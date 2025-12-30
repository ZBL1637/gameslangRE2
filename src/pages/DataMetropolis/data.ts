// ============================================================================
// 第四章：数据洪流之都 - 数据文件
// ============================================================================

import { 
  DataNode, 
  TermDistributionData, 
  SentimentData, 
  CategorySentimentData
} from './types';

// NPC对话脚本
export const SCRIPT = {
  // 章节信息
  ch4_title: '数据洪流之都',
  ch4_subtitle: '// SYSTEM_ROOT: DATA_METROPOLIS //',
  
  // 入场叙述
  ch4_intro_narration_1: '正在建立神经连接... 目标定位：数据洪流之都。',
  ch4_intro_narration_2: '检测到高密度信息流。建筑结构：柱状图；地貌：情感曲线；天象：词云星系。请小心数据过载。',
  
  // NPC对话
  ch4_npc_name: '数据织者 [ADMIN]',
  ch4_npc_title: '系统核心守护程序',
  ch4_npc_greeting: '访问请求已通过。欢迎来到核心数据库，探索者。这里汇聚了亿万玩家的思维碎片，而黑话是解码这些碎片的唯一密钥。',
  ch4_npc_task: '系统检测到四个加密的数据节点。你需要完成解谜协议，重构数据完整性。准备好接入了吗？',
  ch4_npc_node1_intro: '【节点一：光谱协议】检测到不同游戏维度的术语频率异常。分析其分类指纹，找出主导波段。',
  ch4_npc_node2_intro: '【节点二：情感核心】情感极性扫描启动。哪些游戏的黑话主要承载正面情绪？',
  ch4_npc_node3_intro: '【节点三：分类矩阵】警告：部分术语类别含有高浓度的负面情绪。定位这些高风险区域。',
  ch4_npc_node4_intro: '【节点四：指纹链接】多维数据对比。寻找不同游戏生态之间的通用语法与独特标识。',
  ch4_npc_complete: '数据完整性校验通过。同步率 100%。你已获得系统最高权限。正在下载战斗模组...',
  
  // 技能信息
  ch4_skill_name: '弱点洞察协议',
  ch4_skill_english: 'Exploit Detection Protocol',
  ch4_skill_desc: '解析目标底层代码，暴露致命缺陷',
  ch4_skill_effect: '系统超频：接下来的3个指令周期内，所有攻击暴击率提升50%',
  ch4_skill_unlock_text: '弱点数据下载完成。致命打击模块已装载。',
  
  // 结尾叙述
  ch4_outro_narration_1: '数据流重组完毕。核心逻辑已优化。',
  ch4_outro_narration_2: '你已经掌握了数据的真实形态。这股力量将成为你对抗最终混乱的重要武器。'
};

// 四个数据节点
export const DATA_NODES: DataNode[] = [
  {
    id: 'node_1',
    name: '光谱协议：行为解码',
    description: '解析不同游戏维度的术语分类指纹',
    icon: '📊',
    color: '#7F0056',
    completed: false,
    question: {
      question: '根据图表数据，哪款游戏的"行为类"术语占比呈现异常峰值？',
      hint: '解密提示：扫描堆叠柱状图中紫色的高频波段',
      options: [
        { label: 'CSGO', value: 'csgo' },
        { label: '文明6', value: 'civ6' },
        { label: '英雄联盟', value: 'lol' },
        { label: '原神', value: 'genshin' }
      ],
      correctIndex: 1,
      explanation: '数据解析：文明6的"行为类"术语占比高达79.6%。系统分析显示，作为策略游戏，其核心交互逻辑高度依赖玩家的操作指令。'
    }
  },
  {
    id: 'node_2',
    name: '情感核心：极性共振',
    description: '扫描黑话数据流中的情感频率',
    icon: '😊',
    color: '#A6006B',
    completed: false,
    question: {
      question: '系统扫描显示，哪款游戏的黑话中"正面情感"信号最强？',
      hint: '解密提示：定位饼图中代表正面情绪的扇区',
      options: [
        { label: '最终幻想14', value: 'ff14' },
        { label: '原神', value: 'genshin' },
        { label: '王者荣耀', value: 'kog' },
        { label: '绝地求生', value: 'pubg' }
      ],
      correctIndex: 1,
      explanation: '数据解析：原神的正面情感占比达到67.63%。分析表明，其二次元属性与角色养成系统极大地激发了用户的正面情感反馈。'
    }
  },
  {
    id: 'node_3',
    name: '分类矩阵：负熵指数',
    description: '定位高风险的负面情绪术语类别',
    icon: '🎭',
    color: '#5A003D',
    completed: false,
    question: {
      question: '警告：哪类术语的"负面情感"浓度最高？',
      hint: '解密提示：追踪雷达图中深紫色区域的峰值',
      options: [
        { label: '交流/指挥类', value: 'communication' },
        { label: '机制类', value: 'mechanism' },
        { label: '社交类/梗类', value: 'social' },
        { label: '经济交易类', value: 'economy' }
      ],
      correctIndex: 1,
      explanation: '数据解析："机制类"术语的负面情感占比约为30.5%。这通常关联于系统判定、失败惩罚等高压游戏体验（如"被秒"、"暴毙"）。'
    }
  },
  {
    id: 'node_4',
    name: '指纹链接：通用语法',
    description: '追踪跨生态系统的病毒式术语传播',
    icon: '🎮',
    color: '#D946EF',
    completed: false,
    question: {
      question: '哪款游戏的"跨游戏通用语"兼容性最高？',
      hint: '解密提示：观察各游戏雷达图中"跨游戏通用语"维度的读数',
      options: [
        { label: '英雄联盟', value: 'lol' },
        { label: '三角洲行动', value: 'delta' },
        { label: '鸣潮', value: 'wuwa' },
        { label: '最终幻想14', value: 'ff14' }
      ],
      correctIndex: 1,
      explanation: '数据解析：三角洲行动的通用语占比高达30.8%。作为FPS新星，它大量集成了射击游戏界的标准底层协议（如"架枪"、"拉枪"）。'
    }
  }
];

// 游戏术语分类分布数据 (chart1)
export const TERM_DISTRIBUTION_DATA: TermDistributionData[] = [
  {
    game: 'CSGO',
    categories: {
      '交流/指挥类': 0.0206,
      '地图/副本类': 0.0722,
      '机制类': 0.0103,
      '物品/装备类': 0.0206,
      '玩家/群体标签': 0.0206,
      '社交类/梗类': 0.0,
      '经济交易类': 0.0,
      '职业类': 0.0515,
      '行为类': 0.7938,
      '跨游戏通用语': 0.0103
    }
  },
  {
    game: '英雄联盟',
    categories: {
      '交流/指挥类': 0.0,
      '地图/副本类': 0.03,
      '机制类': 0.11,
      '物品/装备类': 0.07,
      '玩家/群体标签': 0.02,
      '社交类/梗类': 0.0,
      '经济交易类': 0.0,
      '职业类': 0.14,
      '行为类': 0.59,
      '跨游戏通用语': 0.04
    }
  },
  {
    game: '最终幻想14',
    categories: {
      '交流/指挥类': 0.0119,
      '地图/副本类': 0.0158,
      '机制类': 0.2134,
      '物品/装备类': 0.0474,
      '玩家/群体标签': 0.1542,
      '社交类/梗类': 0.0079,
      '经济交易类': 0.0316,
      '职业类': 0.2846,
      '行为类': 0.1779,
      '跨游戏通用语': 0.0553
    }
  },
  {
    game: '三角洲行动',
    categories: {
      '交流/指挥类': 0.0127,
      '地图/副本类': 0.0549,
      '机制类': 0.0253,
      '物品/装备类': 0.0169,
      '玩家/群体标签': 0.1477,
      '社交类/梗类': 0.0042,
      '经济交易类': 0.0,
      '职业类': 0.0169,
      '行为类': 0.4135,
      '跨游戏通用语': 0.3080
    }
  },
  {
    game: '原神',
    categories: {
      '交流/指挥类': 0.0,
      '地图/副本类': 0.0289,
      '机制类': 0.0809,
      '物品/装备类': 0.0347,
      '玩家/群体标签': 0.0867,
      '社交类/梗类': 0.0,
      '经济交易类': 0.0058,
      '职业类': 0.4335,
      '行为类': 0.2775,
      '跨游戏通用语': 0.0520
    }
  },
  {
    game: '怪物猎人',
    categories: {
      '交流/指挥类': 0.0,
      '地图/副本类': 0.0043,
      '机制类': 0.1826,
      '物品/装备类': 0.0783,
      '玩家/群体标签': 0.0609,
      '社交类/梗类': 0.0043,
      '经济交易类': 0.0,
      '职业类': 0.0478,
      '行为类': 0.5696,
      '跨游戏通用语': 0.0522
    }
  },
  {
    game: '文明6',
    categories: {
      '交流/指挥类': 0.0,
      '地图/副本类': 0.1156,
      '机制类': 0.0340,
      '物品/装备类': 0.0,
      '玩家/群体标签': 0.0204,
      '社交类/梗类': 0.0,
      '经济交易类': 0.0272,
      '职业类': 0.0068,
      '行为类': 0.7959,
      '跨游戏通用语': 0.0
    }
  },
  {
    game: '无畏契约',
    categories: {
      '交流/指挥类': 0.0,
      '地图/副本类': 0.0439,
      '机制类': 0.1491,
      '物品/装备类': 0.0614,
      '玩家/群体标签': 0.0526,
      '社交类/梗类': 0.0,
      '经济交易类': 0.0088,
      '职业类': 0.0088,
      '行为类': 0.6754,
      '跨游戏通用语': 0.0
    }
  },
  {
    game: '永劫无间',
    categories: {
      '交流/指挥类': 0.0054,
      '地图/副本类': 0.0432,
      '机制类': 0.1514,
      '物品/装备类': 0.0865,
      '玩家/群体标签': 0.0919,
      '社交类/梗类': 0.0,
      '经济交易类': 0.0162,
      '职业类': 0.0865,
      '行为类': 0.4919,
      '跨游戏通用语': 0.0270
    }
  },
  {
    game: '王者荣耀',
    categories: {
      '交流/指挥类': 0.0,
      '地图/副本类': 0.0241,
      '机制类': 0.0783,
      '物品/装备类': 0.0241,
      '玩家/群体标签': 0.0904,
      '社交类/梗类': 0.0120,
      '经济交易类': 0.0361,
      '职业类': 0.1265,
      '行为类': 0.5783,
      '跨游戏通用语': 0.0301
    }
  },
  {
    game: '绝地求生',
    categories: {
      '交流/指挥类': 0.0045,
      '地图/副本类': 0.0407,
      '机制类': 0.0181,
      '物品/装备类': 0.0317,
      '玩家/群体标签': 0.1176,
      '社交类/梗类': 0.0814,
      '经济交易类': 0.0,
      '职业类': 0.0452,
      '行为类': 0.6063,
      '跨游戏通用语': 0.0543
    }
  },
  {
    game: '艾尔登法环',
    categories: {
      '交流/指挥类': 0.0,
      '地图/副本类': 0.0746,
      '机制类': 0.2313,
      '物品/装备类': 0.0896,
      '玩家/群体标签': 0.0448,
      '社交类/梗类': 0.0,
      '经济交易类': 0.0075,
      '职业类': 0.0896,
      '行为类': 0.4552,
      '跨游戏通用语': 0.0075
    }
  },
  {
    game: '魔兽世界',
    categories: {
      '交流/指挥类': 0.0,
      '地图/副本类': 0.0183,
      '机制类': 0.1829,
      '物品/装备类': 0.0976,
      '玩家/群体标签': 0.0610,
      '社交类/梗类': 0.0,
      '经济交易类': 0.0244,
      '职业类': 0.2988,
      '行为类': 0.2744,
      '跨游戏通用语': 0.0427
    }
  },
  {
    game: '鸣潮',
    categories: {
      '交流/指挥类': 0.0059,
      '地图/副本类': 0.0177,
      '机制类': 0.1062,
      '物品/装备类': 0.0472,
      '玩家/群体标签': 0.0826,
      '社交类/梗类': 0.0324,
      '经济交易类': 0.0118,
      '职业类': 0.3628,
      '行为类': 0.2330,
      '跨游戏通用语': 0.1003
    }
  }
];

// 游戏情感分布数据 (chart2)
export const SENTIMENT_DATA: SentimentData[] = [
  { game: 'CSGO', neutral: 93.81, positive: 2.06, negative: 4.12 },
  { game: '英雄联盟', neutral: 90.00, positive: 5.00, negative: 5.00 },
  { game: '最终幻想14', neutral: 68.77, positive: 12.25, negative: 18.97 },
  { game: '三角洲行动', neutral: 83.12, positive: 10.97, negative: 5.91 },
  { game: '原神', neutral: 30.64, positive: 67.63, negative: 1.73 },
  { game: '怪物猎人', neutral: 88.26, positive: 5.65, negative: 6.09 },
  { game: '文明6', neutral: 80.27, positive: 14.97, negative: 4.76 },
  { game: '无畏契约', neutral: 86.84, positive: 10.53, negative: 2.63 },
  { game: '永劫无间', neutral: 80.54, positive: 15.14, negative: 4.32 },
  { game: '王者荣耀', neutral: 84.34, positive: 5.42, negative: 10.24 },
  { game: '绝地求生', neutral: 89.14, positive: 9.05, negative: 1.81 },
  { game: '艾尔登法环', neutral: 82.84, positive: 7.46, negative: 9.70 },
  { game: '魔兽世界', neutral: 80.49, positive: 7.93, negative: 11.59 },
  { game: '鸣潮', neutral: 79.06, positive: 15.63, negative: 5.31 }
];

// 术语类别情感分布数据 (chart3)
export const CATEGORY_SENTIMENT_DATA: CategorySentimentData[] = [
  { category: '交流/指挥类', neutral: 0.5833, positive: 0.4167, negative: 0.0 },
  { category: '地图/副本类', neutral: 0.9474, positive: 0.0526, negative: 0.0 },
  { category: '机制类', neutral: 0.5925, positive: 0.1027, negative: 0.3048 },
  { category: '物品/装备类', neutral: 0.7953, positive: 0.1890, negative: 0.0157 },
  { category: '玩家/群体标签', neutral: 0.7569, positive: 0.1835, negative: 0.0596 },
  { category: '社交类/梗类', neutral: 0.8857, positive: 0.1143, negative: 0.0 },
  { category: '经济交易类', neutral: 0.8750, positive: 0.1250, negative: 0.0 },
  { category: '职业类', neutral: 0.7512, positive: 0.2126, negative: 0.0362 },
  { category: '行为类', neutral: 0.8402, positive: 0.1244, negative: 0.0354 },
  { category: '跨游戏通用语', neutral: 0.8079, positive: 0.0960, negative: 0.0960 }
];

// 术语类别列表
export const TERM_CATEGORIES = [
  '交流/指挥类',
  '地图/副本类',
  '机制类',
  '物品/装备类',
  '玩家/群体标签',
  '社交类/梗类',
  '经济交易类',
  '职业类',
  '行为类',
  '跨游戏通用语'
];

// 图表颜色方案
export const CHART_COLORS = {
  primary: '#7F0056',
  secondary: '#A6006B',
  tertiary: '#5A003D',
  accent: '#D946EF',
  neutral: '#7F0056',
  positive: '#A6006B',
  negative: '#5A003D',
  categories: [
    '#7F0056', '#A6006B', '#5A003D', '#D946EF', '#7F0056',
    '#A6006B', '#5A003D', '#D946EF', '#7F0056', '#A6006B'
  ]
};
