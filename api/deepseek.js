export default async function handler(req, res) {
  // 设置 CORS 头，允许跨域调用
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 从环境变量获取 API Key
  // 在 Vercel 后台配置 Environment Variables: DEEPSEEK_API_KEY
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('Missing API Key configuration');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'API Key not configured on server'
    });
  }

  try {
    // 从请求体获取参数
    const { messages, model, temperature, max_tokens } = req.body;

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Upstream API Error:', data);
      return res.status(response.status).json(data);
    }

    // 返回结果
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
