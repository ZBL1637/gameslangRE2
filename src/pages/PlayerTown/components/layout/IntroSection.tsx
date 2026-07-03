import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SCRIPT } from '../../data';
import './IntroSection.scss';

import chapter3IntroBg from '@/assets/images/chapter3_intro_bg.webp';

interface IntroSectionProps {
  onComplete: () => void;
}

type IntroStep = 'entrance' | 'title';

export const IntroSection: React.FC<IntroSectionProps> = ({
  onComplete
}) => {
  const [step, setStep] = useState<IntroStep>('entrance');
  const [fadeOut, setFadeOut] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = chapter3IntroBg;
    return () => {
      img.onload = null;
    };
  }, []);

  const finishIntro = useCallback((delay = 240) => {
    if (completedRef.current) return;
    completedRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setFadeOut(true);
    window.setTimeout(() => onComplete(), delay);
  }, [onComplete]);

  // 入场动画序列
  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    timersRef.current = timers;
    timers.push(setTimeout(() => setStep('title'), 1200));
    timers.push(setTimeout(() => setFadeOut(true), 2800));
    timers.push(setTimeout(() => finishIntro(0), 3300));

    return () => timers.forEach(clearTimeout);
  }, [finishIntro]);

  return (
    <section className={`intro-section ${fadeOut ? 'fade-out' : ''}`}>
      <div className="intro-frame">
        <div
          className={`intro-bg ${bgLoaded ? 'loaded' : ''}`}
          style={{ backgroundImage: `url(${chapter3IntroBg})` }}
        />

        <button
          type="button"
          className="skip-intro-btn"
          onClick={(e) => {
            e.stopPropagation();
            finishIntro();
          }}
        >
          跳过动画
        </button>

        {step === 'entrance' && (
          <div className="entrance-screen">
            <div className="entrance-text animate-fade-in">
              <p>第三章</p>
              <p>CHAPTER 3</p>
            </div>
          </div>
        )}

        {step === 'title' && (
          <div className="title-screen">
            <div className="title-content animate-scale-in">
              <span className="chapter-index">CHAPTER 3</span>
              <h1>{SCRIPT.ch3_title}</h1>
              <p className="subtitle">{SCRIPT.ch3_subtitle}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
