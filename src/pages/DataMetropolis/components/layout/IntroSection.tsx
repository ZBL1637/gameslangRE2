import React, { useState, useEffect } from 'react';
import { SCRIPT } from '../../data';
import { PixelDialogBox } from '../ui/PixelDialogBox';
import './IntroSection.scss';

import chapter4DataBg from '@/assets/images/chapter4_data_bg.png';
import npcAvatar from '@/assets/images/npc_data_weaver.png';

interface IntroSectionProps {
  onComplete: () => void;
}

type IntroStep = 'entrance' | 'title' | 'narration' | 'npc';

export const IntroSection: React.FC<IntroSectionProps> = ({ onComplete }) => {
  const [step, setStep] = useState<IntroStep>('entrance');
  const [dialogIndex, setDialogIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = chapter4DataBg;
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
      if (dialogIndex === 0) {
        setDialogIndex(1);
      } else {
        setStep('npc');
        setDialogIndex(0);
      }
    } else if (step === 'npc') {
      if (dialogIndex === 0) {
        setDialogIndex(1);
      } else {
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
        text: dialogIndex === 0 ? SCRIPT.ch4_intro_narration_1 : SCRIPT.ch4_intro_narration_2,
        speaker: undefined
      };
    } else if (step === 'npc') {
      return {
        text: dialogIndex === 0 ? SCRIPT.ch4_npc_greeting : SCRIPT.ch4_npc_task,
        speaker: SCRIPT.ch4_npc_name
      };
    }
    return null;
  };

  const dialogContent = getDialogContent();

  return (
    <section className={`intro-section data-metropolis-intro ${fadeOut ? 'fade-out' : ''}`}>
      <div className="intro-frame">
        <div 
          className={`intro-bg ${bgLoaded ? 'loaded' : ''}`}
          style={{ backgroundImage: `url(${chapter4DataBg})` }}
        />
        
        {/* 入场屏幕 */}
        {step === 'entrance' && (
          <div className="entrance-screen">
            <div className="entrance-text animate-fade-in">
              <p>第四章</p>
              <p>CHAPTER IV</p>
            </div>
          </div>
        )}

        {/* 标题屏幕 */}
        {step === 'title' && (
          <div className="title-screen">
            <div className="title-content animate-scale-in">
              <span className="chapter-index">CHAPTER IV</span>
              <h1>{SCRIPT.ch4_title}</h1>
              <p className="subtitle">{SCRIPT.ch4_subtitle}</p>
            </div>
          </div>
        )}

        {/* 对话层 */}
        {(step === 'narration' || step === 'npc') && dialogContent && (
          <div className="dialog-layer animate-fade-in">
            {step === 'npc' && (
              <div className="npc-container animate-slide-in-left">
                <img src={npcAvatar} alt="Data Weaver" className="npc-avatar" />
              </div>
            )}
            <PixelDialogBox
              text={dialogContent.text}
              speaker={dialogContent.speaker}
              onNext={handleDialogNext}
            />
          </div>
        )}
      </div>
    </section>
  );
};
