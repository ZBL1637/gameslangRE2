import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BULLET_COMMENTS_POOL } from '../../data';
import { getDataProcessor } from '@/utils/dataProcessor';
import { Term } from '@/types';
import './BulletCatchMinigame.scss';

const GAME_DURATION_SECONDS = 15;
const SPAWN_INTERVAL_MS = 850;
const MAX_BULLETS_ON_SCREEN = 12;
const BULLET_SPEED_MIN_PX_PER_SEC = 70;
const BULLET_SPEED_MAX_PX_PER_SEC = 130;
const TARGET_TERMS_COUNT = 4;
const DECOY_TERMS_COUNT = 16;

interface BulletCatchMinigameProps {
  onComplete: () => void;
}

interface BulletPoolItem {
  text: string;
  isTarget: boolean;
}

interface ActiveBullet {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  isTarget: boolean;
  caught: boolean;
}

export const BulletCatchMinigame: React.FC<BulletCatchMinigameProps> = ({ onComplete }) => {
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'ended'>('ready');
  const [bullets, setBullets] = useState<ActiveBullet[]>([]);
  const [score, setScore] = useState(0);
  const [targetsCaught, setTargetsCaught] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [combo, setCombo] = useState(0);
  const [targetTerms, setTargetTerms] = useState<string[]>([]);
  const [isPreparing, setIsPreparing] = useState(true);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const bulletIdRef = useRef(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastSpawnTimeRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const bulletPoolRef = useRef<BulletPoolItem[]>([]);

  const buildFallbackPool = useCallback(() => {
    const fallbackTargets = BULLET_COMMENTS_POOL.filter((i) => i.isTarget).map((i) => i.text);
    const fallbackPool = BULLET_COMMENTS_POOL.map((i) => ({ text: i.text, isTarget: i.isTarget }));
    return { fallbackTargets, fallbackPool };
  }, []);

  const pickUnique = useCallback((items: string[], count: number) => {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy.slice(0, Math.max(0, Math.min(count, copy.length)));
  }, []);

  const prepareTargetsAndPool = useCallback(async () => {
    setIsPreparing(true);
    try {
      const dp = await getDataProcessor();
      const candidates = dp
        .getAllTerms()
        .map((t: Term) => String(t.term || t.id).trim())
        .filter((t) => t.length >= 2 && t.length <= 8)
        .filter((t) => !/[\r\n]/.test(t))
        .filter((t) => !/\s{2,}/.test(t));

      const uniqCandidates: string[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < candidates.length; i += 1) {
        const v = candidates[i];
        if (!v || seen.has(v)) continue;
        seen.add(v);
        uniqCandidates.push(v);
      }

      if (uniqCandidates.length < TARGET_TERMS_COUNT) {
        const { fallbackTargets, fallbackPool } = buildFallbackPool();
        setTargetTerms(fallbackTargets);
        bulletPoolRef.current = fallbackPool;
        return;
      }

      const targets = pickUnique(uniqCandidates, TARGET_TERMS_COUNT);
      const decoyCandidates = uniqCandidates.filter((t) => !targets.includes(t));
      const decoys = pickUnique(decoyCandidates, DECOY_TERMS_COUNT);
      const pool: BulletPoolItem[] = [
        ...targets.map((t) => ({ text: t, isTarget: true })),
        ...decoys.map((t) => ({ text: t, isTarget: false })),
      ];

      setTargetTerms(targets);
      bulletPoolRef.current = pool.length > 0 ? pool : targets.map((t) => ({ text: t, isTarget: true }));
    } catch {
      const { fallbackTargets, fallbackPool } = buildFallbackPool();
      setTargetTerms(fallbackTargets);
      bulletPoolRef.current = fallbackPool;
    } finally {
      setIsPreparing(false);
    }
  }, [buildFallbackPool, pickUnique]);

  useEffect(() => {
    if (gameStatus !== 'ready') return;
    void prepareTargetsAndPool();
  }, [gameStatus, prepareTargetsAndPool]);

  // 生成新弹幕
  const spawnBullet = useCallback(() => {
    const pool = bulletPoolRef.current.length > 0 ? bulletPoolRef.current : BULLET_COMMENTS_POOL;
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    const baseSpeed =
      BULLET_SPEED_MIN_PX_PER_SEC +
      Math.random() * (BULLET_SPEED_MAX_PX_PER_SEC - BULLET_SPEED_MIN_PX_PER_SEC);
    
    const newBullet: ActiveBullet = {
      id: bulletIdRef.current++,
      text: randomItem.text,
      x: gameAreaRef.current?.clientWidth || 800,
      y: Math.random() * ((gameAreaRef.current?.clientHeight || 400) - 40) + 20,
      speed: randomItem.isTarget ? baseSpeed * 0.9 : baseSpeed,
      isTarget: randomItem.isTarget,
      caught: false
    };
    
    setBullets(prev => (prev.length >= MAX_BULLETS_ON_SCREEN ? prev : [...prev, newBullet]));
  }, []);

  // 游戏主循环
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const gameLoop = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaMs = Math.min(50, timestamp - lastFrameTimeRef.current);
      lastFrameTimeRef.current = timestamp;

      // 生成新弹幕
      if (timestamp - lastSpawnTimeRef.current > SPAWN_INTERVAL_MS) {
        spawnBullet();
        lastSpawnTimeRef.current = timestamp;
      }

      // 更新弹幕位置
      setBullets(prev => 
        prev
          .map(bullet => ({
            ...bullet,
            x: bullet.x - (bullet.speed * deltaMs) / 1000
          }))
          .filter(bullet => bullet.x > -200 && !bullet.caught)
      );

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStatus, spawnBullet]);

  // 倒计时
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStatus('ended');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // 点击弹幕
  const handleBulletClick = (bullet: ActiveBullet) => {
    if (bullet.caught) return;

    // 标记为已捕获
    setBullets(prev => 
      prev.map(b => b.id === bullet.id ? { ...b, caught: true } : b)
    );

    if (bullet.isTarget) {
      // 捕获目标弹幕
      setScore(prev => prev + 100 + combo * 20);
      setCombo(prev => prev + 1);
      
      if (!targetsCaught.includes(bullet.text)) {
        setTargetsCaught(prev => [...prev, bullet.text]);
      }
    } else {
      // 点击了非目标弹幕
      setScore(prev => Math.max(0, prev - 50));
      setCombo(0);
    }
  };

  // 开始游戏
  const startGame = () => {
    if (isPreparing || targetTerms.length === 0) return;
    setGameStatus('playing');
    setBullets([]);
    setScore(0);
    setTargetsCaught([]);
    setTimeLeft(GAME_DURATION_SECONDS);
    setCombo(0);
    bulletIdRef.current = 0;
    lastSpawnTimeRef.current = 0;
    lastFrameTimeRef.current = null;
  };

  // 检查是否收集完所有目标
  const allTargetsCaught =
    targetTerms.length > 0 && targetTerms.every(term => targetsCaught.includes(term));
  const unlockedTerms = Array.from(new Set(targetsCaught));

  return (
    <div className="bullet-catch-minigame">
      {/* 准备状态 */}
      {gameStatus === 'ready' && (
        <div className="ready-screen">
          <div className="stream-preview">
            <div className="stream-header">
              <span className="live-badge">🔴 LIVE</span>
              <span className="viewer-count">👁 12.3万</span>
            </div>
            <div className="stream-content">
              <h3>🎮 弹幕捕捉挑战</h3>
              <p>在模拟直播间中，点击捕捉目标弹幕！</p>
              <div className="target-list">
                <p>目标弹幕：</p>
                <div className="targets">
                  {targetTerms.map((term, i) => (
                    <span key={i} className="target-term">{term}</span>
                  ))}
                </div>
              </div>
              <p className="warning">⚠️ 注意：点击非目标弹幕会扣分！</p>
            </div>
          </div>
          <button className="start-btn" onClick={startGame} disabled={isPreparing || targetTerms.length === 0}>
            {isPreparing ? '词库加载中...' : '开始捕捉'}
          </button>
        </div>
      )}

      {/* 游戏中 */}
      {gameStatus === 'playing' && (
        <div className="playing-screen">
          {/* 游戏HUD */}
          <div className="game-hud">
            <div className="hud-left">
              <span className="live-badge">🔴 LIVE</span>
              <span className="time">⏱ {timeLeft}s</span>
            </div>
            <div className="hud-center">
              <span className="score">SCORE: {score}</span>
              {combo > 1 && <span className="combo">{combo} COMBO!</span>}
            </div>
            <div className="hud-right">
              <span className="progress">
                {targetsCaught.length}/{targetTerms.length} 目标
              </span>
            </div>
          </div>

          {/* 弹幕区域 */}
          <div className="game-area" ref={gameAreaRef}>
            {/* 模拟直播画面 */}
            <div className="stream-bg">
              <div className="streamer-avatar">🎮</div>
              <div className="chat-overlay">
                <p>主播: 来看看大家的弹幕~</p>
              </div>
            </div>

            {/* 弹幕 */}
            {bullets.map(bullet => (
              <div
                key={bullet.id}
                className={`bullet ${bullet.isTarget ? 'target' : 'normal'} ${bullet.caught ? 'caught' : ''}`}
                style={{
                  left: bullet.x,
                  top: bullet.y
                }}
                onClick={() => handleBulletClick(bullet)}
              >
                {bullet.text}
              </div>
            ))}
          </div>

          {/* 已捕获的目标 */}
          <div className="caught-targets">
            <span>已捕获：</span>
            {targetTerms.map((term, i) => (
              <span 
                key={i} 
                className={`target-chip ${targetsCaught.includes(term) ? 'caught' : ''}`}
              >
                {targetsCaught.includes(term) ? '✓' : '○'} {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 游戏结束 */}
      {gameStatus === 'ended' && (
        <div className="ended-screen">
          <div className="result-header">
            <span className="result-icon">{allTargetsCaught ? '🎉' : '⏰'}</span>
            <h3>{allTargetsCaught ? '完美捕获！' : '时间到！'}</h3>
          </div>

          <div className="result-stats">
            <div className="stat-item">
              <span className="label">最终得分</span>
              <span className="value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="label">捕获目标</span>
              <span className="value">{targetsCaught.length}/{targetTerms.length}</span>
            </div>
          </div>

          <div className="caught-summary">
            <p>捕获的弹幕：</p>
            <div className="caught-list">
              {targetsCaught.map((term, i) => (
                <span key={i} className="caught-term">{term}</span>
              ))}
            </div>
          </div>

          <div className="unlocked-terms">
            <p>解锁黑话：</p>
            <div className="term-list">
              {(unlockedTerms.length > 0 ? unlockedTerms : targetTerms).map((t) => (
                <span key={t} className="term">{t}</span>
              ))}
            </div>
          </div>

          {targetsCaught.length >= 2 ? (
            <button className="continue-btn" onClick={onComplete}>
              获取碎片 →
            </button>
          ) : (
            <button className="retry-btn" onClick={startGame}>
              再试一次
            </button>
          )}
        </div>
      )}
    </div>
  );
};
