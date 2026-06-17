import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { useInput } from '@/hooks/useInput';
import { SpriteCharacter, generatePlaceholderSpriteSheet, Direction, SPRITE_SIZE, SCALE } from '@/components/SpriteCharacter';
import { Button } from '@/components/Button/Button';
import worldMapPng from '@/assets/images/world_map.webp';
import worldMapSvg from '@/assets/images/world_map.svg';
import './WorldMap.scss';

// 区域定义 (添加坐标)
// 坐标基于 16:9 地图的百分比位置 (Top/Left)
// x/y used for logical distance check (0-100)
const REGIONS = [
  // 移除新手村 (id: 0)，它现在是独立区域，不在世界地图上显示
  { id: 1, name: '黑话起源之森', level: '1-15', desc: '术语基础、分类与历史', time: '3 min', x: 15, y: 69, pos: { left: '15%', top: '69%' } },     // 左下 (原位置)
  { id: 2, name: '战斗本体平原', level: '10-25', desc: '副本、RNG与机制黑话', time: '2 min', x: 38.5, y: 69, pos: { left: '38.5%', top: '69%' } },     // 左中下
  { id: 3, name: '玩家生态城镇', level: '20-35', desc: '社群称谓与行为标签', time: '4 min', x: 67, y: 72, pos: { left: '67%', top: '72%' } },    // 中心
  { id: 4, name: '数据洪流之都', level: '30-45', desc: '分类、情感与跨游戏通用语', time: '3 min', x: 89, y: 55, pos: { left: '89%', top: '55%' } },    // 右下
  { id: 5, name: '译语通天塔', level: '40-60', desc: '跨语境翻译、语气与隐喻', time: '4 min', x: 74, y: 30, pos: { left: '74%', top: '30%' } },      // 右上
  { id: 6, name: '终章·魔王城', level: '60-100', desc: '算法推荐与平台生态', time: '5 min', x: 50, y: 15, pos: { left: '50%', top: '15%' } },     // 顶部正中
];

const MOVEMENT_SPEED = 4;
const INTERACTION_DISTANCE = 8; // %

/**
 * 预加载图片资源，加载成功返回 true，失败返回 false。
 */
const preloadImage = (src: string): Promise<boolean> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });

const WorldMap: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, restartChapter } = usePlayer();
  
  // Player State
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction>(Direction.DOWN);
  const [isMoving, setIsMoving] = useState(false);
  const [spriteSheet] = useState<string>(() => generatePlaceholderSpriteSheet());
  const [activeRegion, setActiveRegion] = useState<typeof REGIONS[0] | null>(null);
  const [isReady, setIsReady] = useState(false); // New state to prevent loop before init
  const [isHeavyBackgroundEnabled, setIsHeavyBackgroundEnabled] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const input = useInput();
  
  // Refs for loop
  const posRef = useRef(playerPos);
  const directionRef = useRef(direction);
  const isMovingRef = useRef(isMoving);

  useEffect(() => { posRef.current = playerPos; }, [playerPos]);
  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { isMovingRef.current = isMoving; }, [isMoving]);

  useEffect(() => {
    let canceled = false;
    preloadImage(worldMapPng).then((ok) => {
      if (canceled) return;
      if (ok) setIsHeavyBackgroundEnabled(true);
    });
    return () => {
      canceled = true;
    };
  }, []);

  // Initialize Position (Spawn near last unlocked or Chapter 0)
  useEffect(() => {
    const initPosition = () => {
        if (containerRef.current && !isReady) {
            const { clientWidth, clientHeight } = containerRef.current;
            if (clientWidth > 0 && clientHeight > 0) {
                // Check if returning from a chapter
                const fromChapter = (location.state as any)?.fromChapter;
                let spawnX = clientWidth * 0.05; // Default 5%
                let spawnY = clientHeight * 0.85; // Default 85%

                if (fromChapter) {
                    const region = REGIONS.find(r => r.id === fromChapter);
                    if (region) {
                         spawnX = clientWidth * (region.x / 100);
                         spawnY = clientHeight * (region.y / 100);
                    }
                }
                
                setPlayerPos({ x: spawnX, y: spawnY });
                setIsReady(true);
            }
        }
    };

    // Initial check
    initPosition();

    // Observe resize to handle initial layout if dimensions are 0
    const observer = new ResizeObserver(() => {
        initPosition();
    });

    if (containerRef.current) {
        observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isReady]);

  const getRegionStatus = useCallback((id: number) => {
    if (state.completedChapters.includes(id)) return 'completed';
    if (state.unlockedChapters.includes(id)) return 'unlocked';
    return 'locked';
  }, [state.completedChapters, state.unlockedChapters]);

  const hasPlayableRegion = REGIONS.some(region => getRegionStatus(region.id) !== 'locked');

  const enterRegion = useCallback((id: number) => {
    const status = getRegionStatus(id);
    if (status !== 'locked') {
        navigate(id === 6 ? '/chapter/final' : `/chapter/${id}`);
    }
  }, [getRegionStatus, navigate]);

  const restartRegion = useCallback((id: number) => {
    const status = getRegionStatus(id);
    if (status !== 'completed') return;
    if (!confirm('重新开始将清空本章已保存的进度（不重置已获得的经验与成就）。继续？')) return;
    restartChapter(id);
    navigate(id === 6 ? '/chapter/final' : `/chapter/${id}`);
  }, [getRegionStatus, navigate, restartChapter]);

  const selectRegion = useCallback((region: typeof REGIONS[0]) => {
    const status = getRegionStatus(region.id);
    setActiveRegion(region);
    if (status !== 'locked') {
      enterRegion(region.id);
    }
  }, [enterRegion, getRegionStatus]);

  // Game Loop
  useEffect(() => {
    if (!isReady) return;

    const update = () => {
      if (!containerRef.current) return;
      
      const { up, down, left, right } = input;
      let { x, y } = posRef.current;
      let newIsMoving = false;
      let newDirection = directionRef.current;

      // Interaction check (Space key)
      // Note: input hook prevents default space scrolling, but doesn't expose space state directly 
      // unless we modify it. For now, let's just use proximity auto-prompt + separate key listener for Space?
      // Actually `useInput` filters space prevention but doesn't return space state in the object.
      // Let's add a separate listener for interaction or modify useInput.
      // For simplicity, let's just add a keydown listener for 'Enter' or 'Space' inside this component.

      if (up) { y -= MOVEMENT_SPEED; newDirection = Direction.UP; newIsMoving = true; }
      else if (down) { y += MOVEMENT_SPEED; newDirection = Direction.DOWN; newIsMoving = true; }
      
      if (left) { x -= MOVEMENT_SPEED; newDirection = Direction.LEFT; newIsMoving = true; }
      else if (right) { x += MOVEMENT_SPEED; newDirection = Direction.RIGHT; newIsMoving = true; }

      // Diagonal fix
      if (left && !right && !up && !down) newDirection = Direction.LEFT;
      if (right && !left && !up && !down) newDirection = Direction.RIGHT;
      if (up && !down && !left && !right) newDirection = Direction.UP;
      if (down && !up && !left && !right) newDirection = Direction.DOWN;

      // Boundaries
      const { clientWidth, clientHeight } = containerRef.current;
      const maxX = clientWidth - SPRITE_SIZE * SCALE;
      const maxY = clientHeight - SPRITE_SIZE * SCALE;
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      const prevPos = posRef.current;
      if (x !== prevPos.x || y !== prevPos.y) setPlayerPos({ x, y });
      if (newDirection !== directionRef.current) setDirection(newDirection);
      if (newIsMoving !== isMovingRef.current) setIsMoving(newIsMoving);

      // Check proximity
      const centerX = x + (SPRITE_SIZE * SCALE) / 2;
      const centerY = y + (SPRITE_SIZE * SCALE) / 2;
      const pctX = (centerX / clientWidth) * 100;
      const pctY = (centerY / clientHeight) * 100;

      const nearby = REGIONS.find(r => {
        const dx = pctX - r.x;
        const dy = (pctY - r.y) * (16/9);
        return Math.sqrt(dx*dx + dy*dy) < INTERACTION_DISTANCE;
      });

      setActiveRegion(nearby || null);

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current != null) cancelAnimationFrame(requestRef.current);
    };
  }, [input, isReady]);

  // Interaction Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && activeRegion) {
         enterRegion(activeRegion.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRegion, enterRegion]);

  return (
    <div className="world-map-container">
      {/* Map Nodes */}
      <div
        className={`map-viewport animate-fade-in-up delay-200 ${isHeavyBackgroundEnabled ? 'heavy-bg' : ''}`}
        ref={containerRef}
        style={
          {
            '--world-map-png': `url(${worldMapPng})`,
            '--world-map-svg': `url(${worldMapSvg})`
          } as React.CSSProperties
        }
      >
        <SpriteCharacter 
            image={spriteSheet}
            x={playerPos.x}
            y={playerPos.y}
            direction={direction}
            isMoving={isMoving}
        />

        {REGIONS.map(region => {
          const status = getRegionStatus(region.id);
          const isActive = activeRegion?.id === region.id;
          const nodeClassName = `map-node region-${region.id} status-${status} ${isActive ? 'active-target' : ''}`;
          const nodeAriaLabel = `${region.name} ${status === 'locked' ? '未解锁' : '可进入'}`;
          const nodeContent = (
            <>
              <div className="node-icon">
                {status === 'locked' && <span className="icon-lock">🔒</span>}
                {status === 'completed' && <span className="icon-check">🚩</span>}
                {status === 'unlocked' && <span className="icon-marker">📍</span>}
              </div>

              {isActive && status !== 'locked' && (
                <div className="interaction-prompt">
                    <span className="key">SPACE</span>
                    <span className="label">进入</span>
                </div>
              )}
              {isActive && status === 'locked' && (
                <div className="interaction-prompt locked">
                    <span className="label">未解锁</span>
                </div>
              )}
            </>
          );

          if (status !== 'locked') {
            return (
              <Link
                key={region.id}
                className={nodeClassName}
                style={region.pos}
                aria-label={nodeAriaLabel}
                to={region.id === 6 ? '/chapter/final' : `/chapter/${region.id}`}
              >
                {nodeContent}
              </Link>
            );
          }
          
          return (
            <button
              key={region.id}
              className={nodeClassName}
              style={region.pos}
              type="button"
              aria-label={nodeAriaLabel}
              onClick={(e) => {
                e.stopPropagation();
                selectRegion(region);
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                selectRegion(region);
              }}
            >
              {nodeContent}
            </button>
          );
        })}

        {/* UI Overlay */}
        <div className="map-ui-overlay">
           <div className="control-hint">
              WASD 移动 / SPACE 进入
           </div>
           {activeRegion && (
               <div className="region-info-card animate-fade-in-up">
                   <h3>{activeRegion.name}</h3>
                   <div className="meta">
                       <span>Lv.{activeRegion.level}</span>
                       <span>⏳ {activeRegion.time}</span>
                   </div>
                   <p>{activeRegion.desc}</p>
                   <div className="region-actions">
                     <Button size="sm" onClick={() => enterRegion(activeRegion.id)} disabled={getRegionStatus(activeRegion.id) === 'locked'}>
                       进入
                     </Button>
                     {getRegionStatus(activeRegion.id) === 'completed' && (
                       <Button size="sm" variant="secondary" onClick={() => restartRegion(activeRegion.id)}>
                         重新开始
                       </Button>
                     )}
                   </div>
               </div>
           )}
        </div>

        {!hasPlayableRegion && (
          <div className="map-locked-panel">
            <h2>先完成新手村</h2>
            <p>世界地图已经打开，但主线区域还没有解锁。回到新手村完成出村剧情后，第一章会点亮。</p>
            <Button size="sm" onClick={() => navigate('/tutorial')}>
              返回新手村
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
