import { IconName } from '@/components/Icon/Icon';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  hidden?: boolean; // 隐藏成就：未解锁时显示为 "???"
  conditionHint?: string; // 解锁提示
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    name: '初出茅庐',
    description: '完成新手村的引导并开始游戏。',
    icon: 'flag',
    conditionHint: '开始游戏'
  },
  {
    id: 'forest_explorer',
    name: '森林探索者',
    description: '完整探索第一章：黑话起源之森。',
    icon: 'star',
    conditionHint: '完成第一章探索'
  },
  {
    id: 'time_traveler',
    name: '时光旅行者',
    description: '完整探索第二章：战斗本体平原。',
    icon: 'exp',
    conditionHint: '完成第二章探索'
  },
  {
    id: 'identity_mapper',
    name: '身份制图师',
    description: '完成玩家生态城镇的身份测试与黑话查询。',
    icon: 'star',
    conditionHint: '完成第三章探索'
  },
  {
    id: 'data_weaver',
    name: '数据织者',
    description: '破解数据洪流之都的四个数据节点。',
    icon: 'check',
    conditionHint: '完成第四章探索'
  },
  {
    id: 'translation_bridge',
    name: '转译桥梁',
    description: '完成译语通天塔的跨文化翻译试炼。',
    icon: 'flag',
    conditionHint: '完成第五章探索'
  },
  {
    id: 'algorithm_slayer',
    name: '算法破壁者',
    description: '击败终章的算法霸主。',
    icon: 'skull',
    conditionHint: '完成终章战斗'
  },
  {
    id: 'explorer',
    name: '探索者',
    description: '解锁并访问所有六个区域。',
    icon: 'star',
    conditionHint: '访问所有区域'
  },
  {
    id: 'bookworm',
    name: '博学者',
    description: '在术语图鉴中查看超过 10 个词条。',
    icon: 'check',
    conditionHint: '查看图鉴详情'
  },
  {
    id: 'speed_runner',
    name: '速通玩家',
    description: '在 1 分钟内完成一个章节的阅读（快速跳过）。',
    icon: 'exp',
    hidden: true
  },
  {
    id: 'completionist',
    name: '全收集',
    description: '完成所有主线任务。',
    icon: 'star',
    hidden: true
  },
  {
    id: 'skill_collector',
    name: '四技在身',
    description: '收集终章前的四个战斗技能。',
    icon: 'exp',
    hidden: true
  },
  {
    id: 's_rank_ending',
    name: '共建者结局',
    description: '以 S 级评价完成终章。',
    icon: 'star',
    hidden: true
  },
  {
    id: 's_rank_chapter_1',
    name: '森之 S 评',
    description: '以 S 级评价完成第一章。',
    icon: 'star',
    hidden: true
  },
  {
    id: 's_rank_chapter_2',
    name: '时路 S 评',
    description: '以 S 级评价完成第二章。',
    icon: 'star',
    hidden: true
  },
  {
    id: 's_rank_chapter_3',
    name: '身份 S 评',
    description: '以 S 级评价完成第三章。',
    icon: 'star',
    hidden: true
  },
  {
    id: 's_rank_chapter_4',
    name: '数据 S 评',
    description: '以 S 级评价完成第四章。',
    icon: 'star',
    hidden: true
  },
  {
    id: 's_rank_chapter_5',
    name: '转译 S 评',
    description: '以 S 级评价完成第五章。',
    icon: 'star',
    hidden: true
  },
  {
    id: 'perfect_mainline',
    name: '全线高分',
    description: '第 1 至第 5 章全部达到 S 级评价。',
    icon: 'check',
    hidden: true
  },
  {
    id: 'evidence_master',
    name: '证据拼图师',
    description: '收集至少 8 枚数据碎片。',
    icon: 'check',
    hidden: true
  },
  {
    id: 'secret_finder',
    name: '数据挖掘者',
    description: '发现并点击了隐藏在界面中的彩蛋。',
    icon: 'lock',
    hidden: true
  },
  {
    id: 'perfect_clear',
    name: '一命通关',
    description: '在新手村测验中一次答对。',
    icon: 'star',
    hidden: true
  },
  {
    id: 'first_wipe',
    name: '第一次团灭',
    description: '在新手村测验中答错。',
    icon: 'skull',
    hidden: true
  }
];
