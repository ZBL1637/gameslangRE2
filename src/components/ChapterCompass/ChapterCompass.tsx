import React from 'react';
import { getChapterConfig } from '@/data/chapterProgress';
import './ChapterCompass.scss';

interface ChapterCompassProps {
  chapterId: number;
  objective: string;
  progress?: string;
}

export const ChapterCompass: React.FC<ChapterCompassProps> = ({ chapterId, objective, progress }) => {
  const config = getChapterConfig(chapterId);
  if (!config) return null;

  return (
    <aside className="chapter-compass" aria-label="任务罗盘">
      <div className="compass-kicker">任务罗盘</div>
      <h2>{config.coreQuestion}</h2>
      <p className="compass-objective">{objective}</p>
      {progress && <div className="compass-progress">{progress}</div>}
      <div className="compass-evidence">
        <span>证据</span>
        <p>{config.evidencePrompt}</p>
      </div>
      <div className="compass-source">{config.sourceNote}</div>
    </aside>
  );
};

