// ============================================================================
// 第五章：译语通天塔 (Tower of Translation) - 主组件
// ============================================================================

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

import './TranslationTower.scss';

export const TranslationTower: React.FC = () => {
  const navigate = useNavigate();

  // 初始状态
  const [gameState, setGameState] = useState<Chapter5GlobalState>({
    currentFloor: FloorType.F0_BAZAAR, // 初始在集市，但在 Intro 阶段会被隐藏
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

  // 流程控制状态
  const [phase, setPhase] = useState<'intro' | 'game' | 'skill' | 'outro'>('intro');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 通知辅助函数
  const showNotification = useCallback((type: NotificationItem['type'], message: string, icon?: string) => {
    const newNote: NotificationItem = {
      id: Date.now().toString(),
      type,
      message,
      icon
    };
    setNotifications(prev => [...prev, newNote]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // 处理状态更新
  const updateState = useCallback((delta: Partial<Chapter5GlobalState>) => {
    setGameState(prev => {
      // 检查失败条件
      if (delta.comms !== undefined && delta.comms <= 0) {
        // 这里可以触发失败弹窗，简单起见先重置为 50
        alert("沟通彻底崩溃！请重新尝试。");
        return { ...prev, ...delta, comms: 50 };
      }
      return { ...prev, ...delta };
    });
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

  // Boss 战完成
  const handleBossComplete = () => {
    markFloorComplete(FloorType.F4_BOSS);
    setPhase('skill');
  };

  // 技能确认
  const handleSkillConfirm = () => {
    setPhase('outro');
  };

  // 渲染主内容
  const renderContent = () => {
    if (phase === 'intro') {
      return (
        <IntroSection
          dialogues={NPC_DIALOGUES.intro}
          narrationText={NARRATION_TEXTS.intro}
          onComplete={handleIntroComplete}
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
          onContinue={() => navigate('/chapter/final')}
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
          />
        );
      default:
        return <div>Unknown Floor</div>;
    }
  };

  return (
    <div className="translation-tower-page">
      {/* 背景效果 */}
      <div className="tower-background">
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
      
      <NotificationOverlay notifications={notifications} onRemove={removeNotification} />

      {/* 主内容 */}
      <main className="main-content" style={{ paddingTop: phase === 'game' ? '0' : '0' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default TranslationTower;
