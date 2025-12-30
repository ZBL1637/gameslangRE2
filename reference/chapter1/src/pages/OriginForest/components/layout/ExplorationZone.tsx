import React, { useState } from 'react';
import { ChartSunburst } from '@/components/Charts/ChartSunburst';
import { ChartCooccurrenceGraph } from '@/components/Charts/ChartCooccurrenceGraph';
import { ChartCooccurrenceHeatmap } from '@/components/Charts/ChartCooccurrenceHeatmap';
import { ForestZone } from '../../types';
import './ExplorationZone.scss';

interface ExplorationZoneProps {
  zone: ForestZone;
  onComplete: () => void;
  onExit: () => void;
}

export const ExplorationZone: React.FC<ExplorationZoneProps> = ({ zone, onComplete, onExit }) => {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<string>('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  // 处理旭日图选择
  const handleSunburstSelect = (termId: string, l1Category: string) => {
    setSelectedTerm(termId);
    setSelectedInfo(`「${termId}」属于「${l1Category}」分类`);
    setInteractionCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setTimeout(() => setShowCompletion(true), 500);
      }
      return newCount;
    });
  };

  // 处理共词图选择
  const handleGraphSelect = (meta: { termId: string; degree: number }) => {
    setSelectedTerm(meta.termId);
    setSelectedInfo(`「${meta.termId}」与 ${meta.degree} 个术语相关联`);
    setInteractionCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setTimeout(() => setShowCompletion(true), 500);
      }
      return newCount;
    });
  };

  // 处理热力图选择
  const handleHeatmapSelect = (pair: { a: string; b: string; value: number }) => {
    setSelectedTerm(`${pair.a} - ${pair.b}`);
    setSelectedInfo(`「${pair.a}」与「${pair.b}」的共现强度为 ${pair.value}`);
    setInteractionCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setTimeout(() => setShowCompletion(true), 500);
      }
      return newCount;
    });
  };

  // 根据区域类型渲染图表
  const renderChart = () => {
    switch (zone.challenge.type) {
      case 'sunburst':
        return (
          <div className="chart-wrapper">
            <ChartSunburst onSelectFragment={handleSunburstSelect} />
          </div>
        );
      case 'network':
        return (
          <div className="chart-wrapper">
            <ChartCooccurrenceGraph onSelectTermMeta={handleGraphSelect} />
          </div>
        );
      case 'heatmap':
        return (
          <div className="chart-wrapper">
            <ChartCooccurrenceHeatmap onSelectPair={handleHeatmapSelect} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="exploration-zone-overlay">
      <div className="exploration-zone-modal">
        {/* 头部 */}
        <div className="modal-header">
          <div className="zone-title">
            <span className="zone-icon">{zone.icon}</span>
            <h2>{zone.name}</h2>
          </div>
          <button className="close-button" onClick={onExit}>✕</button>
        </div>

        {/* 挑战说明 */}
        <div className="challenge-info">
          <h3>{zone.challenge.title}</h3>
          <p>{zone.challenge.description}</p>
          <p className="instructions">{zone.challenge.instructions}</p>
        </div>

        {/* 进度 */}
        <div className="selection-progress">
          <span>探索进度: {Math.min(interactionCount, 3)} / 3</span>
          <div className="progress-dots">
            {[0, 1, 2].map(i => (
              <span 
                key={i} 
                className={`dot ${i < interactionCount ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* 选中信息显示 */}
        {selectedTerm && (
          <div className="selected-info">
            <div className="selected-term">
              <span className="label">当前选中：</span>
              <span className="term">{selectedTerm}</span>
            </div>
            <div className="selected-detail">{selectedInfo}</div>
          </div>
        )}

        {/* 图表内容 */}
        <div className="challenge-content">
          {renderChart()}
        </div>

        {/* 完成弹窗 */}
        {showCompletion && (
          <div className="completion-overlay">
            <div className="completion-modal">
              <div className="completion-icon">🌟</div>
              <h3>探索完成！</h3>
              <p>你已收集到「{zone.fragment.name}」</p>
              <div className="fragment-keywords">
                {zone.fragment.keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
              <button className="confirm-button" onClick={onComplete}>
                收下碎片
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
