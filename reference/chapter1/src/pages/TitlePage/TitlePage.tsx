import React, { useEffect, useRef, useState } from 'react';
import { Panel } from '@/components/Panel/Panel';
import { Button } from '@/components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { getDataProcessor } from '@/utils/dataProcessor';
import { getBasicStats } from '@/utils/dataLoader';
import { RPGTitleCard } from '@/components/RPGTitleCard/RPGTitleCard';
import './TitlePage.scss';

const TitlePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, resetProgress } = usePlayer();
  const [displayStats, setDisplayStats] = useState({ terms: 0, games: 0, cats: 0 });
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [dailySlang, setDailySlang] = useState<any>(null);
  const preloadedRoutesRef = useRef<Set<string>>(new Set());

  const SUBTITLES_COUNT = 3;
  const subtitles = [
    `从新手村到满级玩家，读懂 ${displayStats.terms.toLocaleString()} 条游戏黑话。`,
    '按 ↑↓ 选择模式，按 Enter 开始升级。',
    '你将以 Lv.1 玩家身份，闯进弹幕与黑话的世界。'
  ];

  // Random slang generator
  const refreshDailySlang = async () => {
    const dp = await getDataProcessor();
    const terms = dp.getAllTerms();
    const encyclopediaTerms = terms.filter(t => t.source === 'encyclopedia');

    if (encyclopediaTerms.length > 0) {
      const randomTerm = encyclopediaTerms[Math.floor(Math.random() * encyclopediaTerms.length)];
      setDailySlang(randomTerm);
      return;
    }

    if (terms.length > 0) {
      const randomTerm = terms[Math.floor(Math.random() * terms.length)];
      setDailySlang(randomTerm);
    }
  };

  const maybeIdle = (cb: () => void) => {
    const w = window as any;
    if (typeof w.requestIdleCallback === 'function') return w.requestIdleCallback(cb);
    return window.setTimeout(cb, 300);
  };

  useEffect(() => {
    const idleHandle = maybeIdle(() => {
      void refreshDailySlang();
    });
    
    // Subtitle rotation
    const subTimer = setInterval(() => {
      setCurrentSubtitleIndex(prev => (prev + 1) % SUBTITLES_COUNT);
    }, 5000);

    return () => {
      clearInterval(subTimer);
      const w = window as any;
      if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleHandle);
      else clearTimeout(idleHandle);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let timer: number | null = null;

    const idleHandle = maybeIdle(() => {
      void getBasicStats()
        .then(stats => {
          if (disposed) return;

          const targetStats = {
            terms: stats.totalTerms,
            games: stats.totalGames,
            cats: stats.totalCategories
          };

          let progress = 0;
          const duration = 2000;
          const steps = 60;
          const interval = duration / steps;

          timer = window.setInterval(() => {
            progress++;
            const ratio = Math.min(progress / steps, 1);
            const easeRatio = 1 - Math.pow(1 - ratio, 3);

            setDisplayStats({
              terms: Math.floor(targetStats.terms * easeRatio),
              games: Math.floor(targetStats.games * easeRatio),
              cats: Math.floor(targetStats.cats * easeRatio)
            });

            if (progress >= steps && timer != null) {
              clearInterval(timer);
              timer = null;
            }
          }, interval);
        })
        .catch(() => {
        });
    });

    return () => {
      disposed = true;
      if (timer != null) clearInterval(timer);
      const w = window as any;
      if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleHandle);
      else clearTimeout(idleHandle);
    };
  }, []);

  const handleStart = () => {
    if (state.level > 1 || state.currentExp > 0) {
       if (confirm('Start a new game? Current progress will be lost.')) {
         resetProgress();
         navigate('/tutorial');
       }
    } else {
       // 触发成就：初出茅庐 (Moved to Tutorial completion)
       navigate('/tutorial');
    }
  };

  const preloadRoute = (key: 'tutorial' | 'world-map' | 'dictionary') => {
    if (preloadedRoutesRef.current.has(key)) return;
    preloadedRoutesRef.current.add(key);

    if (key === 'tutorial') void import('@/pages/TutorialVillage/TutorialVillage');
    if (key === 'world-map') void import('@/pages/WorldMap/WorldMap');
    if (key === 'dictionary') void import('@/pages/Dictionary/Dictionary');
  };

  return (
    <div className="title-page">
      {/* 1. Player Profile (Top Left) */}
      <div className="player-profile-card animate-fade-in-up">
        <div className="avatar">P1</div>
        <div className="info">
          <div className="name">PLAYER GUEST</div>
          <div className="level">LEVEL {state.level.toString().padStart(2, '0')}</div>
          <div className="exp-bar-container">
            <div className="exp-bar" style={{ width: `${(state.currentExp / state.expToNext) * 100}%` }}></div>
          </div>
          <div className="exp-text">{state.currentExp} / {state.expToNext} EXP</div>
        </div>
        
        {/* Tooltip */}
        <div className="profile-tooltip">
          在页面内阅读、完成测验都会获得 EXP。<br/>100 级后可解锁“玩家档案”。
        </div>
      </div>

      {/* 2. Title & Subtitle */}
      <div className="title-section">
        <RPGTitleCard />
        
        <div className="subtitle-carousel">
           {subtitles.map((sub, idx) => (
             <div 
               key={idx} 
               className={`subtitle-item ${idx === currentSubtitleIndex ? 'active' : ''}`}
             >
               {sub}
             </div>
           ))}
        </div>
      </div>
      
      {/* 3. Main Menu */}
      <div className="menu-section">
        <Panel className="menu-panel animate-fade-in-up delay-200">
          <div className="menu-buttons">
            <div
              onMouseEnter={() => {
                setHoveredMenu('start');
                preloadRoute('tutorial');
              }}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <Button onClick={handleStart} className="animate-pulse">START GAME</Button>
            </div>
            <div
              onMouseEnter={() => {
                setHoveredMenu('continue');
                preloadRoute('world-map');
              }}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <Button 
                onClick={() => navigate('/world-map')} 
                variant="secondary"
                disabled={state.level === 1 && state.currentExp === 0}
              >
                CONTINUE
              </Button>
            </div>
            <div
              onMouseEnter={() => {
                setHoveredMenu('dict');
                preloadRoute('dictionary');
              }}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <Button onClick={() => navigate('/dictionary')} variant="secondary">DICTIONARY</Button>
            </div>
          </div>
        </Panel>
        
        {/* 4. Menu Hint */}
        <div className="menu-hint">
          {hoveredMenu === 'start' && "从 Lv.1 新手村出发，按章节阅读 + 做任务获得 EXP。"}
          {hoveredMenu === 'continue' && "回到你上次停下的章节，等级与成就会保留。"}
          {hoveredMenu === 'dict' && "跳过剧情，直接按分类检索全部术语。"}
          {!hoveredMenu && "请选择一个选项开始。"}
        </div>
      </div>

      {/* 5. Slang of the Day (Right) */}
      <div 
        className="daily-slang-card animate-fade-in-up delay-300"
        onClick={() => {
           if (dailySlang) {
             navigate(`/dictionary?term=${encodeURIComponent(dailySlang.term)}`);
           }
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-header">
          <span>SLANG OF THE DAY</span>
          <span className="refresh-btn" onClick={(e) => { e.stopPropagation(); refreshDailySlang(); }}>↻</span>
        </div>
        {dailySlang && (
          <div className="card-content">
            <div className="term-title">{dailySlang.term}</div>
            <div className="term-def">{dailySlang.definition.length > 30 ? dailySlang.definition.substring(0, 28) + '...' : dailySlang.definition}</div>
            <div className="term-meta">Game: {(dailySlang.games && dailySlang.games[0]) || 'General'}</div>
          </div>
        )}
      </div>

      {/* 6. Terminal Log (Left) */}
      <div className="terminal-log animate-fade-in-up delay-400">
        <div>&gt; 初始化玩家档案……</div>
        <div>&gt; 读取黑话数据库：{displayStats.terms} TERMS</div>
        <div>&gt; 检测到新访客：GUEST</div>
        <div>&gt; 准备从新手村出发。</div>
      </div>

      {/* 8. Bottom Controls */}
      <div className="bottom-controls animate-fade-in-up delay-800">
        <div className="copyright">
          © 2024 DataNews Team
        </div>
      </div>
    </div>
  );
};

export default TitlePage;
