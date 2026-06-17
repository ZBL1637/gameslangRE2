// MetaphorChallenge - 挑战三：隐喻回廊
import React, { useState } from 'react';
import { MetaphorItem, Chapter5GlobalState } from '../../types';
import './MetaphorChallenge.scss';

interface MetaphorChallengeProps {
  items: MetaphorItem[];
  onComplete: () => void;
  onExit: () => void;
  onUpdateState: (delta: Partial<Chapter5GlobalState>) => void;
}

interface Connection {
  sourceId: string;
  targetId: string;
}

export const MetaphorChallenge: React.FC<MetaphorChallengeProps> = ({
  items,
  onComplete,
  onExit: _onExit,
  onUpdateState
}) => {
  // 准备数据：左侧源点和右侧目标
  const [sources] = useState(() => items.map(item => item.left));
  
  // 右侧目标乱序
  const [targets] = useState(() => {
    return [...items.map(item => item.right)].sort(() => Math.random() - 0.5);
  });

  const [connections, setConnections] = useState<Connection[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  // 拖拽状态
  const [draggedSourceId, setDraggedSourceId] = useState<string | null>(null);

  const connectPair = (sourceId: string, targetId: string) => {
    const newConnections = connections.filter(
      c => c.sourceId !== sourceId && c.targetId !== targetId
    );

    newConnections.push({
      sourceId,
      targetId
    });

    setConnections(newConnections);
    setDraggedSourceId(null);
  };

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, sourceId: string) => {
    setDraggedSourceId(sourceId);
    e.dataTransfer.effectAllowed = 'link';
    // 设置拖拽预览图，可选
  };

  // 拖拽经过目标
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
  };

  // 放置在目标上
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSourceId) return;

    connectPair(draggedSourceId, targetId);
  };

  const handleSourceClick = (sourceId: string) => {
    if (showResult) return;
    setDraggedSourceId(prev => prev === sourceId ? null : sourceId);
  };

  const handleTargetClick = (targetId: string) => {
    if (showResult || !draggedSourceId) return;
    connectPair(draggedSourceId, targetId);
  };

  // 获取连接状态
  const getConnectedTarget = (sourceId: string) => connections.find(c => c.sourceId === sourceId)?.targetId;
  const getConnectedSource = (targetId: string) => connections.find(c => c.targetId === targetId)?.sourceId;

  // 检查是否所有都已连接
  const allConnected = connections.length === items.length;

  // 提交检查
  const handleSubmit = () => {
    let correct = 0;
    connections.forEach(conn => {
      // 找到对应的原始item，检查 sourceId 和 targetId 是否匹配
      const item = items.find(i => i.left.id === conn.sourceId);
      if (item && item.right.id === conn.targetId) {
        correct++;
      }
    });

    setCorrectCount(correct);
    setShowResult(true);

    // 更新全局状态
    if (correct === items.length) {
      onUpdateState({
        comms: 20, // 完美奖励
        culture: 15
      });
    } else {
      onUpdateState({
        comms: Math.max(0, (correct - (items.length - correct)) * 5)
      });
    }
  };

  // 渲染连线（SVG）
  // const _renderLines = () => { ... } // Removed unused function
  
  // 实际上，为了实现“回廊点亮”动画，我们需要在结果页展示。

  return (
    <div className={`metaphor-challenge ${showResult && correctCount === items.length ? 'success-glow' : ''}`}>
      <div className="challenge-content">
        <div className="header">
          <h2>隐喻回廊</h2>
          <p>拖拽左侧的【源语概念】，或先点左侧再点右侧，连接对应的【游戏术语】</p>
          <div className="progress">
            已连接: {connections.length} / {items.length}
          </div>
        </div>

        {!showResult ? (
          <div className="drag-area">
            {/* 左侧：源点 */}
            <div className="column source-column">
              {sources.map(source => {
                const targetId = getConnectedTarget(source.id);
                const isConnected = !!targetId;
                return (
                  <div
                    key={source.id}
                    className={`card source-card ${isConnected ? 'connected' : ''} ${draggedSourceId === source.id ? 'selected' : ''}`}
                    draggable={!isConnected} // 连接后也可以拖拽修改？或者锁定？通常可以修改
                    onDragStart={(e) => handleDragStart(e, source.id)}
                    onClick={() => handleSourceClick(source.id)}
                  >
                    <span className="card-icon">🏮</span>
                    <span className="card-text">{source.text}</span>
                    {isConnected && <div className="link-dot right" />}
                  </div>
                );
              })}
            </div>

            {/* 中间连线区（视觉装饰） */}
            <div className="connection-zone">
               {/* 可以在这里放 SVG 线条，但需要 DOM 引用。
                   这里简化处理：用颜色/编号标记，或者仅靠“已连接”状态。
                   为了更好的体验，我们可以给连接后的卡片加相同的颜色边框。
               */}
               <div className="corridor-bg"></div>
            </div>

            {/* 右侧：目标 */}
            <div className="column target-column">
              {targets.map(target => {
                const sourceId = getConnectedSource(target.id);
                const isConnected = !!sourceId;
                
                // 为了显示连接的是哪一个，我们可以显示对应的 source text (可选)
                const connectedSourceText = sourceId ? sources.find(s => s.id === sourceId)?.text : '';

                return (
                  <div
                    key={target.id}
                    className={`card target-card ${isConnected ? 'connected' : ''} ${draggedSourceId ? 'ready' : ''}`}
                    onClick={() => handleTargetClick(target.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, target.id)}
                  >
                    {isConnected && <div className="link-dot left" />}
                    <span className="card-text">{target.text}</span>
                    {isConnected && (
                      <span className="linked-badge">{connectedSourceText}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="result-area">
             <div className={`score-card ${correctCount === items.length ? 'perfect' : 'pass'}`}>
               <div className="score-icon">{correctCount === items.length ? '✨' : '📝'}</div>
               <h3>{correctCount === items.length ? '回廊全亮！' : '连接完成'}</h3>
               <p>正确匹配: {correctCount}/{items.length}</p>
             </div>

             <div className="review-list">
               {items.map((item, idx) => {
                 const conn = connections.find(c => c.sourceId === item.left.id);
                 const myTargetId = conn?.targetId;
                 const isCorrect = myTargetId === item.right.id;
                 
                 return (
                   <div key={idx} className={`review-item ${isCorrect ? 'correct' : 'wrong'} animate-reveal`} style={{animationDelay: `${idx * 0.2}s`}}>
                     <div className="pair">
                       <span className="source">{item.left.text}</span>
                       <span className="arrow">➔</span>
                       <span className="target">{item.right.text}</span>
                     </div>
                     <div className="explanation">
                       {item.explanation}
                     </div>
                   </div>
                 );
               })}
             </div>

             <button 
               className="continue-btn"
               onClick={correctCount === items.length ? onComplete : () => {
                 setConnections([]);
                 setShowResult(false);
                 setCorrectCount(0);
               }}
             >
               {correctCount === items.length ? '继续前行' : '重新挑战'}
             </button>
          </div>
        )}

        {!showResult && (
          <button 
            className="submit-btn"
            disabled={!allConnected}
            onClick={handleSubmit}
          >
            {allConnected ? '激活回廊' : '请连接所有选项'}
          </button>
        )}
      </div>
    </div>
  );
};
