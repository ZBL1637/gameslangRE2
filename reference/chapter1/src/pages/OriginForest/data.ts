import { ForestZone, DialogueOption } from './types';

// ==================== 文案脚本 ====================
export const SCRIPT: Record<string, string> = {
  // 章节标题
  ch1_title_main: "黑话起源之森",
  ch1_title_sub: "术语谱系与词根探索",
  ch1_title_chapter_index: "CHAPTER 1",

  // 入场旁白
  ch1_intro_narration_1: "你踏入了一片古老而神秘的森林。",
  ch1_intro_narration_2: "这里是游戏黑话的起源之地，每一棵古树都刻满了符文与词条。",
  ch1_intro_narration_3: "从「开团」到「GG」，从「DPS」到「奶妈」……",
  ch1_intro_narration_4: "这些词汇如同森林中的路标，指引着玩家们的协作与交流。",

  // NPC - 森林守护者
  ch1_npc_name: "森林守护者 · 语源",
  ch1_npc_intro_1: "旅行者，欢迎来到黑话起源之森。",
  ch1_npc_intro_2: "我是这片森林的守护者，见证了游戏术语从诞生到流传的全过程。",
  ch1_npc_task: "探索这片森林的三个区域：「林冠之环」了解术语分类，「藤蔓之网」发现词汇关系，「溪流之径」追踪术语迁徙。收集三枚词根碎片，我将授予你「共鸣之声」的力量。",

  // 林冠之环 - 分类探索
  ch1_zone_taxonomy_name: "林冠之环",
  ch1_zone_taxonomy_desc: "在这里，黑话不是暗号，而是一种可复用的分类系统。从一级类到子类，再到具体词条，学会分类就能举一反三。",
  ch1_zone_taxonomy_challenge_title: "术语谱系探索",
  ch1_zone_taxonomy_challenge_desc: "通过旭日图探索术语的分类体系，点击扇区深入了解每个类别。",

  // 藤蔓之网 - 关系探索
  ch1_zone_relation_name: "藤蔓之网",
  ch1_zone_relation_desc: "有些词常常一起出现，它们未必同义，却往往属于同一流程阶段或协作场景。像藤蔓一样把语境结成网。",
  ch1_zone_relation_challenge_title: "共词关系探索",
  ch1_zone_relation_challenge_desc: "通过网络图发现术语之间的共现关系，找到连接不同词群的桥接词。",

  // 溪流之径 - 迁徙探索
  ch1_zone_migration_name: "溪流之径",
  ch1_zone_migration_desc: "术语会迁徙：先在某款游戏里出现，再被直播、攻略与社群搬运，最后进入跨游戏通用词库。",
  ch1_zone_migration_challenge_title: "术语迁徙追踪",
  ch1_zone_migration_challenge_desc: "通过热力图了解术语在不同语境中的搭配强度，发现高强度搭配。",

  // 技能获取
  ch1_skill_name: "共鸣之声",
  ch1_skill_desc: "与队友产生语言共鸣，使全队在接下来的2个回合内攻击力提升20%。",
  ch1_skill_unlock_text: "你已集齐三枚词根碎片，古老的知识在你心中汇聚。作为奖励，我将「共鸣之声」的力量授予你。",

  // 成就
  ch1_achievement_title: "🏆 成就解锁：森林探索者",
  ch1_achievement_body: "你已经完整探索了黑话起源之森的三个区域。",
  ch1_achievement_reward: "EXP +300，获得技能「共鸣之声」",

  // 结尾旁白
  ch1_outro_narration_1: "当你走出起源之森，那些曾经陌生的词汇已经不再只是符号。",
  ch1_outro_narration_2: "你学会了如何分类、如何发现关系、如何追踪迁徙。",
  ch1_outro_narration_3: "这些知识将成为你在游戏世界中沟通的基石。",
  ch1_outro_narration_4: "下一站——战斗本体平原，你将见证黑话如何随着游戏产业一同演变。",
};

// ==================== NPC对话选项 ====================
export const NPC_OPTIONS: DialogueOption[] = [
  {
    id: "opt1",
    text: "词根碎片是什么？",
    response: "每个区域都蕴含着独特的语言智慧。收集这些碎片，你就能理解黑话是如何被分类、关联和传播的。"
  },
  {
    id: "opt2",
    text: "为什么要了解术语分类？",
    response: "分类是理解的第一步。当你知道一个词属于哪一类，就能在新游戏里举一反三，快速融入团队。"
  },
  {
    id: "opt3",
    text: "我准备好了，开始探索！",
    response: "很好。记住，每个区域都有一个挑战等着你。完成挑战，碎片自然会出现。祝你旅途顺利。"
  }
];

// ==================== 森林区域数据 ====================
export const FOREST_ZONES: ForestZone[] = [
  {
    id: "taxonomy",
    name: "林冠之环",
    icon: "🌳",
    description: "在这里，黑话不是暗号，而是一种可复用的分类系统。从一级类到子类，再到具体词条，学会分类就能举一反三。",
    challenge: {
      type: "sunburst",
      title: "术语谱系探索",
      description: "通过旭日图探索术语的分类体系",
      instructions: "点击扇区聚焦，再次点击返回上一级。找到3个不同类别的术语并记录。"
    },
    fragment: {
      id: "fragment_taxonomy",
      name: "分类碎片",
      description: "记录了术语分类体系的智慧",
      keywords: ["玩法术语", "社交术语", "经济术语", "机制术语"]
    },
    terms: [
      { id: "t1", term: "开团", category: "玩法", subCategory: "团队协作", definition: "发起团队战斗或活动", example: "老大喊开团了，大家集合！", relatedTerms: ["团灭", "收割"] },
      { id: "t2", term: "DPS", category: "角色", subCategory: "职业分工", definition: "每秒伤害输出，也指输出职业", example: "这把DPS不够，打不动Boss", relatedTerms: ["坦克", "奶妈"] },
      { id: "t3", term: "GG", category: "社交", subCategory: "礼仪用语", definition: "Good Game，表示比赛结束或认输", example: "打得好，GG！", relatedTerms: ["WP", "EZ"] }
    ]
  },
  {
    id: "relation",
    name: "藤蔓之网",
    icon: "🕸️",
    description: "有些词常常一起出现，它们未必同义，却往往属于同一流程阶段或协作场景。像藤蔓一样把语境结成网。",
    challenge: {
      type: "network",
      title: "共词关系探索",
      description: "通过网络图发现术语之间的共现关系",
      instructions: "拖拽缩放查看网络，找到一个连接两团词群的桥接词。"
    },
    fragment: {
      id: "fragment_relation",
      name: "关系碎片",
      description: "记录了术语之间的关联网络",
      keywords: ["共现", "桥接", "语境", "搭配"]
    },
    terms: [
      { id: "r1", term: "坦克", category: "角色", definition: "负责承受伤害的职业", example: "坦克顶住，奶妈加血", relatedTerms: ["T", "MT", "OT"] },
      { id: "r2", term: "奶妈", category: "角色", definition: "负责治疗的职业", example: "奶妈别停，血线要掉了", relatedTerms: ["治疗", "加血", "回蓝"] },
      { id: "r3", term: "OT", category: "机制", definition: "仇恨溢出，怪物攻击非坦克", example: "DPS别OT，让T先拉稳", relatedTerms: ["仇恨", "拉怪", "嘲讽"] }
    ]
  },
  {
    id: "migration",
    name: "溪流之径",
    icon: "🌊",
    description: "术语会迁徙：先在某款游戏里出现，再被直播、攻略与社群搬运，最后进入跨游戏通用词库。",
    challenge: {
      type: "heatmap",
      title: "术语迁徙追踪",
      description: "通过热力图了解术语在不同语境中的搭配强度",
      instructions: "悬停查看两词搭配强度，找一组高强度搭配。"
    },
    fragment: {
      id: "fragment_migration",
      name: "迁徙碎片",
      description: "记录了术语跨圈层传播的轨迹",
      keywords: ["破圈", "迁移", "通用化", "流行语"]
    },
    terms: [
      { id: "m1", term: "PK", category: "玩法", definition: "玩家对战", example: "来PK一把？", relatedTerms: ["对线", "单挑", "1v1"] },
      { id: "m2", term: "秒杀", category: "经济", definition: "快速击杀或抢购", example: "这波秒杀太快了", relatedTerms: ["秒", "瞬杀", "闪购"] },
      { id: "m3", term: "破防", category: "情感", definition: "情绪防线被突破", example: "这剧情真的破防了", relatedTerms: ["泪目", "DNA动了", "绷不住"] }
    ]
  }
];

// ==================== 术语分类数据（用于旭日图） ====================
export const TAXONOMY_DATA = {
  name: "游戏黑话",
  children: [
    {
      name: "玩法术语",
      children: [
        { name: "团队协作", children: [{ name: "开团" }, { name: "团灭" }, { name: "收割" }] },
        { name: "战斗机制", children: [{ name: "连招" }, { name: "技能循环" }, { name: "爆发" }] },
        { name: "对战模式", children: [{ name: "PK" }, { name: "对线" }, { name: "Gank" }] }
      ]
    },
    {
      name: "角色术语",
      children: [
        { name: "职业分工", children: [{ name: "坦克" }, { name: "DPS" }, { name: "奶妈" }] },
        { name: "玩家类型", children: [{ name: "萌新" }, { name: "大佬" }, { name: "老玩家" }] }
      ]
    },
    {
      name: "社交术语",
      children: [
        { name: "礼仪用语", children: [{ name: "GG" }, { name: "WP" }, { name: "GL" }] },
        { name: "情感表达", children: [{ name: "破防" }, { name: "YYDS" }, { name: "绝绝子" }] }
      ]
    },
    {
      name: "经济术语",
      children: [
        { name: "付费相关", children: [{ name: "氪金" }, { name: "白嫖" }, { name: "648" }] },
        { name: "抽卡文化", children: [{ name: "欧皇" }, { name: "非酋" }, { name: "保底" }] }
      ]
    }
  ]
};

// ==================== 共现关系数据（用于网络图） ====================
export const RELATION_DATA = {
  nodes: [
    { id: "坦克", group: 1 },
    { id: "奶妈", group: 1 },
    { id: "DPS", group: 1 },
    { id: "开团", group: 2 },
    { id: "团灭", group: 2 },
    { id: "OT", group: 3 },
    { id: "仇恨", group: 3 },
    { id: "GG", group: 4 },
    { id: "WP", group: 4 }
  ],
  links: [
    { source: "坦克", target: "奶妈", value: 8 },
    { source: "坦克", target: "DPS", value: 7 },
    { source: "奶妈", target: "DPS", value: 6 },
    { source: "开团", target: "团灭", value: 5 },
    { source: "坦克", target: "OT", value: 6 },
    { source: "OT", target: "仇恨", value: 9 },
    { source: "GG", target: "WP", value: 8 },
    { source: "开团", target: "坦克", value: 4 },
    { source: "团灭", target: "GG", value: 3 }
  ]
};

// ==================== 搭配强度数据（用于热力图） ====================
export const HEATMAP_DATA = [
  { x: "坦克", y: "奶妈", value: 85 },
  { x: "坦克", y: "DPS", value: 72 },
  { x: "奶妈", y: "DPS", value: 68 },
  { x: "开团", y: "团灭", value: 45 },
  { x: "氪金", y: "648", value: 92 },
  { x: "欧皇", y: "非酋", value: 88 },
  { x: "GG", y: "WP", value: 76 },
  { x: "破防", y: "泪目", value: 82 },
  { x: "YYDS", y: "绝绝子", value: 65 }
];
