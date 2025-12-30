// BossAssembler - 挑战四：翻译拼装台
import React, { useState, useMemo } from 'react';
import { BossSlot, Chapter5GlobalState } from '../../types';
import './BossAssembler.scss';

interface BossAssemblerProps {
  slots: BossSlot[];
  globalState: Chapter5GlobalState;
  onComplete: () => void;
  onUpdateState: (delta: Partial<Chapter5GlobalState>) => void;
}

export const BossAssembler: React.FC<BossAssemblerProps> = ({
  slots,
  globalState,
  onComplete,
  onUpdateState
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hintUsedSlots, setHintUsedSlots] = useState<number[]>([]);

  // 计算当前属性
  const currentStats = useMemo(() => {
    let totalClarity = 0;
    let totalCulture = 0;
    let count = 0;

    Object.entries(selectedOptions).forEach(([slotId, optionId]) => {
      const slot = slots.find(s => s.id === Number(slotId));
      const option = slot?.options.find(o => o.id === optionId);
      if (option) {
        totalClarity += option.stats.clarity;
        totalCulture += option.stats.culture;
        count++;
      }
    });

    if (count === 0) return { clarity: 0, culture: 0 };
    return {
      clarity: Math.round(totalClarity / count),
      culture: Math.round(totalCulture / count)
    };
  }, [selectedOptions, slots]);

  // 计算策略倾向
  const strategyBias = useMemo(() => {
    let fCount = 0; // Foreignization
    let dCount = 0; // Domestication
    
    Object.entries(selectedOptions).forEach(([slotId, optionId]) => {
      const slot = slots.find(s => s.id === Number(slotId));
      const option = slot?.options.find(o => o.id === optionId);
      if (option?.tags.includes('foreignization')) fCount++;
      if (option?.tags.includes('domestication')) dCount++;
    });

    if (fCount > dCount) return { text: '异化策略 (Foreignization)', desc: '保留了源语的异域风情，但可能牺牲部分理解度。' };
    if (dCount > fCount) return { text: '归化策略 (Domestication)', desc: '完全融入了目标语文化，通俗易懂但可能丢失原味。' };
    return { text: '折中策略 (Balanced)', desc: '在理解与文化之间取得了微妙的平衡。' };
  }, [selectedOptions, slots]);

  // 使用提示券
  const handleUseHint = () => {
    if (activeSlotId === null || globalState.hintTickets <= 0 || hintUsedSlots.includes(activeSlotId)) return;

    // 消耗提示券
    onUpdateState({ 
      hintTickets: globalState.hintTickets - 1,
      ticketsUsed: (globalState.ticketsUsed || 0) + 1
    });
    setHintUsedSlots(prev => [...prev, activeSlotId]);
  };

  // 提交逻辑
  const handleSubmit = () => {
    setShowResult(true);
    const { clarity, culture } = currentStats;
    // 简单的结算：更新全局数值
    onUpdateState({
      clarity,
      culture,
      comms: 20 // 成功奖励
    });
  };

  const isAllSelected = slots.every(s => selectedOptions[s.id]);

  // 获取显示的选项（如果使用了提示券，过滤掉一些低分选项）
  const getDisplayOptions = (slot: BossSlot) => {
    if (!hintUsedSlots.includes(slot.id)) return slot.options;
    
    // 提示券逻辑：只保留双高选项，或者保留 clarity/culture 总和最高的两个
    return [...slot.options].sort((a, b) => 
      (b.stats.clarity + b.stats.culture) - (a.stats.clarity + a.stats.culture)
    ).slice(0, 2);
  };

  return (
    <div className="boss-assembler">
      {/* 左栏：原文碎片 */}
      <div className="source-column">
        <h3>原文碎片 (Source)</h3>
        <div className="source-list">
          {slots.map((slot, index) => (
            <div 
              key={slot.id} 
              className={`source-item ${activeSlotId === slot.id ? 'active' : ''}`}
              onClick={() => setActiveSlotId(slot.id)}
            >
              <span className="index">{index + 1}</span>
              <span className="text">{slot.originalText}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 中栏：拼装工作台 */}
      <div className="assembly-column">
        <div className="stats-preview">
          <div className="stat-item">
            <label>预计清晰度</label>
            <div className="bar-bg"><div className="bar-fill clarity" style={{width: `${currentStats.clarity}%`}}></div></div>
            <span>{currentStats.clarity}</span>
          </div>
          <div className="stat-item">
            <label>预计文化度</label>
            <div className="bar-bg"><div className="bar-fill culture" style={{width: `${currentStats.culture}%`}}></div></div>
            <span>{currentStats.culture}</span>
          </div>
        </div>

        <div className="assembly-area">
          <h3>译文拼装 (Target)</h3>
          <div className="slots-container">
            {slots.map((slot) => {
              const selectedOption = slot.options.find(o => o.id === selectedOptions[slot.id]);
              return (
                <div 
                  key={slot.id}
                  className={`assembly-slot ${activeSlotId === slot.id ? 'active' : ''} ${selectedOption ? 'filled' : ''}`}
                  onClick={() => setActiveSlotId(slot.id)}
                >
                  {selectedOption ? selectedOption.text : "_______"}
                </div>
              );
            })}
          </div>
          
          {/* 选项区域 */}
          {activeSlotId !== null && !showResult && (
            <div className="options-panel animate-fade-in-up">
              <h4>选择译法片段：</h4>
              <div className="options-grid">
                {getDisplayOptions(slots.find(s => s.id === activeSlotId)!).map(option => (
                  <button
                    key={option.id}
                    className={`option-btn ${selectedOptions[activeSlotId!] === option.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedOptions(prev => ({ ...prev, [activeSlotId!]: option.id }));
                      // Auto advance? Maybe not, let user choose.
                    }}
                  >
                    <span className="opt-text">{option.text}</span>
                    <div className="opt-tags">
                      {option.tags.map(t => <span key={t} className={`tag ${t}`}>{t}</span>)}
                    </div>
                  </button>
                ))}
              </div>
              
              {globalState.hintTickets > 0 && !hintUsedSlots.includes(activeSlotId!) && (
                <button className="hint-btn" onClick={handleUseHint}>
                  🎫 使用提示券 (剩余: {globalState.hintTickets}) - 排除干扰项
                </button>
              )}
            </div>
          )}
        </div>

        {!showResult ? (
          <button 
            className="submit-btn" 
            disabled={!isAllSelected}
            onClick={handleSubmit}
          >
            确认拼装方案
          </button>
        ) : (
          <div className="result-panel animate-fade-in">
            <div className="final-text">
              {slots.map(s => slots.find(slot => slot.id === s.id)?.options.find(o => o.id === selectedOptions[s.id])?.text).join('')}
            </div>
            <div className="analysis">
              <h4>分析报告</h4>
              <p><strong>策略倾向：</strong>{strategyBias.text}</p>
              <p>{strategyBias.desc}</p>
            </div>
            <button className="complete-btn" onClick={onComplete}>前往结算 →</button>
          </div>
        )}
      </div>

      {/* 右栏：资源栏 */}
      <div className="resource-column">
        <div className="resource-section">
          <h4>已获符文 (Runes)</h4>
          <div className="runes-list">
            {globalState.runes.length > 0 ? (
              globalState.runes.map((rune, i) => (
                <div key={i} className="rune-item" title={rune}>
                  <span className="icon">💠</span>
                  <span className="name">{rune}</span>
                </div>
              ))
            ) : (
              <div className="empty-tip">暂无符文</div>
            )}
          </div>
        </div>

        <div className="resource-section">
          <h4>短语手册 (Phrasebook)</h4>
          <div className="phrase-list">
            {globalState.phrasebook.length > 0 ? (
              globalState.phrasebook.map(phrase => (
                <div key={phrase.id} className="phrase-item">
                  <span className="term">{phrase.term}</span>
                  <span className="def">{phrase.definition}</span>
                </div>
              ))
            ) : (
              <div className="empty-tip">暂无收集</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
