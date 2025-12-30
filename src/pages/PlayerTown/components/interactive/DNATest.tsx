import React, { useMemo, useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, FlaskConical } from 'lucide-react';
import { DNA_QUESTIONS, GENRES, SCRIPT } from '../../data';
import { DNAResult, GameGenre, QuizGameConfig, QuizQuestion } from '../../types';
import './DNATest.scss';

interface DNATestProps {
  onComplete: (results: DNAResult[]) => void;
  onClose: () => void;
}

export const DNATest: React.FC<DNATestProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-8 = questions
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ show: boolean; keyword: string }>({
    show: false,
    keyword: ''
  });
  const [quizConfig, setQuizConfig] = useState<QuizGameConfig | null>(null);

  // 抽题列表（优先使用 quiz 配置抽题，否则回退至内置）
  const axisMap: Record<string, GameGenre> = {
    casual: '休闲',
    racing: '竞速',
    gacha: '二次元',
    moba: 'MOBA',
    fps: 'FPS',
    sandbox: '沙盒'
  };
  const drawnQuestions = useMemo(() => {
    if (!quizConfig) return DNA_QUESTIONS;
    const pool = quizConfig.questions;
    const pickById = (id: string) => pool.find(q => q.id === id);
    const picked: QuizQuestion[] = [];
    const cfg = quizConfig.quiz.questionDraw;
    if (cfg.mode === 'stratified_random' && cfg.strata?.length) {
      cfg.strata.forEach(stratum => {
        const candidates = stratum.from.map(pickById).filter(Boolean) as QuizQuestion[];
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        picked.push(...shuffled.slice(0, stratum.pick));
      });
      // 补齐数量
      if (picked.length < cfg.drawCount) {
        const remaining = pool.filter(q => !picked.some(p => p.id === q.id));
        const shuffled = [...remaining].sort(() => Math.random() - 0.5);
        picked.push(...shuffled.slice(0, cfg.drawCount - picked.length));
      } else if (picked.length > cfg.drawCount) {
        picked.splice(cfg.drawCount);
      }
    } else {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      picked.push(...shuffled.slice(0, cfg.drawCount));
    }
    // 转为内置 DNATest 问题结构
    const toDNA = picked.map(pq => ({
      id: pq.id,
      title: pq.prompt,
      subtitle: '',
      multi: pq.type === 'multi',
      maxPick: pq.maxPick ?? (pq.type === 'multi' ? 2 : undefined),
      options: pq.options.map(opt => ({
        label: opt.text,
        weights: Object.fromEntries(
          Object.entries(opt.score.axes).map(([axis, v]) => [axisMap[axis], v])
        )
      }))
    }));
    return toDNA;
  }, [quizConfig]);

  const currentQuestion = drawnQuestions[currentStep - 1];
  const isIntro = currentStep === 0;
  const isLastQuestion = currentStep === drawnQuestions.length;
  const totalQuestions = drawnQuestions.length;

  /**
   * 提取本题“采样关键词”
   * - 优先从选项文本中提取显眼词（简单规则：中文/英文词组中间的空格分隔或特殊符号）
   * - 若无法解析，回退为选项文本的核心词（截断为前 6-8 字）
   */
  const getSampleKeyword = (label: string): string => {
    const bySymbols = label.match(/([A-Za-z0-9]+)|([\u4e00-\u9fa5]{2,4})/g);
    if (bySymbols && bySymbols.length > 0) {
      return bySymbols[0];
    }
    return label.slice(0, Math.min(8, label.length));
  };

  /**
   * DNA 采样段列表（用于渲染 8 段进度格）
   */
  const segments = useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, i) => ({
      index: i + 1,
      state: i + 1 < currentStep ? 'lit' : i + 1 === currentStep ? 'active' : 'idle'
    }));
  }, [currentStep, totalQuestions]);

  /**
   * 加载 quiz 配置（reference/quizgame.json）
   * - 首选动态 import（开发环境可用）
   * - 失败则忽略，沿用内置题库
   */
  React.useEffect(() => {
    let disposed = false;
    const loadConfig = async () => {
      try {
        const base = (import.meta as any).env?.BASE_URL ?? '/';
        const res = await fetch(`${base}reference/quizgame.json`);
        if (!disposed && res.ok) {
          const data = await res.json();
          setQuizConfig(data as QuizGameConfig);
        }
      } catch {
        // ignore
      }
    };
    void loadConfig();
    return () => { disposed = true; };
  }, []);

  // 选择选项
  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;

    if (currentQuestion.multi) {
      // 多选
      const maxPick = currentQuestion.maxPick || 2;
      if (selectedOptions.includes(optionIndex)) {
        setSelectedOptions(prev => prev.filter(i => i !== optionIndex));
      } else if (selectedOptions.length < maxPick) {
        setSelectedOptions(prev => [...prev, optionIndex]);
      }
    } else {
      // 单选
      setSelectedOptions([optionIndex]);
    }
  };

  // 下一题
  const handleNext = () => {
    if (isIntro) {
      setCurrentStep(1);
      return;
    }

    if (selectedOptions.length === 0) return;

    // 保存答案
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOptions
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // 计算结果
      const results = calculateResults(newAnswers);
      onComplete(results);
    } else {
      // 采样奖励提示（0.6s）
      const opt = currentQuestion.options[selectedOptions[0]];
      const keyword = opt ? getSampleKeyword(opt.label) : '';
      setRewardToast({ show: true, keyword });
      setTimeout(() => {
        setRewardToast({ show: false, keyword: '' });
      }, 600);
      setCurrentStep(prev => prev + 1);
      setSelectedOptions([]);
    }
  };

  // 上一题
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      const prevQuestion = drawnQuestions[currentStep - 2];
      setSelectedOptions(answers[prevQuestion.id] || []);
    }
  };

  // 计算结果
  const calculateResults = (finalAnswers: Record<string, number[]>): DNAResult[] => {
    const scores: Record<GameGenre, number> = {
      'MOBA': 0, '二次元': 0, '沙盒': 0, 'FPS': 0, '竞速': 0, '休闲': 0
    };

    drawnQuestions.forEach(question => {
      const picks = finalAnswers[question.id] || [];
      picks.forEach(index => {
        const option = question.options[index];
        GENRES.forEach(genre => {
          scores[genre] += option.weights[genre] || 0;
        });
      });
    });

    // 计算百分比
    const total = GENRES.reduce((sum, genre) => sum + scores[genre], 0) || 1;
    const percents = GENRES.map(genre => ({
      genre,
      percent: Math.round(scores[genre] / total * 100)
    }));

    // 确保总和为100%
    const sum = percents.reduce((acc, item) => acc + item.percent, 0);
    const diff = 100 - sum;
    if (diff !== 0) {
      const maxIndex = percents.reduce((maxIdx, item, idx, arr) =>
        item.percent > arr[maxIdx].percent ? idx : maxIdx, 0);
      percents[maxIndex].percent += diff;
    }

    return percents.sort((a, b) => b.percent - a.percent);
  };

  return (
    <div className="dna-test-overlay">
      <div className="dna-test-modal">
        {/* 关闭按钮 */}
        <button className="close-btn" onClick={() => setShowExitConfirm(true)}>
          <X size={24} />
        </button>

        {/* 进度条 */}
        {!isIntro && (
          <div className="progress-bar dna-segments">
            <div className="segments">
              {segments.map(seg => (
                <span key={seg.index} className={`seg ${seg.state}`} />
              ))}
            </div>
            <span className="progress-text">样本 {currentStep} / {totalQuestions}</span>
          </div>
        )}

        {/* 介绍页 */}
        {isIntro && (
          <div className="intro-card">
            <div className="dna-icon">
              <FlaskConical size={28} />
            </div>
            <h2>黑话DNA测试</h2>
            <p className="system-hint">系统：我们将从你的“开黑常用语”中提取 8 段 DNA 片段。</p>
            <p>{SCRIPT.ch3_dna_intro}</p>
            <p className="hint">8 题 · 约 30 秒 · 不记录个人信息（仅生成本次报告）</p>
            <button className="start-btn" onClick={handleNext}>
              开始测试
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* 问题卡片 */}
        {!isIntro && currentQuestion && (
          <div className="question-card">
            <h3 className="question-title">{currentQuestion.title}</h3>
            {currentQuestion.subtitle && (
              <p className="question-subtitle">{currentQuestion.subtitle}</p>
            )}
            {currentQuestion.multi && (
              <p className="multi-counter">已选 {selectedOptions.length}/{currentQuestion.maxPick || 2}</p>
            )}

            <div className="options-list">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${selectedOptions.includes(index) ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(index)}
                >
                  <span className="option-check">
                    {selectedOptions.includes(index) ? (
                      <Check size={16} />
                    ) : (
                      <span className="empty-check"></span>
                    )}
                  </span>
                  <span className="option-label">
                    {option.label}
                  </span>
                  {selectedOptions.includes(index) && (
                    <span className="sample-chip">DNA</span>
                  )}
                </button>
              ))}
            </div>

            {/* 键盘/手柄提示（可通过配置关闭） */}
            {(quizConfig?.quiz?.uiHints?.showKeyHints ?? true) && (
              <p className="key-hints">↑↓ 选择  Enter 确认  Esc 退出</p>
            )}

            <div className="navigation">
              {currentStep > 1 && (
                <button className="nav-btn prev" onClick={handlePrev}>
                  <ArrowLeft size={18} />
                  上一题
                </button>
              )}
              <button 
                className="nav-btn next"
                onClick={handleNext}
                disabled={selectedOptions.length === 0}
              >
                {selectedOptions.length === 0 ? '请选择 1 项' : (isLastQuestion ? '查看结果' : '下一题')}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 采样奖励 Toast */}
        {rewardToast.show && (
          <div className="reward-toast">
            <div className="toast-content">
              <span className="reward-text">DNA 片段 +1</span>
              {rewardToast.keyword && (
                <span className="reward-keyword">{rewardToast.keyword}</span>
              )}
            </div>
          </div>
        )}

        {/* 退出确认弹窗 */}
        {showExitConfirm && (
          <div className="exit-confirm">
            <div className="confirm-card">
              <h4>确认退出鉴定？</h4>
              <p>退出将不会保存本次进度。</p>
              <div className="actions">
                <button className="btn-outline" onClick={onClose}>退出鉴定</button>
                <button className="btn-primary" onClick={() => setShowExitConfirm(false)}>继续鉴定</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
