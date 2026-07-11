import React, { useState, useCallback, useEffect } from 'react';
import { X, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { useModalDialog } from '@/hooks/useModalDialog';
import { DataNode } from '../../types';
import { CHAPTER4_DATA_NOTE, SCRIPT } from '../../data';
import './DataNodeExplorer.scss';

const TermDistributionChart = React.lazy(() =>
  import('../charts/TermDistributionChart').then(module => ({ default: module.TermDistributionChart }))
);
const SentimentDistributionChart = React.lazy(() =>
  import('../charts/SentimentDistributionChart').then(module => ({ default: module.SentimentDistributionChart }))
);
const CategorySentimentChart = React.lazy(() =>
  import('../charts/CategorySentimentChart').then(module => ({ default: module.CategorySentimentChart }))
);
const MultiGameRadarChart = React.lazy(() =>
  import('../charts/MultiGameRadarChart').then(module => ({ default: module.MultiGameRadarChart }))
);

interface DataNodeExplorerProps {
  node: DataNode;
  onComplete: (nodeId: string) => void;
  onClose: () => void;
}

type ExplorerStep = 'intro' | 'chart' | 'question' | 'result';

export const DataNodeExplorer: React.FC<DataNodeExplorerProps> = ({
  node,
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState<ExplorerStep>('intro');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const modalRef = useModalDialog<HTMLDivElement>({ active: true, onClose });

  useEffect(() => {
    modalRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [modalRef, node.id, step]);

  // 获取NPC介绍文本
  const getNpcIntro = () => {
    switch (node.id) {
      case 'node_1': return SCRIPT.ch4_npc_node1_intro;
      case 'node_2': return SCRIPT.ch4_npc_node2_intro;
      case 'node_3': return SCRIPT.ch4_npc_node3_intro;
      case 'node_4': return SCRIPT.ch4_npc_node4_intro;
      default: return '';
    }
  };

  // 渲染对应的图表
  const renderChart = () => {
    switch (node.id) {
      case 'node_1':
        return <TermDistributionChart />;
      case 'node_2':
        return <SentimentDistributionChart />;
      case 'node_3':
        return <CategorySentimentChart />;
      case 'node_4':
        return <MultiGameRadarChart />;
      default:
        return null;
    }
  };

  // 开始探索
  const handleStartExplore = useCallback(() => {
    setStep('chart');
  }, []);

  // 准备回答问题
  const handleReadyToAnswer = useCallback(() => {
    setStep('question');
  }, []);

  // 提交答案
  const handleSubmitAnswer = useCallback(() => {
    if (selectedOption === null) return;
    
    const correct = selectedOption === node.question.correctIndex;
    setIsCorrect(correct);
    setStep('result');
  }, [selectedOption, node.question.correctIndex]);

  // 完成节点
  const handleComplete = useCallback(() => {
    onComplete(node.id);
  }, [node.id, onComplete]);

  // 重试
  const handleRetry = useCallback(() => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowHint(false);
    setStep('chart');
  }, []);

  return (
    <div className="data-node-explorer-overlay">
      <div
        className="explorer-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-node-title"
        tabIndex={-1}
      >
        {/* 关闭按钮 */}
        <button type="button" className="close-btn" aria-label="关闭数据节点" onClick={onClose}>
          <X size={20} />
        </button>

        {/* 节点标题 */}
        <div className="node-header" style={{ borderColor: node.color }}>
          <span className="node-icon">{node.icon}</span>
          <div className="node-title">
            <h2 id="data-node-title">{node.name}</h2>
            <p>{node.description}</p>
          </div>
        </div>

        <aside className="data-provenance-note" aria-label="第四章数据说明">
          <strong>{CHAPTER4_DATA_NOTE.label}</strong>
          <p>{CHAPTER4_DATA_NOTE.scope}</p>
          <p>{CHAPTER4_DATA_NOTE.limitations}</p>
          <p>{CHAPTER4_DATA_NOTE.pending}</p>
        </aside>

        {/* 介绍阶段 */}
        {step === 'intro' && (
          <div className="intro-content animate-fade-in">
            <div className="npc-message">
              <div className="npc-avatar">🧙</div>
              <div className="message-bubble">
                <p>{getNpcIntro()}</p>
              </div>
            </div>
            <button type="button" className="action-btn primary" onClick={handleStartExplore}>
              开始探索
            </button>
          </div>
        )}

        {/* 图表阶段 */}
        {step === 'chart' && (
          <div className="chart-content animate-fade-in">
            <div className="chart-container">
              <React.Suspense fallback={<div className="chart-loading">正在装载图表证据...</div>}>
                {renderChart()}
              </React.Suspense>
            </div>
            <div className="chart-actions">
              <p className="instruction">仔细观察图表，找出其中的规律</p>
              <button type="button" className="action-btn primary" onClick={handleReadyToAnswer}>
                我准备好回答问题了
              </button>
            </div>
          </div>
        )}

        {/* 问题阶段 */}
        {step === 'question' && (
          <div className="question-content animate-fade-in">
            <div className="question-box">
              <h3>{node.question.question}</h3>
              
              {/* 提示 */}
              <div className="hint-section">
                <button 
                  type="button"
                  className="hint-btn"
                  onClick={() => setShowHint(!showHint)}
                >
                  <HelpCircle size={16} />
                  {showHint ? '隐藏提示' : '显示提示'}
                </button>
                {showHint && (
                  <p className="hint-text">{node.question.hint}</p>
                )}
              </div>

              {/* 选项 */}
              <div className="options-list">
                {node.question.options.map((option, index) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`option-btn ${selectedOption === index ? 'selected' : ''}`}
                    onClick={() => setSelectedOption(index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="question-actions">
              <button type="button" className="action-btn secondary" onClick={() => setStep('chart')}>
                返回查看图表
              </button>
              <button 
                type="button"
                className="action-btn primary" 
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
              >
                提交答案
              </button>
            </div>
          </div>
        )}

        {/* 结果阶段 */}
        {step === 'result' && (
          <div className="result-content animate-fade-in">
            <div className={`result-box ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="result-icon">
                {isCorrect ? (
                  <Check size={48} />
                ) : (
                  <AlertCircle size={48} />
                )}
              </div>
              <h3>{isCorrect ? '回答正确！' : '回答错误'}</h3>
              <p className="explanation">{node.question.explanation}</p>
            </div>

            <div className="result-actions">
              {isCorrect ? (
                <button type="button" className="action-btn primary" onClick={handleComplete}>
                  完成节点
                </button>
              ) : (
                <>
                  <button type="button" className="action-btn secondary" onClick={handleRetry}>
                    重新尝试
                  </button>
                  <button type="button" className="action-btn primary" onClick={handleComplete}>
                    继续（跳过）
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
