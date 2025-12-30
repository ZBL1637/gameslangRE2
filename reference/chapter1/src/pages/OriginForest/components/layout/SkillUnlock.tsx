import React, { useState, useEffect } from 'react';
import { SCRIPT } from '../../data';
import skillImage from '../../../../assets/images/skill_resonance_voice.png';
import npcImage from '../../../../assets/images/npc_forest_keeper.png';
import './SkillUnlock.scss';

interface SkillUnlockProps {
  onUnlock: () => void;
}

export const SkillUnlock: React.FC<SkillUnlockProps> = ({ onUnlock }) => {
  const [phase, setPhase] = useState<'intro' | 'unlock' | 'complete'>('intro');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // 打字机效果
  useEffect(() => {
    const text = SCRIPT.ch1_skill_unlock_text;
    setIsTyping(true);
    setDisplayedText('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    if (isTyping) {
      setIsTyping(false);
      setDisplayedText(SCRIPT.ch1_skill_unlock_text);
      return;
    }

    if (phase === 'intro') {
      setPhase('unlock');
    } else if (phase === 'unlock') {
      setPhase('complete');
      setTimeout(onUnlock, 2000);
    }
  };

  return (
    <div className="skill-unlock-overlay" onClick={handleClick}>
      {/* 背景粒子 */}
      <div className="particles-bg">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* NPC */}
      <div className="npc-container">
        <img src={npcImage} alt="森林守护者" className="npc-image" />
        <div className="npc-glow" />
      </div>

      {/* 对话框 */}
      {phase === 'intro' && (
        <div className="dialogue-box">
          <div className="speaker-name">{SCRIPT.ch1_npc_name}</div>
          <div className="dialogue-content">
            <p className="dialogue-text">
              {displayedText}
              {isTyping && <span className="cursor">▌</span>}
            </p>
          </div>
          {!isTyping && (
            <div className="continue-hint">
              <span>点击继续</span>
              <span className="arrow">▼</span>
            </div>
          )}
        </div>
      )}

      {/* 技能解锁动画 */}
      {phase === 'unlock' && (
        <div className="skill-unlock-animation">
          <div className="skill-container">
            <div className="skill-glow-ring" />
            <div className="skill-glow-ring delay-1" />
            <div className="skill-glow-ring delay-2" />
            <img src={skillImage} alt="共鸣之声" className="skill-icon" />
          </div>
          <div className="skill-info">
            <h2 className="skill-name">{SCRIPT.ch1_skill_name}</h2>
            <p className="skill-desc">{SCRIPT.ch1_skill_desc}</p>
          </div>
          <div className="unlock-prompt">点击获取技能</div>
        </div>
      )}

      {/* 完成状态 */}
      {phase === 'complete' && (
        <div className="skill-complete">
          <div className="success-icon">✨</div>
          <h2>技能已获得！</h2>
          <div className="skill-badge">
            <img src={skillImage} alt="共鸣之声" className="badge-icon" />
            <span className="badge-name">{SCRIPT.ch1_skill_name}</span>
          </div>
        </div>
      )}
    </div>
  );
};
