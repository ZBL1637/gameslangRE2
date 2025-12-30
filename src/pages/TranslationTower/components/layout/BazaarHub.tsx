// BazaarHub - 塔下集市 (F0)
import React, { useState } from 'react';
import { Chapter5GlobalState, FloorType, MistranslationCard } from '../../types';
import { BAZAAR_MISTRANSLATIONS, BAZAAR_CHAT_MESSAGES } from '../../data';
import './BazaarHub.scss';

interface BazaarHubProps {
  state: Chapter5GlobalState;
  onNavigate: (floor: FloorType) => void;
  onUpdateState: (delta: Partial<Chapter5GlobalState>) => void;
  onAddTicket: () => void;
  onAddPhrase: (term: string, def: string) => void;
}

export const BazaarHub: React.FC<BazaarHubProps> = ({
  state,
  onNavigate,
  onUpdateState,
  onAddTicket,
  onAddPhrase
}) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [solvedCards, setSolvedCards] = useState<string[]>([]);
  const [aliReaction, setAliReaction] = useState<string>('default'); // default, happy, confused

  const handleCardClick = (id: string) => {
    if (solvedCards.includes(id)) return;
    setActiveCardId(activeCardId === id ? null : id);
  };

  const handleOptionSelect = (card: MistranslationCard, optionIndex: number) => {
    const option = card.options[optionIndex];
    
    // Apply rewards/penalties
    const newState: Partial<Chapter5GlobalState> = {};
    if (option.reward) {
      if (option.reward.comms) newState.comms = Math.min(100, Math.max(0, state.comms + option.reward.comms));
      if (option.reward.clarity) newState.clarity = Math.min(100, Math.max(0, state.clarity + option.reward.clarity));
      if (option.reward.culture) newState.culture = Math.min(100, Math.max(0, state.culture + option.reward.culture));
      if (option.reward.ticket) onAddTicket();
    }
    
    onUpdateState(newState);

    // Update UI state
    if (option.isCorrect) {
      setSolvedCards([...solvedCards, card.id]);
      setAliReaction('happy');
      setTimeout(() => setAliReaction('default'), 2000);
      setActiveCardId(null);
    } else {
      setAliReaction('confused');
      setTimeout(() => setAliReaction('default'), 2000);
    }
  };

  const getFloorStatus = (floor: FloorType) => {
    if (state.floorProgress[floor]) return '已通关';
    if (floor === FloorType.F0_BAZAAR) return '进行中';
    
    // Check if unlocked (previous floor completed)
    const floors = [FloorType.F0_BAZAAR, FloorType.F1_KEYWORD, FloorType.F2_STYLE, FloorType.F3_METAPHOR, FloorType.F4_BOSS];
    const index = floors.indexOf(floor);
    if (index > 0 && state.floorProgress[floors[index - 1]]) return '可进入';
    
    return '未解锁';
  };

  const renderChatContent = (content: string, terms: {term: string, definition: string}[]) => {
    const parts = content.split(/(\{.*?\})/);
    return parts.map((part, i) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const termKey = part.slice(1, -1);
        const termData = terms.find(t => t.term === termKey);
        if (termData) {
          return (
            <span 
              key={i} 
              className="slang-highlight" 
              onClick={() => onAddPhrase(termData.term, termData.definition)}
              title="点击收录到词典"
            >
              {termKey}
            </span>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  const menuItems = [
    { id: FloorType.F0_BAZAAR, title: '集市总览', subtitle: '误译委托中心', icon: '⛺' },
    { id: FloorType.F1_KEYWORD, title: 'F1 关键词锻炉', subtitle: '词义精准试炼', icon: '🔥' },
    { id: FloorType.F2_STYLE, title: 'F2 语气熔炉', subtitle: '风格转换试炼', icon: '⚖️' },
    { id: FloorType.F3_METAPHOR, title: 'F3 隐喻回廊', subtitle: '文化深层试炼', icon: '🌀' },
    { id: FloorType.F4_BOSS, title: 'F4 翻译圣坛', subtitle: '最终组装试炼', icon: '👑' }
  ];

  return (
    <section className="bazaar-hub-section">
      {/* 左侧导航栏 */}
      <div className="nav-column">
        <div className="nav-header">
          <h2>通天塔导航</h2>
          <span className="header-icon">🧭</span>
        </div>
        <div className="nav-menu">
          {menuItems.map((item) => {
            const status = getFloorStatus(item.id);
            const isLocked = status === '未解锁';
            return (
              <div 
                key={item.id}
                className={`menu-item ${state.currentFloor === item.id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && onNavigate(item.id)}
              >
                <div className="item-icon-box">{item.icon}</div>
                <div className="item-text">
                  <span className="item-title">{item.title}</span>
                  <span className="item-status">{status}</span>
                </div>
                {state.currentFloor === item.id && <div className="active-indicator">▶</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 中央主面板 */}
      <div className="main-column">
        <div className="panel-header">
          <h3>误译委托板</h3>
          <span className="subtitle">帮助阿里理解这些游戏黑话</span>
        </div>
        
        <div className="requests-list">
          {BAZAAR_MISTRANSLATIONS.map(card => {
            const isSolved = solvedCards.includes(card.id);
            const isActive = activeCardId === card.id;

            return (
              <div key={card.id} className={`request-card ${isSolved ? 'solved' : ''} ${isActive ? 'active' : ''}`}>
                <div className="card-header" onClick={() => handleCardClick(card.id)}>
                  <span className="status-icon">{isSolved ? '✅' : '❓'}</span>
                  <span className="card-title">{card.title}</span>
                  {!isSolved && <span className="expand-hint">{isActive ? '收起' : '查看详情'}</span>}
                </div>
                
                {isActive && !isSolved && (
                  <div className="card-body animate-slide-down">
                    <p className="request-text">"{card.request}"</p>
                    <div className="options-list">
                      {card.options.map((opt, idx) => (
                        <div key={opt.id} className="option-item" onClick={() => handleOptionSelect(card, idx)}>
                          <span className="option-text">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isSolved && (
                   <div className="card-solved-msg">
                     委托已完成
                   </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="panel-header" style={{marginTop: '2rem'}}>
          <h3>玩家频道</h3>
          <span className="subtitle">点击高亮黑话收集词条</span>
        </div>
        <div className="chat-container">
          {BAZAAR_CHAT_MESSAGES.map(msg => (
            <div key={msg.id} className="chat-message">
              <div className="chat-user">{msg.user}:</div>
              <div className="chat-content">
                {renderChatContent(msg.content, msg.slangTerms)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧面板 */}
      <div className="side-column">
        {/* 阿里状态 */}
        <div className="ali-status-card">
          <div className="avatar-box">
             <span className="avatar-emoji">
               {aliReaction === 'happy' ? '🤩' : aliReaction === 'confused' ? '😵‍💫' : '👳'}
             </span>
          </div>
          <div className="ali-dialog">
             {aliReaction === 'happy' ? "原来是这个意思！太棒了！" : 
              aliReaction === 'confused' ? "这...这不对吧？" : 
              "这些人在说什么？帮帮我..."}
          </div>
        </div>

        {/* 词典预览 */}
        <div className="phrasebook-preview">
           <h4>已收录词条 ({state.phrasebook.length})</h4>
           <div className="phrase-list">
             {state.phrasebook.length === 0 ? (
               <div className="empty-hint">暂无词条</div>
             ) : (
               state.phrasebook.map(p => (
                 <div key={p.id} className="phrase-tag">{p.term}</div>
               ))
             )}
           </div>
        </div>
      </div>
    </section>
  );
};
