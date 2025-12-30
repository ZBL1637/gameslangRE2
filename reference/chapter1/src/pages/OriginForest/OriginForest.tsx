import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { IntroSection } from './components/layout/IntroSection';
import { ForestMap } from './components/layout/ForestMap';
import { ExplorationZone } from './components/layout/ExplorationZone';
import { SkillUnlock } from './components/layout/SkillUnlock';
import { OutroSection } from './components/layout/OutroSection';
import { FOREST_ZONES, SCRIPT } from './data';
import { GameState } from './types';
import bgImage from '../../assets/images/chapter1_forest_bg.png';

import './OriginForest.scss';

const OriginForest: React.FC = () => {
  const navigate = useNavigate();
  const { state, addExp, unlockAchievement, unlockChapter, completeChapter, updateChapterProgress } = usePlayer();
  
  const savedProgress = state.chapterProgress?.['chapter_1'] || {};

  // 游戏状态
  const [gameState, setGameState] = useState<GameState>({
    currentZone: null,
    fragmentsCollected: savedProgress.fragmentsCollected || [],
    zonesCompleted: savedProgress.zonesCompleted || [],
    skillUnlocked: savedProgress.skillUnlocked || false
  });
  
  // UI状态
  const [introCompleted, setIntroCompleted] = useState(savedProgress.introCompleted || false);
  const [showExploration, setShowExploration] = useState(false);
  const [showSkillUnlock, setShowSkillUnlock] = useState(false);
  const [showOutro, setShowOutro] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  // 自动保存进度
  useEffect(() => {
    updateChapterProgress('chapter_1', {
      fragmentsCollected: gameState.fragmentsCollected,
      zonesCompleted: gameState.zonesCompleted,
      skillUnlocked: gameState.skillUnlocked,
      introCompleted
    });
  }, [gameState.fragmentsCollected, gameState.zonesCompleted, gameState.skillUnlocked, introCompleted]);

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
    if (gameState.fragmentsCollected.length === 3 && !gameState.skillUnlocked) {
      setTimeout(() => {
        setShowSkillUnlock(true);
      }, 1000);
    }
  }, [gameState.fragmentsCollected, gameState.skillUnlocked]);

  // 进入探索区域
  const handleEnterZone = (zoneId: string) => {
    setGameState(prev => ({ ...prev, currentZone: zoneId }));
    setShowExploration(true);
  };

  // 完成区域探索
  const handleCompleteZone = (zoneId: string) => {
    setGameState(prev => ({
      ...prev,
      zonesCompleted: [...prev.zonesCompleted, zoneId],
      fragmentsCollected: [...prev.fragmentsCollected, `fragment_${zoneId}`]
    }));
    setShowExploration(false);
    addExp(50);
  };

  // 退出探索
  const handleExitZone = () => {
    setShowExploration(false);
    setGameState(prev => ({ ...prev, currentZone: null }));
  };

  // 解锁技能
  const handleUnlockSkill = () => {
    setGameState(prev => ({ ...prev, skillUnlocked: true }));
    setShowSkillUnlock(false);
    unlockAchievement('forest_explorer');
    addExp(200);
    setShowOutro(true);
  };

  // 完成章节
  const handleComplete = () => {
    completeChapter(1);
    unlockChapter(2);
    navigate('/world-map');
  };

  // 获取当前区域数据
  const currentZoneData = FOREST_ZONES.find(zone => zone.id === gameState.currentZone);

  return (
    <div className="origin-forest-page">
      
      {introCompleted && (
        <div className="global-bg-layer" style={{ backgroundImage: `url(${bgImage})` }} />
      )}

      <div 
        className="origin-forest-scroll-container"
        style={{ overflowY: introCompleted ? 'auto' : 'hidden' }}
      >
        {/* 1. 入场介绍（全屏） */}
        {!introCompleted && <IntroSection onComplete={() => setIntroCompleted(true)} />}

        {/* 2. 主内容区域 */}
        {introCompleted && (
          <div ref={contentRef} className="main-content">
            {/* 森林地图 */}
            <ForestMap 
              zones={FOREST_ZONES}
              completedZones={gameState.zonesCompleted}
              onEnterZone={handleEnterZone}
            />

            {/* 跳过按钮（调试用） */}
            {!gameState.skillUnlocked && (
              <div className="forest-skip-option">
                <p>完成所有区域探索以解锁技能... 或者</p>
                <button onClick={() => {
                  setGameState({
                    currentZone: null,
                    fragmentsCollected: ['fragment_taxonomy', 'fragment_relation', 'fragment_migration'],
                    zonesCompleted: ['taxonomy', 'relation', 'migration'],
                    skillUnlocked: false
                  });
                }}>
                  [跳过探索直接收集所有碎片]
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. 区域探索弹窗 */}
      {showExploration && currentZoneData && (
        <ExplorationZone 
          zone={currentZoneData}
          onComplete={() => handleCompleteZone(currentZoneData.id)}
          onExit={handleExitZone}
        />
      )}

      {/* 4. 技能解锁界面 */}
      {showSkillUnlock && (
        <SkillUnlock onUnlock={handleUnlockSkill} />
      )}

      {/* 5. 结尾章节 */}
      {showOutro && (
        <div className="outro-overlay">
          <OutroSection onComplete={handleComplete} />
        </div>
      )}
    </div>
  );
};

export default OriginForest;
