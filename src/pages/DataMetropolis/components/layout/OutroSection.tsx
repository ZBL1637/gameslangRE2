import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerActions } from '@/context/PlayerContext';
import { ArrowRight, MapPin } from 'lucide-react';
import { SCRIPT } from '../../data';
import { PixelDialogBox } from '../ui/PixelDialogBox';
import npcAvatar from '@/assets/images/npc_data_weaver.png';
import './OutroSection.scss';

interface OutroSectionProps {
  onComplete: () => void;
}

export const OutroSection: React.FC<OutroSectionProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'narration1' | 'narration2' | 'summary' | 'complete'>('narration1');
  const navigate = useNavigate();
  const { completeChapter } = usePlayerActions();

  useEffect(() => {
    // 只有进入summary后才自动计时结束
    if (step === 'summary') {
      // 保持summary状态，不自动跳转，让用户看清楚成就
    }
  }, [step]);

  const handleNext = () => {
    if (step === 'narration1') {
      setStep('narration2');
    } else if (step === 'narration2') {
      setStep('summary');
    }
  };

  return (
    <div className="outro-section">
      {/* 对话层 */}
      {(step === 'narration1' || step === 'narration2') && (
        <div className="dialog-layer animate-fade-in">
          <div className="npc-container animate-slide-in-left">
            <img src={npcAvatar} alt="Data Weaver" className="npc-avatar" />
          </div>
          <PixelDialogBox
            text={step === 'narration1' ? SCRIPT.ch4_outro_narration_1 : SCRIPT.ch4_outro_narration_2}
            speaker={SCRIPT.ch4_npc_name}
            onNext={handleNext}
          />
        </div>
      )}

      {/* 章节总结 */}
      {(step === 'summary' || step === 'complete') && (
        <div className="summary-screen animate-fade-in">
          <div className="summary-header">
            <h1 className="main-title">系统同步完成</h1>
            <h2 className="sub-title">{SCRIPT.ch4_title}</h2>
          </div>

          <div className="achievement-list">
            <div className="achievement-item">
              <span className="icon">📊</span>
              <span className="text">光谱协议解码成功</span>
            </div>
            <div className="achievement-item">
              <span className="icon">😊</span>
              <span className="text">情感核心共振确认</span>
            </div>
            <div className="achievement-item">
              <span className="icon">🎭</span>
              <span className="text">分类矩阵风险排除</span>
            </div>
            <div className="achievement-item">
              <span className="icon">🎮</span>
              <span className="text">通用语法链接建立</span>
            </div>
            <div className="achievement-item highlight">
              <span className="icon">🎯</span>
              <span className="text">加载模块「{SCRIPT.ch4_skill_name}」</span>
            </div>
          </div>

          <div className="module-section">
            <div className="section-label">已加载模块</div>
            <div className="module-card">
              <div className="module-icon-wrapper">
                <span className="module-icon">🎯</span>
              </div>
              <div className="module-info">
                <h3 className="module-name">{SCRIPT.ch4_skill_name}</h3>
                <p className="module-desc">{SCRIPT.ch4_skill_effect}</p>
              </div>
            </div>
          </div>

          <div className="next-station">
            <MapPin size={18} />
            <span>下一站：译语通天塔</span>
          </div>

          <div className="action-buttons">
            <button className="action-btn next-chapter-btn" onClick={() => {
              completeChapter(4);
              navigate('/chapter/5');
            }}>
              前往下一章
              <ArrowRight size={20} />
            </button>
            <button className="action-btn world-map-btn" onClick={() => {
              completeChapter(4);
              navigate('/world-map', { state: { fromChapter: 4 } });
            }}>
              返回世界地图
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
