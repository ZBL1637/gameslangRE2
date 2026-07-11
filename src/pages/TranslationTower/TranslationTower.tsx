// ============================================================================
// 第五章：译语通天塔 (Tower of Translation) - 主组件
// ============================================================================

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/Button/Button';
import { ChapterCompass } from '@/components/ChapterCompass/ChapterCompass';
import { ChapterRewardOverlay } from '@/components/ChapterRewardOverlay/ChapterRewardOverlay';
import { useModalDialog } from '@/hooks/useModalDialog';
import type { ChapterReward } from '@/data/chapterProgress';
import { 
  Chapter5GlobalState, 
  FloorType, 
  RuneType,
  PhraseEntry
} from './types';
import { NotificationOverlay, NotificationItem } from './components/common/NotificationOverlay';
import { 
  CHAPTER_META, 
  NPC_DIALOGUES, 
  NARRATION_TEXTS, 
  KEYWORD_CHALLENGES,
  STYLE_CHALLENGES,
  METAPHOR_CHALLENGES,
  BOSS_ASSEMBLER_DATA,
  SKILL_DATA
} from './data';

// 布局组件
import { IntroSection } from './components/layout/IntroSection';
import { BazaarHub } from './components/layout/BazaarHub';
import { HUD } from './components/layout/HUD';
import { OutroSection } from './components/layout/OutroSection';
import { SkillUnlock } from './components/layout/SkillUnlock';

// 挑战组件
import { KeywordChallenge } from './components/challenges/KeywordChallenge';
import { StyleChallenge } from './components/challenges/StyleChallenge';
import { MetaphorChallenge } from './components/challenges/MetaphorChallenge';
import { BossAssembler } from './components/challenges/BossAssembler';
import type { BossAssemblyScores } from './bossAssemblerScoring';

import './TranslationTower.scss';

const createInitialTowerState = (): Chapter5GlobalState => ({
  currentFloor: FloorType.F0_BAZAAR,
  comms: 100,
  clarity: 50,
  culture: 50,
  runes: [],
  hintTickets: 0,
  ticketsUsed: 0,
  phrasebook: [],
  floorProgress: {
    [FloorType.F0_BAZAAR]: true,
    [FloorType.F1_KEYWORD]: false,
    [FloorType.F2_STYLE]: false,
    [FloorType.F3_METAPHOR]: false,
    [FloorType.F4_BOSS]: false
  }
});

export const TranslationTower: React.FC = () => {
  const navigate = useNavigate();
  const { state, completeChapterRun, restartChapter, updateChapterProgress } = usePlayer();
  const savedProgress = state.chapterProgress?.chapter_5 || {};
  const isChapterCompleted = state.completedChapters.includes(5);

  // 初始状态
  const [gameState, setGameState] = useState<Chapter5GlobalState>(() => savedProgress.gameState || createInitialTowerState());

  // 流程控制状态
  const [phase, setPhase] = useState<'intro' | 'game' | 'skill' | 'outro'>(() => {
    if (isChapterCompleted) return 'game';
    return savedProgress.phase || 'intro';
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [reward, setReward] = useState<ChapterReward | null>(null);
  const notificationSeqRef = useRef(0);

  const completedChallengeCount = useMemo(() => {
    return [FloorType.F1_KEYWORD, FloorType.F2_STYLE, FloorType.F3_METAPHOR, FloorType.F4_BOSS]
      .filter(floor => gameState.floorProgress[floor]).length;
  }, [gameState.floorProgress]);

  const allTrialsComplete = completedChallengeCount >= 4;

  useEffect(() => {
    updateChapterProgress('chapter_5', {
      phase,
      gameState
    });
  }, [gameState, phase, updateChapterProgress]);

  // 通知辅助函数
  const showNotification = useCallback((type: NotificationItem['type'], message: string, icon?: string) => {
    const newNote: NotificationItem = {
      id: `${Date.now()}_${notificationSeqRef.current++}`,
      type,
      message,
      icon
    };
    setNotifications(prev => [...prev, newNote]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clampStat = (value: number) => Math.max(0, Math.min(100, value));
  
  // 处理状态更新
  const updateState = useCallback((delta: Partial<Chapter5GlobalState>) => {
    setGameState(prev => {
      const nextComms = delta.comms !== undefined ? clampStat(prev.comms + delta.comms) : prev.comms;
      const nextClarity = delta.clarity !== undefined ? clampStat(prev.clarity + delta.clarity) : prev.clarity;
      const nextCulture = delta.culture !== undefined ? clampStat(prev.culture + delta.culture) : prev.culture;
      const nextState = {
        ...prev,
        ...delta,
        comms: nextComms,
        clarity: nextClarity,
        culture: nextCulture,
      };

      // 检查失败条件
      if (nextState.comms <= 0) {
        setFailureMessage('沟通彻底崩溃。重新整理翻译策略后再试一次。');
        return { ...nextState, comms: 0 };
      }
      return nextState;
    });
  }, []);

  const setBossScores = useCallback((scores: BossAssemblyScores) => {
    setGameState(prev => ({
      ...prev,
      clarity: clampStat(scores.clarity),
      culture: clampStat(scores.culture),
      comms: clampStat(scores.comms),
    }));
  }, []);

  // 导航
  const handleNavigate = useCallback((floor: FloorType) => {
    setGameState(prev => ({ ...prev, currentFloor: floor }));
  }, []);

  // 增加资源辅助函数
  const addRune = useCallback((rune: RuneType) => {
    setGameState(prev => {
      if (prev.runes.includes(rune)) return prev;
      showNotification('rune', `获得符文：${rune.toUpperCase()}`, '💎');
      return { ...prev, runes: [...prev.runes, rune] };
    });
  }, [showNotification]);

  const addPhrase = useCallback((term: string, definition: string) => {
    setGameState(prev => {
      if (prev.phrasebook.some(p => p.term === term)) return prev;
      showNotification('phrase', `收录新词条：${term}`, '📖');
      const newPhrase: PhraseEntry = {
        id: `p_${Date.now()}`,
        term,
        definition,
        collected: true
      };
      return { ...prev, phrasebook: [...prev.phrasebook, newPhrase] };
    });
  }, [showNotification]);

  const addHintTicket = useCallback(() => {
    setGameState(prev => ({ ...prev, hintTickets: prev.hintTickets + 1 }));
    showNotification('ticket', '获得一张提示券！', '🎟️');
  }, [showNotification]);

  const markFloorComplete = useCallback((floor: FloorType) => {
    setGameState(prev => ({
      ...prev,
      floorProgress: { ...prev.floorProgress, [floor]: true }
    }));
    // 自动返回集市
    handleNavigate(FloorType.F0_BAZAAR);
  }, [handleNavigate]);

  // Intro 完成
  const handleIntroComplete = () => {
    setPhase('game');
  };

  const handleSkipIntro = () => {
    setPhase('game');
  };

  // Boss 战完成
  const handleBossComplete = () => {
    markFloorComplete(FloorType.F4_BOSS);
    setPhase('skill');
  };

  // 技能确认
  const handleSkillConfirm = () => {
    setPhase('outro');
  };

  const handleChapterComplete = () => {
    const newsProgress = state.chapterProgress?.news_5 as { revealed?: boolean; correct?: boolean } | undefined;
    const newsScore = (newsProgress?.revealed ? 2 : 0) + (newsProgress?.correct ? 2 : 0);
    const chapterReward = completeChapterRun(5, {
      score: 16 + completedChallengeCount * 3 + Math.min(gameState.runes.length, 3) + newsScore,
      fragmentIds: ['fragment_translation'],
    });
    setReward(chapterReward);
  };

  const handleRecoverFromFailure = () => {
    setFailureMessage(null);
    setGameState(prev => ({ ...prev, comms: 50, currentFloor: FloorType.F0_BAZAAR }));
    setPhase('game');
  };
  const failureDialogRef = useModalDialog<HTMLDivElement>({
    active: Boolean(failureMessage),
    onClose: handleRecoverFromFailure,
  });

  const handleRestartChapter = () => {
    restartChapter(5);
    setGameState(createInitialTowerState());
    setFailureMessage(null);
    setReward(null);
    setPhase('intro');
  };

  const handleReturnToMap = () => {
    navigate('/world-map', { state: { fromChapter: 5 } });
  };

  // 渲染主内容
  const renderContent = () => {
    if (phase === 'intro') {
      return (
        <IntroSection
          dialogues={NPC_DIALOGUES.intro}
          narrationText={NARRATION_TEXTS.intro}
          onComplete={handleIntroComplete}
          onSkip={handleSkipIntro}
        />
      );
    }

    if (phase === 'skill') {
      return (
        <SkillUnlock
          skillData={SKILL_DATA}
          dialogues={NPC_DIALOGUES.boss_success}
          onConfirm={handleSkillConfirm}
        />
      );
    }

    if (phase === 'outro') {
      return (
        <OutroSection
          narrationText={NARRATION_TEXTS.outro}
          globalState={gameState}
          skillData={SKILL_DATA}
          onContinue={handleChapterComplete}
        />
      );
    }

    // Game Phase
    switch (gameState.currentFloor) {
      case FloorType.F0_BAZAAR:
        return (
          <BazaarHub
            state={gameState}
            onNavigate={handleNavigate}
            onUpdateState={updateState}
            onAddTicket={addHintTicket}
            onAddPhrase={addPhrase}
          />
        );
      case FloorType.F1_KEYWORD:
        return (
          <KeywordChallenge
            items={KEYWORD_CHALLENGES}
            collectedRunes={gameState.runes}
            onComplete={() => markFloorComplete(FloorType.F1_KEYWORD)}
            onExit={() => handleNavigate(FloorType.F0_BAZAAR)}
            onUpdateState={updateState}
            addRune={addRune}
          />
        );
      case FloorType.F2_STYLE:
        return (
          <StyleChallenge
            items={STYLE_CHALLENGES}
            onComplete={() => markFloorComplete(FloorType.F2_STYLE)}
            onExit={() => handleNavigate(FloorType.F0_BAZAAR)}
            onUpdateState={updateState}
          />
        );
      case FloorType.F3_METAPHOR:
        return (
          <MetaphorChallenge
            items={METAPHOR_CHALLENGES}
            onComplete={() => markFloorComplete(FloorType.F3_METAPHOR)}
            onExit={() => handleNavigate(FloorType.F0_BAZAAR)}
            onUpdateState={updateState}
          />
        );
      case FloorType.F4_BOSS:
        return (
          <BossAssembler
            slots={BOSS_ASSEMBLER_DATA}
            globalState={gameState}
            onComplete={handleBossComplete}
            onUpdateState={updateState}
            onSetScores={setBossScores}
          />
        );
      default:
        return <div>Unknown Floor</div>;
    }
  };

  return (
    <div className="translation-tower-page">
      {/* 背景效果 */}
      <div className="tower-background" aria-hidden="true">
        <div className="language-streams">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="language-stream"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`
              }}
            >
              {['你好', 'Hello', 'مرحبا', '안녕', 'Bonjour', '翻译'][i % 6]}
            </div>
          ))}
        </div>
        <div className="tower-silhouette"></div>
      </div>

      {/* HUD - 只在游戏阶段显示 */}
      {phase === 'game' && (
        <HUD state={gameState} title={CHAPTER_META.title} />
      )}
      {phase === 'game' && (
        <div className="translation-side-panels">
          <ChapterCompass
            chapterId={5}
            objective="完成关键词、语气、隐喻与最终组装试炼。"
            progress={`已完成 ${completedChallengeCount} / 4 个试炼`}
          />
        </div>
      )}
      
      <NotificationOverlay notifications={notifications} onRemove={removeNotification} />

      {/* 主内容 */}
      <main className={`main-content phase-${phase}`}>
        {renderContent()}
      </main>

      {phase === 'game' && isChapterCompleted && allTrialsComplete && (
        <div className="ch5-return-panel">
          <p>译语通天塔已通关。你可以回到世界地图，或重新游玩本章。</p>
          <div className="return-actions">
            <Button type="button" variant="primary" onClick={handleReturnToMap}>
              返回世界地图
            </Button>
            <Button type="button" variant="secondary" onClick={handleRestartChapter}>
              重新游玩本章
            </Button>
          </div>
        </div>
      )}

      {failureMessage && (
        <div
          className="translation-failure-panel"
          ref={failureDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="translation-failure-title"
          tabIndex={-1}
        >
          <div className="failure-card">
            <h2 id="translation-failure-title">沟通断裂</h2>
            <p>{failureMessage}</p>
            <button onClick={handleRecoverFromFailure}>返回集市重试</button>
          </div>
        </div>
      )}

      <ChapterRewardOverlay
        reward={reward}
        onContinue={() => navigate('/chapter/final')}
        continueLabel="进入终章"
      />
    </div>
  );
};

export default TranslationTower;
