// ============================================================================
// 第五章：译语通天塔 (Tower of Translation) - 数据文件
// ============================================================================

import {
  ChapterMeta,
  MistranslationCard,
  KeywordItem,
  StyleItem,
  MetaphorItem,
  BossSlot,
  NPCDialogue,
  SkillData,
  FloorType
} from './types';

// 章节元数据
export const CHAPTER_META: ChapterMeta = {
  id: 'chapter5',
  title: '译语通天塔',
  floors: [
    { id: FloorType.F0_BAZAAR, name: '塔下集市', type: 'hub', description: '翻译委托与玩家交流中心' },
    { id: FloorType.F1_KEYWORD, name: 'F1 关键词锻炉', type: 'challenge', description: '词义精准度试炼' },
    { id: FloorType.F2_STYLE, name: 'F2 语气熔炉', type: 'challenge', description: '语体风格试炼' },
    { id: FloorType.F3_METAPHOR, name: 'F3 隐喻回廊', type: 'challenge', description: '文化深层试炼' },
    { id: FloorType.F4_BOSS, name: 'F4 翻译圣坛', type: 'boss', description: '最终组装试炼' }
  ],
  rewardSkill: {
    name: '言灵·转化',
    description: '获得转化伤害类型与属性的能力'
  }
};

// F0: 误译委托卡片
export const BAZAAR_MISTRANSLATIONS: MistranslationCard[] = [
  {
    id: 'm1',
    title: '波斯商人的困惑',
    request: '我想在这个游戏里买一件"神装" (Godly Gear)，但我不知道该怎么说。',
    options: [
      {
        id: 'opt1',
        text: 'Holy Costume (圣洁的戏服)',
        isCorrect: false,
        explanation: '这听起来像是牧师穿的衣服，不是强力装备。',
        reaction: '阿里：哈？我是要去打架，不是去唱诗班！',
        reward: { comms: -10 }
      },
      {
        id: 'opt2',
        text: 'God-tier Equipment (神级装备)',
        isCorrect: true,
        explanation: 'God-tier 是游戏圈常用的表达顶级强度的词。',
        reaction: '阿里：对！就是这个感觉！看起来就很强！',
        reward: { comms: 10, ticket: true }
      },
      {
        id: 'opt3',
        text: 'Deity Clothes (神仙的衣服)',
        isCorrect: false,
        explanation: '这太直白了，听起来像神话故事里的衣服。',
        reaction: '阿里：你是说我要穿成宙斯的样子吗？',
        reward: { comms: -5 }
      }
    ]
  },
  {
    id: 'm2',
    title: '寻找队伍',
    request: '我想找人一起"开黑" (Play together in a net cafe/voice chat)，怎么表达？',
    options: [
      {
        id: 'opt1',
        text: 'Open Black (打开黑色)',
        isCorrect: false,
        explanation: '完全的字面翻译，没人能听懂。',
        reaction: '阿里：打开黑色？把灯关掉吗？',
        reward: { comms: -15 }
      },
      {
        id: 'opt2',
        text: 'Premade Team (预组队)',
        isCorrect: true,
        explanation: 'Premade 指的是预先组好的队伍，虽然不完全等同于开黑，但意思最接近。',
        reaction: '阿里：哦，原来叫这个！我要去找队友了！',
        reward: { comms: 10, ticket: true }
      },
      {
        id: 'opt3',
        text: 'Start Dark (开始黑暗)',
        isCorrect: false,
        explanation: '这听起来像是什么邪恶仪式的开始。',
        reaction: '阿里：听起来好可怕...我不玩黑魔法。',
        reward: { comms: -10 }
      }
    ]
  },
  {
    id: 'm3',
    title: '关于"氪金"',
    request: '这个游戏"氪金" (Pay to win/Spend money) 厉害吗？',
    options: [
      {
        id: 'opt1',
        text: 'Krypton Gold (氪元素金)',
        isCorrect: false,
        explanation: '化学元素翻译，完全偏离原意。',
        reaction: '阿里：超人的弱点？这游戏还能挖矿？',
        reward: { comms: -10 }
      },
      {
        id: 'opt2',
        text: 'Pay-to-Win (花钱赢)',
        isCorrect: true,
        explanation: '虽然稍微贬义，但最准确传达了"花钱变强"的核心含义。',
        reaction: '阿里：懂了，就是看钱包厚度是吧。',
        reward: { comms: 10, ticket: true }
      },
      {
        id: 'opt3',
        text: 'Charge Money (充钱)',
        isCorrect: false,
        explanation: '虽然没错，但没有表达出"氪金"那种为了变强而大量投入的意味。',
        reaction: '阿里：充话费吗？这谁都知道要充钱啊。',
        reward: { comms: -5 }
      }
    ]
  },
  {
    id: 'm4',
    title: '由于"非酋"附体',
    request: '我今天真是"非酋" (Unlucky) 附体，什么都抽不到。',
    options: [
      {
        id: 'opt1',
        text: 'African Chief (非洲酋长)',
        isCorrect: false,
        explanation: '这是具有种族歧视嫌疑的直译，绝对不能在国际服使用。',
        reaction: '阿里：喂！这太冒犯了吧！你想让我被封号吗？',
        reward: { comms: -30 }
      },
      {
        id: 'opt2',
        text: 'Bad RNG (随机数很差)',
        isCorrect: true,
        explanation: 'RNG (Random Number Generation) 是游戏圈通用的运气代名词。',
        reaction: '阿里：是啊，系统的随机数生成器肯定针对我！',
        reward: { comms: 10, ticket: true }
      },
      {
        id: 'opt3',
        text: 'Not European (不是欧洲人)',
        isCorrect: false,
        explanation: '虽然国内流行"欧皇"，但在国外这个梗并不通用。',
        reaction: '阿里：我本来就不是欧洲人啊？这有什么关系？',
        reward: { comms: -5 }
      }
    ]
  },
  {
    id: 'm5',
    title: '这波"由于"',
    request: '刚才那波操作我"犹豫" (Hesitated) 了，导致团灭。',
    options: [
      {
        id: 'opt1',
        text: 'I hesitated (我犹豫了)',
        isCorrect: true,
        explanation: '简单直接，准确表达了意思。',
        reaction: '阿里：下次我会果断一点的！',
        reward: { comms: 10, ticket: true }
      },
      {
        id: 'opt2',
        text: 'I swam (我游泳了)',
        isCorrect: false,
        explanation: '谐音梗误译。',
        reaction: '阿里：这里是陆地地图啊？',
        reward: { comms: -10 }
      },
      {
        id: 'opt3',
        text: 'I fish (我摸鱼)',
        isCorrect: false,
        explanation: '意思完全不一样了。',
        reaction: '阿里：我很认真在玩！没有摸鱼！',
        reward: { comms: -5 }
      }
    ]
  },
  {
    id: 'm6',
    title: '对手是"挂壁"',
    request: '那个狙击手肯定是"挂壁" (Cheater)！',
    options: [
      {
        id: 'opt1',
        text: 'Wall Hanger (挂在墙上的人)',
        isCorrect: false,
        explanation: '字面翻译，不知所云。',
        reaction: '阿里：他是蜘蛛侠吗？',
        reward: { comms: -10 }
      },
      {
        id: 'opt2',
        text: 'Hacker / Cheater',
        isCorrect: true,
        explanation: '国际通用的作弊者称呼。',
        reaction: '阿里：我要举报他！Hacker!',
        reward: { comms: 10, ticket: true }
      },
      {
        id: 'opt3',
        text: 'Plugin User (插件用户)',
        isCorrect: false,
        explanation: 'Plugin 通常指合法的插件，外挂一般叫 Cheat 或 Hack。',
        reaction: '阿里：用插件不违规吧？',
        reward: { comms: -5 }
      }
    ]
  }
];

// F1: 关键词挑战
export const KEYWORD_CHALLENGES: KeywordItem[] = [
  {
    id: 'k1',
    chinese: '孙悟空',
    pinyin: 'Sūn Wù Kōng',
    correctAnswer: 'The Monkey King',
    options: ['Sun Wukong', 'The Monkey King', 'Stone Monkey'],
    explanation: '虽然 Sun Wukong 是音译，但在英语世界中，The Monkey King 的知名度和传播度更高，更能唤起文化共鸣。',
    strategy: 'domestication',
    culturalNote: '中国神话中最著名的英雄角色，以七十二变和筋斗云著称。',
    runeDrop: 'accuracy'
  },
  {
    id: 'k2',
    chinese: '金箍棒',
    pinyin: 'Jīn Gū Bàng',
    correctAnswer: 'Ruyi Jingu Bang',
    options: ['Golden Stick', 'Ruyi Jingu Bang', 'Magic Iron Rod'],
    explanation: 'Golden Stick 过于简单。Ruyi Jingu Bang (如意金箍棒) 保留了"如意" (随心所欲) 的核心概念，是更精准的文化翻译。',
    strategy: 'foreignization',
    culturalNote: '定海神针，重一万三千五百斤，可随心意变大变小。',
    runeDrop: 'accuracy'
  },
  {
    id: 'k3',
    chinese: '猪八戒',
    pinyin: 'Zhū Bā Jiè',
    correctAnswer: 'Zhu Bajie',
    options: ['Pigsy', 'Zhu Bajie', 'Pig Monster'],
    explanation: 'Pigsy 是早期译本的意译（带有贬义）。现代翻译趋向于使用音译 Zhu Bajie 以示尊重，将其视为独立角色而非单纯的"猪"。',
    strategy: 'foreignization',
    culturalNote: '天蓬元帅下凡，虽然贪吃好色，但也是取经团队不可或缺的一员。',
    runeDrop: 'accuracy'
  },
  {
    id: 'k4',
    chinese: '紧箍咒',
    pinyin: 'Jǐn Gū Zhòu',
    correctAnswer: 'Tightening Spell',
    options: ['Headache Spell', 'Tightening Spell', 'Golden Ring Chant'],
    explanation: 'Tightening Spell 准确描述了咒语的功能（收紧金箍），比 Headache Spell (头痛咒) 更具描述性。',
    strategy: 'paraphrase',
    culturalNote: '用来约束孙悟空的法术，象征着心性的修炼与约束。',
    runeDrop: 'accuracy'
  }
];

// F2: 语气挑战
export const STYLE_CHALLENGES: StyleItem[] = [
  {
    id: 's1',
    chinese: '这波不亏，下把能赢。',
    context: '队友失误导致团灭后',
    foreignization: {
      translation: "This wave is not a loss, we can win the next round.",
      explanation: '保留了"波(wave)"的中文游戏术语，比较生硬。',
      culturalPreservation: 90,
      accessibility: 40
    },
    domestication: {
      translation: "Worth. We got this next time.",
      explanation: '使用英语玩家常用的 "Worth" 和鼓励语，非常地道。',
      culturalPreservation: 30,
      accessibility: 95
    },
    gloss: {
      text: '注："波" (Wave) 指一次战斗交锋。',
      effect: { clarity: 20, culture: 0 }
    }
  },
  {
    id: 's2',
    chinese: '这人太阴了，老六！',
    context: '被躲在角落的敌人偷袭',
    foreignization: {
      translation: "This person is too yin! Old Six!",
      explanation: '直接音译"阴"和"老六"，外国人完全听不懂。',
      culturalPreservation: 100,
      accessibility: 10
    },
    domestication: {
      translation: "What a camper! So sneaky!",
      explanation: 'Camper 专指蹲坑阴人的人，完美对应"老六"在游戏里的含义。',
      culturalPreservation: 20,
      accessibility: 90
    },
    gloss: {
      text: '注："老六" (Old Six) 指喜欢躲藏阴人的玩家，源自CS:GO。',
      effect: { clarity: 25, culture: 10 }
    }
  },
  {
    id: 's3',
    chinese: '这种局我也能C？',
    context: '在劣势局中打出精彩操作',
    foreignization: {
      translation: "I can C in this kind of game?",
      explanation: 'C是Carry的缩写，虽然英语也有Carry，但作为动词单用C比较中式。',
      culturalPreservation: 70,
      accessibility: 50
    },
    domestication: {
      translation: "I can carry this mess?",
      explanation: '用 Carry this mess 表达"这种烂局也能带飞"，更自然。',
      culturalPreservation: 40,
      accessibility: 85
    },
    gloss: {
      text: '注："C" 是 Carry (核心输出/带飞) 的缩写。',
      effect: { clarity: 15, culture: 0 }
    }
  }
];

// F3: 隐喻挑战
export const METAPHOR_CHALLENGES: MetaphorItem[] = [
  {
    id: 'm1',
    left: { id: 'l1', text: '落地成盒', type: 'source' },
    right: { id: 'r1', text: 'Insta-death / Loot Box', type: 'target' },
    connection: '形象转化',
    explanation: '游戏中死亡后变成骨灰盒(战利品箱)，形容刚开始就死掉了。'
  },
  {
    id: 'm2',
    left: { id: 'l2', text: '跑毒', type: 'source' },
    right: { id: 'r2', text: 'Outrun the Circle', type: 'target' },
    connection: '机制转化',
    explanation: '中文用"毒"形容安全区外的伤害，英文通常直接说"圈"或"风暴"。'
  },
  {
    id: 'm3',
    left: { id: 'l3', text: '血牛', type: 'source' },
    right: { id: 'r3', text: 'Meat Shield / Tank', type: 'target' },
    connection: '动物隐喻',
    explanation: '中文用"牛"形容血厚耐打，英文常用"肉盾"或"坦克"。'
  },
  {
    id: 'm4',
    left: { id: 'l4', text: '放风筝', type: 'source' },
    right: { id: 'r4', text: 'Kiting', type: 'target' },
    connection: '动作直译',
    explanation: '中英文都用放风筝(Kiting)来形容拉扯打法，是难得的共识。'
  }
];

// F4: Boss 拼装数据
export const BOSS_ASSEMBLER_DATA: BossSlot[] = [
  {
    id: 1,
    originalText: "兄弟们，",
    options: [
      { id: '1a', text: "Brothers,", tags: ['foreignization'], stats: { clarity: 80, culture: 90 } },
      { id: '1b', text: "Guys,", tags: ['domestication'], stats: { clarity: 95, culture: 40 } },
      { id: '1c', text: "Everyone,", tags: ['neutral'], stats: { clarity: 90, culture: 50 } }
    ]
  },
  {
    id: 2,
    originalText: "这波团战",
    options: [
      { id: '2a', text: "this team fight", tags: ['neutral'], stats: { clarity: 90, culture: 60 } },
      { id: '2b', text: "this clash", tags: ['domestication'], stats: { clarity: 85, culture: 50 } },
      { id: '2c', text: "this wave", tags: ['foreignization'], stats: { clarity: 70, culture: 80 } }
    ]
  },
  {
    id: 3,
    originalText: "别上头，",
    options: [
      { id: '3a', text: "don't get overheaded,", tags: ['foreignization'], stats: { clarity: 30, culture: 90 } },
      { id: '3b', text: "don't get greedy,", tags: ['domestication'], stats: { clarity: 95, culture: 40 } },
      { id: '3c', text: "stay cool,", tags: ['neutral'], stats: { clarity: 90, culture: 50 } }
    ]
  },
  {
    id: 4,
    originalText: "我们要猥琐发育，",
    options: [
      { id: '4a', text: "develop wretchedly,", tags: ['foreignization'], stats: { clarity: 20, culture: 100 } },
      { id: '4b', text: "play safe and farm,", tags: ['domestication'], stats: { clarity: 95, culture: 30 } },
      { id: '4c', text: "turtle up,", tags: ['neutral'], stats: { clarity: 90, culture: 40 } }
    ]
  },
  {
    id: 5,
    originalText: "等后期。",
    options: [
      { id: '5a', text: "wait for late game.", tags: ['neutral'], stats: { clarity: 95, culture: 60 } },
      { id: '5b', text: "wait for later period.", tags: ['foreignization'], stats: { clarity: 60, culture: 70 } },
      { id: '5c', text: "scale for late.", tags: ['domestication'], stats: { clarity: 90, culture: 40 } }
    ]
  }
];

export const BAZAAR_CHAT_MESSAGES = [
  {
    id: 'c1',
    user: 'NoobMaster',
    content: '求大腿带飞！我这里有 {gank} 机会，速来！',
    slangTerms: [
      { term: 'gank', definition: 'Gang Kill的缩写，指偷袭/围剿' }
    ]
  },
  {
    id: 'c2',
    user: 'ProGamer',
    content: '这波 {aggro} 拉得太差了，辅助别乱跑！',
    slangTerms: [
      { term: 'aggro', definition: 'Aggression/仇恨值，指怪物对玩家的攻击欲望' }
    ]
  },
  {
    id: 'c3',
    user: 'Healer007',
    content: '由于 {OOM}，无法支援，请自行猥琐。',
    slangTerms: [
      { term: 'OOM', definition: 'Out Of Mana，法力耗尽' }
    ]
  }
];

// NPC对话脚本
export const NPC_DIALOGUES: Record<string, NPCDialogue[]> = {
  intro: [
    {
      id: 'intro_1',
      speaker: '译言大师',
      text: '欢迎来到译语通天塔，年轻的旅者。',
      emotion: 'neutral'
    },
    {
      id: 'intro_2',
      speaker: '译言大师',
      text: '这里是语言的边界，也是文化的交汇点。看看塔下的集市吧。',
      emotion: 'neutral'
    },
    {
      id: 'intro_3',
      speaker: '阿里',
      text: '嘿！这游戏怎么这么难懂？我想买装备，他们带我去买时装...',
      emotion: 'confused'
    },
    {
      id: 'intro_4',
      speaker: '译言大师',
      text: '这位波斯朋友遇到了麻烦。帮助他，也是你修行的开始。',
      emotion: 'neutral'
    }
  ],
  hub_hint: [
    {
      id: 'hub_1',
      speaker: '译言大师',
      text: '在集市中，你会遇到各种因误译而产生的误会。',
      emotion: 'neutral'
    },
    {
      id: 'hub_2',
      speaker: '译言大师',
      text: '选择正确的解释，积累"沟通值"。当你准备好后，可以挑战塔内的试炼。',
      emotion: 'neutral'
    }
  ],
  boss_success: [
    {
      id: 'boss_s1',
      speaker: '阿里',
      text: '哇！原来是这个意思！大家都听懂了！',
      emotion: 'happy'
    },
    {
      id: 'boss_s2',
      speaker: '译言大师',
      text: '精准而优雅。你已经掌握了转化的精髓。',
      emotion: 'happy'
    }
  ],
  boss_fail: [
    {
      id: 'boss_f1',
      speaker: '阿里',
      text: '他们在笑什么？我是不是说错话了？',
      emotion: 'sad'
    },
    {
      id: 'boss_f2',
      speaker: '译言大师',
      text: '沟通断裂了。你需要更准确地传达意图，而不是拘泥于字面。',
      emotion: 'neutral'
    }
  ],
  settlement: [
    {
      id: 'end_1',
      speaker: '阿里',
      text: '谢谢你！现在我终于能和大家一起快乐游戏了！',
      emotion: 'happy'
    },
    {
      id: 'end_2',
      speaker: '译言大师',
      text: '语言不再是障碍，而是连接心灵的桥梁。去吧，带着这份力量。',
      emotion: 'excited'
    }
  ]
};

// 技能数据
export const SKILL_DATA: SkillData = {
  name: '言灵·转化',
  englishName: 'Logos Conversion',
  icon: '🔮',
  description: '掌握翻译之道后获得的神秘力量，能够转化事物的本质属性。',
  effects: [
    '将Boss下一次攻击的伤害类型随机转化为另一种类型',
    '30%几率将伤害转化为治疗效果',
    '冷却时间：4回合'
  ],
  lore: '语言是思想的载体，翻译是文化的桥梁。当你真正理解了语言转化的奥秘，你便获得了改变事物本质的力量。'
};

// 章节叙述文本
export const NARRATION_TEXTS = {
  intro: '在黑话大陆的边境，矗立着一座高耸入云的古塔——译语通天塔。',
  tower_desc: '塔身内外流动着由不同语言文字组成的数据流。塔的底部是一个国际化的贸易集市。',
  outro: '在你的帮助下，阿里终于找到了志同道合的队友，欢声笑语在集市中回荡。\n\n你成功地架起了文化的桥梁，让来自不同世界的人们得以相互理解。'
};

// 最终任务数据
export const FINAL_TASK = {
  originalText: "Tonight we explore new dungeon. Need Tank and Healer. DPS be strong, no lazy!",
  context: "阿里试图在世界频道招募队友",
  hints: [
    "Tank = 肉盾/坦克",
    "Healer = 奶妈/治疗",
    "DPS = 输出位",
    "No lazy = 别划水"
  ]
};

// 商人数据
export const MERCHANTS = [
  {
    name: '阿里',
    avatar: '👳',
    dialogues: {
      confused: '我发出去的消息，为什么没人理我？是不是我的语法有问题？',
      understanding: '原来如此！谢谢你的帮助，我现在感觉自信多了！'
    }
  }
];
