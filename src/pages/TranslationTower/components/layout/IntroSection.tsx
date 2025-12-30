// IntroSection - 入场动画和NPC对话
import React, { useState, useEffect } from 'react';
import { NPCDialogue } from '../../types';
import { PixelDialogBox } from '../ui/PixelDialogBox';
import './IntroSection.scss';

import npcAvatar from '../../../../assets/images/npc_translation_master.png';
import chapter5Bg from '../../../../assets/images/chapter5_bg.png';

interface IntroSectionProps {
  dialogues: NPCDialogue[];
  narrationText: string;
  onComplete: () => void;
}

type IntroStep = 'entrance' | 'title' | 'narration' | 'npc';

export const IntroSection: React.FC<IntroSectionProps> = ({
  dialogues,
  narrationText,
  onComplete
}) => {
  const [step, setStep] = useState<IntroStep>('entrance');
  const [dialogIndex, setDialogIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = chapter5Bg;
    return () => {
      img.onload = null;
    };
  }, []);
  
  // 入场动画序列
  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    
    // 1.5秒后显示标题 (entrance -> title)
    timers.push(setTimeout(() => setStep('title'), 1500));
    
    // 3.5秒后进入旁白 (title -> narration)
    timers.push(setTimeout(() => {
      setStep('narration');
    }, 3500));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleDialogNext = () => {
    if (step === 'narration') {
      // 旁白结束，进入NPC对话
      setStep('npc');
      setDialogIndex(0);
    } else if (step === 'npc') {
      if (dialogIndex < dialogues.length - 1) {
        setDialogIndex(prev => prev + 1);
      } else {
        // 对话结束
        setFadeOut(true);
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }
  };

  const getDialogContent = () => {
    if (step === 'narration') {
      return {
        text: narrationText,
        speaker: undefined
      };
    } else if (step === 'npc') {
      const currentDialogue = dialogues[dialogIndex];
      return {
        text: currentDialogue?.text || '...',
        speaker: currentDialogue?.speaker
      };
    }
    return null;
  };

  const dialogContent = getDialogContent();

  return (
    <section className={`intro-section translation-tower-intro ${fadeOut ? 'fade-out' : ''}`}>
      <div className="intro-frame">
        <div 
          className={`intro-bg ${bgLoaded ? 'loaded' : ''}`}
          style={{ backgroundImage: `url(${chapter5Bg})` }}
        />
        
        {/* 入场屏幕 */}
        {step === 'entrance' && (
          <div className="entrance-screen">
            <div className="entrance-text animate-fade-in">
              <p>第五章</p>
              <p>CHAPTER V</p>
            </div>
          </div>
        )}

        {/* 标题屏幕 */}
        {step === 'title' && (
          <div className="title-screen">
            <div className="title-content animate-scale-in">
              <span className="chapter-index">CHAPTER V</span>
              <h1>译语通天塔</h1>
              <p className="subtitle">Tower of Translation</p>
            </div>
          </div>
        )}

        {/* 对话层 */}
        {(step === 'narration' || step === 'npc') && dialogContent && (
          <div className="dialog-layer animate-fade-in">
            {step === 'npc' && (
              <div className="npc-container animate-slide-in-left">
                <img src={npcAvatar} alt="Translation Master" className="npc-avatar" />
              </div>
            )}
            <PixelDialogBox
              text={dialogContent.text}
              speaker={dialogContent.speaker}
              onNext={handleDialogNext}
              onComplete={step === 'npc' && dialogIndex === dialogues.length - 1 ? undefined : undefined} 
            />
          </div>
        )}
      </div>
    </section>
  );
};
