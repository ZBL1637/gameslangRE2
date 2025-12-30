// ============================================================================
// 第五章：译语通天塔 - HUD 组件
// ============================================================================

import React from 'react';
import { Chapter5GlobalState, FloorType } from '../../types';
import './HUD.scss';

interface HUDProps {
  state: Chapter5GlobalState;
  title: string;
}

export const HUD: React.FC<HUDProps> = ({ state, title }) => {
  const getFloorName = (floor: FloorType) => {
    switch (floor) {
      case FloorType.F0_BAZAAR: return 'F0 塔下集市';
      case FloorType.F1_KEYWORD: return 'F1 关键词锻炉';
      case FloorType.F2_STYLE: return 'F2 语气熔炉';
      case FloorType.F3_METAPHOR: return 'F3 隐喻回廊';
      case FloorType.F4_BOSS: return 'F4 翻译圣坛';
      default: return '未知区域';
    }
  };

  const floors = [
    FloorType.F0_BAZAAR,
    FloorType.F1_KEYWORD,
    FloorType.F2_STYLE,
    FloorType.F3_METAPHOR,
    FloorType.F4_BOSS
  ];

  return (
    <div className="chapter5-hud animate-fade-in-down">
      {/* 顶部左侧：标题与位置 */}
      <div className="hud-header">
        <div className="chapter-title">CH.5 {title}</div>
        <div className="current-location">{getFloorName(state.currentFloor)}</div>
      </div>

      {/* 中部：数值状态 */}
      <div className="hud-stats">
        <div className="stat-item comms">
          <div className="stat-label">
            <span className="icon">📡</span>
            <span>沟通值</span>
          </div>
          <div className="stat-bar-container">
            <div 
              className="stat-bar" 
              style={{ width: `${Math.max(0, Math.min(100, state.comms))}%` }}
            />
          </div>
          <span className="stat-value">{state.comms}</span>
        </div>

        <div className="stat-item clarity">
          <div className="stat-label">
            <span className="icon">👁️</span>
            <span>清晰度</span>
          </div>
          <div className="stat-bar-container">
            <div 
              className="stat-bar" 
              style={{ width: `${Math.max(0, Math.min(100, state.clarity))}%` }}
            />
          </div>
          <span className="stat-value">{state.clarity}</span>
        </div>

        <div className="stat-item culture">
          <div className="stat-label">
            <span className="icon">📜</span>
            <span>文化度</span>
          </div>
          <div className="stat-bar-container">
            <div 
              className="stat-bar" 
              style={{ width: `${Math.max(0, Math.min(100, state.culture))}%` }}
            />
          </div>
          <span className="stat-value">{state.culture}</span>
        </div>
      </div>

      {/* 右侧：资源与塔身进度 */}
      <div className="hud-resources">
        {/* Phrasebook 快捷入口 */}
        <div className="resource-item phrasebook">
          <span className="icon">📖</span>
          <span className="count">{state.phrasebook.length}</span>
        </div>

        {/* 提示券 */}
        <div className="resource-item tickets">
          <span className="icon">🎟️</span>
          <span className="count">{state.hintTickets}</span>
        </div>

        {/* 塔身指示灯 */}
        <div className="tower-indicator">
          {floors.map((floor, index) => {
            const isActive = state.currentFloor === floor;
            const isCompleted = state.floorProgress[floor];
            const isUnlocked = floor === FloorType.F0_BAZAAR || state.floorProgress[floors[index - 1]];

            let statusClass = 'locked';
            if (isCompleted) statusClass = 'completed';
            else if (isActive) statusClass = 'active';
            else if (isUnlocked) statusClass = 'unlocked';

            return (
              <div 
                key={floor} 
                className={`floor-light ${statusClass}`}
                title={getFloorName(floor)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
