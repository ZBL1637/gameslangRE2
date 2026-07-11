import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { FloatingTerm } from '../../types';
import rawWordsData from '@/data/words_sort_data.json';
import { useModalDialog } from '@/hooks/useModalDialog';
import {
  buildFramePositions,
  type PercentRect,
  type TermPosition,
} from '../../floatingTermLayout';
import './FloatingTerms.scss';

interface FloatingTermsProps {
  onTermClick: (term: string) => void;
  exploredTerms: string[];
}

interface RawWordData {
  "一级分类": string;
  "二级分类": string | null;
  "三级分类": string | null;
  title: string;
  summary: string;
}

type TermTone = 'cyan' | 'purple' | 'pink' | 'gold';

/**
 * 将词汇映射到 4 色霓虹主题，用于统一标签配色与高亮。
 */
const getTermTone = (term: FloatingTerm): TermTone => {
  const byKeyword: Record<string, TermTone> = {
    Carry: 'gold',
    架枪: 'gold',
    压枪: 'gold',
    氪金: 'cyan',
    欧皇: 'cyan',
    非酋: 'cyan',
    YYDS: 'purple',
    '666': 'purple'
  };

  const direct = byKeyword[term.term];
  if (direct) return direct;

  const games = term.games ?? [];
  const competitive = ['LoL', 'Dota2', 'CS:GO', 'Valorant', 'Overwatch'];
  if (competitive.some((g) => games.includes(g))) return 'gold';

  if (term.source === 'scraped' || term.source === 'mixed') return 'cyan';
  if (term.category.includes('二次元')) return 'pink';
  return 'purple';
};

/**
 * 从 JSON 数据中筛选“适合漂浮展示”的词条池，并随机抽样展示。
 */
const pickFloatingTermsFromJSON = (allTerms: RawWordData[], count: number): FloatingTerm[] => {
  // 转换为通用数组以避免类型问题（如果 JSON 导入被视为 readonly）
  const termsArray = allTerms as unknown as RawWordData[];

  const pool = termsArray.filter((t) => {
    if (!t?.title || !t?.summary) return false;
    // 放宽过滤条件，确保至少能显示一些词汇
    if (t.summary.trim().length < 2) return false; 
    if (t.title.trim().length > 30) return false;
    return true; 
  });

  const source = pool.length ? pool : termsArray;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, count).map((t, index) => ({
    id: `ft-${index}-${t.title}`,
    term: t.title,
    category: t["二级分类"] || t["一级分类"] || '未分类',
    definition: t.summary,
    example: '',
    source: 'encyclopedia',
    games: []
  }));
};

export const FloatingTerms: React.FC<FloatingTermsProps> = ({
  onTermClick,
  exploredTerms
}) => {
  const [positions, setPositions] = useState<TermPosition[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<FloatingTerm | null>(null);
  const [visibleTerms, setVisibleTerms] = useState<FloatingTerm[]>([]);
  const visibleTermsRef = useRef<FloatingTerm[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const measureLayoutBounds = useCallback((): {
    blockedAreas: PercentRect[];
    minimumSpacing: { x: number; y: number };
  } => {
    const container = containerRef.current;
    if (!container) return { blockedAreas: [], minimumSpacing: { x: 12, y: 8 } };

    const root = container.getBoundingClientRect();
    if (root.width <= 0 || root.height <= 0) {
      return { blockedAreas: [], minimumSpacing: { x: 12, y: 8 } };
    }

    const termRects = Array.from(container.querySelectorAll<HTMLElement>('.floating-term'))
      .map(element => element.getBoundingClientRect());
    const maxTermWidth = Math.max(160, ...termRects.map(rect => rect.width));
    const maxTermHeight = Math.max(44, ...termRects.map(rect => rect.height));
    const xPadding = (maxTermWidth / 2 / root.width) * 100 + 2;
    const yPadding = (maxTermHeight / 2 / root.height) * 100 + 2;

    const blockedAreas = Array.from(document.querySelectorAll<HTMLElement>('.town-hud-panels, .ch3-return-panel'))
      .filter(element => element.getClientRects().length > 0)
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          left: Math.max(0, ((rect.left - root.left) / root.width) * 100 - xPadding),
          right: Math.min(100, ((rect.right - root.left) / root.width) * 100 + xPadding),
          top: Math.max(0, ((rect.top - root.top) / root.height) * 100 - yPadding),
          bottom: Math.min(100, ((rect.bottom - root.top) / root.height) * 100 + yPadding),
        };
      });

    return {
      blockedAreas,
      minimumSpacing: {
        x: (maxTermWidth / root.width) * 100 + 2,
        y: (maxTermHeight / root.height) * 100 + 2,
      },
    };
  }, []);

  const createPositions = useCallback((terms: FloatingTerm[]) => {
    const { blockedAreas, minimumSpacing } = measureLayoutBounds();
    return buildFramePositions(terms, blockedAreas, Math.random, minimumSpacing);
  }, [measureLayoutBounds]);

  // 初始化漂浮词汇位置
  useEffect(() => {
    const applyTerms = (terms: FloatingTerm[]) => {
      visibleTermsRef.current = terms;
      setVisibleTerms(terms);
      setPositions(createPositions(terms));
    };

    const handleResize = () => {
      if (!visibleTermsRef.current.length) return;
      setPositions(createPositions(visibleTermsRef.current));
    };
    window.addEventListener('resize', handleResize);

    // 直接使用导入的 JSON 数据
    try {
      const rawData = rawWordsData as RawWordData[];
      const terms = pickFloatingTermsFromJSON(rawData, 15);
      applyTerms(terms);
    } catch (error) {
      console.error('Failed to load floating terms:', error);
      applyTerms([]);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [createPositions]);

  useEffect(() => {
    if (!visibleTermsRef.current.length) return;
    setPositions(createPositions(visibleTermsRef.current));
  }, [exploredTerms.length, visibleTerms.length, createPositions]);

  /**
   * 点击词汇：打开详情弹窗，并触发对应高亮/激活态。
   */
  const handleTermClick = useCallback((term: FloatingTerm) => {
    setSelectedTerm(term);
  }, []);

  /**
   * 关闭详情：把本次查看计入“已探索”，并恢复漂浮层交互。
   */
  const handleCloseDetail = useCallback(() => {
    if (selectedTerm) {
      onTermClick(selectedTerm.term);
    }
    setSelectedTerm(null);
  }, [selectedTerm, onTermClick]);
  const detailDialogRef = useModalDialog<HTMLDivElement>({
    active: Boolean(selectedTerm),
    onClose: handleCloseDetail,
  });

  /**
   * 获取霓虹主题色，用于详情弹窗的分类边框提示。
   */
  const getToneColor = (tone: TermTone): string => {
    switch (tone) {
      case 'cyan': return '#42E5FF';
      case 'pink': return '#FF5FD7';
      case 'gold': return '#FFC44D';
      default: return '#B56CFF';
    }
  };

  return (
    <div ref={containerRef} className={`floating-terms-container ${selectedTerm ? 'has-detail' : ''}`}>
      {/* 漂浮词汇 */}
      {visibleTerms.map((term, _index) => {
        const pos = positions.find(p => p.id === term.id);
        const isExplored = exploredTerms.includes(term.term);
        const tone = getTermTone(term);
        const isActive = selectedTerm?.id === term.id;
        
        if (!pos) return null;

        const style: React.CSSProperties & Record<string, string | number> = {
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          ['--term-delay' as string]: `${pos.delay}s`,
          ['--term-duration' as string]: `${8 + pos.speed * 4}s`,
          ['--term-dir' as string]: pos.direction
        };

        return (
          <button
            type="button"
            key={term.id}
            className={[
              'floating-term',
              `tone-${tone}`,
              isExplored ? 'explored' : 'locked',
              isActive ? 'active' : ''
            ].filter(Boolean).join(' ')}
            style={style}
            onClick={() => handleTermClick(term)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              handleTermClick(term);
            }}
            aria-label={`查看黑话：${term.term}`}
            aria-pressed={isActive}
          >
            <span className="term-icon" aria-hidden="true" />
            <span className="term-text">{term.term}</span>
            {isExplored ? <span className="explored-mark">✓</span> : <span className="term-lock" aria-hidden="true" />}
            <span className="term-arrow" aria-hidden="true" />
          </button>
        );
      })}

      {/* 词汇详情弹窗 */}
      {selectedTerm && (
        <div className="term-detail-overlay" onClick={handleCloseDetail}>
          <div
            className="term-detail-card"
            ref={detailDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="term-detail-title"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
          >
            <button className="close-btn" aria-label="关闭词条详情" onClick={handleCloseDetail}>
              <X size={20} />
            </button>

            <div className="term-header">
              <h3 id="term-detail-title" className="term-name">{selectedTerm.term}</h3>
              <span 
                className="term-category"
                style={{ borderColor: getToneColor(getTermTone(selectedTerm)) }}
              >
                {selectedTerm.category}
              </span>
            </div>

            <div className="term-content">
              <div className="info-row">
                <span className="label">📖 释义</span>
                <p>{selectedTerm.definition}</p>
              </div>

              {selectedTerm.example && (
                <div className="info-row">
                  <span className="label">💬 例句</span>
                  <p className="example">"{selectedTerm.example}"</p>
                </div>
              )}

              {selectedTerm.origin && (
                <div className="info-row">
                  <span className="label">📜 起源</span>
                  <p>{selectedTerm.origin}</p>
                </div>
              )}
            </div>

            <button className="confirm-btn" onClick={handleCloseDetail}>
              我学会了！
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
