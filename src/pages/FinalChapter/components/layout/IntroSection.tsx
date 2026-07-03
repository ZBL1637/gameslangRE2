// ============================================================================
// IntroSection - 入场动画和Boss对话
// ============================================================================

import React, { useState } from 'react';
import { NPC_DIALOGUES, NARRATION_TEXTS } from '../../data';
import './IntroSection.scss';

interface IntroSectionProps {
  onComplete: () => void;
}

type IntroPhase = 'entrance' | 'title' | 'narration' | 'boss_dialogue' | 'ready';

const IntroSection: React.FC<IntroSectionProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<IntroPhase>('entrance');
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const handleClick = () => {
    switch (phase) {
      case 'entrance':
        setPhase('title');
        break;
      case 'title':
        setPhase('narration');
        break;
      case 'narration':
        setPhase('boss_dialogue');
        break;
      case 'boss_dialogue':
        if (dialogueIndex < NPC_DIALOGUES.intro.length - 1) {
          setDialogueIndex(prev => prev + 1);
        } else {
          setPhase('ready');
        }
        break;
      case 'ready':
        onComplete();
        break;
    }
  };

  const renderContent = () => {
    switch (phase) {
      case 'entrance':
        return (
          <div className="entrance-screen">
            <div className="entrance-text">
              <p>终 章</p>
              <p>···</p>
            </div>
          </div>
        );

      case 'title':
        return (
          <div className="title-screen">
            <div className="title-content">
              <span className="chapter-index">FINAL CHAPTER</span>
              <h1>魔王城</h1>
              <p className="subtitle">The Overlord's Citadel</p>
            </div>
          </div>
        );

      case 'narration':
        return (
          <div className="narration-screen">
            <div className="narration-box">
              <p className="narration-text">{NARRATION_TEXTS.intro}</p>
            </div>
            <span className="click-hint">点击继续</span>
          </div>
        );

      case 'boss_dialogue':
        const dialogue = NPC_DIALOGUES.intro[dialogueIndex];
        return (
          <div className="dialogue-screen">
            <div className="boss-container">
              <div className="boss-visual">
                <div className="boss-silhouette">
                  <div className="data-streams">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="stream" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <div className="boss-face">
                    <div className="face-code">{'{ }'}</div>
                  </div>
                </div>
              </div>
              
              <div className="dialogue-box">
                <div className="dialogue-header">
                  <span className={`speaker ${dialogue.speaker === '算法霸主' ? 'boss' : 'system'}`}>
                    {dialogue.speaker}
                  </span>
                </div>
                <p className="dialogue-text">{dialogue.text}</p>
                <span className="click-hint">点击继续</span>
              </div>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="ready-screen">
            <div className="ready-content">
              <div className="boss-icon">🌀</div>
              <h2>最终决战</h2>
              <p className="battle-info">
                在15回合内击败算法霸主<br/>
                合理运用你在旅途中获得的技能
              </p>
              <div className="battle-brief">
                <div>
                  <strong>核心目标</strong>
                  <span>抓住充能窗口，打断终极过滤。</span>
                </div>
                <div>
                  <strong>战斗节奏</strong>
                  <span>先清守门人，再集中攻击算法霸主。</span>
                </div>
                <div>
                  <strong>证据加成</strong>
                  <span>已收集的数据碎片会自动转化为战斗优势。</span>
                </div>
              </div>
              <button className="start-battle-btn" onClick={onComplete}>
                <span className="btn-icon">⚔️</span>
                <span>开始战斗</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="intro-section" onClick={phase !== 'ready' ? handleClick : undefined}>
      <button
        type="button"
        className="skip-intro-btn"
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
      >
        跳过动画
      </button>
      {renderContent()}
    </div>
  );
};

export default IntroSection;
