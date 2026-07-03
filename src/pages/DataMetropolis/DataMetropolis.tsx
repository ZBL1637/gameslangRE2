import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { ChapterRewardOverlay } from '@/components/ChapterRewardOverlay/ChapterRewardOverlay';
import { Button } from '@/components/Button/Button';
import type { ChapterReward } from '@/data/chapterProgress';
import { GamePhase, DataNode } from './types';
import { DATA_NODES } from './data';
import { IntroSection } from './components/layout/IntroSection';
import { CityOverview } from './components/layout/CityOverview';
import { DataNodeExplorer } from './components/layout/DataNodeExplorer';
import { SkillUnlock } from './components/layout/SkillUnlock';
import { OutroSection } from './components/layout/OutroSection';
import './DataMetropolis.scss';

export const DataMetropolis: React.FC = () => {
  const navigate = useNavigate();
  const { state, completeChapterRun, restartChapter, updateChapterProgress } = usePlayer();
  const isChapterCompleted = state.completedChapters.includes(4);
  const savedProgress = state.chapterProgress?.chapter_4 || {};
  
  // 游戏状态
  const [phase, setPhase] = useState<GamePhase>(isChapterCompleted && savedProgress.phase === 'outro' ? 'city_overview' : (savedProgress.phase || 'intro'));
  const [nodes, setNodes] = useState<DataNode[]>(() => {
    const completedNodeIds = new Set<string>(savedProgress.completedNodeIds || []);
    return DATA_NODES.map(node => ({ ...node, completed: completedNodeIds.has(node.id) }));
  });
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(savedProgress.currentNodeId || null);
  const [skillUnlocked, setSkillUnlocked] = useState(Boolean(savedProgress.skillUnlocked));
  const [reward, setReward] = useState<ChapterReward | null>(null);
  
  // 检查是否所有节点都已完成
  const allNodesCompleted = nodes.every(node => node.completed);
  const completedNodeIds = useMemo(() => nodes.filter(node => node.completed).map(node => node.id), [nodes]);

  useEffect(() => {
    updateChapterProgress('chapter_4', {
      phase,
      currentNodeId,
      skillUnlocked,
      completedNodeIds
    });
  }, [completedNodeIds, currentNodeId, phase, skillUnlocked, updateChapterProgress]);
  
  // 当所有节点完成时，显示技能解锁
  useEffect(() => {
    if (allNodesCompleted && phase === 'city_overview' && !skillUnlocked) {
      setTimeout(() => {
        setPhase('skill_unlock');
      }, 1000);
    }
  }, [allNodesCompleted, phase, skillUnlocked]);
  
  // 完成入场
  const handleIntroComplete = useCallback(() => {
    setPhase('city_overview');
  }, []);
  
  // 选择数据节点
  const handleNodeSelect = useCallback((nodeId: string) => {
    setCurrentNodeId(nodeId);
    const nodePhase = nodeId as GamePhase;
    setPhase(nodePhase);
  }, []);
  
  // 完成数据节点
  const handleNodeComplete = useCallback((nodeId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, completed: true } : node
    ));
    setCurrentNodeId(null);
    setPhase('city_overview');
  }, []);
  
  // 关闭数据节点
  const handleNodeClose = useCallback(() => {
    setCurrentNodeId(null);
    setPhase('city_overview');
  }, []);
  
  // 技能解锁完成
  const handleSkillUnlock = useCallback(() => {
    setSkillUnlocked(true);
    setPhase('outro');
  }, []);
  
  // 章节完成
  const handleChapterComplete = useCallback(() => {
    const newsProgress = state.chapterProgress?.news_4 as { revealed?: boolean; correct?: boolean } | undefined;
    const newsScore = (newsProgress?.revealed ? 2 : 0) + (newsProgress?.correct ? 2 : 0);
    const chapterReward = completeChapterRun(4, {
      score: 16 + completedNodeIds.length * 3 + newsScore,
      fragmentIds: ['fragment_sentiment'],
    });
    setReward(chapterReward);
  }, [completeChapterRun, completedNodeIds.length, state.chapterProgress]);

  const handleRestartChapter = useCallback(() => {
    restartChapter(4);
    setPhase('intro');
    setNodes(DATA_NODES.map(node => ({ ...node, completed: false })));
    setCurrentNodeId(null);
    setSkillUnlocked(false);
    setReward(null);
  }, [restartChapter]);
  
  // 获取当前节点
  const currentNode = currentNodeId 
    ? nodes.find(n => n.id === currentNodeId) 
    : null;
  
  return (
    <div className="data-metropolis-page">
      <main className="main-content">
        {/* 入场动画 */}
        {phase === 'intro' && (
          <IntroSection onComplete={handleIntroComplete} />
        )}
        
        {/* 城市概览 */}
        {(phase === 'city_overview' || currentNode || phase === 'skill_unlock' || phase === 'outro') && (
          <CityOverview 
            nodes={nodes}
            onNodeSelect={handleNodeSelect}
            allCompleted={allNodesCompleted}
          />
        )}

        {isChapterCompleted && allNodesCompleted && phase === 'city_overview' && (
          <div className="ch4-return-panel">
            <div>
              <div className="title">数据洪流之都已通关</div>
              <div className="desc">本章结算已经完成，你可以返回世界地图，或重新游玩本章流程。</div>
            </div>
            <div className="actions">
              <Button size="sm" onClick={() => navigate('/world-map', { state: { fromChapter: 4 } })}>
                返回世界地图
              </Button>
              <Button size="sm" variant="secondary" onClick={handleRestartChapter}>
                重新游玩本章
              </Button>
            </div>
          </div>
        )}
        
        {/* 数据节点探索 */}
        {currentNode && (
          <DataNodeExplorer
            node={currentNode}
            onComplete={handleNodeComplete}
            onClose={handleNodeClose}
          />
        )}
        
        {/* 技能解锁 */}
        {phase === 'skill_unlock' && (
          <SkillUnlock onUnlock={handleSkillUnlock} />
        )}
        
        {/* 结尾 */}
      {phase === 'outro' && (
        <div className="data-outro-overlay">
          <OutroSection onComplete={handleChapterComplete} />
        </div>
      )}
      <ChapterRewardOverlay
        reward={reward}
        onContinue={() => navigate('/world-map', { state: { fromChapter: 4 } })}
      />
    </main>
  </div>
);
};

export default DataMetropolis;
