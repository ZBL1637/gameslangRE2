// OutroSection - 章节结束与结算
import React, { useState, useEffect } from 'react';
import { Chapter5GlobalState, SkillData } from '../../types';
import './OutroSection.scss';

interface OutroSectionProps {
  narrationText: string;
  globalState: Chapter5GlobalState;
  skillData: SkillData;
  onContinue: () => void;
}

type OutroPhase = 'narration' | 'calculating' | 'settlement';

export const OutroSection: React.FC<OutroSectionProps> = ({
  narrationText,
  globalState,
  skillData,
  onContinue
}) => {
  const [phase, setPhase] = useState<OutroPhase>('narration');
  const [displayedScore, setDisplayedScore] = useState({ clarity: 0, culture: 0, comms: 0 });

  // 评价计算
  const getRank = () => {
    const { clarity, culture } = globalState;
    const total = clarity + culture;
    if (total > 180) return { title: "通天塔·传奇译者", color: "#f59e0b" };
    if (total > 150) return { title: "通天塔·资深向导", color: "#8b5cf6" };
    if (total > 120) return { title: "通天塔·见习翻译", color: "#06b6d4" };
    return { title: "通天塔·迷途旅人", color: "#64748b" };
  };

  const rank = getRank();

  const handleNarrationClick = () => {
    setPhase('calculating');
  };

  const handleNarrationKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleNarrationClick();
  };

  // 数字滚动动画
  useEffect(() => {
    if (phase === 'calculating') {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setDisplayedScore({
          clarity: Math.floor(globalState.clarity * progress),
          culture: Math.floor(globalState.culture * progress),
          comms: Math.floor(globalState.comms * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setPhase('settlement');
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [phase, globalState]);

  return (
    <section className="outro-section">
      {/* 叙述阶段 */}
      {phase === 'narration' && (
        <div
          className="narration-screen animate-fade-in"
          role="button"
          tabIndex={0}
          aria-label="生成通天塔契约"
          onClick={handleNarrationClick}
          onKeyDown={handleNarrationKeyDown}
        >
          <div className="narration-box">
            <p className="narration-text">{narrationText}</p>
          </div>
          <span className="click-hint">点击屏幕生成通天塔契约...</span>
        </div>
      )}

      {/* 结算阶段 */}
      {(phase === 'calculating' || phase === 'settlement') && (
        <div className="settlement-screen animate-fade-in-up">
          <div className="settlement-card">
            <div className="card-header">
              <span className="chapter-label">CHAPTER 5 COMPLETED</span>
              <h2>译语通天塔 · 结语</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-circle clarity">
                  <span className="value">{displayedScore.clarity}</span>
                </div>
                <span className="label">清晰度 (Clarity)</span>
              </div>
              <div className="stat-item">
                <div className="stat-circle culture">
                  <span className="value">{displayedScore.culture}</span>
                </div>
                <span className="label">文化度 (Culture)</span>
              </div>
              <div className="stat-item">
                <div className="stat-circle comms">
                  <span className="value">{displayedScore.comms}</span>
                </div>
                <span className="label">传播值 (Comms)</span>
              </div>
            </div>

            <div className="secondary-stats animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="stat-row">
                <span className="label">获得符文 (Runes)</span>
                <span className="value">{globalState.runes.length}</span>
              </div>
              <div className="stat-row">
                <span className="label">收集词条 (Phrasebook)</span>
                <span className="value">{globalState.phrasebook.length}</span>
              </div>
              <div className="stat-row">
                <span className="label">使用提示 (Hints Used)</span>
                <span className="value">{globalState.ticketsUsed || 0}</span>
              </div>
            </div>

            {phase === 'settlement' && (
              <div className="rank-badge animate-pop-in" style={{ borderColor: rank.color, color: rank.color }}>
                <span className="rank-title">{rank.title}</span>
              </div>
            )}

            <div className="rewards-section">
              <h3>获得奖励</h3>
              <div className="skill-card-reward">
                <div className="card-inner">
                  <div className="card-front">
                    <div className="skill-icon">🔤</div>
                    <div className="skill-details">
                      <h4>{skillData.name}</h4>
                      <p>{skillData.description}</p>
                      <div className="skill-tags">
                        <span>被动</span>
                        <span>语言系</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {phase === 'settlement' && (
              <button className="continue-btn animate-fade-in" onClick={onContinue}>
                前往下一章：魔王城 →
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
