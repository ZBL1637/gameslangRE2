import React from 'react';
import {
  DATA_FRAGMENTS,
  FRAGMENT_COMBOS,
  GameEnding,
  getUnlockedFragmentCombos,
} from '@/data/chapterProgress';
import './EvidenceBoard.scss';

interface EvidenceBoardProps {
  fragmentIds: string[];
  ending?: GameEnding | null;
  compact?: boolean;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({ fragmentIds, ending, compact = false }) => {
  const owned = new Set(fragmentIds);
  const unlockedCombos = getUnlockedFragmentCombos(fragmentIds);

  return (
    <section className={`evidence-board ${compact ? 'is-compact' : ''}`} aria-label="数据碎片组合推理板">
      <div className="board-header">
        <div>
          <span className="board-kicker">EVIDENCE BOARD</span>
          <h3>数据碎片组合推理板</h3>
        </div>
        <div className="board-count">
          {fragmentIds.length} / {Object.keys(DATA_FRAGMENTS).length} 碎片
        </div>
      </div>

      <div className="fragment-strip">
        {Object.values(DATA_FRAGMENTS).map(fragment => (
          <div key={fragment.id} className={`fragment-token ${owned.has(fragment.id) ? 'owned' : ''}`}>
            <span className="token-dot" />
            <span>{owned.has(fragment.id) ? fragment.title : '未知碎片'}</span>
          </div>
        ))}
      </div>

      <div className="combo-grid">
        {FRAGMENT_COMBOS.map(combo => {
          const unlocked = unlockedCombos.some(item => item.id === combo.id);
          return (
            <article key={combo.id} className={`combo-card ${unlocked ? 'unlocked' : 'locked'}`}>
              <div className="combo-topline">
                <span className="combo-badge">{combo.badge}</span>
                <strong>{combo.title}</strong>
              </div>
              <p className="combo-effect">{combo.effect}</p>
              <div className="combo-requirements">
                {combo.requiredFragmentIds.map(id => (
                  <span key={id} className={owned.has(id) ? 'met' : ''}>
                    {DATA_FRAGMENTS[id]?.title ?? id}
                  </span>
                ))}
              </div>
              {unlocked && <p className="combo-ending-line">{combo.endingLine}</p>}
            </article>
          );
        })}
      </div>

      {ending && (
        <div className={`ending-badge-line rank-${ending.rank.toLowerCase()}`}>
          <span>{ending.rank}</span>
          <strong>{ending.title}</strong>
          <em>{ending.score} 分</em>
        </div>
      )}
    </section>
  );
};

