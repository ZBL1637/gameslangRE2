// KeywordChallenge - 挑战一：关键词锻炉
import React, { useState } from 'react';
import { 
  KeywordItem, 
  Chapter5GlobalState, 
  RuneType 
} from '../../types';
import './KeywordChallenge.scss';

interface KeywordChallengeProps {
  items: KeywordItem[];
  collectedRunes: RuneType[];
  onComplete: () => void;
  onExit: () => void;
  onUpdateState: (delta: Partial<Chapter5GlobalState>) => void;
  addRune: (rune: RuneType) => void;
}

export const KeywordChallenge: React.FC<KeywordChallengeProps> = ({
  items,
  collectedRunes,
  onComplete,
  onExit,
  onUpdateState,
  addRune
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // 新增状态：Combo 连击
  const [combo, setCombo] = useState(0);
  // 新增状态：获得的符文提示
  const [earnedRune, setEarnedRune] = useState<RuneType | null>(null);

  const currentItem = items[currentIndex];
  const isCorrect = selectedAnswer === currentItem.correctAnswer;

  // 策略对应的中文标签
  const strategyMap = {
    transliteration: '音译',
    paraphrase: '意译',
    domestication: '归化',
    foreignization: '异化'
  };

  // 符文对应的图标
  const runeIcons = {
    accuracy: '🎯',
    elegance: '✨',
    spirit: '👻'
  };

  // 选择答案
  const handleSelectAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  // 提交答案
  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
    
    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setCorrectCount(prev => prev + 1);
      
      // 奖励结算
      onUpdateState({
        comms: Math.min(100, (newCombo >= 3 ? 5 : 0) + 10), // 基础 +10 HP，3连击以上额外 +5
        clarity: Math.min(100, 5)
      });

      // 掉落符文 (仅首通/未收集时)
      if (currentItem.runeDrop && !collectedRunes.includes(currentItem.runeDrop)) {
        setEarnedRune(currentItem.runeDrop);
        addRune(currentItem.runeDrop);
      }
    } else {
      setCombo(0);
      // 惩罚
      onUpdateState({ comms: -10 });
    }
  };

  // 下一题
  const handleNext = () => {
    setEarnedRune(null);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  // 完成挑战
  const handleFinish = () => {
    // 60% 正确率视为通过
    if (correctCount >= Math.ceil(items.length * 0.6)) {
      onComplete();
    } else {
      // 重新开始
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectCount(0);
      setIsComplete(false);
      setCombo(0);
      setEarnedRune(null);
    }
  };

  return (
    <div className="challenge-overlay">
      <div className="challenge-modal keyword-challenge">
        <button className="close-btn" onClick={onExit}>✕</button>

        <div className="challenge-header">
          <span className="challenge-icon">🔤</span>
          <h2>关键词锻炉</h2>
          <p>选择最合适的英文翻译</p>
          
          {/* Combo 展示 */}
          {combo > 1 && (
            <div className="combo-badge">
              <span className="combo-count">{combo}</span>
              <span className="combo-label">COMBO!</span>
            </div>
          )}
        </div>

        {!isComplete ? (
          <>
            {/* 进度条 */}
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
              ></div>
              <span className="progress-text">{currentIndex + 1}/{items.length}</span>
            </div>

            {/* 题目区域 */}
            <div className="question-area">
              <div className="chinese-term">
                <span className="term-text">{currentItem.chinese}</span>
                <span className="pinyin">{currentItem.pinyin}</span>
                {/* 策略标签 */}
                <span className={`strategy-tag ${currentItem.strategy}`}>
                  {strategyMap[currentItem.strategy]}
                </span>
              </div>

              <div className="arrow-indicator">→</div>

              <div className="options-grid">
                {currentItem.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${selectedAnswer === option ? 'selected' : ''} ${
                      showResult 
                        ? option === currentItem.correctAnswer 
                          ? 'correct' 
                          : selectedAnswer === option 
                            ? 'incorrect' 
                            : ''
                        : ''
                    }`}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={showResult}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 结果展示 */}
            {showResult && (
              <div className={`result-area ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-header">
                  <span className="result-icon">{isCorrect ? '✅' : '❌'}</span>
                  <span className="result-text">{isCorrect ? '正确！' : '错误'}</span>
                  {/* 符文掉落提示 */}
                  {isCorrect && earnedRune && (
                    <div className="rune-drop">
                      <span className="rune-icon">{runeIcons[earnedRune]}</span>
                      <span className="rune-name">获得符文: {earnedRune}</span>
                    </div>
                  )}
                </div>
                <div className="explanation">
                  <h4>翻译解析</h4>
                  <p>{currentItem.explanation}</p>
                </div>
                <div className="cultural-note">
                  <h4>文化背景</h4>
                  <p>{currentItem.culturalNote}</p>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="action-buttons">
              {!showResult ? (
                <button 
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                >
                  确认答案
                </button>
              ) : (
                <button className="next-btn" onClick={handleNext}>
                  {currentIndex < items.length - 1 ? '下一题 →' : '查看结果'}
                </button>
              )}
            </div>
          </>
        ) : (
          /* 完成界面 */
          <div className="complete-area">
            <div className={`score-display ${correctCount >= Math.ceil(items.length * 0.6) ? 'pass' : 'fail'}`}>
              <span className="score-icon">
                {correctCount >= Math.ceil(items.length * 0.6) ? '🎉' : '😢'}
              </span>
              <h3>
                {correctCount >= Math.ceil(items.length * 0.6) 
                  ? '锻造成功！' 
                  : '火候不足'}
              </h3>
              <p className="score-text">
                正确率: {correctCount}/{items.length} 
                ({Math.round((correctCount / items.length) * 100)}%)
              </p>
              <p className="pass-hint">
                {correctCount >= Math.ceil(items.length * 0.6)
                  ? '你已掌握关键词翻译的精髓！'
                  : `需要正确 ${Math.ceil(items.length * 0.6)} 题以上才能通过`}
              </p>
            </div>
            <button className="finish-btn" onClick={handleFinish}>
              {correctCount >= Math.ceil(items.length * 0.6) ? '领取奖励' : '重新锻造'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
