import React, { useState, useEffect } from 'react';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { DataNode } from '../../types';
import { SCRIPT } from '../../data';
import './CityOverview.scss';

import chapter4Bg from '@/assets/images/chapter4_data_bg.webp';

// 导入节点图标图片
import nodeSpectrum from '@/assets/images/node_spectrum.webp';
import nodeSentiment from '@/assets/images/node_sentiment.webp';
import nodeCategory from '@/assets/images/node_category.webp';
import nodeMultigame from '@/assets/images/node_multigame.webp';

// 节点图标映射
const nodeIconMap: Record<string, string> = {
  'node_1': nodeSpectrum,
  'node_2': nodeSentiment,
  'node_3': nodeCategory,
  'node_4': nodeMultigame,
};

interface CityOverviewProps {
  nodes: DataNode[];
  onNodeSelect: (nodeId: string) => void;
  allCompleted: boolean;
}

export const CityOverview: React.FC<CityOverviewProps> = ({
  nodes,
  onNodeSelect,
  allCompleted
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dataStreams, setDataStreams] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  // 生成数据流动画
  useEffect(() => {
    const streams = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setDataStreams(streams);
  }, []);

  // 获取下一个可用节点
  const getNextAvailableNode = () => {
    return nodes.find(n => !n.completed);
  };

  const nextNode = getNextAvailableNode();

  return (
    <section className="city-overview-section">
      <div className="chapter-bg" style={{ backgroundImage: `url(${chapter4Bg})` }} aria-hidden="true" />
      <div className="chapter-bg-overlay" aria-hidden="true" />
      {/* 背景效果 */}
      <div className="city-background" aria-hidden="true">
        {/* 数据流 */}
        <div className="data-streams">
          {dataStreams.map(stream => (
            <div
              key={stream.id}
              className="data-stream"
              style={{
                left: `${stream.x}%`,
                animationDelay: `${stream.delay}s`
              }}
            />
          ))}
        </div>

        {/* 网格 */}
        <div className="grid-overlay"></div>

        {/* 词云星空 */}
        <div className="word-cloud-sky">
          {['YYDS', '破防', '氪金', '肝帝', '欧皇', '非酋', 'GG', 'MVP'].map((word, i) => (
            <span
              key={word}
              className="floating-word"
              style={{
                left: `${10 + i * 12}%`,
                top: `${5 + (i % 3) * 8}%`,
                animationDelay: `${i * 0.5}s`
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* 任务面板 - 左上角 */}
      <div className="mission-panel">
        <div className="mission-header">
          <span className="mission-icon" aria-hidden="true">📋</span>
          <div className="mission-title">
            <h4>当前任务协议</h4>
            <span className="mission-progress">
              {nodes.filter(n => n.completed).length}/{nodes.length}
            </span>
          </div>
        </div>
        <div className="mission-content">
          {allCompleted ? (
            <p className="completed">所有协议已执行完毕！</p>
          ) : nextNode ? (
            <p>接入「{nextNode.name}」进行数据解密</p>
          ) : (
            <p>探索数据洪流之都</p>
          )}
        </div>
      </div>

      {/* 标题 */}
      <div className="section-header">
        <h2>{SCRIPT.ch4_title}</h2>
        <p>执行四个数据节点的解谜协议</p>
      </div>

      {/* 数据节点网格 */}
      <div className="nodes-container">
        <div className="nodes-grid">
          {nodes.map((node, index) => {
            const isAvailable = index === 0 || nodes[index - 1].completed;
            const isHovered = hoveredNode === node.id;
            const nodeIcon = nodeIconMap[node.id];

            return (
              <button
                type="button"
                key={node.id}
                className={`node-card ${node.completed ? 'completed' : ''} ${isAvailable ? 'available' : 'locked'} ${isHovered ? 'hovered' : ''}`}
                disabled={!isAvailable}
                aria-label={`${node.name}，${node.completed ? '已完成，可再次探索' : isAvailable ? '可进入探索' : '未解锁'}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => isAvailable && onNodeSelect(node.id)}
              >
                {/* 节点光效 */}
                <div className="node-glow" style={{ background: `radial-gradient(circle, ${node.color}40, transparent)` }} aria-hidden="true"></div>

                {/* 节点图标 */}
                <div className="node-icon" style={{ borderColor: node.color }} aria-hidden="true">
                  {node.completed ? (
                    <Check size={32} className="check-icon" />
                  ) : !isAvailable ? (
                    <Lock size={24} className="lock-icon" />
                  ) : nodeIcon ? (
                    <img src={nodeIcon} alt="" className="node-icon-image" />
                  ) : (
                    <span className="icon-emoji">{node.icon}</span>
                  )}
                </div>

                {/* 节点信息 */}
                <div className="node-info">
                  <h3>{node.name}</h3>
                  <p>{node.description}</p>
                </div>

                {/* 状态标签 */}
                <div className="node-status">
                  {node.completed ? (
                    <span className="status completed">已完成</span>
                  ) : isAvailable ? (
                    <span
                      className="enter-btn"
                      style={{ background: `linear-gradient(135deg, ${node.color}, ${node.color}cc)` }}
                    >
                      进入探索
                      <ChevronRight size={16} />
                    </span>
                  ) : (
                    <span className="status locked">未解锁</span>
                  )}
                </div>

                {/* 连接线 */}
                {index < nodes.length - 1 && (
                  <div className={`connector ${nodes[index].completed ? 'active' : ''}`}></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
