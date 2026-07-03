import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { ChapterRewardOverlay } from '@/components/ChapterRewardOverlay/ChapterRewardOverlay';
import { Button } from '@/components/Button/Button';
import type { ChapterReward } from '@/data/chapterProgress';
import { IntroSection } from './components/layout/IntroSection';
import { OutroSection } from './components/layout/OutroSection';
import { TimelineMap } from './components/layout/TimelineMap';
import { EraExplorer } from './components/layout/EraExplorer';
import { SkillUnlock } from './components/layout/SkillUnlock';
import { TIMELINE_ERAS } from './data';
import { GameState } from './types';
import bgImage from '../../assets/images/timeroad.webp';

import './BattlePlain.scss';

const BattlePlain: React.FC = () => {
  const navigate = useNavigate();
  const { state, addExp, completeChapterRun, restartChapter, updateChapterProgress } = usePlayer();
  const isChapterCompleted = state.completedChapters.includes(2);
  
  const savedProgress = state.chapterProgress?.['chapter_2'] || {};

  // 游戏状态
  const [gameState, setGameState] = useState<GameState>({
    currentEra: null,
    fragmentsCollected: savedProgress.fragmentsCollected || [],
    minigamesCompleted: savedProgress.minigamesCompleted || [],
    skillUnlocked: savedProgress.skillUnlocked || false
  });
  
  // UI状态
  const [introCompleted, setIntroCompleted] = useState(savedProgress.introCompleted || false);
  const [showEraExplorer, setShowEraExplorer] = useState(false);
  const [showSkillUnlock, setShowSkillUnlock] = useState(false);
  const [showOutro, setShowOutro] = useState(!isChapterCompleted && (savedProgress.showOutro || false));
  const [reward, setReward] = useState<ChapterReward | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // 自动保存进度
  useEffect(() => {
    updateChapterProgress('chapter_2', {
      fragmentsCollected: gameState.fragmentsCollected,
      minigamesCompleted: gameState.minigamesCompleted,
      skillUnlocked: gameState.skillUnlocked,
      introCompleted,
      showOutro
    });
  }, [gameState.fragmentsCollected, gameState.minigamesCompleted, gameState.skillUnlocked, introCompleted, showOutro, updateChapterProgress]);

  // 当完成介绍后滚动到主内容
  useEffect(() => {
    if (introCompleted && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [introCompleted]);

  // 检查是否收集完所有碎片
  useEffect(() => {
    if (gameState.fragmentsCollected.length === 4 && !gameState.skillUnlocked) {
      // 延迟显示技能解锁界面
      setTimeout(() => {
        setShowSkillUnlock(true);
      }, 1000);
    }
  }, [gameState.fragmentsCollected, gameState.skillUnlocked]);

  // 进入时代探索
  const handleEnterEra = (eraId: string) => {
    setGameState(prev => ({ ...prev, currentEra: eraId }));
    setShowEraExplorer(true);
  };

  // 完成时代小游戏
  const handleCompleteMinigame = (eraId: string) => {
    if (gameState.minigamesCompleted.includes(eraId)) {
      setShowEraExplorer(false);
      return;
    }

    setGameState(prev => ({
      ...prev,
      minigamesCompleted: [...prev.minigamesCompleted, eraId],
      fragmentsCollected: [...prev.fragmentsCollected, `fragment_${eraId}`]
    }));
    setShowEraExplorer(false);
    
    // 添加经验
    addExp(50);
  };

  // 退出时代探索
  const handleExitEra = () => {
    setShowEraExplorer(false);
    setGameState(prev => ({ ...prev, currentEra: null }));
  };

  // 解锁技能
  const handleUnlockSkill = () => {
    setGameState(prev => ({ ...prev, skillUnlocked: true }));
    setShowSkillUnlock(false);
    addExp(200);
    
    // 立即显示结尾，无缝衔接
    setShowOutro(true);
  };

  // 完成章节
  const handleComplete = () => {
    const newsProgress = state.chapterProgress?.news_2 as { revealed?: boolean; correct?: boolean } | undefined;
    const newsScore = (newsProgress?.revealed ? 2 : 0) + (newsProgress?.correct ? 2 : 0);
    const chapterReward = completeChapterRun(2, {
      score: 14 + gameState.minigamesCompleted.length * 3 + newsScore,
      fragmentIds: ['fragment_timeline'],
    });
    setReward(chapterReward);
  };

  const handleRestartChapter = () => {
    restartChapter(2);
    setGameState({
      currentEra: null,
      fragmentsCollected: [],
      minigamesCompleted: [],
      skillUnlocked: false,
    });
    setIntroCompleted(false);
    setShowEraExplorer(false);
    setShowSkillUnlock(false);
    setShowOutro(false);
    setReward(null);
  };

  // 获取当前时代数据
  const currentEraData = TIMELINE_ERAS.find(era => era.id === gameState.currentEra);

  return (
    <div className="battle-plain-page">
      
      {introCompleted && (
        <div className="global-bg-layer" style={{ backgroundImage: `url(${bgImage})` }} />
      )}

      <div 
        className="battle-plain-scroll-container"
        style={{ overflowY: introCompleted ? 'auto' : 'hidden' }}
      >
        {/* 1. 入场介绍（全屏） */}
        {!introCompleted && <IntroSection onComplete={() => setIntroCompleted(true)} />}

        {/* 2. 主内容区域 */}
        {introCompleted && (
          <div ref={contentRef} className="main-content">
            {/* 时间线地图 */}
            <TimelineMap 
              eras={TIMELINE_ERAS}
              completedEras={gameState.minigamesCompleted}
              onEnterEra={handleEnterEra}
            />

            {isChapterCompleted && gameState.minigamesCompleted.length >= TIMELINE_ERAS.length && !showOutro && (
              <div className="ch2-return-panel">
                <div>
                  <div className="title">战斗本体平原已通关</div>
                  <div className="desc">本章结算已经完成，你可以返回世界地图，也可以清空本章保存进度后重新游玩。</div>
                </div>
                <div className="actions">
                  <Button size="sm" onClick={() => navigate('/world-map', { state: { fromChapter: 2 } })}>
                    返回世界地图
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleRestartChapter}>
                    重新游玩本章
                  </Button>
                </div>
              </div>
            )}



          </div>
        )}
      </div>

      {/* 3. 时代探索弹窗 */}
      {showEraExplorer && currentEraData && (
        <EraExplorer 
          era={currentEraData}
          onComplete={() => handleCompleteMinigame(currentEraData.id)}
          onExit={handleExitEra}
        />
      )}

      {/* 4. 技能解锁界面 */}
      {showSkillUnlock && (
        <SkillUnlock onUnlock={handleUnlockSkill} />
      )}

      {/* 5. 成就通知 (已移除) */}

      {/* 6. 技能获得通知 (已移除) */}

      {/* 7. 结尾章节 */}
      {showOutro && (
        <div className="outro-overlay">
          <OutroSection onComplete={handleComplete} onRestart={handleRestartChapter} />
        </div>
      )}

      <ChapterRewardOverlay
        reward={reward}
        onContinue={() => navigate('/world-map', { state: { fromChapter: 2 } })}
      />

    </div>
  );
};

export default BattlePlain;
