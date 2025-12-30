import { rawData, RawData } from './dataLoader';
import { Term, GameIndex, CategoryIndex, ChartData, QuizItem } from '@/types';

// 辅助函数：标准化游戏名称 (简单处理)
const normalizeGameName = (game: string): string => {
  if (!game) return 'General';
  const g = game.toLowerCase().trim();
  if (g.includes('ff14') || g.includes('final fantasy')) return 'FF14';
  if (g.includes('lol') || g.includes('league')) return 'LoL';
  if (g.includes('wow') || g.includes('warcraft')) return 'WoW';
  if (g.includes('csgo')) return 'CS:GO';
  if (g.includes('dota')) return 'Dota2';
  return game;
};

const TERM_PLAIN_TRANSLATIONS: Record<string, string> = {
  '开团': '准备打团/开战，发起一次集体行动（多见于团本、MOBA团战）。',
  'DPS': '负责打输出的角色/位置；也常用来指“输出能力”。',
  'GG': 'Good Game 的缩写：礼貌的“打得不错/结束了”，有时也带点阴阳怪气。',
  '开荒': '第一次打新副本/新Boss，从零摸机制、反复试错。',
  '团灭': '整个队伍一起失败/全灭，通常要重来。',
  '副本': '独立关卡/地下城：进进去打一段内容，过了就拿奖励。',
  '肝': '花大量时间反复刷任务/材料，把进度“肝”出来。',
  '氪金': '花真钱充值买道具/抽卡/加速进度。',
  '欧皇': '运气特别好的人（抽卡、掉落总出货）。',
  '非酋': '运气特别差的人（抽卡、掉落总不出货）。',
  'T': 'Tank 的缩写：队伍里负责抗伤害、拉怪、站前排的角色/位置。',
  '奶': '治疗位/奶妈奶爸：负责给队友回血、保命、抬血线。',
  'CD': '冷却时间：技能用过后要等多久才能再次使用。',
  'TP': '传送：快速移动到指定地点（也可指传送技能/传送卷轴）。',
  'PVP': '玩家对战：Player vs Player，和其他玩家直接对抗的玩法。',
  'BUG': '程序或规则漏洞：会导致异常、穿模、数值不对等问题。',
  'BUFF': '增益效果：给角色加成（攻击/防御/移速等）。',
  'DEBUFF': '减益效果：让角色变弱（减速/减防/中毒等）。',
  'DLC': '可下载内容：额外付费或免费追加的剧情/角色/道具等。',
  '划水': '不认真参与、摸鱼：在队伍里贡献很少，像“混进来拿奖励”。',
  '保底': '抽卡/掉落的最低保障：再非也会在某个次数内给到稀有奖励。'
};

const appendPlainTranslation = (definition: unknown, termId: string) => {
  const plain = TERM_PLAIN_TRANSLATIONS[termId];
  if (!plain) return String(definition ?? '');

  const base = String(definition ?? '').trim();
  if (base.includes('人话：')) return base;
  if (!base) return `人话：${plain}`;
  return `${base}\n\n人话：${plain}`;
};

/** 将术语 ID 归一化为便于宽松匹配的 key（大小写、空白、括号等差异不敏感） */
const normalizeTermKey = (termId: string): string => {
  const raw = String(termId ?? '').trim();
  if (!raw) return '';
  const stripped = raw
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.toLowerCase();
};

/** 为一个术语 ID 生成一组候选 key，用于尽可能在词典中找到对应解释 */
const buildTermKeyCandidates = (termId: string): string[] => {
  const raw = String(termId ?? '').trim();
  if (!raw) return [];

  const alias: Record<string, string> = {
    t: 'T',
    cd: 'CD',
    tp: 'TP',
    pvp: 'PVP',
    bug: 'BUG',
    buff: 'BUFF',
    debuff: 'DEBUFF',
    dlc: 'DLC',
    gg: 'GG',
    dps: 'DPS',
    ot: 'OT'
  };

  const base = raw.trim();
  const basic = [base, base.toUpperCase(), base.toLowerCase()];
  const mapped = alias[base.toLowerCase()] ? [alias[base.toLowerCase()]] : [];

  const withoutParen = base.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim();
  const splitBySlash = base.split('/').map((s) => s.trim()).filter(Boolean);
  const splitByDelim = base
    .split(/[、，,；;·\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const all = [...basic, ...mapped, withoutParen, ...splitBySlash, ...splitByDelim]
    .map((s) => s.trim())
    .filter(Boolean);

  const uniq: string[] = [];
  const seen = new Set<string>();
  all.forEach((s) => {
    const k = normalizeTermKey(s);
    if (!k || seen.has(k)) return;
    seen.add(k);
    uniq.push(s);
  });
  return uniq;
};

// 1. 数据处理核心类
class DataProcessor {
  private terms: Map<string, Term> = new Map();
  private termKeyIndex: Map<string, string> = new Map();
  private gameIndex: GameIndex = {};
  private categoryIndex: CategoryIndex = {};
  private rawData: RawData;
  
  constructor(rawData: RawData) {
    this.rawData = rawData;
    this.processData();
    this.buildTermKeyIndex();
    this.buildIndices();
  }

  // 处理并合并数据
  private processData() {
    // A. 处理 words_sort_data (作为骨架，因为它有分类信息)
    this.rawData.sortData.forEach((item: any) => {
      const id = String(item.title);
      const term: Term = {
        id,
        term: String(item.title),
        definition: appendPlainTranslation(item.summary, id),
        games: [], // 初始为空，稍后补充
        category: {
          l1: item["一级分类"] || 'Uncategorized',
          l2: item["二级分类"] || 'General',
          l3: item["三级分类"]
        },
        source: 'encyclopedia',
        tags: []
      };
      this.terms.set(id, term);
    });

    // B. 处理 words_scraped_data (补充游戏信息和新词)
    this.rawData.scrapedData.forEach((item: any) => {
      const id = String(item.term); // 注意：这里可能与 sortData 的 title 重复，也可能是新词
      const game = normalizeGameName(item.game);

      if (this.terms.has(id)) {
        // 已存在：补充游戏信息，标记 source 为 mixed
        const existingTerm = this.terms.get(id)!;
        if (!existingTerm.games.includes(game)) {
          existingTerm.games.push(game);
        }
        existingTerm.source = 'mixed';
        // 可以考虑合并 definition，这里暂且保留百科的（通常质量更高）
      } else {
        // 不存在：新增 scraped 词条
        // 尝试推断分类 (或者放入默认分类)
        const term: Term = {
          id,
          term: String(item.term),
          definition: appendPlainTranslation(item.definition, id),
          games: [game],
          category: {
            l1: '玩家社区黑话', // 默认分类
            l2: '其他',
          },
          source: 'scraped',
          tags: ['scraped']
        };
        this.terms.set(id, term);
      }
    });

    // C. 处理 words_all_data (查漏补缺)
    this.rawData.allData.forEach((item: any) => {
       const id = String(item.title);
       if (!this.terms.has(id)) {
         // 如果 sortData 里没涵盖（理论上 sortData 应该是全集，但以防万一）
         const term: Term = {
           id,
           term: String(item.title),
           definition: appendPlainTranslation(item.summary, id),
           games: [],
           category: {
             l1: '未分类',
             l2: '未分类'
           },
           source: 'encyclopedia',
           tags: []
         };
         this.terms.set(id, term);
       }
    });

    this.terms.forEach((t) => {
      t.definition = appendPlainTranslation(t.definition, t.id);
    });
  }

  /** 建立“宽松 key -> 真实术语 ID”索引，减少图表/文案与词典 ID 的不一致带来的缺失 */
  private buildTermKeyIndex() {
    this.termKeyIndex.clear();
    this.terms.forEach((_term, id) => {
      const candidates = buildTermKeyCandidates(id);
      candidates.forEach((c) => {
        const key = normalizeTermKey(c);
        if (!key) return;
        if (!this.termKeyIndex.has(key)) this.termKeyIndex.set(key, id);
      });
    });
  }

  // 建立索引
  private buildIndices() {
    this.terms.forEach(term => {
      // Game Index
      if (term.games.length === 0) {
        // 通用术语
        this.addToGameIndex('General', term.id);
      } else {
        term.games.forEach(g => this.addToGameIndex(g, term.id));
      }

      // Category Index
      const { l1, l2 } = term.category;
      if (!this.categoryIndex[l1]) {
        this.categoryIndex[l1] = {};
      }
      if (!this.categoryIndex[l1][l2]) {
        this.categoryIndex[l1][l2] = [];
      }
      this.categoryIndex[l1][l2].push(term.id);
    });
  }

  private addToGameIndex(game: string, id: string) {
    if (!this.gameIndex[game]) {
      this.gameIndex[game] = [];
    }
    this.gameIndex[game].push(id);
  }

  // 获取所有处理后的术语
  public getAllTerms(): Term[] {
    return Array.from(this.terms.values());
  }

  public getTerm(id: string): Term | undefined {
    const direct = this.terms.get(id);
    if (direct) return direct;

    const candidates = buildTermKeyCandidates(id);
    for (let i = 0; i < candidates.length; i += 1) {
      const c = candidates[i];
      const exact = this.terms.get(c);
      if (exact) return exact;
      const key = normalizeTermKey(c);
      const mappedId = key ? this.termKeyIndex.get(key) : undefined;
      if (mappedId) {
        const mapped = this.terms.get(mappedId);
        if (mapped) return mapped;
      }
    }

    return undefined;
  }

  public getGameIndex(): GameIndex {
    return this.gameIndex;
  }

  public getCategoryIndex(): CategoryIndex {
    return this.categoryIndex;
  }

  // 生成图表数据
  public getChartData(): ChartData {
    // 1. Sunburst Data (Category -> L1 -> L2 -> Count)
    const sunburstData = Object.entries(this.categoryIndex).map(([l1, l2Map]) => {
      return {
        name: l1,
        children: Object.entries(l2Map).map(([l2, ids]) => ({
          name: l2,
          value: ids.length
        }))
      };
    });

    // 2. Radar Data (Game Term Counts - Top 6 Games)
    const gameCounts = Object.entries(this.gameIndex)
      .map(([game, ids]) => ({ name: game, value: ids.length }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // 取前8个
    
    const gameRadarData = {
      indicator: gameCounts.map(g => ({ name: g.name, max: gameCounts[0].value })),
      data: [
        {
          value: gameCounts.map(g => g.value),
          name: '术语数量'
        }
      ]
    };

    // 3. Word Cloud (Scraped Frequency - Simulated for now)
    // 真实情况应该统计 scrapedData 中出现的频次，这里简单用 filter scraped source 的
    const wordCloudData = Array.from(this.terms.values())
      .filter(t => t.source === 'scraped' || t.source === 'mixed')
      .map(t => ({
        name: t.term,
        value: Math.floor(Math.random() * 100) + 10 // 模拟热度，后续可替换为真实频次
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    return {
      sunburstData,
      gameRadarData,
      wordCloudData
    };
  }

  // 生成测验题库 (Simple Generator)
  public generateQuizBank(count: number = 5): QuizItem[] {
    const terms = this.getAllTerms().filter(t => t.definition && t.definition.length > 10);
    const quizBank: QuizItem[] = [];

    for (let i = 0; i < count; i++) {
      if (terms.length === 0) break;
      const randomIndex = Math.floor(Math.random() * terms.length);
      const targetTerm = terms[randomIndex];
      
      // 生成干扰项
      const options = [targetTerm.term];
      while (options.length < 4) {
        const randomDistractor = terms[Math.floor(Math.random() * terms.length)].term;
        if (!options.includes(randomDistractor)) {
          options.push(randomDistractor);
        }
      }
      
      // 打乱选项
      options.sort(() => Math.random() - 0.5);

      quizBank.push({
        id: `quiz-${i}`,
        question: `以下哪个术语的定义是："${targetTerm.definition.substring(0, 50)}..."？`,
        options,
        answer: targetTerm.term,
        relatedTermId: targetTerm.id
      });
    }
    return quizBank;
  }
}

export const dataProcessor = new DataProcessor(rawData);

export const getDataProcessor = async (): Promise<DataProcessor> => {
  return dataProcessor;
};
