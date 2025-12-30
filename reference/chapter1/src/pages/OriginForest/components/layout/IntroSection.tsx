import React, { useState, useEffect } from 'react';
import { SCRIPT, NPC_OPTIONS } from '../../data';
import npcImage from '../../../../assets/images/npc_forest_keeper.png';
import bgImage from '../../../../assets/images/chapter1_forest_bg.png';
import './IntroSection.scss';

interface IntroSectionProps {
  onComplete: () => void;
}

type Phase = 'narration' | 'npc_intro' | 'npc_options' | 'npc_task';

export const IntroSection: React.FC<IntroSectionProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('narration');
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [npcDialogueIndex, setNpcDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const narrations = [
    SCRIPT.ch1_intro_narration_1,
    SCRIPT.ch1_intro_narration_2,
    SCRIPT.ch1_intro_narration_3,
    SCRIPT.ch1_intro_narration_4,
  ];

  const npcIntroDialogues = [
    SCRIPT.ch1_npc_intro_1,
    SCRIPT.ch1_npc_intro_2,
  ];

  // 打字机效果
  useEffect(() => {
    let currentText = '';
    
    if (phase === 'narration') {
      currentText = narrations[narrationIndex];
    } else if (phase === 'npc_intro') {
      currentText = npcIntroDialogues[npcDialogueIndex];
    } else if (phase === 'npc_options' && selectedOption) {
      const option = NPC_OPTIONS.find(o => o.id === selectedOption);
      currentText = option?.response || '';
    } else if (phase === 'npc_task') {
      currentText = SCRIPT.ch1_npc_task;
    }

    if (!currentText) return;

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
  }, [phase, narrationIndex, npcDialogueIndex, selectedOption]);

  const handleClick = () => {
    if (isTyping) {
      // 跳过打字效果
      setIsTyping(false);
      if (phase === 'narration') {
        setDisplayedText(narrations[narrationIndex]);
      } else if (phase === 'npc_intro') {
        setDisplayedText(npcIntroDialogues[npcDialogueIndex]);
      } else if (phase === 'npc_task') {
        setDisplayedText(SCRIPT.ch1_npc_task);
      }
      return;
    }

    // 进入下一阶段
    if (phase === 'narration') {
      if (narrationIndex < narrations.length - 1) {
        setNarrationIndex(prev => prev + 1);
      } else {
        setPhase('npc_intro');
        setNpcDialogueIndex(0);
      }
    } else if (phase === 'npc_intro') {
      if (npcDialogueIndex < npcIntroDialogues.length - 1) {
        setNpcDialogueIndex(prev => prev + 1);
      } else {
        setPhase('npc_options');
      }
    } else if (phase === 'npc_options' && selectedOption) {
      setPhase('npc_task');
      setSelectedOption(null);
    } else if (phase === 'npc_task') {
      onComplete();
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  return (
    <div className="intro-section" onClick={handleClick}>
      {/* 背景 */}
      <div className="intro-bg" style={{ backgroundImage: `url(${bgImage})` }} />
      
      {/* 章节标题（旁白阶段显示） */}
      {phase === 'narration' && narrationIndex === 0 && (
        <div className="chapter-title">
          <span className="chapter-index">{SCRIPT.ch1_title_chapter_index}</span>
          <h1 className="main-title">{SCRIPT.ch1_title_main}</h1>
          <span className="sub-title">{SCRIPT.ch1_title_sub}</span>
        </div>
      )}

      {/* NPC图片（NPC阶段显示） */}
      {(phase === 'npc_intro' || phase === 'npc_options' || phase === 'npc_task') && (
        <div className="npc-container">
          <img src={npcImage} alt="森林守护者" className="npc-image" />
          <div className="npc-glow" />
        </div>
      )}

      {/* 对话框 */}
      <div className="dialogue-box">
        {/* NPC名字 */}
        {(phase === 'npc_intro' || phase === 'npc_options' || phase === 'npc_task') && (
          <div className="speaker-name">{SCRIPT.ch1_npc_name}</div>
        )}
        
        {/* 对话内容 */}
        <div className="dialogue-content">
          <p className="dialogue-text">
            {displayedText}
            {isTyping && <span className="cursor">▌</span>}
          </p>
        </div>

        {/* 选项（NPC选项阶段显示） */}
        {phase === 'npc_options' && !selectedOption && !isTyping && (
          <div className="options-container">
            {NPC_OPTIONS.map(option => (
              <button 
                key={option.id}
                className="option-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionSelect(option.id);
                }}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {/* 继续提示 */}
        {!isTyping && phase !== 'npc_options' && (
          <div className="continue-hint">
            <span>点击继续</span>
            <span className="arrow">▼</span>
          </div>
        )}
        {!isTyping && phase === 'npc_options' && selectedOption && (
          <div className="continue-hint">
            <span>点击继续</span>
            <span className="arrow">▼</span>
          </div>
        )}
      </div>
    </div>
  );
};
