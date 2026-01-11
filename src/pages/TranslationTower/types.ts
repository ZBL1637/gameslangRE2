// ============================================================================
// 第五章：译语通天塔 (Tower of Translation) - 类型定义
// ============================================================================

// 章节元数据
export interface ChapterMeta {
  id: string;
  title: string;
  floors: FloorConfig[];
  rewardSkill: {
    name: string;
    description: string;
  };
}

export interface FloorConfig {
  id: string;
  name: string;
  type: 'hub' | 'challenge' | 'boss';
  description: string;
}

// 翻译挑战类型
export type ChallengeType = 'keyword' | 'style' | 'metaphor';

// 翻译风格
export type TranslationStyle = 'foreignization' | 'domestication';

// 挑战状态
export type ChallengeStatus = 'locked' | 'available' | 'completed';

// 楼层枚举
export enum FloorType {
  F0_BAZAAR = 'F0_BAZAAR',
  F1_KEYWORD = 'F1_KEYWORD',
  F2_STYLE = 'F2_STYLE',
  F3_METAPHOR = 'F3_METAPHOR',
  F4_BOSS = 'F4_BOSS'
}

// 全局状态
export interface Chapter5GlobalState {
  currentFloor: FloorType;
  comms: number;   // 沟通值 (HP)
  clarity: number; // 清晰度
  culture: number; // 文化度
  runes: RuneType[];
  hintTickets: number;
  ticketsUsed: number;
  phrasebook: PhraseEntry[];
  floorProgress: Record<FloorType, boolean>;
}

export type RuneType = 'accuracy' | 'elegance' | 'spirit';

export interface PhraseEntry {
  id: string;
  term: string;
  definition: string;
  collected: boolean;
}

// F0: 误译委托卡片
export interface MistranslationCard {
  id: string;
  title: string;
  request: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    reward?: {
      comms?: number;
      clarity?: number;
      culture?: number;
      ticket?: boolean;
    };
    reaction?: string; // 阿里吐槽/反馈
  }[];
}

// F1: 关键词锻炉
export interface KeywordItem {
  id: string;
  chinese: string;
  pinyin: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  strategy: 'transliteration' | 'paraphrase' | 'domestication' | 'foreignization'; // 音译/意译/归化/异化
  culturalNote: string;
  runeDrop?: RuneType;
}

// F2: 语气熔炉
export interface StyleItem {
  id: string;
  chinese: string;
  context: string;
  foreignization: {
    translation: string;
    explanation: string;
    culturalPreservation: number; // 0-100
    accessibility: number; // 0-100
  };
  domestication: {
    translation: string;
    explanation: string;
    culturalPreservation: number;
    accessibility: number;
  };
  gloss?: {
    text: string; // 注释内容
    effect: { clarity: number; culture: number };
  };
}

// F3: 隐喻回廊
export interface MetaphorItem {
  id: string;
  left: { id: string; text: string; type: 'source' };
  right: { id: string; text: string; type: 'target' };
  connection: string;
  explanation: string;
}

// F4: Boss 拼装槽位
export interface BossSlot {
  id: number;
  originalText: string;
  options: {
    id: string;
    text: string;
    tags: ('foreignization' | 'domestication' | 'neutral')[];
    stats: { clarity: number; culture: number };
  }[];
}

// 挑战数据
export interface Challenge {
  id: ChallengeType;
  name: string;
  description: string;
  icon: string;
  status: ChallengeStatus;
  reward: string;
}

// NPC对话
export interface NPCDialogue {
  id: string;
  speaker: string;
  text: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'confused' | 'excited';
}

// 技能数据
export interface SkillData {
  name: string;
  englishName: string;
  icon: string;
  description: string;
  effects: string[];
  lore: string;
}

export interface Merchant {
  id: string;
  name: string;
  origin: string;
  avatar: string;
  dialogues: {
    greeting: string;
    confused: string;
    understanding: string;
    thanks: string;
  };
}

// 最终翻译任务
export interface FinalTranslationTask {
  originalText: string;
  context: string;
  targetMerchant: string;
  hints: string[];
  correctTranslation: string;
  playerTranslation?: string;
}

// 游戏状态
export interface Chapter5State {
  currentPhase: 'intro' | 'tower' | 'challenges' | 'final' | 'skill' | 'outro';
  completedChallenges: ChallengeType[];
  unlockedSkills: string[];
  merchantUnderstanding: number; // 0-100
  currentChallenge: ChallengeType | null;
}

// NPC对话 (Removed duplicate definition)
// export interface NPCDialogue { ... }

// 角色译名注解
export interface CharacterNameNote {
  id: string;
  chinese: string;
  english: string;
  pinyin: string;
  strategy: TranslationStyle;
  reason: string;
  culturalBackground: string;
}
