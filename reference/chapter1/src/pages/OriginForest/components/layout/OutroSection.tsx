import React, { useState, useEffect } from 'react';
import { SCRIPT } from '../../data';
import './OutroSection.scss';

interface OutroSectionProps {
  onComplete: () => void;
}

export const OutroSection: React.FC<OutroSectionProps> = ({ onComplete }) => {
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);

  const narrations = [
    SCRIPT.ch1_outro_narration_1,
    SCRIPT.ch1_outro_narration_2,
    SCRIPT.ch1_outro_narration_3,
    SCRIPT.ch1_outro_narration_4,
  ];

  // 打字机效果
  useEffect(() => {
    const currentText = narrations[narrationIndex];
    setIsTyping(true);
    setDisplayedText('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < currentText.length) {
        setDisplayedText(currentText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [narrationIndex]);

  const handleClick = () => {
    if (isTyping) {
      setIsTyping(false);
      setDisplayedText(narrations[narrationIndex]);
      return;
    }

    if (narrationIndex < narrations.length - 1) {
      setNarrationIndex(prev => prev + 1);
    } else if (!showAchievement) {
      setShowAchievement(true);
    }
  };

  return (
    <div className="outro-section" onClick={handleClick}>
      {/* 背景效果 */}
      <div className="outro-bg">
        <div className="light-rays" />
      </div>

      {/* 旁白文字 */}
      {!showAchievement && (
        <div className="narration-container">
          <p className="narration-text">
            {displayedText}
            {isTyping && <span className="cursor">▌</span>}
          </p>
          {!isTyping && (
            <div className="continue-hint">
              <span>点击继续</span>
              <span className="arrow">▼</span>
            </div>
          )}
        </div>
      )}

      {/* 成就展示 */}
      {showAchievement && (
        <div className="achievement-container">
          <div className="achievement-card">
            <div className="achievement-header">
              <span className="achievement-icon">🏆</span>
              <h2>成就解锁</h2>
            </div>
            <div className="achievement-content">
              <h3>森林探索者</h3>
              <p>{SCRIPT.ch1_achievement_body}</p>
              <div className="reward-info">
                <span className="reward-label">奖励：</span>
                <span className="reward-value">{SCRIPT.ch1_achievement_reward}</span>
              </div>
            </div>
            <button className="complete-button" onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}>
              返回世界地图
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
