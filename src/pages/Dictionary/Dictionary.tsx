import React, { useState, useMemo, useEffect, useRef, useDeferredValue } from 'react';
import { Panel } from '@/components/Panel/Panel';
import { Button } from '@/components/Button/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDataProcessor } from '@/utils/dataProcessor';
import { Term } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import './Dictionary.scss';

type DataProcessorLike = {
  getAllTerms: () => Term[];
  getCategoryIndex: () => Record<string, unknown>;
  getGameIndex: () => Record<string, unknown>;
  getTerm: (id: string) => Term | undefined;
};

const SOURCE_MAP: Record<string, string> = {
  'encyclopedia': '萌娘百科',
  'scraped': '社区抓取',
  'mixed': '混合来源',
  'unknown': '未知'
};

const MAX_VISIBLE_TERMS = 160;

const Dictionary: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeQuest, unlockTerm, markTermViewed, state } = usePlayer();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [games, setGames] = useState<string[]>(['all']);
  const [isLoading, setIsLoading] = useState(true);
  const dpRef = useRef<DataProcessorLike | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    if (!state.dictionaryUnlocked) {
      setIsLoading(false);
      return;
    }
    let disposed = false;
    setIsLoading(true);

    void getDataProcessor()
      .then(dp => {
        if (disposed) return;
        dpRef.current = dp as unknown as DataProcessorLike;
        const allTerms = dp.getAllTerms();
        setTerms(allTerms);
        setCategories(['all', ...Object.keys(dp.getCategoryIndex())]);
        setGames(['all', ...Object.keys(dp.getGameIndex())].sort());
      })
      .finally(() => {
        if (disposed) return;
        setIsLoading(false);
      });

    return () => {
      disposed = true;
    };
  }, [state.dictionaryUnlocked]);

  useEffect(() => {
    if (!state.dictionaryUnlocked) return;
    completeQuest('side_visit_dict');
  }, [completeQuest, state.dictionaryUnlocked]);

  // Handle query params for direct term linking
  useEffect(() => {
    if (!state.dictionaryUnlocked) return;
    const params = new URLSearchParams(location.search);
    const termParam = params.get('term');
    if (termParam && terms.length > 0) {
      const found =
        dpRef.current?.getTerm?.(termParam) ??
        terms.find(
          (t) =>
            t.id === termParam ||
            t.term === termParam ||
            String(t.id).toLowerCase() === termParam.toLowerCase() ||
            String(t.term).toLowerCase() === termParam.toLowerCase()
        ) ??
        null;
      if (!found) return;
      setSelectedTerm(found);
      setSearchTerm(found.term);
    }
  }, [location.search, state.dictionaryUnlocked, terms]);

  useEffect(() => {
    if (!state.dictionaryUnlocked) return;
    if (!selectedTerm) return;
    unlockTerm(selectedTerm.id);
    markTermViewed(selectedTerm.id);
  }, [markTermViewed, selectedTerm, state.dictionaryUnlocked, unlockTerm]);

  const sources = ['all', 'encyclopedia', 'scraped', 'mixed'];

  const filteredTerms = useMemo(() => {
    if (!state.dictionaryUnlocked) return [];
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
    return terms.filter(t => {
      if (!t) return false;
      const termName = String(t.term || '');
      const tags = t.tags || [];
      const matchSearch =
        normalizedSearch.length === 0 ||
        termName.toLowerCase().includes(normalizedSearch) ||
        tags.some(tag => String(tag || '').toLowerCase().includes(normalizedSearch));
      
      const categoryL1 = t.category?.l1 || 'Uncategorized';
      const matchCategory = selectedCategory === 'all' || categoryL1 === selectedCategory;
      
      const gameList = t.games || [];
      const matchGame = selectedGame === 'all' || gameList.includes(selectedGame) || (selectedGame === 'General' && gameList.length === 0);
      
      const source = t.source || 'unknown';
      const matchSource = selectedSource === 'all' || source === selectedSource;
      
      return matchSearch && matchCategory && matchGame && matchSource;
    });
  }, [state.dictionaryUnlocked, terms, deferredSearchTerm, selectedCategory, selectedGame, selectedSource]);

  const visibleTerms = useMemo(() => filteredTerms.slice(0, MAX_VISIBLE_TERMS), [filteredTerms]);
  const hiddenResultCount = Math.max(0, filteredTerms.length - visibleTerms.length);

  return (
    <div className="dictionary-container">
      <div className="dict-header">
        <h2 className="pixel-title">术语图鉴 <span className="count">({filteredTerms.length})</span></h2>
        <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>返回</Button>
      </div>

      {!state.dictionaryUnlocked && (
        <Panel className="dict-details">
          <div className="details-placeholder">
            <div className="book-icon">🔒</div>
            <p>你还未获得“术语图鉴”。通关第一章“黑话起源之森”后将作为结算奖励发放。</p>
            <Button size="sm" onClick={() => navigate('/world-map')}>前往世界地图</Button>
          </div>
        </Panel>
      )}

      {state.dictionaryUnlocked && (
      <div className="dict-content">
        {/* 左侧：搜索与列表 */}
        <Panel className="dict-sidebar">
          <div className="search-section">
            <input 
              type="text" 
              placeholder="搜索术语..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              disabled={isLoading}
            />
            
            <div className="filters-row">
              <select 
                value={selectedGame} 
                onChange={(e) => setSelectedGame(e.target.value)}
                className="filter-select"
                disabled={isLoading}
              >
                <option value="all">所有游戏</option>
                {games.filter(g => g !== 'all').map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              <select 
                value={selectedSource} 
                onChange={(e) => setSelectedSource(e.target.value)}
                className="filter-select"
                disabled={isLoading}
              >
                <option value="all">所有来源</option>
                {sources.filter(s => s !== 'all').map(s => (
                  <option key={s} value={s}>{SOURCE_MAP[s] || s}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter-tags">
             {categories.map(cat => (
               <span 
                 key={cat} 
                 className={`filter-tag ${selectedCategory === cat ? 'active' : ''}`}
                 onClick={() => setSelectedCategory(cat)}
               >
                 {cat === 'all' ? '全部' : cat}
               </span>
             ))}
          </div>

          <div className="term-list">
            {isLoading && (
              <div className="empty-state">加载中...</div>
            )}
            {visibleTerms.map(term => {
              const isViewed = (state.viewedTerms || []).includes(term.id);
              const isUnlocked = (state.unlockedTerms || []).includes(term.id);
              return (
                <div 
                  key={term.id} 
                  className={`term-item ${selectedTerm?.id === term.id ? 'active' : ''} ${isViewed ? 'viewed' : ''}`}
                  onClick={() => setSelectedTerm(term)}
                >
                  <div className="term-main">
                    <span className="term-name">{term.term}</span>
                    <span className="term-badges">
                      {isViewed && <span className="mini-badge viewed">已读</span>}
                      {!isViewed && isUnlocked && <span className="mini-badge unlocked">已解锁</span>}
                      {(term.games || []).slice(0, 2).map(g => <span key={g} className="mini-badge">{g}</span>)}
                    </span>
                  </div>
                  <span className="term-cat">{term.category?.l2 || 'General'}</span>
                </div>
              );
            })}
            {!isLoading && hiddenResultCount > 0 && (
              <div className="result-limit">
                已显示前 {MAX_VISIBLE_TERMS} 条，继续输入关键词可缩小范围。
              </div>
            )}
            {!isLoading && filteredTerms.length === 0 && (
              <div className="empty-state">未找到相关术语</div>
            )}
          </div>
        </Panel>

        {/* 右侧：详情展示 */}
        <Panel className="dict-details">
          {selectedTerm ? (
            <div className="term-detail-view">
              <div className="detail-header">
                <h1 className="term-title">{selectedTerm.term}</h1>
                <div className="term-meta">
                  <span className="badge game">{(selectedTerm.games || []).join(', ') || 'General'}</span>
                  <span className="badge category">{selectedTerm.category?.l1 || '?'} &gt; {selectedTerm.category?.l2 || '?'}</span>
                  <span className="badge source">{SOURCE_MAP[selectedTerm.source] || selectedTerm.source}</span>
                </div>
              </div>
              
              <div className="detail-body">
                <h3>定义</h3>
                <p className="definition-text">{selectedTerm.definition}</p>
                
                {selectedTerm.tags && selectedTerm.tags.length > 0 && (
                  <div className="tags-section">
                    <h3>标签</h3>
                    <div className="tags-list">
                      {selectedTerm.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="details-placeholder">
              <div className="book-icon">📖</div>
              <p>从左侧选择术语以查看详情</p>
            </div>
          )}
        </Panel>
      </div>
      )}
    </div>
  );
};

export default Dictionary;
