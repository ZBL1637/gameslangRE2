// FinalTask - 最终翻译任务
import React, { useState } from 'react';
import { NPCDialogue } from '../../types';
import { FINAL_TASK, MERCHANTS } from '../../data';
import './FinalTask.scss';

interface FinalTaskProps {
  dialogues: NPCDialogue[];
  onComplete: () => void;
}

type TaskPhase = 'intro' | 'task' | 'result';

export const FinalTask: React.FC<FinalTaskProps> = ({
  dialogues,
  onComplete
}) => {
  const [phase, setPhase] = useState<TaskPhase>('intro');
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showHints, setShowHints] = useState<boolean[]>(new Array(FINAL_TASK.hints.length).fill(false));
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const merchant = MERCHANTS[0];

  // 处理对话点击
  const handleDialogueClick = () => {
    if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex(prev => prev + 1);
    } else {
      setPhase('task');
    }
  };

  const handleIntroKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleDialogueClick();
  };

  // 显示提示
  const toggleHint = (index: number) => {
    setShowHints(prev => {
      const newHints = [...prev];
      newHints[index] = !newHints[index];
      return newHints;
    });
  };

  // 翻译选项
  const translationOptions = [
    { id: 'a', text: 'Tonight we explore new dungeon. Need Tank and Healer. DPS be strong, no lazy!' },
    { id: 'b', text: 'Hey friends, tonight we\'re attempting a new dungeon for the first time. We need a Tank and a Healer. DPS players should bring their A-game - no slacking off!' },
    { id: 'c', text: 'Brothers, tonight open wasteland new copy, come T and milk, DPS give power, don\'t row water!' },
    { id: 'd', text: 'Guys, let\'s do the new raid tonight. Looking for tank and healer. Good DPS only, no AFK.' }
  ];

  // 选择翻译
  const handleSelectOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(prev => prev.filter(id => id !== optionId));
    } else {
      setSelectedOptions([optionId]);
    }
  };

  // 提交翻译
  const handleSubmit = () => {
    const correct = selectedOptions.includes('b');
    setIsCorrect(correct);
    setPhase('result');
  };

  return (
    <section className="final-task-section">
      {/* 介绍阶段 */}
      {phase === 'intro' && (
        <div
          className="intro-phase"
          role="button"
          tabIndex={0}
          aria-label="继续对话"
          onClick={handleDialogueClick}
          onKeyDown={handleIntroKeyDown}
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

      {/* 任务阶段 */}
      {phase === 'task' && (
        <div className="task-phase">
          <div className="task-header">
            <h2>最终考验：跨文化翻译</h2>
            <p>帮助波斯商人理解本地玩家的黑话</p>
          </div>

          <div className="task-content">
            {/* 原文展示 */}
            <div className="original-text-card">
              <div className="card-header">
                <span className="player-avatar">🎮</span>
                <span className="player-name">本地玩家</span>
              </div>
              <div className="card-body">
                <p className="original-text">"{FINAL_TASK.originalText}"</p>
                <p className="context">{FINAL_TASK.context}</p>
              </div>
            </div>

            {/* 商人反应 */}
            <div className="merchant-card">
              <div className="card-header">
                <span className="merchant-avatar">{merchant.avatar}</span>
                <span className="merchant-name">{merchant.name}（波斯商人）</span>
              </div>
              <div className="card-body">
                <p className="merchant-text">"{merchant.dialogues.confused}"</p>
              </div>
            </div>

            {/* 提示区域 */}
            <div className="hints-section">
              <h4>翻译提示（点击展开）</h4>
              <div className="hints-list">
                {FINAL_TASK.hints.map((hint: string, index: number) => (
                  <button
                    type="button"
                    key={index} 
                    className={`hint-item ${showHints[index] ? 'expanded' : ''}`}
                    aria-expanded={showHints[index]}
                    onClick={() => toggleHint(index)}
                  >
                    <span className="hint-icon">{showHints[index] ? '📖' : '❓'}</span>
                    <span className="hint-text">
                      {showHints[index] ? hint : `提示 ${index + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 翻译选项 */}
            <div className="translation-options">
              <h4>选择最合适的翻译：</h4>
              <div className="options-list">
                {translationOptions.map(option => (
                  <button
                    type="button"
                    key={option.id}
                    className={`option-item ${selectedOptions.includes(option.id) ? 'selected' : ''}`}
                    aria-pressed={selectedOptions.includes(option.id)}
                    onClick={() => handleSelectOption(option.id)}
                  >
                    <span className="option-letter">{option.id.toUpperCase()}</span>
                    <p className="option-text">{option.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="submit-btn"
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0}
            >
              提交翻译
            </button>
          </div>
        </div>
      )}

      {/* 结果阶段 */}
      {phase === 'result' && (
        <div className="result-phase">
          <div className={`result-card ${isCorrect ? 'success' : 'retry'}`}>
            {isCorrect ? (
              <>
                <div className="result-icon">🎉</div>
                <h2>翻译成功！</h2>
                <div className="merchant-reaction">
                  <span className="merchant-avatar">{merchant.avatar}</span>
                  <p>"{merchant.dialogues.understanding}"</p>
                </div>
                <p className="result-explanation">
                  你的翻译既保留了原意，又使用了目标受众能理解的表达方式。
                  这正是优秀翻译的精髓——在忠实与可读之间找到平衡。
                </p>
                <button className="continue-btn" onClick={onComplete}>
                  获取奖励 →
                </button>
              </>
            ) : (
              <>
                <div className="result-icon">🤔</div>
                <h2>再试一次</h2>
                <p className="result-explanation">
                  这个翻译可能过于直译或过于意译，导致信息传递不够准确。
                  好的翻译需要在保留原意和易于理解之间找到平衡。
                </p>
                <button className="retry-btn" onClick={() => setPhase('task')}>
                  重新选择
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
