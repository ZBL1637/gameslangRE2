export type AiQueryResult = {
  term: string
  definition: string
  usage: string
  examples: string[]
  context: string
  level: string
  synonyms: string[]
}

/**
 * 根据浏览器语言环境粗略判断当前语言（用于生成中英文提示词）。
 */
function detectLang(): 'zh' | 'en' {
  const lang = navigator.language?.toLowerCase() || 'zh'
  return lang.startsWith('zh') ? 'zh' : 'en'
}

/**
 * 构造用于 DeepSeek Chat Completions 的提示词。
 * 要求模型只返回 JSON（不带代码块、不带额外解释）。
 */
export function buildPrompt(query: string, lang: 'zh' | 'en' = detectLang()): string {
  if (lang === 'en') {
    return `You are an expert in gaming terminology. Explain the gaming slang "${query}" in English.
Reply with ONLY a valid JSON object (no extra text) using the exact schema below:

{
  "term": "${query}",
  "definition": "50–100 words, precise meaning",
  "usage": "30–60 words describing how and when it is used",
  "examples": [
    "Example sentence 1",
    "Example sentence 2",
    "Example sentence 3"
  ],
  "context": "20–40 words about game genres or communities",
  "level": "Common / Niche / Specific game",
    "synonyms": ["synonym1", "synonym2"]
}

Requirements:
- Answer strictly in English.
- Return only JSON with the above fields.
- If it is not gaming slang, clearly state this in "definition".
- Provide at least 2 example sentences.`
  }

  return `请详细解释游戏黑话"${query}"的含义和使用场景。请按照以下JSON格式回复，确保回复是有效的JSON格式：

{
  "term": "${query}",
  "definition": "详细定义（50-100字）",
  "usage": "使用场景和方式（30-60字）",
  "examples": [
    "使用例句1",
    "使用例句2",
    "使用例句3"
  ],
  "context": "出现的游戏类型或社区背景（20-40字）",
  "level": "流行程度：通用/小众/特定游戏",
  "synonyms": ["同义词1", "同义词2"]
}

请确保：
1. 回复必须是有效的JSON格式
2. 所有字段都必须填写
3. 如果该词不是游戏黑话，请在definition中说明
4. examples数组至少包含2个例句`
}

/**
 * 从模型返回文本中提取并解析 JSON（兼容 Markdown 代码块、前后附加说明）。
 */
function parseJsonObjectFromText(text: string): unknown {
  const trimmed = String(text || '').trim()

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const candidate = fenceMatch?.[1]?.trim() || trimmed

  const objMatch = candidate.match(/\{[\s\S]*\}/)
  if (!objMatch) throw new Error('解析失败：未找到JSON')

  return JSON.parse(objMatch[0])
}

/**
 * 将服务端错误（含非 2xx）转换为可读的错误信息。
 */
async function readDeepSeekError(res: Response): Promise<string> {
  let payload: any = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  const msgFromPayload = payload?.error?.message || payload?.message || ''
  const statusPart = `${res.status} ${res.statusText}`.trim()
  const msgPart = String(msgFromPayload).trim()

  if (msgPart) return `DeepSeek 请求失败：${statusPart} - ${msgPart}`
  return `DeepSeek 请求失败：${statusPart}`
}

type CacheEntry<T> = { value: T; expiresAt: number }

const deepSeekCache = new Map<string, CacheEntry<AiQueryResult>>()
const deepSeekInFlight = new Map<string, Promise<AiQueryResult>>()

const DEEPSEEK_CACHE_TTL_MS = 10 * 60 * 1000
const DEEPSEEK_CACHE_MAX_ENTRIES = 100

let deepSeekActiveCount = 0
const deepSeekQueue: Array<{
  signal?: AbortSignal
  run: () => Promise<unknown>
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))

  return new Promise((resolve, reject) => {
    let done = false

    const cleanup = () => {
      if (done) return
      done = true
      window.clearTimeout(id)
      if (signal) signal.removeEventListener('abort', onAbort)
    }

    const onAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }

    const id = window.setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    if (signal) signal.addEventListener('abort', onAbort)
  })
}

function pruneCache(now: number) {
  for (const [key, entry] of deepSeekCache) {
    if (entry.expiresAt <= now) deepSeekCache.delete(key)
  }

  while (deepSeekCache.size > DEEPSEEK_CACHE_MAX_ENTRIES) {
    const firstKey = deepSeekCache.keys().next().value as string | undefined
    if (!firstKey) break
    deepSeekCache.delete(firstKey)
  }
}

function deepSeekLimit<T>(fn: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    deepSeekQueue.push({
      signal,
      run: fn as any,
      resolve: resolve as any,
      reject
    })

    const pump = () => {
      if (deepSeekActiveCount >= 1) return
      const task = deepSeekQueue.shift()
      if (!task) return
      if (task.signal?.aborted) {
        task.reject(new DOMException('Aborted', 'AbortError'))
        pump()
        return
      }

      deepSeekActiveCount += 1
      task
        .run()
        .then(task.resolve, task.reject)
        .finally(() => {
          deepSeekActiveCount -= 1
          pump()
        })
    }

    pump()
  })
}

function parseRetryAfterMs(res: Response): number | null {
  const raw = res.headers.get('Retry-After')
  if (!raw) return null

  const seconds = Number(raw)
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000

  const dateMs = Date.parse(raw)
  if (!Number.isNaN(dateMs)) {
    const delta = dateMs - Date.now()
    return Math.max(0, delta)
  }

  return null
}

function shouldRetryStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

function computeBackoffMs(attempt: number): number {
  const base = 400
  const cap = 4000
  const exp = Math.min(cap, base * Math.pow(2, Math.max(0, attempt - 1)))
  const jitter = 0.7 + Math.random() * 0.6
  return Math.floor(exp * jitter)
}

async function fetchDeepSeekWithRetry(
  url: string,
  init: RequestInit,
  signal?: AbortSignal
): Promise<Response> {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    try {
      const res = await fetch(url, { ...init, signal })
      if (res.ok) return res

      if (!shouldRetryStatus(res.status) || attempt === maxAttempts) return res

      const retryAfterMs = parseRetryAfterMs(res)
      const waitMs = retryAfterMs != null ? Math.min(retryAfterMs, 8000) : computeBackoffMs(attempt)
      await sleep(waitMs, signal)
    } catch (err) {
      const isAbort =
        err instanceof DOMException
          ? err.name === 'AbortError'
          : String((err as any)?.name || '').toLowerCase().includes('abort')
      if (isAbort) throw err

      if (attempt === maxAttempts) throw err
      await sleep(computeBackoffMs(attempt), signal)
    }
  }

  throw new Error('DeepSeek 请求失败：未知错误')
}

/**
 * 调用 DeepSeek Chat Completions 接口，返回黑话结构化解析结果。
 * 需要在环境变量中配置：
 * - `VITE_DEEPSEEK_API_KEY`
 * 可选：
 * - `VITE_DEEPSEEK_API_URL`（默认 `https://api.deepseek.com/v1/chat/completions`）
 * - `VITE_DEEPSEEK_MODEL`（默认 `deepseek-chat`）
 */
export async function queryDeepSeek(term: string, signal?: AbortSignal): Promise<AiQueryResult> {
  const env = import.meta.env as any
  const defaultUrl = import.meta.env.DEV ? '/api/deepseek' : 'https://api.deepseek.com/v1/chat/completions'
  const url = env?.VITE_DEEPSEEK_API_URL || defaultUrl
  const apiKey = env?.VITE_DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('缺少 VITE_DEEPSEEK_API_KEY（请在 .env.local 中设置，并重启开发服务器）')
  }

  const model = env?.VITE_DEEPSEEK_MODEL || 'deepseek-chat'

  const lang = detectLang()
  const cacheKey = `${url}::${model}::${lang}::${term}`.toLowerCase()
  const now = Date.now()
  pruneCache(now)
  const cached = deepSeekCache.get(cacheKey)
  if (cached && cached.expiresAt > now) return cached.value

  if (!signal && deepSeekInFlight.has(cacheKey)) {
    return deepSeekInFlight.get(cacheKey)!
  }

  const prompt = buildPrompt(term, lang)

  const run = async (): Promise<AiQueryResult> => {
    const res = await deepSeekLimit(
      () =>
        fetchDeepSeekWithRetry(
          url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: 'Return ONLY a valid JSON object. No extra text. No markdown code fences.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 1000
            })
          },
          signal
        ),
      signal
    )

    if (!res.ok) {
      throw new Error(await readDeepSeekError(res))
    }

    const data = await res.json()
    const content: string = data?.choices?.[0]?.message?.content || ''
    const parsed = parseJsonObjectFromText(content) as AiQueryResult
    deepSeekCache.set(cacheKey, { value: parsed, expiresAt: Date.now() + DEEPSEEK_CACHE_TTL_MS })
    pruneCache(Date.now())
    return parsed
  }

  if (!signal) {
    const inFlight = run().finally(() => deepSeekInFlight.delete(cacheKey))
    deepSeekInFlight.set(cacheKey, inFlight)
    return inFlight
  }

  return run()
}
