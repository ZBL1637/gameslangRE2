export type SkillRewardId = 'time_freeze' | 'resonance' | 'weakness' | 'logos';

export type EndingRank = 'S' | 'A' | 'B' | 'FAIL';
export type ChapterGrade = 'S' | 'A' | 'B' | 'C';

export interface ChapterReward {
  chapterId: number;
  chapterTitle: string;
  isNewCompletion: boolean;
  expReward: number;
  skillId?: SkillRewardId;
  skillName?: string;
  fragments: DataFragment[];
  achievements: string[];
  nextChapterId?: number;
  score: number;
}

export interface GameEnding {
  rank: EndingRank;
  title: string;
  score: number;
  won: boolean;
  completedAt: string;
  summary: string;
}

export interface DataFragment {
  id: string;
  chapterId: number;
  title: string;
  description: string;
}

export interface NewsPredictionOption {
  id: string;
  label: string;
  rationale: string;
  isCorrect?: boolean;
}

export interface ChapterNewsConfig {
  chapterId: number;
  title: string;
  coreQuestion: string;
  sourceNote: string;
  evidencePrompt: string;
  revealText: string;
  predictionPrompt: string;
  predictionOptions: NewsPredictionOption[];
  chartTakeaway: string;
  impactText: string;
  rewardSkillId?: SkillRewardId;
  rewardSkillName?: string;
  fragmentIds: string[];
  achievementId?: string;
  baseScore: number;
  perfectScore: number;
}

export interface FragmentCombo {
  id: string;
  title: string;
  requiredFragmentIds: string[];
  effect: string;
  endingLine: string;
  badge: string;
  scoreBonus: number;
}

export interface EvidenceBattleBonus {
  attackBonus: number;
  damageReduction: number;
  maxTurnBonus: number;
  comboScoreBonus: number;
  unlockedCombos: FragmentCombo[];
}

export const DATA_FRAGMENTS: Record<string, DataFragment> = {
  village_signal: {
    id: 'village_signal',
    chapterId: 0,
    title: '新手村信号',
    description: '黑话既是门槛，也是玩家互相识别的语言入口。'
  },
  fragment_taxonomy: {
    id: 'fragment_taxonomy',
    chapterId: 1,
    title: '分类碎片',
    description: '黑话可以按行为、机制、职业、社交等类别建立可读的谱系。'
  },
  fragment_relation: {
    id: 'fragment_relation',
    chapterId: 1,
    title: '关系碎片',
    description: '高频共现词展示了玩家协作、冲突和流程节点之间的关系。'
  },
  fragment_migration: {
    id: 'fragment_migration',
    chapterId: 1,
    title: '迁徙碎片',
    description: '术语会从单一游戏语境流向攻略、直播和跨游戏社群。'
  },
  fragment_timeline: {
    id: 'fragment_timeline',
    chapterId: 2,
    title: '时间碎片',
    description: '街机、网游、手游、直播时代共同塑造了黑话的传播路径。'
  },
  fragment_identity: {
    id: 'fragment_identity',
    chapterId: 3,
    title: '身份碎片',
    description: '玩家用黑话描述打法、性格和社群位置，形成身份标签。'
  },
  fragment_sentiment: {
    id: 'fragment_sentiment',
    chapterId: 4,
    title: '情感碎片',
    description: '黑话不仅传递信息，也携带玩家的正负情绪与压力来源。'
  },
  fragment_translation: {
    id: 'fragment_translation',
    chapterId: 5,
    title: '转译碎片',
    description: '跨文化语境里，直译会失真，意图和场景才是关键。'
  },
  fragment_algorithm: {
    id: 'fragment_algorithm',
    chapterId: 6,
    title: '算法碎片',
    description: '平台算法会放大圈层语言，也可能制造信息茧房。'
  }
};

export const CHAPTER_NEWS_CONFIG: Record<number, ChapterNewsConfig> = {
  0: {
    chapterId: 0,
    title: '黑话新手村',
    coreQuestion: '为什么玩家会用外人听不懂的语言交流？',
    sourceNote: '来源：项目内 2,769 条游戏黑话词库与新手村问答脚本。',
    evidencePrompt: '完成村长问答，判断黑话在沟通中的功能。',
    revealText: '黑话是一种社群速记：它压缩了复杂游戏经验，也天然形成圈层门槛。',
    predictionPrompt: '先判断：黑话最先解决的是什么问题？',
    predictionOptions: [
      { id: 'exclude', label: '把外人挡在圈外', rationale: '门槛确实存在，但它通常是副作用。' },
      { id: 'speed', label: '让复杂配合变快', rationale: '一两个词就能传递角色、动作和状态。', isCorrect: true },
      { id: 'trend', label: '追逐社交平台热词', rationale: '平台会放大黑话，但源头常在游戏协作。' }
    ],
    chartTakeaway: '词库中的高频词大多指向行动、角色、状态和评价，说明黑话首先是协作压缩工具。',
    impactText: '反转：黑话会制造门槛，但它被玩家保留下来的原因，是它能让陌生队友迅速对齐。',
    fragmentIds: ['village_signal'],
    achievementId: 'first_step',
    baseScore: 8,
    perfectScore: 12
  },
  1: {
    chapterId: 1,
    title: '黑话起源之森',
    coreQuestion: '游戏黑话能否被当作一套语言系统来阅读？',
    sourceNote: '来源：项目内术语分类、共词关系与搭配强度数据。',
    evidencePrompt: '探索分类旭日图、共词网络和搭配热力图，收集三枚词根碎片。',
    revealText: '黑话不是零散梗，而是分类、关系和迁徙共同组成的语言地图。',
    predictionPrompt: '先判断：游戏黑话更像哪一种结构？',
    predictionOptions: [
      { id: 'meme_bag', label: '随机梗包', rationale: '梗会出现，但无法解释稳定分类和共现关系。' },
      { id: 'language_map', label: '可读的语言地图', rationale: '分类、共词和搭配共同组成了可导航的地图。', isCorrect: true },
      { id: 'fixed_code', label: '固定暗号表', rationale: '黑话会迁徙和变形，固定暗号解释不了流动性。' }
    ],
    chartTakeaway: '旭日图给出分类骨架，共词网络显示语境连接，热力图显示高强度搭配。',
    impactText: '反转：玩家说的不是一堆孤立梗，而是一套会被场景持续更新的民间术语系统。',
    fragmentIds: ['fragment_taxonomy', 'fragment_relation', 'fragment_migration'],
    achievementId: 'forest_explorer',
    baseScore: 14,
    perfectScore: 24
  },
  2: {
    chapterId: 2,
    title: '战斗本体平原',
    coreQuestion: '黑话的流行为什么总和游戏产业阶段绑定？',
    sourceNote: '来源：章节时间线资料与街机、网游、手游、直播四阶段案例。',
    evidencePrompt: '完成四个时代挑战，比较每个时代的核心玩法如何制造新词。',
    revealText: '黑话会随着玩法、付费模式和传播渠道改变，从游戏厅暗语变成公共网络语言。',
    predictionPrompt: '先判断：哪种力量最容易改变黑话的流行路径？',
    predictionOptions: [
      { id: 'industry_stage', label: '玩法与产业阶段', rationale: '街机、网游、手游、直播都带来新的协作和传播机制。', isCorrect: true },
      { id: 'graphics', label: '画面技术升级', rationale: '画面升级会改变体验，但不必然制造新词。' },
      { id: 'single_author', label: '少数玩家发明', rationale: '个体能造词，流行还依赖场景和渠道。' }
    ],
    chartTakeaway: '时间线显示：新硬件、新付费模式和新传播渠道出现时，术语会集中变形或扩散。',
    impactText: '反转：黑话不是自然“火起来”的，它常常被玩法规则、商业模式和传播平台共同推着走。',
    rewardSkillId: 'time_freeze',
    rewardSkillName: '时之凝固',
    fragmentIds: ['fragment_timeline'],
    achievementId: 'time_traveler',
    baseScore: 14,
    perfectScore: 26
  },
  3: {
    chapterId: 3,
    title: '玩家生态城镇',
    coreQuestion: '玩家为什么愿意用标签描述自己和别人？',
    sourceNote: '来源：章节 DNA 测试、玩家类型标签与黑话档案馆样例。',
    evidencePrompt: '完成玩家 DNA 测试，并在档案馆查询至少 10 个黑话。',
    revealText: '黑话把复杂行为压缩成标签，既能帮玩家找同伴，也会固化刻板印象。',
    predictionPrompt: '先判断：玩家标签最主要在表达什么？',
    predictionOptions: [
      { id: 'identity', label: '身份与关系位置', rationale: '标签在描述打法、能力、态度和社群关系。', isCorrect: true },
      { id: 'pure_skill', label: '纯粹技术水平', rationale: '技术只是其中一部分，很多标签指向态度和关系。' },
      { id: 'rank', label: '官方段位系统', rationale: '大量黑话来自玩家自发命名。' }
    ],
    chartTakeaway: 'DNA 测试和档案馆查询显示，标签会把行为、风格和情绪压缩成可传播的身份符号。',
    impactText: '反转：标签能帮玩家找到同类，也会把复杂的人简化成一个词。',
    rewardSkillId: 'resonance',
    rewardSkillName: '共鸣之声',
    fragmentIds: ['fragment_identity'],
    achievementId: 'identity_mapper',
    baseScore: 14,
    perfectScore: 28
  },
  4: {
    chapterId: 4,
    title: '数据洪流之都',
    coreQuestion: '黑话数据能揭示不同游戏社群的情绪结构吗？',
    sourceNote: '来源：项目内游戏术语分类占比、情感分布和跨游戏通用语数据。',
    evidencePrompt: '破解四个数据节点，用图表回答分类、情感和通用语问题。',
    revealText: '机制类词更容易聚集负面情绪，强社群游戏则更容易产生身份与情感表达。',
    predictionPrompt: '先判断：黑话数据最能揭示社群的哪一层结构？',
    predictionOptions: [
      { id: 'emotion_pressure', label: '情绪压力和社群关系', rationale: '情感分布和分类占比能显示压力来源与关系结构。', isCorrect: true },
      { id: 'sales', label: '游戏销量排名', rationale: '术语数据不能直接等同销量。' },
      { id: 'graphics_style', label: '美术风格偏好', rationale: '文本数据更擅长揭示沟通与情绪。' }
    ],
    chartTakeaway: '节点图表把“词类占比、情绪分布、跨游戏通用语”放在一起，能看到不同社群的压力点。',
    impactText: '反转：玩家抱怨并不只是负能量，它常常指向机制摩擦、付费压力和协作成本。',
    rewardSkillId: 'weakness',
    rewardSkillName: '弱点分析',
    fragmentIds: ['fragment_sentiment'],
    achievementId: 'data_weaver',
    baseScore: 16,
    perfectScore: 30
  },
  5: {
    chapterId: 5,
    title: '译语通天塔',
    coreQuestion: '黑话跨语言传播时，什么会被误读？',
    sourceNote: '来源：章节误译委托、关键词、语气、隐喻和最终组装任务。',
    evidencePrompt: '完成三层翻译试炼与最终组装，平衡准确度、清晰度和文化含义。',
    revealText: '黑话翻译的难点不在字面，而在玩家共同理解的场景和情绪。',
    predictionPrompt: '先判断：黑话跨语言传播时最容易丢失什么？',
    predictionOptions: [
      { id: 'literal_word', label: '单个词的字面意义', rationale: '字面意义容易查到，最难的是背后的场景。' },
      { id: 'context_emotion', label: '语境、语气和共同经验', rationale: '翻译要保留玩家知道但字典不写的那部分。', isCorrect: true },
      { id: 'font_style', label: '文字字体和排版', rationale: '呈现会影响阅读，但不是误读核心。' }
    ],
    chartTakeaway: '关键词、语气、隐喻三类任务显示，直译准确不代表读者真正理解。',
    impactText: '反转：最“忠实”的直译有时最会误导人，因为它抹掉了玩家共同的场景记忆。',
    rewardSkillId: 'logos',
    rewardSkillName: '言灵·转化',
    fragmentIds: ['fragment_translation'],
    achievementId: 'translation_bridge',
    baseScore: 16,
    perfectScore: 30
  },
  6: {
    chapterId: 6,
    title: '终章·魔王城',
    coreQuestion: '算法会怎样放大黑话社群的连接与隔阂？',
    sourceNote: '来源：前五章碎片、终章 Boss 技能和结算评分。',
    evidencePrompt: '用已获得的技能击败算法霸主，查看你的数据新闻结局。',
    revealText: '理解黑话的终点不是消灭圈层，而是看见语言、平台和社群如何互相塑造。',
    predictionPrompt: '先判断：算法最可能怎样改变黑话社群？',
    predictionOptions: [
      { id: 'amplify', label: '同时放大连接和隔阂', rationale: '推荐机制会让同类更容易相遇，也会让外部理解更困难。', isCorrect: true },
      { id: 'erase', label: '自动消除圈层差异', rationale: '算法通常不会自动补足语境。' },
      { id: 'freeze', label: '让黑话停止变化', rationale: '传播越快，黑话越可能变形。' }
    ],
    chartTakeaway: '终章把前五章碎片合并成推理板，显示语言、情绪、翻译和平台机制之间的连锁关系。',
    impactText: '反转：算法不是单纯的敌人，它是放大器；关键在于玩家和平台如何处理被放大的差异。',
    fragmentIds: ['fragment_algorithm'],
    achievementId: 'algorithm_slayer',
    baseScore: 18,
    perfectScore: 32
  }
};

export const getChapterConfig = (chapterId: number) => CHAPTER_NEWS_CONFIG[chapterId];

export const getFragments = (ids: string[]) =>
  ids.map((id) => DATA_FRAGMENTS[id]).filter((fragment): fragment is DataFragment => Boolean(fragment));

export const getChapterGrade = (score: number, chapterId?: number): ChapterGrade => {
  const perfectScore = chapterId != null ? CHAPTER_NEWS_CONFIG[chapterId]?.perfectScore : undefined;
  const target = perfectScore ?? 30;
  const ratio = target <= 0 ? 0 : score / target;
  if (ratio >= 0.92) return 'S';
  if (ratio >= 0.76) return 'A';
  if (ratio >= 0.58) return 'B';
  return 'C';
};

export const FRAGMENT_COMBOS: FragmentCombo[] = [
  {
    id: 'language_map',
    title: '语言地图',
    requiredFragmentIds: ['fragment_taxonomy', 'fragment_relation', 'fragment_migration'],
    effect: '普通攻击追加 6 点证据伤害。',
    endingLine: '你用分类、关系和迁徙证据证明：黑话是一张会移动的语言地图。',
    badge: 'MAP',
    scoreBonus: 6
  },
  {
    id: 'pressure_lens',
    title: '压力透镜',
    requiredFragmentIds: ['fragment_identity', 'fragment_sentiment'],
    effect: 'Boss 对你造成的直接伤害减少 6 点。',
    endingLine: '你看见标签背后的身份需求和情绪压力，没有把玩家简化成单一词条。',
    badge: 'LENS',
    scoreBonus: 5
  },
  {
    id: 'translation_bridge',
    title: '转译桥',
    requiredFragmentIds: ['fragment_timeline', 'fragment_translation'],
    effect: '最终战最大回合数 +2，给反击留下更多窗口。',
    endingLine: '你把历史阶段和跨语境转译连在一起，理解黑话为什么会在传播中变形。',
    badge: 'BRIDGE',
    scoreBonus: 5
  },
  {
    id: 'algorithm_trace',
    title: '算法追踪',
    requiredFragmentIds: ['fragment_algorithm', 'fragment_sentiment', 'fragment_translation'],
    effect: '终章结算额外获得 6 分，并解锁算法放大器结论。',
    endingLine: '你证明平台推荐会放大情绪和误读，也能被透明的语境补丁重新校准。',
    badge: 'TRACE',
    scoreBonus: 6
  }
];

export const getUnlockedFragmentCombos = (fragmentIds: string[]) => {
  const owned = new Set(fragmentIds);
  return FRAGMENT_COMBOS.filter(combo => combo.requiredFragmentIds.every(id => owned.has(id)));
};

export const getEvidenceBattleBonus = (fragmentIds: string[]): EvidenceBattleBonus => {
  const unlockedCombos = getUnlockedFragmentCombos(fragmentIds);
  return {
    attackBonus: unlockedCombos.some(combo => combo.id === 'language_map') ? 6 : 0,
    damageReduction: unlockedCombos.some(combo => combo.id === 'pressure_lens') ? 6 : 0,
    maxTurnBonus: unlockedCombos.some(combo => combo.id === 'translation_bridge') ? 2 : 0,
    comboScoreBonus: unlockedCombos.reduce((sum, combo) => sum + combo.scoreBonus, 0),
    unlockedCombos,
  };
};

export const getEndingForScore = (score: number, won: boolean): Omit<GameEnding, 'completedAt'> => {
  if (!won) {
    return {
      rank: 'FAIL',
      title: '失败重试',
      score,
      won,
      summary: '信息过载协议启动。你保留了已收集的证据，可以调整技能顺序后再次挑战。'
    };
  }

  if (score >= 90) {
    return {
      rank: 'S',
      title: '共建者',
      score,
      won,
      summary: '你收集了足够证据，也理解了圈层语言的连接与边界。你能参与塑造更开放的玩家社区。'
    };
  }

  if (score >= 70) {
    return {
      rank: 'A',
      title: '解码者',
      score,
      won,
      summary: '你击败了算法霸主，并能读懂大多数黑话背后的数据线索。还有少量碎片等待回收。'
    };
  }

  return {
    rank: 'B',
    title: '逃离信息风暴',
    score,
    won,
    summary: '你突破了最终战，但对黑话生态的理解仍有缺口。回到章节中补齐证据会改变结局。'
  };
};
