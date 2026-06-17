// ============================================================================
// 第三章：玩家生态城镇 - 主组件
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { ChapterCompass } from '@/components/ChapterCompass/ChapterCompass';
import { ChapterRewardOverlay } from '@/components/ChapterRewardOverlay/ChapterRewardOverlay';
import { DataEvidencePanel } from '@/components/DataEvidencePanel/DataEvidencePanel';
import type { ChapterReward } from '@/data/chapterProgress';

import { IntroSection } from './components/layout/IntroSection';
import { TownMap } from './components/layout/TownMap';
import { DNATest } from './components/interactive/DNATest';
import { DNAReport } from './components/interactive/DNAReport';
import { AIQueryPanel } from './components/interactive/AIQueryPanel';
import { FloatingTerms } from './components/visuals/FloatingTerms';
import { SkillUnlock } from './components/layout/SkillUnlock';
import { OutroSection } from './components/layout/OutroSection';

import { Chapter3Phase, DNAResult } from './types';
import { SCRIPT } from './data';

import './PlayerTown.scss';

const RECOMMENDED_ARCHIVE_TERMS = ['GG', 'YYDS', '欧皇', '氪金', '破防', '666', '肝', '送人头', '开团', 'Carry', 'DPS', '奶妈'];

export const PlayerTown: React.FC = () => {
  const navigate = useNavigate();
  const { state, completeChapterRun, updateChapterProgress } = usePlayer();
  const savedProgress = state.chapterProgress?.chapter_3 || {};
  
  // 章节状态
  const [phase, setPhase] = useState<Chapter3Phase>(savedProgress.phase || 'intro');
  const [dnaCompleted, setDnaCompleted] = useState(Boolean(savedProgress.dnaCompleted));
  const [dnaResult, setDnaResult] = useState<DNAResult[] | null>(savedProgress.dnaResult || null);
  const [queriedTerms, setQueriedTerms] = useState<string[]>(savedProgress.queriedTerms || []);
  const [exploredTerms, setExploredTerms] = useState<string[]>(savedProgress.exploredTerms || []);
  const [skillUnlocked, setSkillUnlocked] = useState(Boolean(savedProgress.skillUnlocked));
  const [showAchievement, setShowAchievement] = useState(false);
  const [showSkillToast, setShowSkillToast] = useState(false);
  const [reward, setReward] = useState<ChapterReward | null>(null);
  
  // 当前活动的建筑/功能
  const [, setActiveBuilding] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const queriedTermsRef = useRef<string[]>(queriedTerms);
  const exploredTermsRef = useRef<string[]>(exploredTerms);
  const skillUnlockedRef = useRef(skillUnlocked);

  useEffect(() => {
    queriedTermsRef.current = queriedTerms;
  }, [queriedTerms]);

  useEffect(() => {
    exploredTermsRef.current = exploredTerms;
  }, [exploredTerms]);

  useEffect(() => {
    skillUnlockedRef.current = skillUnlocked;
  }, [skillUnlocked]);

  useEffect(() => {
    updateChapterProgress('chapter_3', {
      phase,
      dnaCompleted,
      dnaResult,
      queriedTerms,
      exploredTerms,
      skillUnlocked
    });
  }, [dnaCompleted, dnaResult, exploredTerms, phase, queriedTerms, skillUnlocked, updateChapterProgress]);

  // 完成入场
  const handleIntroComplete = useCallback(() => {
    setPhase('exploration');
  }, []);

  // 进入DNA测试
  const handleEnterDNATest = useCallback(() => {
    setActiveBuilding('identity_center');
    setPhase('dna_test');
  }, []);

  // DNA测试完成
  const handleDNAComplete = useCallback((results: DNAResult[]) => {
    setDnaResult(results);
    setDnaCompleted(true);
    setPhase('dna_result');
  }, []);

  // 关闭DNA报告
  const handleCloseDNAReport = useCallback(() => {
    setActiveBuilding(null);
    setPhase('exploration');
  }, []);

  // 进入档案馆
  const handleEnterArchive = useCallback(() => {
    setActiveBuilding('archive_hall');
    setShowAIPanel(true);
  }, []);

  // 关闭AI面板
  const handleCloseAIPanel = useCallback(() => {
    setShowAIPanel(false);
    setActiveBuilding(null);
  }, []);

  // 查询黑话
  const handleQueryTerm = useCallback((term: string) => {
    if (!queriedTermsRef.current.includes(term)) {
      const newQueriedTerms = [...queriedTermsRef.current, term];
      queriedTermsRef.current = newQueriedTerms;
      setQueriedTerms(newQueriedTerms);
      
      // 检查是否达成目标（查询10个黑话）
      if (newQueriedTerms.length >= 10 && !skillUnlockedRef.current) {
        // 显示成就
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 3000);
        
        // 延迟显示技能解锁
        setTimeout(() => {
          setShowAIPanel(false);
          setActiveBuilding(null);
          setPhase('skill_unlock');
        }, 3500);
      }
    }
  }, []);

  // 探索漂浮词汇
  const handleExploreTerm = useCallback((term: string) => {
    if (!exploredTermsRef.current.includes(term)) {
      const newExploredTerms = [...exploredTermsRef.current, term];
      exploredTermsRef.current = newExploredTerms;
      setExploredTerms(newExploredTerms);
    }
    // 同时计入查询
    handleQueryTerm(term);
  }, [handleQueryTerm]);

  // 技能解锁完成
  const handleSkillUnlock = useCallback(() => {
    setSkillUnlocked(true);
    setShowSkillToast(true);
    setTimeout(() => setShowSkillToast(false), 4000);
    setPhase('outro');
  }, []);

  // 章节完成
  const handleChapterComplete = useCallback(() => {
    const newsProgress = state.chapterProgress?.news_3 as { revealed?: boolean; correct?: boolean } | undefined;
    const newsScore = (newsProgress?.revealed ? 2 : 0) + (newsProgress?.correct ? 2 : 0);
    const chapterReward = completeChapterRun(3, {
      score: 14 + Math.min(queriedTerms.length, 10) + (dnaCompleted ? 4 : 0) + newsScore,
      fragmentIds: ['fragment_identity'],
    });
    setReward(chapterReward);
  }, [completeChapterRun, dnaCompleted, queriedTerms.length, state.chapterProgress]);

  return (
    <div className="player-town-page">
      <div className="main-content">
        
        {/* 入场阶段 */}
        {phase === 'intro' && <IntroSection onComplete={handleIntroComplete} />}

        {/* 城镇地图 (作为背景在探索、测试、结果等阶段常驻) */}
        {phase !== 'intro' && (
          <>
          <ChapterCompass
            chapterId={3}
            objective="完成玩家 DNA 测试，并在真言档案馆查询 10 个黑话。"
            progress={`DNA：${dnaCompleted ? '完成' : '未完成'} · 查询 ${queriedTerms.length} / 10`}
          />
          <DataEvidencePanel chapterId={3} compact />
          <TownMap
            dnaCompleted={dnaCompleted}
            queriedCount={queriedTerms.length}
            onEnterDNATest={handleEnterDNATest}
            onEnterArchive={handleEnterArchive}
          >
            <FloatingTerms 
              onTermClick={handleExploreTerm}
              exploredTerms={exploredTerms}
            />
          </TownMap>
          </>
        )}

        {/* DNA测试 */}
        {phase === 'dna_test' && (
          <DNATest 
            onComplete={handleDNAComplete}
            onClose={() => {
              setActiveBuilding(null);
              setPhase('exploration');
            }}
          />
        )}

        {/* DNA报告 */}
        {phase === 'dna_result' && dnaResult && (
          <DNAReport 
            results={dnaResult}
            onClose={handleCloseDNAReport}
          />
        )}

        {/* AI查询面板 */}
        {showAIPanel && (
          <AIQueryPanel 
            onQuery={handleQueryTerm}
            queriedTerms={queriedTerms}
            onClose={handleCloseAIPanel}
            suggestedTerms={RECOMMENDED_ARCHIVE_TERMS}
          />
        )}

        {/* 技能解锁 */}
        {phase === 'skill_unlock' && (
          <SkillUnlock onUnlock={handleSkillUnlock} />
        )}

        {/* 结尾 */}
        {phase === 'outro' && (
          <div className="outro-overlay">
            <OutroSection onComplete={handleChapterComplete} />
          </div>
        )}

        {/* 成就通知 */}
        {showAchievement && (
          <div className="achievement-toast">
            <div className="toast-content">
              <div className="icon-box">
                <Trophy size={24} />
              </div>
              <div className="text-box">
                <h4>成就解锁</h4>
                <p className="title">黑话通晓者</p>
                <p className="reward">了解了10个游戏黑话</p>
              </div>
            </div>
          </div>
        )}

        {/* 技能获得通知 */}
        {showSkillToast && (
          <div className="skill-toast">
            <div className="toast-content">
              <div className="icon-box">
                <span>🔊</span>
              </div>
              <div className="text-box">
                <h4>新技能获得</h4>
                <p className="title">{SCRIPT.ch3_skill_name}</p>
                <p className="desc">{SCRIPT.ch3_skill_desc}</p>
              </div>
            </div>
          </div>
        )}

        <ChapterRewardOverlay
          reward={reward}
          onContinue={() => navigate('/world-map', { state: { fromChapter: 3 } })}
        />

      </div>
    </div>
  );
};

export default PlayerTown;
