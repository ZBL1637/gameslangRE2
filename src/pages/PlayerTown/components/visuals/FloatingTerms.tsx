import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { FloatingTerm } from '../../types';
import rawWordsData from '@/data/words_sort_data.json';
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

interface TermPosition {
  id: string;
  x: number;
  y: number;
  speed: number;
  delay: number;
  direction: number;
}

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

/**
 * 在章节画框内部生成点位，避免压住顶部任务面板区域。
 */
const buildFramePositions = (terms: FloatingTerm[]): TermPosition[] => {
  const safe = { left: 8, right: 92, top: 18, bottom: 88 };
  const blocked = [
    { left: 0, right: 58, top: 0, bottom: 30 },
    { left: 42, right: 100, top: 0, bottom: 26 }
  ];

  const rand01 = () => (Math.random() + Math.random()) / 2;

  const pick = () => {
    let attempts = 0;
    let x = safe.left + rand01() * (safe.right - safe.left);
    let y = safe.top + rand01() * (safe.bottom - safe.top);

    const isBlocked = () =>
      blocked.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);

    while (isBlocked() && attempts < 100) {
      x = safe.left + rand01() * (safe.right - safe.left);
      y = safe.top + rand01() * (safe.bottom - safe.top);
      attempts++;
    }

    return { x, y };
  };

  return terms.map((term, index) => {
    const { x, y } = pick();
    return {
      id: term.id,
      x,
      y,
      speed: 0.5 + Math.random() * 1.5,
      delay: index * 0.12,
      direction: Math.random() > 0.5 ? 1 : -1
    };
  });
};

export const FloatingTerms: React.FC<FloatingTermsProps> = ({
  onTermClick,
  exploredTerms
}) => {
  const [positions, setPositions] = useState<TermPosition[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<FloatingTerm | null>(null);
  const [visibleTerms, setVisibleTerms] = useState<FloatingTerm[]>([]);
  const visibleTermsRef = useRef<FloatingTerm[]>([]);

  // 初始化漂浮词汇位置
  useEffect(() => {
    const applyTerms = (terms: FloatingTerm[]) => {
      visibleTermsRef.current = terms;
      setVisibleTerms(terms);
      setPositions(buildFramePositions(terms));
    };

    const handleResize = () => {
      if (!visibleTermsRef.current.length) return;
      setPositions(buildFramePositions(visibleTermsRef.current));
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
  }, []);

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
    <div className={`floating-terms-container ${selectedTerm ? 'has-detail' : ''}`}>
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
          <div
            key={term.id}
            className={[
              'floating-term',
              `tone-${tone}`,
              isExplored ? 'explored' : 'locked',
              isActive ? 'active' : ''
            ].filter(Boolean).join(' ')}
            style={style}
            onClick={() => handleTermClick(term)}
          >
            <span className="term-icon" aria-hidden="true" />
            <span className="term-text">{term.term}</span>
            {isExplored ? <span className="explored-mark">✓</span> : <span className="term-lock" aria-hidden="true" />}
            <span className="term-arrow" aria-hidden="true" />
          </div>
        );
      })}

      {/* 词汇详情弹窗 */}
      {selectedTerm && (
        <div className="term-detail-overlay" onClick={handleCloseDetail}>
          <div className="term-detail-card" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCloseDetail}>
              <X size={20} />
            </button>

            <div className="term-header">
              <h3 className="term-name">{selectedTerm.term}</h3>
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
