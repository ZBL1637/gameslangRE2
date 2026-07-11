// SkillUnlock - 技能解锁动画
import React, { useState, useEffect } from 'react';
import { NPCDialogue } from '../../types';
import './SkillUnlock.scss';

interface SkillData {
  name: string;
  englishName: string;
  icon: string;
  description: string;
  effects: string[];
  lore: string;
}

interface SkillUnlockProps {
  skillData: SkillData;
  dialogues: NPCDialogue[];
  onConfirm: () => void;
}

type UnlockPhase = 'dialogue' | 'reveal' | 'details';

export const SkillUnlock: React.FC<SkillUnlockProps> = ({
  skillData,
  dialogues,
  onConfirm
}) => {
  const [phase, setPhase] = useState<UnlockPhase>('dialogue');
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // 处理对话点击
  const handleDialogueClick = () => {
    if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex(prev => prev + 1);
    } else {
      setPhase('reveal');
    }
  };

  const handleDialogueKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleDialogueClick();
  };

  // 揭示动画后显示详情
  useEffect(() => {
    if (phase === 'reveal') {
      const timer = setTimeout(() => {
        setPhase('details');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="skill-unlock-overlay">
      {/* 粒子效果 */}
      <div className="particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="skill-unlock-container">
        {/* 对话阶段 */}
        {phase === 'dialogue' && (
          <div
            className="dialogue-phase"
            role="button"
            tabIndex={0}
            aria-label="继续技能对话"
            onClick={handleDialogueClick}
            onKeyDown={handleDialogueKeyDown}
          >
            <div className="npc-dialogue">
              <div className="npc-avatar">🧙‍♂️</div>
              <div className="dialogue-box">
                <h3>{dialogues[dialogueIndex]?.speaker}</h3>
                <p>{dialogues[dialogueIndex]?.text}</p>
                <span className="click-hint">点击继续</span>
              </div>
            </div>
          </div>
        )}

        {/* 揭示阶段 */}
        {phase === 'reveal' && (
          <div className="reveal-phase animate-scale-in">
            <div className="skill-icon-container">
              <div className="icon-glow"></div>
              <div className="icon-ring"></div>
              <div className="skill-icon">
                <span>{skillData.icon}</span>
              </div>
            </div>
            <div className="skill-name">
              <h2>{skillData.name}</h2>
              <span className="sparkle-icon">✨</span>
            </div>
            <p className="skill-english">{skillData.englishName}</p>
          </div>
        )}

        {/* 详情阶段 */}
        {phase === 'details' && (
          <div className="details-phase animate-fade-in">
            <div className="skill-reveal">
              <div className="skill-icon-container small">
                <div className="icon-glow"></div>
                <div className="skill-icon">
                  <span>{skillData.icon}</span>
                </div>
              </div>
              <div className="skill-name">
                <h2>{skillData.name}</h2>
                <span className="sparkle-icon">✨</span>
              </div>
              <p className="skill-english">{skillData.englishName}</p>
            </div>

            <div className="skill-details">
              <p className="skill-desc">{skillData.description}</p>

              <div className="skill-effect">
                <h4>技能效果</h4>
                <ul>
                  {skillData.effects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </div>

              <div className="skill-lore">
                <p>"{skillData.lore}"</p>
              </div>

              <button className="confirm-btn" onClick={onConfirm}>
                习得技能 ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
