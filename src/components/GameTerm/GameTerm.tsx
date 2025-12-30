import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { usePlayer } from '@/context/PlayerContext';
import { getDataProcessor } from '@/utils/dataProcessor';
import type { Term } from '@/types';
import { useNavigate } from 'react-router-dom';
import './GameTerm.scss';

interface GameTermProps {
  termId: string; // 术语 ID (对应 words_all_data 中的 title 或 scraped_data 中的 term)
  children?: React.ReactNode; // 可选：如果显示文本与 ID 不同
}

export const GameTerm: React.FC<GameTermProps> = ({ termId, children }) => {
  const navigate = useNavigate();
  const { state, unlockTerm, markTermViewed } = usePlayer();
  const [termData, setTermData] = useState<Term | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    let disposed = false;
    setIsResolved(false);

    void getDataProcessor()
      .then((dp) => {
        if (disposed) return;
        setTermData(dp.getTerm(termId) || null);
        setIsResolved(true);
      })
      .catch(() => {
        if (disposed) return;
        setTermData(null);
        setIsResolved(true);
      });

    return () => {
      disposed = true;
    };
  }, [termId]);
  
  // 如果找不到术语数据，直接渲染文本
  const displayContent = useMemo(() => children || termData?.term || termId, [children, termData, termId]);

  const handleClick = useCallback(() => {
    if (!state.dictionaryUnlocked) return;
    const idToUse = termData?.id ?? termId;
    unlockTerm(idToUse);
    markTermViewed(idToUse);
    navigate(`/dictionary?term=${encodeURIComponent(idToUse)}`);
  }, [markTermViewed, navigate, state.dictionaryUnlocked, termData?.id, termId, unlockTerm]);

  if (isResolved && !termData) return <span className="game-term-missing">{displayContent}</span>;

  if (!termData) return <span className="game-term-highlight">{displayContent}</span>;

  // 如果新手模式关闭，只渲染高亮文本，不带 Tooltip
  if (!state.newPlayerMode) {
    return (
      <span className="game-term-highlight active" onClick={handleClick} title={!state.dictionaryUnlocked ? '术语图鉴未解锁' : undefined}>
        {displayContent}
      </span>
    );
  }

  // 构造 Tooltip 内容
  const tooltipContent = (
    <div className="term-tooltip-content">
      <div className="term-header">
        <span className="term-title">{termData.term}</span>
        <span className="term-game">{termData.games[0] || 'General'}</span>
      </div>
      <p className="term-def">{termData.definition}</p>
      <div className="term-hint">💡 Click to view in Dictionary</div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="top">
      <span 
        className="game-term active" 
        onClick={handleClick}
        title={!state.dictionaryUnlocked ? '术语图鉴未解锁' : undefined}
      >
        {displayContent}
      </span>
    </Tooltip>
  );
};
