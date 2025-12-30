import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/Button/Button';
import { ChartCooccurrenceGraph, ChartCooccurrenceHeatmap, ChartSunburst } from '@/components/Charts';
import { DialogBox } from '@/pages/TutorialVillage/components/DialogBox';
import { getDataProcessor } from '@/utils/dataProcessor';
import type { Term } from '@/types';
import forestBg from '@/assets/images/chapter1_forest_bg.png';
import npcForestKeeper from '@/assets/images/npc_forest_keeper.png';
import fragmentTaxonomy from '@/assets/images/fragment_taxonomy.png';
import fragmentRelation from '@/assets/images/fragment_relation.png';
import fragmentMigration from '@/assets/images/fragment_migration.png';
import './OriginForest.scss';

type Phase = 'narration' | 'npc_intro' | 'npc_options' | 'npc_task';
type Stage = 'intro' | 'map' | 'explore' | 'outro';

type ZoneId = 'taxonomy' | 'relation' | 'migration';
type ZoneType = 'sunburst' | 'network' | 'heatmap';

type Zone = {
  id: ZoneId;
  name: string;
  icon: string;
  description: string;
  challenge: {
    type: ZoneType;
    title: string;
    description: string;
    instructions: string;
  };
  fragment: {
    id: string;
    name: string;
    keywords: string[];
    image: string;
  };
};

type ForestProgress = {
  introCompleted: boolean;
  zonesCompleted: ZoneId[];
  fragmentsCollected: string[];
  bridgeTermId?: string;
  collocationUnlocked?: boolean;
  taxonomyCategories?: string[];
};

const SCRIPT = {
  titleMain: '黑话起源之森',
  titleSub: '术语谱系与词根探索',
  titleIndex: 'CHAPTER 1',
  introNarration: [
    '你踏入了一片古老而神秘的森林。',
    '这里是游戏黑话的起源之地，每一棵古树都刻满了符文与词条。',
    '从「开团」到「GG」，从「DPS」到「奶妈」……',
    '这些词汇如同森林中的路标，指引着玩家们的协作与交流。'
  ],
  npcName: '森林守护者 · 语源',
  npcIntro: [
    '旅行者，欢迎来到黑话起源之森。',
    '我是这片森林的守护者，见证了游戏术语从诞生到流传的全过程。',
    '通关这片森林后，我会把“术语图鉴”交给你——那将是你之后冒险的随身装备。'
  ],
  npcTask:
    '探索这片森林的三个区域：「林冠之环」了解术语分类，「藤蔓之网」发现词汇关系，「溪流之径」追踪术语迁徙。收集三枚词根碎片，我将在结算时发放“术语图鉴”。',
  npcOptions: [
    {
      id: 'opt1',
      text: '词根碎片是什么？',
      response: '每个区域都蕴含着独特的语言智慧。收集这些碎片，你就能理解黑话是如何被分类、关联和传播的。'
    },
    {
      id: 'opt2',
      text: '为什么要了解术语分类？',
      response: '分类是理解的第一步。当你知道一个词属于哪一类，就能在新游戏里举一反三，快速融入团队。'
    },
    {
      id: 'opt3',
      text: '我准备好了，开始探索！',
      response: '很好。记住，每个区域都有一个挑战等着你。完成挑战，碎片自然会出现。祝你旅途顺利。'
    }
  ],
  achievementTitle: '森林探索者',
  achievementBody: '你已经完整探索了黑话起源之森的三个区域。',
  achievementReward: 'EXP +300，获得「术语图鉴」',
  outroNarration: [
    '当你走出起源之森，那些曾经陌生的词汇已经不再只是符号。',
    '你学会了如何分类、如何发现关系、如何追踪迁徙。',
    '这些知识将成为你在游戏世界中沟通的基石。',
    '下一站——战斗本体平原，你将见证黑话如何随着游戏产业一同演变。'
  ]
};

const ZONES: Zone[] = [
  {
    id: 'taxonomy',
    name: '林冠之环',
    icon: '🌳',
    description: '黑话不是暗号，而是一种可复用的分类系统。从一级类到子类，再到具体词条，学会分类就能举一反三。',
    challenge: {
      type: 'sunburst',
      title: '术语谱系探索',
      description: '通过旭日图探索术语的分类体系',
      instructions: '点击最外层具体术语，弹出词典窗口查看解释。累计查看 3 个来自不同一级类的术语后完成。'
    },
    fragment: { id: 'fragment_taxonomy', name: '分类碎片', keywords: ['玩法术语', '社交术语', '经济术语', '机制术语'], image: fragmentTaxonomy }
  },
  {
    id: 'relation',
    name: '藤蔓之网',
    icon: '🕸️',
    description: '有些词常常一起出现，它们未必同义，却往往属于同一流程阶段或协作场景。像藤蔓一样把语境结成网。',
    challenge: {
      type: 'network',
      title: '共词关系探索',
      description: '通过网络图发现术语之间的共现关系',
      instructions: '点击节点弹出词典窗口查看解释。找到一个连接较多的“桥接词”并查看后完成。'
    },
    fragment: { id: 'fragment_relation', name: '关系碎片', keywords: ['共现', '桥接', '语境', '搭配'], image: fragmentRelation }
  },
  {
    id: 'migration',
    name: '溪流之径',
    icon: '🌊',
    description: '术语会迁徙：先在某款游戏里出现，再被直播、攻略与社群搬运，最后进入跨游戏通用词库。',
    challenge: {
      type: 'heatmap',
      title: '术语迁徙追踪',
      description: '通过热力图了解术语在不同语境中的搭配强度',
      instructions: '点击格子弹出词典窗口查看两词解释。找到一组强度 ≥ 200 的搭配并查看后完成。'
    },
    fragment: { id: 'fragment_migration', name: '迁徙碎片', keywords: ['破圈', '迁移', '通用化', '流行语'], image: fragmentMigration }
  }
];

const asArray = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);
const asBool = (v: unknown): boolean => Boolean(v);
const asString = (v: unknown): string | null => (typeof v === 'string' ? v : null);

/**
 * 预加载图片资源，并返回是否已完成尝试加载（成功或失败都会返回 true）。
 */
const usePreloadImage = (src: string, timeoutMs = 1000) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);

    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
    img.src = src;

    const timer = window.setTimeout(() => setLoaded(true), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [src, timeoutMs]);

  return loaded;
};

/**
 * 打字机效果 Hook：在启用时按速度逐字输出文本，并支持跳过到完整文本。
 */
const useTypewriter = (text: string, enabled: boolean, speed = 30) => {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setDisplayed('');
    setIsTyping(true);
    let i = 0;
    const timer = window.setInterval(() => {
      if (i >= text.length) {
        window.clearInterval(timer);
        setIsTyping(false);
        return;
      }
      i += 1;
      setDisplayed(text.slice(0, i));
    }, speed);
    return () => window.clearInterval(timer);
  }, [enabled, speed, text]);

  const skip = () => {
    setDisplayed(text);
    setIsTyping(false);
  };

  return { displayed, isTyping, skip };
};

/**
 * 第一章开场段落：入场提示 → 章节标题 → 旁白与 NPC 对话，点击可推进或跳过打字。
 */
const IntroSection: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  type IntroStep = 'entrance' | 'title' | 'dialogue';

  const [introStep, setIntroStep] = useState<IntroStep>('entrance');
  const [fadeOut, setFadeOut] = useState(false);
  const [phase, setPhase] = useState<Phase>('narration');
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [npcDialogueIndex, setNpcDialogueIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const bgLoaded = usePreloadImage(forestBg);

  useEffect(() => {
    if (introStep === 'entrance') {
      const t = window.setTimeout(() => setIntroStep('title'), 1800);
      return () => window.clearTimeout(t);
    }
    if (introStep === 'title') {
      const t = window.setTimeout(() => setIntroStep('dialogue'), 2200);
      return () => window.clearTimeout(t);
    }
  }, [introStep]);

  const currentText = useMemo(() => {
    if (phase === 'narration') return SCRIPT.introNarration[narrationIndex] ?? '';
    if (phase === 'npc_intro') return SCRIPT.npcIntro[npcDialogueIndex] ?? '';
    if (phase === 'npc_options' && selectedOption) {
      return SCRIPT.npcOptions.find((o) => o.id === selectedOption)?.response ?? '';
    }
    if (phase === 'npc_task') return SCRIPT.npcTask;
    return '';
  }, [narrationIndex, npcDialogueIndex, phase, selectedOption]);

  const handleAdvance = () => {
    if (introStep !== 'dialogue') {
      setIntroStep('dialogue');
      return;
    }

    if (phase === 'narration') {
      if (narrationIndex < SCRIPT.introNarration.length - 1) setNarrationIndex((v) => v + 1);
      else {
        setPhase('npc_intro');
        setNpcDialogueIndex(0);
      }
      return;
    }

    if (phase === 'npc_intro') {
      if (npcDialogueIndex < SCRIPT.npcIntro.length - 1) setNpcDialogueIndex((v) => v + 1);
      else setPhase('npc_options');
      return;
    }

    if (phase === 'npc_options') {
      if (!selectedOption) return;
      setPhase('npc_task');
      setSelectedOption(null);
      return;
    }

    if (phase === 'npc_task') {
      setFadeOut(true);
      window.setTimeout(() => onComplete(), 450);
    }
  };

  return (
    <div className={`ch1-intro ${fadeOut ? 'is-fading-out' : ''}`} onClick={introStep === 'dialogue' ? undefined : handleAdvance}>
      <div className={`ch1-intro-bg ${bgLoaded ? 'is-loaded' : ''}`} style={{ backgroundImage: `url(${forestBg})` }} />

      {introStep === 'entrance' && (
        <div className="ch1-entrance-screen">
          <div className="ch1-entrance-text">
            <p>你离开了新手村……</p>
            <p>踏入了黑话起源之森</p>
          </div>
        </div>
      )}

      {introStep === 'title' && (
        <div className="ch1-title-screen">
          <div className="ch1-title">
            <div className="ch1-title-index">{SCRIPT.titleIndex}</div>
            <div className="ch1-title-main">{SCRIPT.titleMain}</div>
            <div className="ch1-title-sub">{SCRIPT.titleSub}</div>
          </div>
        </div>
      )}

      {introStep === 'dialogue' && (
        <>
          {phase === 'npc_options' && !selectedOption ? (
            <>
              <div className="tutorial-dialog-wrapper variant-default">
                <div className="character-portrait">
                  <img src={npcForestKeeper} alt={SCRIPT.npcName} />
                </div>
                <div className="tutorial-dialog-box" onClick={(e) => e.stopPropagation()}>
                  <div className="speaker-container">
                    <span className="speaker-tag">{SCRIPT.npcName}</span>
                  </div>
                  <div className="dialog-text">你想先了解哪一部分？</div>
                </div>

                <div className="ch1-choice-box" onClick={(e) => e.stopPropagation()}>
                  <div className="ch1-options">
                    {SCRIPT.npcOptions.map((opt) => (
                      <button
                        key={opt.id}
                        className="ch1-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOption(opt.id);
                        }}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <DialogBox
              speaker={phase === 'narration' ? '' : SCRIPT.npcName}
              text={currentText}
              onNext={handleAdvance}
              showNextArrow={true}
              characterImage={phase === 'narration' ? undefined : npcForestKeeper}
              variant="default"
            />
          )}
        </>
      )}
    </div>
  );
};

const ForestMap: React.FC<{
  zones: Zone[];
  completedZones: ZoneId[];
  onEnterZone: (zoneId: ZoneId) => void;
}> = ({ zones, completedZones, onEnterZone }) => {
  const progress = zones.length === 0 ? 0 : (completedZones.length / zones.length) * 100;

  return (
    <div className="ch1-map">
      <div className="ch1-map-header">
        <div className="ch1-map-title">🌲 起源之森探索地图</div>
        <div className="ch1-map-subtitle">探索三个区域，收集词根碎片</div>
      </div>

      <div className="ch1-progress">
        <div className="ch1-progress-bar">
          <div className="ch1-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="ch1-progress-text">
          已探索 {completedZones.length} / {zones.length} 区域
        </div>
      </div>

      <div className="ch1-fragments">
        <div className="ch1-fragments-title">词根碎片</div>
        <div className="ch1-fragments-grid">
          {zones.map((z) => {
            const collected = completedZones.includes(z.id);
            return (
              <div key={z.id} className={`ch1-fragment ${collected ? 'collected' : 'empty'}`}>
                {collected ? (
                  <>
                    <img className="ch1-fragment-img" src={z.fragment.image} alt={z.fragment.name} />
                    <div className="ch1-fragment-name">{z.fragment.name}</div>
                  </>
                ) : (
                  <>
                    <div className="ch1-fragment-placeholder">?</div>
                    <div className="ch1-fragment-name">未收集</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ch1-zones">
        {zones.map((z, idx) => {
          const completed = completedZones.includes(z.id);
          const locked = idx > 0 && !completedZones.includes(zones[idx - 1]!.id);
          return (
            <button
              key={z.id}
              className={`ch1-zone ${completed ? 'completed' : ''} ${locked ? 'locked' : ''}`}
              disabled={locked}
              onClick={() => onEnterZone(z.id)}
            >
              <div className="ch1-zone-icon">
                <span className="emoji">{z.icon}</span>
                {completed && <span className="badge">✓</span>}
                {locked && <span className="badge">🔒</span>}
              </div>
              <div className="ch1-zone-body">
                <div className="ch1-zone-name">{z.name}</div>
                <div className="ch1-zone-desc">{z.description}</div>
                <div className="ch1-zone-challenge">
                  <span className="label">挑战：</span>
                  <span className="value">{z.challenge.title}</span>
                </div>
                <div className="ch1-zone-cta">{locked ? '🔒 未解锁' : completed ? '🔄 重新探索' : '🌿 进入探索'}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ExplorationModal: React.FC<{
  zone: Zone;
  bridgeTermId?: string;
  collocationUnlocked?: boolean;
  taxonomyCategories: string[];
  onClose: () => void;
  onUpdate: (patch: Partial<ForestProgress>) => void;
  onComplete: () => void;
}> = ({ zone, bridgeTermId, collocationUnlocked, taxonomyCategories, onClose, onUpdate, onComplete }) => {
  const [interactionCount, setInteractionCount] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<string>('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionArmed, setCompletionArmed] = useState(false);
  const [termInfoOpen, setTermInfoOpen] = useState(false);
  const [termInfoLoading, setTermInfoLoading] = useState(false);
  const [termInfoError, setTermInfoError] = useState<string | null>(null);
  const [termInfo, setTermInfo] = useState<Term | null>(null);
  const [termInfoSecondary, setTermInfoSecondary] = useState<Term | null>(null);
  const [pendingInfo, setPendingInfo] = useState<
    | { kind: 'sunburst'; termId: string; l1Category: string }
    | { kind: 'network'; termId: string; degree: number }
    | { kind: 'heatmap'; a: string; b: string; value: number }
    | null
  >(null);

  /** 触发布局变化后的图表重算尺寸，避免 ECharts 在模态框内出现空白 */
  const scheduleChartResize = () => {
    const fire = () => window.dispatchEvent(new Event('resize'));
    requestAnimationFrame(fire);
    window.setTimeout(fire, 120);
  };

  /** 从本地词典数据库中按术语 ID 解析出术语详情；不存在则返回 null */
  const resolveTerm = async (termId: string): Promise<Term | null> => {
    const dp = await getDataProcessor();
    const term = dp.getTerm(termId);
    return term ?? null;
  };

  /** 打开“术语信息”窗口并加载词典内容；用户确认后才计入任务进度 */
  const openTermInfo = async (
    next:
      | { kind: 'sunburst'; termId: string; l1Category: string }
      | { kind: 'network'; termId: string; degree: number }
      | { kind: 'heatmap'; a: string; b: string; value: number }
  ) => {
    setPendingInfo(next);
    setTermInfoOpen(true);
    setTermInfoLoading(true);
    setTermInfoError(null);
    setTermInfo(null);
    setTermInfoSecondary(null);

    try {
      if (next.kind === 'heatmap') {
        const [a, b] = await Promise.all([resolveTerm(next.a), resolveTerm(next.b)]);
        setTermInfo(a);
        setTermInfoSecondary(b);
      } else {
        const term = await resolveTerm(next.termId);
        setTermInfo(term);
      }
    } catch (e) {
      setTermInfoError(e instanceof Error ? e.message : String(e));
    } finally {
      setTermInfoLoading(false);
    }
  };

  /** 关闭术语信息窗口（不计入任务进度） */
  const closeTermInfo = () => {
    setTermInfoOpen(false);
    setPendingInfo(null);
    setTermInfo(null);
    setTermInfoSecondary(null);
    setTermInfoError(null);
    setTermInfoLoading(false);
    scheduleChartResize();
  };

  /** 用户确认已查看词典信息后，写入探索进度并触发可能的完成态 */
  const confirmTermInfo = () => {
    if (!pendingInfo) return;
    let willComplete = false;

    if (pendingInfo.kind === 'sunburst') {
      const { termId, l1Category } = pendingInfo;
      setSelectedTitle(termId);
      setSelectedDetail(`「${termId}」属于「${l1Category}」分类`);
      const nextCats = taxonomyCategories.includes(l1Category) ? taxonomyCategories : [...taxonomyCategories, l1Category];
      willComplete = taxonomyCategories.length < 3 && nextCats.length >= 3;
      onUpdate({ taxonomyCategories: nextCats });
    } else if (pendingInfo.kind === 'network') {
      const { termId, degree } = pendingInfo;
      setSelectedTitle(termId);
      setSelectedDetail(`「${termId}」与 ${degree} 个术语相关联`);
      if (!bridgeTermId && degree >= 8) {
        willComplete = true;
        onUpdate({ bridgeTermId: termId });
      }
    } else if (pendingInfo.kind === 'heatmap') {
      const { a, b, value } = pendingInfo;
      setSelectedTitle(`${a} × ${b}`);
      setSelectedDetail(`「${a}」与「${b}」的共现强度为 ${value}`);
      if (!collocationUnlocked && value >= 200) {
        willComplete = true;
        onUpdate({ collocationUnlocked: true });
      }
    }

    setInteractionCount((v) => v + 1);
    if (willComplete) setCompletionArmed(true);
    closeTermInfo();
  };

  const handleSunburstSelect = (termId: string, l1Category: string) => {
    void openTermInfo({ kind: 'sunburst', termId, l1Category });
  };

  const handleGraphSelect = (meta: { termId: string; degree: number }) => {
    void openTermInfo({ kind: 'network', termId: meta.termId, degree: meta.degree });
  };

  const handleHeatmapSelect = (pair: { a: string; b: string; value: number }) => {
    void openTermInfo({ kind: 'heatmap', a: pair.a, b: pair.b, value: pair.value });
  };

  const completionHint = useMemo(() => {
    if (zone.challenge.type === 'sunburst') return `已点亮：${taxonomyCategories.length} / 3`;
    if (zone.challenge.type === 'network') return bridgeTermId ? `已找到桥接词：${bridgeTermId}` : '未找到桥接词（提示：选择连接较多的节点）';
    return collocationUnlocked ? '已发现高强度搭配' : '未发现高强度搭配（提示：选择强度 ≥ 200）';
  }, [bridgeTermId, collocationUnlocked, taxonomyCategories.length, zone.challenge.type]);

  const canComplete = useMemo(() => {
    if (zone.challenge.type === 'sunburst') return taxonomyCategories.length >= 3;
    if (zone.challenge.type === 'network') return Boolean(bridgeTermId);
    return Boolean(collocationUnlocked);
  }, [bridgeTermId, collocationUnlocked, taxonomyCategories.length, zone.challenge.type]);

  useEffect(() => {
    if (completionArmed && canComplete) window.setTimeout(() => setShowCompletion(true), 280);
  }, [canComplete, completionArmed]);

  useEffect(() => {
    setInteractionCount(0);
    setSelectedTitle(null);
    setSelectedDetail('');
    setShowCompletion(false);
    setCompletionArmed(false);
    setTermInfoOpen(false);
    setTermInfoLoading(false);
    setTermInfoError(null);
    setTermInfo(null);
    setTermInfoSecondary(null);
    setPendingInfo(null);
  }, [zone.id]);

  const renderChart = () => {
    if (zone.challenge.type === 'sunburst') return <ChartSunburst onSelectFragment={handleSunburstSelect} />;
    if (zone.challenge.type === 'network') return <ChartCooccurrenceGraph onSelectTermMeta={handleGraphSelect} />;
    if (zone.challenge.type === 'heatmap') return <ChartCooccurrenceHeatmap onSelectPair={handleHeatmapSelect} />;
    return null;
  };

  return (
    <div className="ch1-modal-overlay" onClick={onClose}>
      <div className="ch1-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ch1-modal-header">
          <div className="ch1-modal-title">
            <span className="emoji">{zone.icon}</span>
            <span>{zone.name}</span>
          </div>
          <button className="ch1-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ch1-modal-info">
          <div className="title">{zone.challenge.title}</div>
          <div className="desc">{zone.challenge.description}</div>
          <div className="inst">{zone.challenge.instructions}</div>
        </div>

        <div className="ch1-modal-progress">
          <div className="text">{completionHint}</div>
          <div className="dots">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`dot ${i < Math.min(interactionCount, 3) ? 'filled' : ''}`} />
            ))}
          </div>
        </div>

        {selectedTitle && (
          <div className="ch1-modal-selected">
            <div className="row">
              <span className="label">当前选中：</span>
              <span className="value">{selectedTitle}</span>
            </div>
            <div className="detail">{selectedDetail}</div>
          </div>
        )}

        <div className="ch1-modal-chart">{renderChart()}</div>

        {termInfoOpen && (
          <div className="ch1-term-overlay" onClick={closeTermInfo}>
            <div className="ch1-term-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ch1-term-header">
                <div className="title">术语档案</div>
                <button className="ch1-modal-close" onClick={closeTermInfo}>
                  ✕
                </button>
              </div>

              {termInfoLoading ? (
                <div className="ch1-term-loading">正在从词典数据库读取…</div>
              ) : termInfoError ? (
                <div className="ch1-term-error">{termInfoError}</div>
              ) : pendingInfo?.kind === 'heatmap' ? (
                <div className="ch1-term-grid">
                  <div className="ch1-term-card">
                    <div className="name">{pendingInfo.a}</div>
                    <div className="meta">{termInfo?.category?.l1 ? `${termInfo.category.l1} > ${termInfo.category.l2}` : '未收录分类'}</div>
                    <div className="definition">{termInfo?.definition || '词典数据库中未找到该术语解释。'}</div>
                  </div>
                  <div className="ch1-term-card">
                    <div className="name">{pendingInfo.b}</div>
                    <div className="meta">
                      {termInfoSecondary?.category?.l1 ? `${termInfoSecondary.category.l1} > ${termInfoSecondary.category.l2}` : '未收录分类'}
                    </div>
                    <div className="definition">{termInfoSecondary?.definition || '词典数据库中未找到该术语解释。'}</div>
                  </div>
                  <div className="ch1-term-relation">共现强度：{pendingInfo.value}</div>
                </div>
              ) : (
                <div className="ch1-term-body">
                  <div className="name">{pendingInfo?.kind === 'sunburst' || pendingInfo?.kind === 'network' ? pendingInfo.termId : ''}</div>
                  <div className="meta">{termInfo?.category?.l1 ? `${termInfo.category.l1} > ${termInfo.category.l2}` : '未收录分类'}</div>
                  {pendingInfo?.kind === 'sunburst' && <div className="extra">一级类：{pendingInfo.l1Category}</div>}
                  {pendingInfo?.kind === 'network' && <div className="extra">连接数：{pendingInfo.degree}</div>}
                  <div className="definition">{termInfo?.definition || '词典数据库中未找到该术语解释。'}</div>
                </div>
              )}

              <div className="ch1-term-actions">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={confirmTermInfo}
                  disabled={
                    termInfoLoading ||
                    Boolean(termInfoError) ||
                    (!termInfo && pendingInfo?.kind !== 'heatmap') ||
                    (pendingInfo?.kind === 'heatmap' && !termInfo && !termInfoSecondary)
                  }
                >
                  我已查看，计入任务并关闭
                </Button>
              </div>
            </div>
          </div>
        )}

        {showCompletion && (
          <div className="ch1-complete-overlay">
            <div className="ch1-complete">
              <div className="icon">🌟</div>
              <div className="title">探索完成！</div>
              <div className="subtitle">你已收集到「{zone.fragment.name}」</div>
              <div className="keywords">
                {zone.fragment.keywords.map((k) => (
                  <span key={k} className="tag">
                    {k}
                  </span>
                ))}
              </div>
              <Button size="sm" variant="primary" onClick={onComplete} disabled={!canComplete}>
                收下碎片
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OutroOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [idx, setIdx] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const { displayed, isTyping, skip } = useTypewriter(SCRIPT.outroNarration[idx] ?? '', true);

  const handleAdvance = () => {
    if (isTyping) {
      skip();
      return;
    }
    if (idx < SCRIPT.outroNarration.length - 1) setIdx((v) => v + 1);
    else if (!showAchievement) setShowAchievement(true);
  };

  return (
    <div className="ch1-outro" onClick={handleAdvance}>
      {!showAchievement ? (
        <div className="ch1-outro-text">
          <div className="narration">
            {displayed}
            {isTyping && <span className="ch1-cursor">▌</span>}
          </div>
          {!isTyping && <div className="hint">点击继续 ▼</div>}
        </div>
      ) : (
        <div className="ch1-achievement">
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <div className="header">
              <span className="emoji">🏆</span>
              <span>成就解锁</span>
            </div>
            <div className="body">
              <div className="title">{SCRIPT.achievementTitle}</div>
              <div className="desc">{SCRIPT.achievementBody}</div>
              <div className="reward">
                <span className="label">奖励：</span>
                <span className="value">{SCRIPT.achievementReward}</span>
              </div>
            </div>
            <Button size="sm" variant="primary" onClick={onComplete}>
              返回世界地图
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const OriginForest: React.FC = () => {
  const navigate = useNavigate();
  const { state, addExp, completeQuest, unlockAchievement, completeChapter, updateChapterProgress } = usePlayer();

  const saved = (state.chapterProgress?.ch1 as Record<string, unknown> | undefined)?.forest as Record<string, unknown> | undefined;
  const initialProgress: ForestProgress = useMemo(() => {
    const introCompleted = asBool(saved?.introCompleted);
    const zonesCompleted = asArray<ZoneId>(saved?.zonesCompleted, []);
    const fragmentsCollected = asArray<string>(saved?.fragmentsCollected, []);
    const bridgeTermId = asString(saved?.bridgeTermId) ?? undefined;
    const collocationUnlocked = Boolean(saved?.collocationUnlocked);
    const taxonomyCategories = asArray<string>(saved?.taxonomyCategories, []);
    return { introCompleted, zonesCompleted, fragmentsCollected, bridgeTermId, collocationUnlocked, taxonomyCategories };
  }, [saved]);

  const [progress, setProgress] = useState<ForestProgress>(initialProgress);
  const [stage, setStage] = useState<Stage>(initialProgress.introCompleted ? 'map' : 'intro');
  const [activeZoneId, setActiveZoneId] = useState<ZoneId | null>(null);

  const activeZone = useMemo(() => ZONES.find((z) => z.id === activeZoneId) ?? null, [activeZoneId]);

  useEffect(() => {
    updateChapterProgress('ch1', { forest: progress });
  }, [progress, updateChapterProgress]);

  useEffect(() => {
    if (progress.bridgeTermId) completeQuest('side_ch1_bridge');
  }, [completeQuest, progress.bridgeTermId]);

  useEffect(() => {
    if (progress.collocationUnlocked) completeQuest('side_ch1_collocation');
  }, [completeQuest, progress.collocationUnlocked]);

  useEffect(() => {
    if (progress.zonesCompleted.length >= 3) completeQuest('main_ch1');
  }, [completeQuest, progress.zonesCompleted.length]);

  useEffect(() => {
    if (progress.zonesCompleted.length === 3) {
      const t = window.setTimeout(() => {
        unlockAchievement('forest_explorer');
        addExp(200);
        setStage('outro');
      }, 650);
      return () => window.clearTimeout(t);
    }
  }, [addExp, progress.zonesCompleted.length, unlockAchievement]);

  const enterZone = (zoneId: ZoneId) => {
    setActiveZoneId(zoneId);
    setStage('explore');
  };

  const completeZone = (zoneId: ZoneId) => {
    const zone = ZONES.find((z) => z.id === zoneId);
    if (!zone) return;

    setProgress((prev) => {
      const zonesCompleted = prev.zonesCompleted.includes(zoneId) ? prev.zonesCompleted : [...prev.zonesCompleted, zoneId];
      const fragmentsCollected = prev.fragmentsCollected.includes(zone.fragment.id) ? prev.fragmentsCollected : [...prev.fragmentsCollected, zone.fragment.id];
      return { ...prev, zonesCompleted, fragmentsCollected };
    });
    addExp(50);
    setStage('map');
    setActiveZoneId(null);
  };

  const finishChapter = () => {
    completeChapter(1);
    navigate('/world-map');
  };

  return (
    <div className="origin-forest-page">
      <div className="ch1-global-bg" style={{ backgroundImage: `url(${forestBg})` }} />

      <div className="origin-forest-scroll-container" style={{ overflowY: stage === 'intro' ? 'hidden' : 'auto' }}>
        {stage === 'intro' && (
          <IntroSection
            onComplete={() => {
              setProgress((prev) => ({ ...prev, introCompleted: true }));
              setStage('map');
            }}
          />
        )}

        {stage !== 'intro' && (
          <div className="ch1-main">
            <ForestMap zones={ZONES} completedZones={progress.zonesCompleted} onEnterZone={enterZone} />
          </div>
        )}
      </div>

      {stage === 'explore' && activeZone && (
        <ExplorationModal
          zone={activeZone}
          bridgeTermId={progress.bridgeTermId}
          collocationUnlocked={progress.collocationUnlocked}
          taxonomyCategories={progress.taxonomyCategories ?? []}
          onUpdate={(patch) => setProgress((prev) => ({ ...prev, ...patch }))}
          onClose={() => {
            setStage('map');
            setActiveZoneId(null);
          }}
          onComplete={() => completeZone(activeZone.id)}
        />
      )}

      {stage === 'outro' && <OutroOverlay onComplete={finishChapter} />}
    </div>
  );
};

export default OriginForest;
