import React from 'react';
import { ForestZone } from '../../types';
import fragmentTaxonomy from '../../../../assets/images/fragment_taxonomy.png';
import fragmentRelation from '../../../../assets/images/fragment_relation.png';
import fragmentMigration from '../../../../assets/images/fragment_migration.png';
import './ForestMap.scss';

interface ForestMapProps {
  zones: ForestZone[];
  completedZones: string[];
  onEnterZone: (zoneId: string) => void;
}

const FRAGMENT_IMAGES: Record<string, string> = {
  taxonomy: fragmentTaxonomy,
  relation: fragmentRelation,
  migration: fragmentMigration,
};

export const ForestMap: React.FC<ForestMapProps> = ({ zones, completedZones, onEnterZone }) => {
  return (
    <div className="forest-map">
      {/* 标题 */}
      <div className="map-header">
        <h2 className="map-title">🌲 起源之森探索地图</h2>
        <p className="map-subtitle">探索三个区域，收集词根碎片</p>
      </div>

      {/* 进度指示器 */}
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(completedZones.length / zones.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          已探索 {completedZones.length} / {zones.length} 区域
        </span>
      </div>

      {/* 碎片收集展示 */}
      <div className="fragments-display">
        <h3>词根碎片</h3>
        <div className="fragments-grid">
          {zones.map(zone => {
            const isCollected = completedZones.includes(zone.id);
            return (
              <div 
                key={zone.id} 
                className={`fragment-slot ${isCollected ? 'collected' : 'empty'}`}
              >
                {isCollected ? (
                  <>
                    <img 
                      src={FRAGMENT_IMAGES[zone.id]} 
                      alt={zone.fragment.name}
                      className="fragment-image"
                    />
                    <span className="fragment-name">{zone.fragment.name}</span>
                  </>
                ) : (
                  <>
                    <div className="fragment-placeholder">?</div>
                    <span className="fragment-name">未收集</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 区域卡片 */}
      <div className="zones-container">
        {zones.map((zone, index) => {
          const isCompleted = completedZones.includes(zone.id);
          const isLocked = index > 0 && !completedZones.includes(zones[index - 1].id);
          
          return (
            <div 
              key={zone.id}
              className={`zone-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => !isLocked && onEnterZone(zone.id)}
            >
              {/* 连接线 */}
              {index > 0 && <div className="connector-line" />}
              
              {/* 区域图标 */}
              <div className="zone-icon">
                <span className="icon-emoji">{zone.icon}</span>
                {isCompleted && <span className="check-mark">✓</span>}
                {isLocked && <span className="lock-icon">🔒</span>}
              </div>

              {/* 区域信息 */}
              <div className="zone-info">
                <h3 className="zone-name">{zone.name}</h3>
                <p className="zone-description">{zone.description}</p>
                
                {/* 挑战信息 */}
                <div className="challenge-preview">
                  <span className="challenge-label">挑战：</span>
                  <span className="challenge-title">{zone.challenge.title}</span>
                </div>

                {/* 按钮 */}
                <button 
                  className={`enter-button ${isCompleted ? 'replay' : ''} ${isLocked ? 'disabled' : ''}`}
                  disabled={isLocked}
                >
                  {isLocked ? '🔒 未解锁' : isCompleted ? '🔄 重新探索' : '🌿 进入探索'}
                </button>
              </div>

              {/* 完成标记 */}
              {isCompleted && (
                <div className="completed-badge">
                  <span>已完成</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
