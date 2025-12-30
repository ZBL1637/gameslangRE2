// 游戏状态
export interface GameState {
  currentZone: string | null;
  fragmentsCollected: string[];
  zonesCompleted: string[];
  skillUnlocked: boolean;
}

// 森林区域
export interface ForestZone {
  id: string;
  name: string;
  icon: string;
  description: string;
  challenge: {
    type: 'sunburst' | 'network' | 'heatmap';
    title: string;
    description: string;
    instructions: string;
  };
  fragment: {
    id: string;
    name: string;
    description: string;
    keywords: string[];
  };
  terms: TermData[];
}

// 术语数据
export interface TermData {
  id: string;
  term: string;
  category: string;
  subCategory?: string;
  definition: string;
  example: string;
  relatedTerms?: string[];
}

// 对话选项
export interface DialogueOption {
  id: string;
  text: string;
  response: string;
}
