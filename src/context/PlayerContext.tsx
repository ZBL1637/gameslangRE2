import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { QUESTS } from '@/data/quests';
import { ACHIEVEMENTS, Achievement } from '@/data/achievements';
import {
  ChapterReward,
  GameEnding,
  SkillRewardId,
  getChapterConfig,
  getChapterGrade,
  getFragments,
} from '@/data/chapterProgress';
import { DialogBox } from '@/components/DialogBox/DialogBox'; // 复用 DialogBox 做成就弹窗
import { Icon } from '@/components/Icon/Icon';
import './PlayerContext.scss';

const SAVE_KEY = 'datanews_player_save';
const SAVE_VERSION = 2;

// 1. 定义玩家状态接口
export interface PlayerState {
  saveVersion: number;
  level: number;
  currentExp: number;
  expToNext: number;
  unlockedChapters: number[]; // 存储章节 ID
  completedChapters: number[];
  dictionaryUnlocked: boolean; // 是否已获得“术语图鉴”
  unlockedTerms: string[];
  viewedTerms: string[];
  achievements: string[]; // 成就 ID
  completedQuests: string[]; // 已完成的任务 ID
  activeQuests: string[]; // 已激活的任务 ID (当前简化逻辑：未完成即视为 active)
  newPlayerMode: boolean; // 新手模式开关
  tutorialProgress?: {
    phase: string;
  };
  chapterProgress: Record<string, any>; // 存储各章节的具体进度 state
  skillsUnlocked: SkillRewardId[];
  dataFragments: string[];
  chapterScores: Record<string, number>;
  visitedChapters: number[];
  ending: GameEnding | null;
}

// 默认初始状态
const INITIAL_STATE: PlayerState = {
  saveVersion: SAVE_VERSION,
  level: 1,
  currentExp: 0,
  expToNext: 100, // 初始升级所需经验
  unlockedChapters: [0], // 默认解锁新手村(Chapter 0)
  completedChapters: [],
  dictionaryUnlocked: false,
  unlockedTerms: [],
  viewedTerms: [],
  achievements: [],
  completedQuests: [],
  activeQuests: ['main_ch1', 'side_ch1_bridge', 'side_ch1_collocation'], // 初始激活任务
  newPlayerMode: true,
  tutorialProgress: { phase: 'entering' },
  chapterProgress: {},
  skillsUnlocked: [],
  dataFragments: [],
  chapterScores: {},
  visitedChapters: [],
  ending: null
};

// 2. Context Value 接口
interface PlayerContextType {
  state: PlayerState;
  addExp: (amount: number) => void;
  unlockChapter: (chapterId: number) => void;
  completeChapter: (chapterId: number) => void;
  completeChapterRun: (chapterId: number, options?: { score?: number; fragmentIds?: string[] }) => ChapterReward;
  restartChapter: (chapterId: number) => void;
  unlockTerm: (termId: string) => void;
  markTermViewed: (termId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  unlockSkill: (skillId: SkillRewardId) => void;
  collectDataFragment: (fragmentId: string) => void;
  recordChapterScore: (chapterId: number, score: number) => void;
  visitChapter: (chapterId: number) => void;
  finishGame: (ending: GameEnding) => void;
  completeQuest: (questId: string) => void;
  toggleNewPlayerMode: () => void;
  resetProgress: () => void;
  getQuestStatus: (questId: string) => 'active' | 'completed' | 'locked';
  updateTutorialProgress: (phase: string) => void;
  updateChapterProgress: (key: string, data: any) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);
type PlayerActionsContextType = Omit<PlayerContextType, 'state'>;
const PlayerActionsContext = createContext<PlayerActionsContextType | undefined>(undefined);

const addExpToState = (prev: PlayerState, amount: number): PlayerState => {
  if (amount <= 0) return prev;

  let newExp = prev.currentExp + amount;
  let newLevel = prev.level;
  let newExpToNext = prev.expToNext;

  while (newExp >= newExpToNext) {
    newExp -= newExpToNext;
    newLevel++;
    newExpToNext = Math.floor(newExpToNext * 1.5);
  }

  return {
    ...prev,
    level: newLevel,
    currentExp: newExp,
    expToNext: newExpToNext
  };
};

const uniqueAppend = <T,>(list: T[], items: T[]) => {
  const next = [...list];
  items.forEach((item) => {
    if (!next.includes(item)) next.push(item);
  });
  return next;
};

const migrateState = (raw: unknown): PlayerState => {
  const parsed = raw && typeof raw === 'object' ? raw as Partial<PlayerState> : {};
  const merged: PlayerState = {
    ...INITIAL_STATE,
    ...parsed,
    saveVersion: SAVE_VERSION,
    unlockedChapters: Array.isArray(parsed.unlockedChapters) ? parsed.unlockedChapters : INITIAL_STATE.unlockedChapters,
    completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : INITIAL_STATE.completedChapters,
    unlockedTerms: Array.isArray(parsed.unlockedTerms) ? parsed.unlockedTerms : INITIAL_STATE.unlockedTerms,
    viewedTerms: Array.isArray(parsed.viewedTerms) ? parsed.viewedTerms : INITIAL_STATE.viewedTerms,
    achievements: Array.isArray(parsed.achievements) ? parsed.achievements : INITIAL_STATE.achievements,
    completedQuests: Array.isArray(parsed.completedQuests) ? parsed.completedQuests : INITIAL_STATE.completedQuests,
    activeQuests: Array.isArray(parsed.activeQuests) ? parsed.activeQuests : INITIAL_STATE.activeQuests,
    chapterProgress: parsed.chapterProgress && typeof parsed.chapterProgress === 'object' ? parsed.chapterProgress : {},
    skillsUnlocked: Array.isArray(parsed.skillsUnlocked) ? parsed.skillsUnlocked : [],
    dataFragments: Array.isArray(parsed.dataFragments) ? parsed.dataFragments : [],
    chapterScores: parsed.chapterScores && typeof parsed.chapterScores === 'object' ? parsed.chapterScores : {},
    visitedChapters: Array.isArray(parsed.visitedChapters) ? parsed.visitedChapters : [],
    ending: parsed.ending ?? null,
  };

  if (!merged.dictionaryUnlocked && merged.completedChapters.includes(1)) {
    merged.dictionaryUnlocked = true;
  }
  if (merged.dictionaryUnlocked && !merged.activeQuests.includes('side_visit_dict')) {
    merged.activeQuests = [...merged.activeQuests, 'side_visit_dict'];
  }

  return merged;
};

// 3. Provider 组件
export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlayerState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return INITIAL_STATE;
      return migrateState(JSON.parse(saved));
    } catch {
      return INITIAL_STATE;
    }
  });

  const [notification, setNotification] = useState<{ type: 'achievement', data: Achievement } | null>(null);
  const stateRef = useRef(state);

  // 每次状态更新时保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, saveVersion: SAVE_VERSION }));
    } catch {
      // localStorage 可能被禁用或超限，游戏仍继续运行。
    }
  }, [state]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 经验值增加逻辑
  const addExp = useCallback((amount: number) => {
    setState(prev => addExpToState(prev, amount));
  }, []);

  const unlockChapter = useCallback((chapterId: number) => {
    setState(prev => {
      if (prev.unlockedChapters.includes(chapterId)) return prev;
      return { ...prev, unlockedChapters: [...prev.unlockedChapters, chapterId] };
    });
  }, []);

  const unlockTerm = useCallback((termId: string) => {
    setState(prev => {
      const list = prev.unlockedTerms || [];
      if (list.includes(termId)) return prev;
      return { ...prev, unlockedTerms: [...list, termId] };
    });
  }, []);

  const completeQuest = useCallback((questId: string) => {
    setState(prev => {
      if (prev.completedQuests.includes(questId)) return prev;
      
      const quest = QUESTS.find(q => q.id === questId);
      if (quest) {
        return addExpToState({
          ...prev,
          completedQuests: [...prev.completedQuests, questId],
        }, quest.expReward);
      }
      
      return { ...prev, completedQuests: [...prev.completedQuests, questId] };
    });
  }, []);

  const completeChapterRun = useCallback((chapterId: number, options?: { score?: number; fragmentIds?: string[] }) => {
    const currentState = stateRef.current;
    const config = getChapterConfig(chapterId);
    const chapterTitle = config?.title ?? `第 ${chapterId} 章`;
    const isNewCompletion = !currentState.completedChapters.includes(chapterId);
    const nextChapterId = chapterId < 6 ? chapterId + 1 : undefined;
    const relatedQuest = QUESTS.find(q => q.chapterId === chapterId && q.type === 'main');
    const score = options?.score ?? config?.baseScore ?? 10;
    const fragmentIds = options?.fragmentIds ?? config?.fragmentIds ?? [];
    const fragments = getFragments(fragmentIds);
    const grade = getChapterGrade(score, chapterId);
    const achievements = [
      ...(config?.achievementId ? [config.achievementId] : []),
      ...(chapterId >= 1 && chapterId <= 5 && grade === 'S' ? [`s_rank_chapter_${chapterId}`] : []),
    ];
    const expReward = relatedQuest
      ? (currentState.completedQuests.includes(relatedQuest.id) ? 0 : relatedQuest.expReward)
      : (chapterId === 0 ? 80 : 0);

    setState(prev => {
      const alreadyCompleted = prev.completedChapters.includes(chapterId);
      let nextState: PlayerState = {
        ...prev,
        visitedChapters: uniqueAppend(prev.visitedChapters || [], [chapterId]),
        chapterScores: {
          ...(prev.chapterScores || {}),
          [String(chapterId)]: Math.max(prev.chapterScores?.[String(chapterId)] ?? 0, score),
        },
      };

      if (alreadyCompleted) return nextState;

      nextState.completedChapters = uniqueAppend(nextState.completedChapters, [chapterId]);
      nextState.dataFragments = uniqueAppend(nextState.dataFragments || [], fragmentIds);

      if (config?.rewardSkillId) {
        nextState.skillsUnlocked = uniqueAppend(nextState.skillsUnlocked || [], [config.rewardSkillId]);
      }

      if (config?.achievementId) {
        nextState.achievements = uniqueAppend(nextState.achievements || [], [config.achievementId]);
      }

      if (chapterId >= 1 && chapterId <= 5 && getChapterGrade(score, chapterId) === 'S') {
        nextState.achievements = uniqueAppend(nextState.achievements || [], [`s_rank_chapter_${chapterId}`]);
      }

      if (chapterId === 1 && !nextState.dictionaryUnlocked) {
        nextState.dictionaryUnlocked = true;
        nextState.activeQuests = uniqueAppend(nextState.activeQuests, ['side_visit_dict']);
      }

      if (nextChapterId && !nextState.unlockedChapters.includes(nextChapterId)) {
        nextState.unlockedChapters = [...nextState.unlockedChapters, nextChapterId];
        const nextQuest = QUESTS.find(q => q.chapterId === nextChapterId && q.type === 'main');
        if (nextQuest) nextState.activeQuests = uniqueAppend(nextState.activeQuests, [nextQuest.id]);
      }

      const mainChaptersCompleted = [1, 2, 3, 4, 5, 6].every(id =>
        id === chapterId || nextState.completedChapters.includes(id)
      );
      if (mainChaptersCompleted) {
        nextState.achievements = uniqueAppend(nextState.achievements, ['completionist']);
      }

      if ((nextState.skillsUnlocked || []).length >= 4) {
        nextState.achievements = uniqueAppend(nextState.achievements, ['skill_collector']);
      }

      if ((nextState.dataFragments || []).length >= 8) {
        nextState.achievements = uniqueAppend(nextState.achievements, ['evidence_master']);
      }

      const allMainChaptersS = [1, 2, 3, 4, 5].every(id => {
        const savedScore = id === chapterId ? score : nextState.chapterScores?.[String(id)] ?? 0;
        return getChapterGrade(savedScore, id) === 'S';
      });
      if (allMainChaptersS) {
        nextState.achievements = uniqueAppend(nextState.achievements, ['perfect_mainline']);
      }

      return nextState;
    });

    achievements.forEach((achievementId) => {
      if (!currentState.achievements.includes(achievementId)) {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (achievement) {
          setNotification({ type: 'achievement', data: achievement });
          setTimeout(() => setNotification(null), 3000);
        }
      }
    });

    if (relatedQuest) {
      setTimeout(() => completeQuest(relatedQuest.id), 0);
    } else if (chapterId === 0 && isNewCompletion) {
      setTimeout(() => addExp(80), 0);
    }

    return {
      chapterId,
      chapterTitle,
      isNewCompletion,
      expReward: isNewCompletion ? expReward : 0,
      skillId: config?.rewardSkillId,
      skillName: config?.rewardSkillName,
      fragments,
      achievements: isNewCompletion ? achievements : [],
      nextChapterId,
      score,
    };
  }, [addExp, completeQuest]);

  const completeChapter = useCallback((chapterId: number) => {
    completeChapterRun(chapterId);
  }, [completeChapterRun]);

  const restartChapter = useCallback((chapterId: number) => {
    setState(prev => {
      const current = prev.chapterProgress || {};
      const next = { ...current };
      const keysToClear = [`ch${chapterId}`, `chapter_${chapterId}`];
      keysToClear.forEach((k) => {
        if (k in next) delete next[k];
      });
      return { ...prev, chapterProgress: next };
    });
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setState(prev => {
      if (prev.achievements.includes(achievementId)) return prev;
      
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievement) {
        setNotification({ type: 'achievement', data: achievement });
        // 3秒后自动关闭通知
        setTimeout(() => setNotification(null), 3000);
      }
      
      return { ...prev, achievements: [...prev.achievements, achievementId] };
    });
  }, []);

  const markTermViewed = useCallback((termId: string) => {
    setState(prev => {
      const list = prev.viewedTerms || [];
      if (list.includes(termId)) return prev;
      const nextViewed = [...list, termId];

      if (nextViewed.length >= 10 && !prev.achievements.includes('bookworm')) {
        setTimeout(() => unlockAchievement('bookworm'), 0);
      }

      return { ...prev, viewedTerms: nextViewed };
    });
  }, [unlockAchievement]);

  const unlockSkill = useCallback((skillId: SkillRewardId) => {
    setState(prev => {
      const skillsUnlocked = uniqueAppend(prev.skillsUnlocked || [], [skillId]);
      const achievements = skillsUnlocked.length >= 4
        ? uniqueAppend(prev.achievements || [], ['skill_collector'])
        : prev.achievements;
      return { ...prev, skillsUnlocked, achievements };
    });
  }, []);

  const collectDataFragment = useCallback((fragmentId: string) => {
    setState(prev => ({
      ...prev,
      dataFragments: uniqueAppend(prev.dataFragments || [], [fragmentId])
    }));
  }, []);

  const recordChapterScore = useCallback((chapterId: number, score: number) => {
    setState(prev => ({
      ...prev,
      chapterScores: {
        ...(prev.chapterScores || {}),
        [String(chapterId)]: Math.max(prev.chapterScores?.[String(chapterId)] ?? 0, score),
      }
    }));
  }, []);

  const visitChapter = useCallback((chapterId: number) => {
    setState(prev => ({
      ...prev,
      visitedChapters: uniqueAppend(prev.visitedChapters || [], [chapterId])
    }));
  }, []);

  const finishGame = useCallback((ending: GameEnding) => {
    setState(prev => {
      const achievements = ending.rank === 'S'
        ? uniqueAppend(prev.achievements || [], ['s_rank_ending'])
        : prev.achievements;
      return { ...prev, ending, achievements };
    });
  }, []);

  const toggleNewPlayerMode = useCallback(() => {
    setState(prev => ({ ...prev, newPlayerMode: !prev.newPlayerMode }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(INITIAL_STATE);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const getQuestStatus = useCallback((questId: string) => {
    const currentState = stateRef.current;
    if (currentState.completedQuests.includes(questId)) return 'completed';
    if (currentState.activeQuests.includes(questId)) return 'active';
    return 'locked';
  }, []);

  const updateTutorialProgress = useCallback((phase: string) => {
    setState(prev => ({
      ...prev,
      tutorialProgress: { phase }
    }));
  }, []);

  const updateChapterProgress = useCallback((key: string, data: any) => {
    setState(prev => {
      const currentChapterProgress = prev.chapterProgress || {};
      return {
        ...prev,
        chapterProgress: {
          ...currentChapterProgress,
          [key]: {
            ...(currentChapterProgress[key] || {}),
            ...data
          }
        }
      };
    });
  }, []);

  const contextValue = useMemo<PlayerContextType>(() => {
    return {
      state,
      addExp,
      unlockChapter,
      completeChapter,
      completeChapterRun,
      restartChapter,
      unlockTerm,
      markTermViewed,
      unlockAchievement,
      unlockSkill,
      collectDataFragment,
      recordChapterScore,
      visitChapter,
      finishGame,
      completeQuest,
      toggleNewPlayerMode,
      resetProgress,
      getQuestStatus,
      updateTutorialProgress,
      updateChapterProgress,
    };
  }, [
    state,
    addExp,
    unlockChapter,
    completeChapter,
    completeChapterRun,
    restartChapter,
    unlockTerm,
    markTermViewed,
    unlockAchievement,
    unlockSkill,
    collectDataFragment,
    recordChapterScore,
    visitChapter,
    finishGame,
    completeQuest,
    toggleNewPlayerMode,
    resetProgress,
    getQuestStatus,
    updateTutorialProgress,
    updateChapterProgress,
  ]);

  const actionsValue = useMemo<PlayerActionsContextType>(() => {
    return {
      addExp,
      unlockChapter,
      completeChapter,
      completeChapterRun,
      restartChapter,
      unlockTerm,
      markTermViewed,
      unlockAchievement,
      unlockSkill,
      collectDataFragment,
      recordChapterScore,
      visitChapter,
      finishGame,
      completeQuest,
      toggleNewPlayerMode,
      resetProgress,
      getQuestStatus,
      updateTutorialProgress,
      updateChapterProgress,
    };
  }, [
    addExp,
    unlockChapter,
    completeChapter,
    completeChapterRun,
    restartChapter,
    unlockTerm,
    markTermViewed,
    unlockAchievement,
    unlockSkill,
    collectDataFragment,
    recordChapterScore,
    visitChapter,
    finishGame,
    completeQuest,
    toggleNewPlayerMode,
    resetProgress,
    getQuestStatus,
    updateTutorialProgress,
    updateChapterProgress,
  ]);

  return (
    <PlayerActionsContext.Provider value={actionsValue}>
      <PlayerContext.Provider value={contextValue}>
        {children}
        
        {/* 全局成就通知 */}
        {notification && notification.type === 'achievement' && (
          <div className="player-achievement-toast">
            <DialogBox 
              text={`Unlocked: ${notification.data.name}`}
              speaker="ACHIEVEMENT"
              avatar={<Icon name={notification.data.icon} size="lg" />}
              speed={50}
            />
          </div>
        )}
      </PlayerContext.Provider>
    </PlayerActionsContext.Provider>
  );
};

// 4. Custom Hook
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

/**
 * 获取仅包含 action 的 Player 上下文，避免 state 更新触发不必要的重渲染
 */
export const usePlayerActions = () => {
  const context = useContext(PlayerActionsContext);
  if (context === undefined) {
    throw new Error('usePlayerActions must be used within a PlayerProvider');
  }
  return context;
};
