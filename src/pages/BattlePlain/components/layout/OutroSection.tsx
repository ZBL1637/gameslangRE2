import React, { useState } from 'react';
import { SCRIPT } from '../../data';
import { ArrowRight, RotateCcw, Trophy, Clock } from 'lucide-react';
import timelordImg from '../../../../assets/images/timelord.png';
import bgImage from '../../../../assets/images/chapter2_end_bg.png';
import './OutroSection.scss';

interface OutroSectionProps {
  onComplete: () => void;
  onRestart?: () => void;
}

export const OutroSection: React.FC<OutroSectionProps> = ({ onComplete, onRestart }) => {
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const narrations = [
    SCRIPT.ch2_outro_narration_1,
    SCRIPT.ch2_outro_narration_2,
    SCRIPT.ch2_outro_narration_3,
    SCRIPT.ch2_outro_narration_4
  ];

  // 处理点击继续
  const handleClick = () => {
    if (narrationIndex < narrations.length - 1) {
      setNarrationIndex(prev => prev + 1);
    } else {
      setShowButton(true);
    }
  };

  return (
    <div className="outro-section" onClick={!showButton ? handleClick : undefined} style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* 背景特效 */}
      <div className="background-effects">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="time-particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} 
          />
        ))}
        <div className="time-vortex" />
      </div>

      <div className="outro-content">
        {/* 章节回顾 */}
        <div className="chapter-recap">
          <h2>战斗本体平原</h2>
          <p className="subtitle">时光档案馆探索完成</p>
        </div>

        {/* 旁白文字 - 仅在未显示总结页时显示 */}
        {!showButton && (
          <div className="narration-wrapper">
            <div className="character-portrait">
              <img src={timelordImg} alt="Time Guardian" />
            </div>
            <div className="narration-box">
              <div className="speaker-name">时之守护者</div>
              <p className="narration-text">
                {narrations[narrationIndex]}
              </p>
              <span className="click-hint">
                点击继续 ({narrationIndex + 1}/{narrations.length})
              </span>
            </div>
          </div>
        )}

        {/* 收获总结 */}
        {showButton && (
          <div className="rewards-summary">
            <h3>本章收获</h3>
            <div className="rewards-grid">
              <div className="reward-item">
                <span className="reward-icon">💎</span>
                <span className="reward-label">时间碎片</span>
                <span className="reward-value">×4</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🧭</span>
                <span className="reward-label">时之罗盘</span>
                <span className="reward-value">×1</span>
              </div>
              <div className="reward-item skill">
                <span className="reward-icon">⏸️</span>
                <span className="reward-label">时之凝固</span>
                <span className="reward-value">技能</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">✨</span>
                <span className="reward-label">经验值</span>
                <span className="reward-value">+300</span>
              </div>
            </div>
          </div>
        )}

        {/* 继续按钮 */}
        {showButton && (
          <div className="action-buttons">
            {onRestart && (
              <button className="restart-btn" onClick={onRestart}>
                <RotateCcw size={18} />
                重新开始本章
              </button>
            )}
            <button className="continue-btn" onClick={onComplete}>
              返回世界地图
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* 底部左侧：技能获得通知 */}
        {showButton && (
          <div className="skill-toast">
            <div className="toast-content">
              <div className="icon-box">
                <Clock size={24} />
              </div>
              <div className="text-box">
                <h4>技能获得</h4>
                <p className="title">{SCRIPT.ch2_skill_name}</p>
                <p className="desc">{SCRIPT.ch2_skill_desc}</p>
              </div>
            </div>
          </div>
        )}

        {/* 底部右侧：成就解锁通知 */}
        {showButton && (
          <div className="achievement-toast">
            <div className="toast-content">
              <div className="icon-box">
                <Trophy size={24} />
              </div>
              <div className="text-box">
                <h4>成就解锁</h4>
                <p className="title">{SCRIPT.ch2_achievement_title.replace("🏆 ", "")}</p>
                <p className="reward">{SCRIPT.ch2_achievement_reward}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
