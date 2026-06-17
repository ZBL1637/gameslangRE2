import React, { useMemo } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getChapterConfig } from '@/data/chapterProgress';
import './DataEvidencePanel.scss';

interface DataEvidencePanelProps {
  chapterId: number;
  storageKey?: string;
  compact?: boolean;
}

type NewsInteractionProgress = {
  selectedOptionId?: string;
  revealed?: boolean;
  correct?: boolean;
};

const getDefaultStorageKey = (chapterId: number) => `news_${chapterId}`;

export const DataEvidencePanel: React.FC<DataEvidencePanelProps> = ({
  chapterId,
  storageKey,
  compact = false,
}) => {
  const { state, updateChapterProgress } = usePlayer();
  const config = getChapterConfig(chapterId);
  const key = storageKey ?? getDefaultStorageKey(chapterId);
  const progress = (state.chapterProgress?.[key] || {}) as NewsInteractionProgress;

  const selectedOption = useMemo(
    () => config?.predictionOptions.find(option => option.id === progress.selectedOptionId) ?? null,
    [config?.predictionOptions, progress.selectedOptionId]
  );

  if (!config) return null;

  const handleSelect = (optionId: string) => {
    const option = config.predictionOptions.find(item => item.id === optionId);
    updateChapterProgress(key, {
      selectedOptionId: optionId,
      revealed: true,
      correct: Boolean(option?.isCorrect),
    });
  };

  return (
    <section className={`data-evidence-panel ${compact ? 'is-compact' : ''}`} aria-label="数据新闻证据面板">
      <div className="evidence-header">
        <div>
          <span className="evidence-kicker">DATA BRIEF</span>
          <h3>{config.coreQuestion}</h3>
        </div>
        <div className={`evidence-grade-chip ${progress.correct ? 'is-correct' : progress.revealed ? 'is-miss' : ''}`}>
          {progress.revealed ? (progress.correct ? '判断命中' : '需要修正') : '等待判断'}
        </div>
      </div>

      <div className="prediction-block">
        <p className="prediction-prompt">{config.predictionPrompt}</p>
        <div className="prediction-options">
          {config.predictionOptions.map(option => {
            const selected = option.id === progress.selectedOptionId;
            const showCorrect = progress.revealed && option.isCorrect;
            return (
              <button
                key={option.id}
                className={`prediction-option ${selected ? 'is-selected' : ''} ${showCorrect ? 'is-correct' : ''}`}
                onClick={() => handleSelect(option.id)}
                type="button"
              >
                <span className="option-label">{option.label}</span>
                {progress.revealed && selected && <span className="option-mark">{option.isCorrect ? '✓' : '修正'}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {progress.revealed && selectedOption && (
        <div className="evidence-reveal">
          <div className="reveal-row">
            <span className="reveal-label">你的判断</span>
            <p>{selectedOption.rationale}</p>
          </div>
          <div className="reveal-row">
            <span className="reveal-label">图表证据</span>
            <p>{config.chartTakeaway}</p>
          </div>
          <div className="reveal-row is-impact">
            <span className="reveal-label">结论反转</span>
            <p>{config.impactText}</p>
          </div>
          <div className="source-note">{config.sourceNote}</div>
        </div>
      )}
    </section>
  );
};

