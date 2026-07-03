// ============================================================================
// 终章：魔王城 (The Overlord's Citadel) - 主组件
// ============================================================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import {
  EvidenceBattleBonus,
  GameEnding,
  SkillRewardId,
  getEndingForScore,
  getEvidenceBattleBonus,
} from '@/data/chapterProgress';
import { FinalChapterState, BattlePhase } from './types';
import {
  INITIAL_BOSS_STATE,
  INITIAL_PLAYER_STATE,
  PLAYER_SKILLS,
  BOSS_SKILLS
} from './data';

// 导入子组件
import IntroSection from './components/layout/IntroSection';
import BattleArena from './components/battle/BattleArena';
import VictoryScreen from './components/layout/VictoryScreen';
import DefeatScreen from './components/layout/DefeatScreen';

import './FinalChapter.scss';

// 初始游戏状态
const getInitialState = (skillsUnlocked: SkillRewardId[], evidenceBonus: EvidenceBattleBonus): FinalChapterState => ({
  currentPhase: 'intro',
  currentTurn: 1,
  maxTurns: 15 + evidenceBonus.maxTurnBonus,
  isPlayerTurn: true,
  player: {
    ...INITIAL_PLAYER_STATE,
    skills: PLAYER_SKILLS
      .filter(skill => skillsUnlocked.includes(skill.id))
      .map(skill => ({ ...skill }))
  },
  boss: {
    ...INITIAL_BOSS_STATE,
    skills: BOSS_SKILLS.map(skill => ({ ...skill }))
  },
  minions: [],
  battleLog: [],
  lastBossSkill: null,
  copiedSkill: null
});

const calculateFinalScore = (
  globalState: ReturnType<typeof usePlayer>['state'],
  battleState: FinalChapterState,
  won: boolean
) => {
  const completedScore = [1, 2, 3, 4, 5].filter(id => globalState.completedChapters.includes(id)).length * 6;
  const finalFragmentIds = won
    ? Array.from(new Set([...(globalState.dataFragments || []), 'fragment_algorithm']))
    : (globalState.dataFragments || []);
  const evidenceBonus = getEvidenceBattleBonus(finalFragmentIds);
  const fragmentScore = Math.min(27, finalFragmentIds.length * 3);
  const skillScore = Math.min(16, (globalState.skillsUnlocked?.length || 0) * 4);
  const chapterScore = Math.min(20, Object.values(globalState.chapterScores || {}).reduce((sum, value) => sum + Math.min(4, Math.floor(value / 6)), 0));
  const battleScore = won ? 22 : Math.max(0, Math.floor((100 - battleState.boss.currentHp) / 5));
  const turnBonus = won ? Math.max(0, 10 - Math.max(0, battleState.currentTurn - 8)) : 0;
  const newsScore = [1, 2, 3, 4, 5, 6].reduce((sum, id) => {
    const progress = globalState.chapterProgress?.[`news_${id}`] as { revealed?: boolean; correct?: boolean } | undefined;
    return sum + (progress?.revealed ? 1 : 0) + (progress?.correct ? 1 : 0);
  }, 0);

  const rawScore = completedScore + fragmentScore + skillScore + chapterScore + battleScore + turnBonus + newsScore + evidenceBonus.comboScoreBonus;
  return won ? Math.min(100, rawScore) : Math.min(59, rawScore);
};

const FinalChapter: React.FC = () => {
  const { state, completeChapterRun, finishGame, visitChapter } = usePlayer();
  const evidenceBonus = getEvidenceBattleBonus(state.dataFragments || []);
  const [gameState, setGameState] = useState<FinalChapterState>(() => getInitialState(state.skillsUnlocked, evidenceBonus));
  const [ending, setEnding] = useState<GameEnding | null>(state.ending);
  const finalizedRef = useRef(false);

  useEffect(() => {
    visitChapter(6);
  }, [visitChapter]);

  // 切换游戏阶段
  const setPhase = useCallback((phase: BattlePhase) => {
    setGameState(prev => ({ ...prev, currentPhase: phase }));
  }, []);

  // 开始战斗
  const startBattle = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPhase: 'battle',
      battleLog: [{
        turn: 1,
        actor: 'system',
        action: '战斗开始',
        detail: '与算法霸主的最终决战开始了！',
        timestamp: Date.now()
      }]
    }));
  }, []);

  // 更新游戏状态
  const updateGameState = useCallback((updates: Partial<FinalChapterState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  // 重新开始游戏
  const restartGame = useCallback(() => {
    finalizedRef.current = false;
    setEnding(null);
    setGameState(getInitialState(state.skillsUnlocked, getEvidenceBattleBonus(state.dataFragments || [])));
  }, [state.dataFragments, state.skillsUnlocked]);

  useEffect(() => {
    if (finalizedRef.current) return;
    if (gameState.currentPhase !== 'victory' && gameState.currentPhase !== 'defeat') return;

    finalizedRef.current = true;
    const won = gameState.currentPhase === 'victory';
    const score = calculateFinalScore(state, gameState, won);
    const nextEnding: GameEnding = {
      ...getEndingForScore(score, won),
      completedAt: new Date().toISOString(),
    };

    if (won) {
      completeChapterRun(6, {
        score,
        fragmentIds: ['fragment_algorithm'],
      });
    }
    finishGame(nextEnding);
    setEnding(nextEnding);
  }, [completeChapterRun, finishGame, gameState, state]);

  // 渲染当前阶段
  const renderCurrentPhase = () => {
    switch (gameState.currentPhase) {
      case 'intro':
        return (
          <IntroSection onComplete={startBattle} />
        );
      
      case 'battle':
        return (
          <BattleArena
            gameState={gameState}
            updateGameState={updateGameState}
            setPhase={setPhase}
            evidenceBonus={evidenceBonus}
          />
        );
      
      case 'victory':
        return (
          <VictoryScreen
            gameState={gameState}
            ending={ending}
            onRestart={restartGame}
          />
        );
      
      case 'defeat':
        return (
          <DefeatScreen
            gameState={gameState}
            ending={ending}
            onRestart={restartGame}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="final-chapter">
      <div className="chapter-background">
        <div className="data-storm">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="data-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        <div className="code-rain">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="code-column"
              style={{
                left: `${i * 5}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            >
              {['0', '1', '{', '}', '<', '>', '/', '\\', '=', '+'].map((char, j) => (
                <span key={j}>{char}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className={`chapter-content phase-${gameState.currentPhase}`}>
        {renderCurrentPhase()}
      </div>
    </div>
  );
};

export default FinalChapter;
