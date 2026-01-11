// TowerOverview - 通天塔概览
import React, { useState, useEffect } from 'react';
import './TowerOverview.scss';

interface TowerOverviewProps {
  narrationText: string;
  onEnterChallenges: () => void;
}

export const TowerOverview: React.FC<TowerOverviewProps> = ({
  // narrationText,
  onEnterChallenges
}) => {
  const [activeMenu, setActiveMenu] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    { id: 0, title: '文化融合', subtitle: '看看词怎么跨圈流动', icon: '🔗' },
    { id: 1, title: '风格转换', subtitle: '让语言适应不同场景', icon: '🔄' },
    { id: 2, title: '关键词翻译', subtitle: '精准传达核心语义', icon: '🔤' }
  ];

  return (
    <section className="tower-overview-section">
      {/* 左侧导航栏 */}
      <div className="nav-column">
        <div className="nav-header">
          <h2>功能菜单</h2>
          <span className="header-icon">⚙️</span>
        </div>
        <div className="nav-menu">
          {menuItems.map((item, index) => (
            <div 
              key={item.id}
              className={`menu-item ${activeMenu === index ? 'active' : ''}`}
              onMouseEnter={() => setActiveMenu(index)}
            >
              <div className="item-icon-box">{item.icon}</div>
              <div className="item-text">
                <span className="item-title">{item.title}</span>
                <span className="item-subtitle">{item.subtitle}</span>
              </div>
              {activeMenu === index && <div className="active-indicator">▶</div>}
            </div>
          ))}
        </div>
        
        <div className="nav-footer">
          <span>系统状态: 正常</span>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div className={`main-column ${showContent ? 'fade-in' : ''}`}>
        
        {/* Top: HUD信息条 */}
        <div className="hud-bar">
          <div className="location-info">
            <h1>译语通天塔 · 塔下集市</h1>
          </div>
          <div className="location-desc">
            <p>塔身内外流动着由不同语言文字组成的数据流。塔的底部是一个国际化的贸易集市。</p>
          </div>
          <button className="settings-btn">
            <span>查看设定</span>
            <span className="icon">ℹ️</span>
          </button>
        </div>

        {/* Middle: 主互动面板 */}
        <div className="interaction-panel">
          <div className="panel-header">
            <h3>塔下集市 · 误译高发区</h3>
          </div>
          <div className="panel-body">
            {/* 左列：误译问句 */}
            <div className="npc-column">
              <div className="npc-item">
                <div className="tag warning">误译</div>
                <span className="avatar">🧔</span>
                <div className="dialogue">
                  <span className="text">"神装"？是卖衣服的吗？</span>
                  <span className="sub-text">点击查看解释</span>
                </div>
              </div>
              <div className="npc-item">
                <div className="tag warning">误译</div>
                <span className="avatar">👳</span>
                <div className="dialogue">
                  <span className="text">"开黑"？要去黑暗的地方？</span>
                  <span className="sub-text">点击查看解释</span>
                </div>
              </div>
            </div>

            {/* 右列：玩家频道 */}
            <div className="player-column">
              <div className="player-card">
                <div className="card-header">
                  <span className="icon">🎮</span>
                  <span>玩家频道</span>
                </div>
                <div className="chat-bubble">
                  <p>有没有人来开黑？带你上分！</p>
                </div>
                <button className="chat-btn">
                  <span>我也发一句</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: 操作区 */}
        <div className="action-area">
          <button className="secondary-btn">
            <span>先逛集市</span>
          </button>
          <button className="primary-btn" onClick={onEnterChallenges}>
            <span className="icon">🏛️</span>
            <span>进入翻译圣坛</span>
          </button>
        </div>

      </div>
    </section>
  );
};
