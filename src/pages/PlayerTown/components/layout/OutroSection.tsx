import React, { useState } from 'react';
import { SCRIPT } from '../../data';
import { ArrowRight, RotateCcw, Trophy, Clock } from 'lucide-react';
import librarianImg from '../../../../assets/images/npc_ai_librarian.png';
import bgImage from '../../../../assets/images/chapter3_intro_bg.png';
import './OutroSection.scss';

interface OutroSectionProps {
  onComplete: () => void;
  onRestart?: () => void;
}

export const OutroSection: React.FC<OutroSectionProps> = ({ onComplete, onRestart }) => {
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const narrations = [
    SCRIPT.ch3_outro_narration_1,
    SCRIPT.ch3_outro_narration_2
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
        <div className="cyber-grid" />
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="data-particle" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }} 
          />
        ))}
      </div>

      <div className="outro-content">
        {/* 章节回顾 */}
        <div className="chapter-recap">
          <h2>玩家生态城镇</h2>
          <p className="subtitle">黑话生态调研完成</p>
        </div>

        {/* 旁白文字 - 仅在未显示总结页时显示 */}
        {!showButton && (
          <div className="narration-wrapper">
            <div className="character-portrait">
              <img src={librarianImg} alt="AI Librarian" />
            </div>
            <div className="narration-box">
              <div className="speaker-name">梅林</div>
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
                <span className="reward-icon">🧬</span>
                <span className="reward-label">DNA测试</span>
                <span className="reward-value">完成</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">🔍</span>
                <span className="reward-label">黑话探索</span>
                <span className="reward-value">10+</span>
              </div>
              <div className="reward-item skill">
                <span className="reward-icon">🔊</span>
                <span className="reward-label">共鸣之声</span>
                <span className="reward-value">技能</span>
              </div>
              <div className="reward-item">
                <span className="reward-icon">✨</span>
                <span className="reward-label">经验值</span>
                <span className="reward-value">+400</span>
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
      </div>

      {/* 底部左侧：技能获得通知 */}
      {showButton && (
        <div className="skill-toast">
          <div className="toast-content">
            <div className="icon-box">
              <Clock size={24} />
            </div>
            <div className="text-box">
              <h4>技能获得</h4>
              <p className="title">{SCRIPT.ch3_skill_name}</p>
              <p className="desc">{SCRIPT.ch3_skill_desc}</p>
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
              <p className="title">社交达人</p>
              <p className="reward">获得称号「赛博外交官」</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
