// StyleChallenge - 挑战二：语气熔炉
import React, { useState, useEffect } from 'react';
import { 
  StyleItem, 
  TranslationStyle, 
  Chapter5GlobalState 
} from '../../types';
import './StyleChallenge.scss';

interface StyleChallengeProps {
  items: StyleItem[];
  onComplete: () => void;
  onExit: () => void;
  onUpdateState: (delta: Partial<Chapter5GlobalState>) => void;
}

export const StyleChallenge: React.FC<StyleChallengeProps> = ({
  items,
  onComplete,
  onExit,
  onUpdateState
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<TranslationStyle | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [glossUsedCount, setGlossUsedCount] = useState(0); // 本轮使用了几次注释
  const [isGlossApplied, setIsGlossApplied] = useState(false); // 当前是否已加注释
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = items[currentIndex];

  // 重置每题状态
  useEffect(() => {
    setSelectedStyle(null);
    setShowComparison(false);
    setIsGlossApplied(false);
    setGlossUsedCount(0);
  }, [currentIndex]);

  // 选择翻译风格
  const handleSelectStyle = (style: TranslationStyle) => {
    setSelectedStyle(style);
    setShowComparison(true);
    
    // const styleData = style === 'foreignization' 
    //   ? currentItem.foreignization 
    //   : currentItem.domestication;

    // 初始数值影响
    onUpdateState({
      culture: style === 'foreignization' ? 5 : -2,
      clarity: style === 'domestication' ? 5 : -2
    });
  };

  // 添加注释
  const handleAddGloss = () => {
    if (glossUsedCount >= 2 || isGlossApplied || !currentItem.gloss) return;
    
    setIsGlossApplied(true);
    setGlossUsedCount(prev => prev + 1);
    
    // 注释效果：Clarity 提升，Culture 不降
    onUpdateState({
      clarity: currentItem.gloss.effect.clarity,
      culture: currentItem.gloss.effect.culture
    });
  };

  // 获取当前展示的译文
  const getDisplayTranslation = () => {
    if (!selectedStyle) return '';
    const baseText = selectedStyle === 'foreignization' 
      ? currentItem.foreignization.translation 
      : currentItem.domestication.translation;
      
    if (isGlossApplied && currentItem.gloss) {
      return `${baseText} (${currentItem.gloss.text})`;
    }
    return baseText;
  };

  // 获取商人反应
  const getMerchantReaction = () => {
    if (!selectedStyle) return { emoji: '🤔', text: '波斯商人：这是什么意思？' };
    
    const styleData = selectedStyle === 'foreignization' 
      ? currentItem.foreignization 
      : currentItem.domestication;
    
    let accessibility = styleData.accessibility;
    if (isGlossApplied) accessibility += 20; // 注释提升理解度

    if (accessibility >= 80) return { emoji: '😊', text: '波斯商人：我完全理解了！' };
    if (accessibility >= 50) return { emoji: '😐', text: '波斯商人：大概明白了...' };
    return { emoji: '😵', text: '波斯商人：简直是天书！' };
  };

  const reaction = getMerchantReaction();

  // 下一题
  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  return (
    <div className="challenge-overlay">
      <div className="challenge-modal style-challenge">
        <button type="button" className="close-btn" onClick={onExit}>✕</button>

        <div className="challenge-header">
          <span className="challenge-icon">🔥</span>
          <h2>语气熔炉</h2>
          <p>在"保留原味"与"通俗易懂"之间抉择</p>
        </div>

        {!isComplete ? (
          <>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
              ></div>
              <span className="progress-text">{currentIndex + 1}/{items.length}</span>
            </div>

            {/* 原文与语境 */}
            <div className="original-section">
              <div className="chinese-text">
                <span className="label">原文</span>
                <p className="text">{currentItem.chinese}</p>
              </div>
              <div className="context-text">
                <span className="label">语境</span>
                <p className="text">{currentItem.context}</p>
              </div>
            </div>

            {/* 风格选择 */}
            <div className="style-buttons">
              <button
                type="button"
                className={`style-btn foreignization ${selectedStyle === 'foreignization' ? 'selected' : ''}`}
                onClick={() => handleSelectStyle('foreignization')}
                disabled={showComparison}
              >
                <span className="style-icon">🏺</span>
                <span className="style-name">异化 (Foreignization)</span>
                <span className="style-desc">保留源语文化特色</span>
              </button>
              <button
                type="button"
                className={`style-btn domestication ${selectedStyle === 'domestication' ? 'selected' : ''}`}
                onClick={() => handleSelectStyle('domestication')}
                disabled={showComparison}
              >
                <span className="style-icon">🤝</span>
                <span className="style-name">归化 (Domestication)</span>
                <span className="style-desc">贴近译语读者习惯</span>
              </button>
            </div>

            {/* 结果对比区 */}
            {showComparison && selectedStyle && (
              <div className="comparison-section animate-slide-up">
                {/* 商人反应 */}
                <div className="merchant-reaction">
                  <span className="merchant-emoji">{reaction.emoji}</span>
                  <span className="reaction-text">{reaction.text}</span>
                </div>

                {/* 译文展示 */}
                <div className="translation-display">
                  <p className="final-text">{getDisplayTranslation()}</p>
                  
                  {/* 注释按钮 */}
                  {currentItem.gloss && !isGlossApplied && (
                    <button 
                      type="button"
                      className="gloss-btn"
                      onClick={handleAddGloss}
                      disabled={glossUsedCount >= 2}
                      title="添加注释可提升清晰度"
                    >
                      📝 添加注释 (+清晰度)
                    </button>
                  )}
                </div>

                {/* 核心反馈：双条拉扯 */}
                <div className="dual-feedback-bar">
                  <div className="bar-container">
                    {/* 文化条 (左) */}
                    <div 
                      className="bar-fill culture"
                      style={{ 
                        width: `${selectedStyle === 'foreignization' ? currentItem.foreignization.culturalPreservation : currentItem.domestication.culturalPreservation}%` 
                      }}
                    >
                      <span className="bar-label">Culture</span>
                    </div>
                    
                    {/* 清晰条 (右) */}
                    <div 
                      className="bar-fill clarity"
                      style={{ 
                        width: `${(selectedStyle === 'foreignization' ? currentItem.foreignization.accessibility : currentItem.domestication.accessibility) + (isGlossApplied ? 20 : 0)}%` 
                      }}
                    >
                      <span className="bar-label">Clarity</span>
                    </div>
                  </div>
                  <div className="bar-legend">
                    <span>⬅ 文化深厚</span>
                    <span>通俗易懂 ➡</span>
                  </div>
                </div>

                <div className="explanation-box">
                  <p>{selectedStyle === 'foreignization' ? currentItem.foreignization.explanation : currentItem.domestication.explanation}</p>
                </div>

                <button type="button" className="next-btn" onClick={handleNext}>
                  {currentIndex < items.length - 1 ? '下一题 →' : '完成挑战'}
                </button>
              </div>
            )}
          </>
        ) : (
          /* 完成界面 */
          <div className="complete-area">
            <span className="complete-icon">⚖️</span>
            <h3>熔炼完成！</h3>
            <p>你已领悟如何在不同语境下权衡翻译策略。</p>
            <button type="button" className="finish-btn" onClick={onComplete}>
              领取奖励
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
