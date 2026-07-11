import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import './TownMap.scss';

// 导入NPC图片
import npcDnaScientist from '@/assets/images/npc_dna_scientist.webp';
import npcAiLibrarian from '@/assets/images/npc_ai_librarian.webp';
import chapter3Bg from '@/assets/images/chapter3_intro_bg.webp';

interface TownMapProps {
  dnaCompleted: boolean;
  queriedCount: number;
  onEnterDNATest: () => void;
  onEnterArchive: () => void;
  children?: React.ReactNode;
}

export const TownMap: React.FC<TownMapProps> = ({
  dnaCompleted,
  queriedCount,
  onEnterDNATest,
  onEnterArchive,
  children
}) => {
  // 档案馆在完成DNA测试后解锁
  const archiveUnlocked = dnaCompleted;
  
  // NPC对话状态
  const [hoveredNpc, setHoveredNpc] = useState<'dna' | 'ai' | null>(null);

  return (
    <div className="town-map-section">
      {/* 城镇地图 - 像素艺术风格 */}
      <div className="town-container pixel-style">
        {/* 像素艺术背景 */}
        <div className="pixel-bg" aria-hidden="true">
          <img src={chapter3Bg} alt="" className="bg-image" />
          <div className="pixel-overlay"></div>
        </div>

        {children}

        {/* NPC区域 */}
        <div className="npc-zone">
          {/* DNA测试NPC - 炼金术士 */}
          <button
            type="button"
            className={`npc-wrapper dna-npc ${dnaCompleted ? 'completed' : 'active'}`}
            aria-label={dnaCompleted ? '艾琳娜 · 基因学者，DNA测试已完成' : '艾琳娜 · 基因学者，开始DNA测试'}
            onClick={onEnterDNATest}
            onMouseEnter={() => setHoveredNpc('dna')}
            onMouseLeave={() => setHoveredNpc(null)}
          >
            <div className="npc-glow" aria-hidden="true"></div>
            <div className="npc-sprite">
              <img src={npcDnaScientist} alt="" aria-hidden="true" />
            </div>
            <div className="npc-marker" aria-hidden="true">
              {dnaCompleted ? '✓' : '!'}
            </div>
            
            {/* NPC对话气泡 */}
            <div className={`npc-bubble ${hoveredNpc === 'dna' ? 'show' : ''}`} aria-hidden="true">
              <div className="bubble-content">
                <h4>艾琳娜 · 基因学者</h4>
                <p>{dnaCompleted 
                  ? '你的DNA测试已完成！去档案馆探索更多吧~' 
                  : '来测试一下你的游戏DNA吧！我能分析出你的玩家类型~'
                }</p>
                {!dnaCompleted && <span className="interact-btn">开始测试</span>}
              </div>
              <div className="bubble-arrow"></div>
            </div>
          </button>

          {/* AI查询NPC - 智者图书管理员 */}
          <button
            type="button"
            className={`npc-wrapper ai-npc ${archiveUnlocked ? 'active' : 'locked'}`}
            aria-disabled={!archiveUnlocked}
            aria-label={archiveUnlocked ? '梅林 · 真言守护者，进入档案馆' : '梅林 · 真言守护者，档案馆未解锁'}
            onClick={() => {
              if (archiveUnlocked) {
                onEnterArchive();
              } else {
                // 如果未解锁，强制显示气泡提示（移动端兼容）
                setHoveredNpc('ai');
                // 3秒后自动隐藏
                setTimeout(() => setHoveredNpc(null), 3000);
              }
            }}
            onMouseEnter={() => setHoveredNpc('ai')}
            onMouseLeave={() => setHoveredNpc(null)}
          >
            <div className="npc-glow" aria-hidden="true"></div>
            <div className="npc-sprite">
              <img src={npcAiLibrarian} alt="" aria-hidden="true" />
              {!archiveUnlocked && (
                <div className="lock-overlay">
                  <Lock size={32} />
                </div>
              )}
            </div>
            <div className="npc-marker" aria-hidden="true">
              {archiveUnlocked ? '?' : '🔒'}
            </div>
            
            {/* NPC对话气泡 */}
            <div className={`npc-bubble ${hoveredNpc === 'ai' ? 'show' : ''}`} aria-hidden="true">
              <div className="bubble-content">
                <h4>梅林 · 真言守护者</h4>
                <p>{archiveUnlocked 
                  ? '欢迎来到真言档案馆！我可以解答任何游戏黑话的奥秘。' 
                  : '完成DNA测试后，我才能为你开启档案馆的大门...'
                }</p>
                {archiveUnlocked && <span className="interact-btn">进入档案馆</span>}
              </div>
              <div className="bubble-arrow"></div>
            </div>
          </button>
        </div>

        {/* 装饰性NPC群众 */}
        <div className="crowd-npcs" aria-hidden="true">
          <div className="crowd-npc" style={{ left: '10%', bottom: '15%' }}>
            <span className="chat-bubble">GG!</span>
          </div>
          <div className="crowd-npc" style={{ left: '85%', bottom: '20%' }}>
            <span className="chat-bubble">YYDS</span>
          </div>
          <div className="crowd-npc" style={{ left: '50%', bottom: '8%' }}>
            <span className="chat-bubble">666</span>
          </div>
        </div>

        {/* 场景指示牌 */}
        <div className="scene-signs">
          <div className="sign sign-left">
            <span>认证中心 →</span>
          </div>
          <div className="sign sign-right">
            <span>← 档案馆</span>
          </div>
        </div>

        <div className="exploration-hint in-frame in-frame-right">
          <p>💡 点击NPC与他们对话，完成DNA测试后可解锁AI档案馆查询功能</p>
          <div className="hint-progress">
            <span>已了解黑话: {queriedCount} / 10</span>
            {queriedCount >= 10 && <span className="complete-hint">✓ 目标达成！</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
