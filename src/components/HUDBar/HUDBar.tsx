import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '@/components/Panel/Panel';
import { Icon } from '@/components/Icon/Icon';
import { Button } from '@/components/Button/Button';
import { usePlayer } from '@/context/PlayerContext';
import './HUDBar.scss';

interface HUDBarProps {
  level: number;
  currentExp: number;
  maxExp: number;
  title?: string;
  onBack?: () => void;
}

export const HUDBar: React.FC<HUDBarProps> = ({ 
  level, 
  currentExp, 
  maxExp, 
  title,
  onBack 
}) => {
  const navigate = useNavigate();
  const { state } = usePlayer();
  const expPercentage = Math.min(100, (currentExp / maxExp) * 100);
  const canOpenWorldMap = state.unlockedChapters.some((id) => id > 0);

  return (
    <div className="hud-bar">
      <Panel className="hud-panel">
        <div className="hud-content">
          <div className="hud-left">
             {onBack && (
               <span className="back-btn" onClick={onBack}>
                 <Icon name="arrow-right" size="sm" style={{ transform: 'rotate(180deg)', display: 'inline-block' }} /> BACK
               </span>
             )}
             {title && <span className="hud-title">{title}</span>}
          </div>
          
          <div className="hud-center">
             <Button
               size="sm"
               onClick={() => navigate('/world-map')}
               disabled={!canOpenWorldMap}
               title={!canOpenWorldMap ? '完成新手村后解锁世界地图' : '打开世界地图'}
             >
               <span style={{ marginRight: '4px' }}>🗺️</span> 地图
             </Button>
             <Button size="sm" onClick={() => navigate('/quests')}>
               <span style={{ marginRight: '4px' }}>📜</span> 任务
             </Button>
             <Button size="sm" onClick={() => navigate('/dictionary')} disabled={!state.dictionaryUnlocked}>
               {!state.dictionaryUnlocked ? (
                 <>
                   <span style={{ marginRight: '4px' }}><Icon name="lock" size="sm" /></span> 图鉴
                 </>
               ) : (
                 <>
                   <span style={{ marginRight: '4px' }}>📖</span> 图鉴
                 </>
               )}
             </Button>
             <Button size="sm" onClick={() => navigate('/achievements')}>
               <span style={{ marginRight: '4px' }}>🏆</span> 成就
             </Button>
          </div>

          <div className="hud-right">
             <div 
               className="player-avatar" 
               onClick={() => navigate('/profile')}
               title="点击查看玩家档案"
             >
               <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix" alt="Avatar" />
             </div>

             <div className="status-group">
               <span className="label">LV.</span>
               <span className="value">{level}</span>
             </div>
             
             <div className="status-group exp-group">
               <span className="label">EXP</span>
               <div className="exp-bar-container">
                 <div 
                   className="exp-fill" 
                   style={{ width: `${expPercentage}%` }}
                 />
               </div>
             </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};
