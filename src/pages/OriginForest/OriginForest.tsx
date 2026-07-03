import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/Button/Button';
import { ChapterCompass } from '@/components/ChapterCompass/ChapterCompass';
import { ChapterRewardOverlay } from '@/components/ChapterRewardOverlay/ChapterRewardOverlay';
import { DialogBox } from '@/pages/TutorialVillage/components/DialogBox';
import type { ChapterReward } from '@/data/chapterProgress';
import forestBg from '@/assets/images/chapter1_forest_bg.webp';
import npcForestKeeper from '@/assets/images/npc_forest_keeper.webp';
import fragmentTaxonomy from '@/assets/images/fragment_taxonomy.webp';
import fragmentRelation from '@/assets/images/fragment_relation.webp';
import fragmentMigration from '@/assets/images/fragment_migration.webp';
import './OriginForest.scss';

const ChartSunburst = React.lazy(() =>
  import('@/components/Charts/ChartSunburst').then(module => ({ default: module.ChartSunburst }))
);
const ChartCooccurrenceGraph = React.lazy(() =>
  import('@/components/Charts/ChartCooccurrenceGraph').then(module => ({ default: module.ChartCooccurrenceGraph }))
);
const ChartCooccurrenceHeatmap = React.lazy(() =>
  import('@/components/Charts/ChartCooccurrenceHeatmap').then(module => ({ default: module.ChartCooccurrenceHeatmap }))
);

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
      instructions: '点击最外层具体术语即可点亮分类。累计点亮 3 个来自不同一级类的术语后自动结算。'
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
      instructions: '点击连接较多的节点即可锁定桥接词。找到合格桥接词后自动结算。'
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
      instructions: '点击热力图格子即可记录搭配。找到一组强度 ≥ 200 的搭配后自动结算。'
    },
    fragment: { id: 'fragment_migration', name: '迁徙碎片', keywords: ['破圈', '迁移', '通用化', '流行语'], image: fragmentMigration }
  }
];

const asArray = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);
const asBool = (v: unknown): boolean => Boolean(v);
const asString = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const createEmptyForestProgress = (): ForestProgress => ({
  introCompleted: false,
  zonesCompleted: [],
  fragmentsCollected: [],
  bridgeTermId: undefined,
  collocationUnlocked: false,
  taxonomyCategories: [],
});

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
  const completedRef = useRef(false);
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

  const finishIntro = useCallback((delay = 180) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFadeOut(true);
    window.setTimeout(() => onComplete(), delay);
  }, [onComplete]);

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
      finishIntro(450);
    }
  };

  return (
    <div className={`ch1-intro ${fadeOut ? 'is-fading-out' : ''}`} onClick={introStep === 'dialogue' ? undefined : handleAdvance}>
      <div className={`ch1-intro-bg ${bgLoaded ? 'is-loaded' : ''}`} style={{ backgroundImage: `url(${forestBg})` }} />

      <button
        type="button"
        className="skip-intro-btn"
        onClick={(e) => {
          e.stopPropagation();
          finishIntro();
        }}
      >
        跳过动画
      </button>

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
              disabled={locked || completed}
              onClick={() => {
                if (!locked && !completed) onEnterZone(z.id);
              }}
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
                <div className="ch1-zone-cta">{locked ? '🔒 未解锁' : completed ? '✓ 已探索' : '🌿 进入探索'}</div>
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

  const handleSunburstSelect = (termId: string, l1Category: string) => {
    setSelectedTitle(termId);
    setSelectedDetail(`「${termId}」属于「${l1Category}」分类`);
    setInteractionCount((v) => v + 1);

    const nextCats = taxonomyCategories.includes(l1Category) ? taxonomyCategories : [...taxonomyCategories, l1Category];
    onUpdate({ taxonomyCategories: nextCats });
    if (nextCats.length >= 3) setCompletionArmed(true);
  };

  const handleGraphSelect = (meta: { termId: string; degree: number }) => {
    setSelectedTitle(meta.termId);
    setSelectedDetail(`「${meta.termId}」与 ${meta.degree} 个术语相关联`);
    setInteractionCount((v) => v + 1);
    if (meta.degree >= 8) {
      onUpdate({ bridgeTermId: meta.termId });
      setCompletionArmed(true);
    }
  };

  const handleHeatmapSelect = (pair: { a: string; b: string; value: number }) => {
    setSelectedTitle(`${pair.a} × ${pair.b}`);
    setSelectedDetail(`「${pair.a}」与「${pair.b}」的共现强度为 ${pair.value}`);
    setInteractionCount((v) => v + 1);
    if (pair.value >= 200) {
      onUpdate({ collocationUnlocked: true });
      setCompletionArmed(true);
    }
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

        <React.Suspense fallback={<div className="ch1-chart-loading">正在装载图表证据...</div>}>
          <div className="ch1-modal-chart">{renderChart()}</div>
        </React.Suspense>

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
  const { state, addExp, completeQuest, completeChapterRun, restartChapter, updateChapterProgress } = usePlayer();

  const saved = (state.chapterProgress?.ch1 as Record<string, unknown> | undefined)?.forest as Record<string, unknown> | undefined;
  const initialProgress: ForestProgress = useMemo(() => {
    const emptyProgress = createEmptyForestProgress();
    const introCompleted = asBool(saved?.introCompleted);
    const zonesCompleted = asArray<ZoneId>(saved?.zonesCompleted, []);
    const fragmentsCollected = asArray<string>(saved?.fragmentsCollected, []);
    const bridgeTermId = asString(saved?.bridgeTermId) ?? undefined;
    const collocationUnlocked = Boolean(saved?.collocationUnlocked);
    const taxonomyCategories = asArray<string>(saved?.taxonomyCategories, []);
    return { ...emptyProgress, introCompleted, zonesCompleted, fragmentsCollected, bridgeTermId, collocationUnlocked, taxonomyCategories };
  }, [saved]);
  const isChapterCompleted = state.completedChapters.includes(1);

  const [progress, setProgress] = useState<ForestProgress>(initialProgress);
  const [stage, setStage] = useState<Stage>(initialProgress.introCompleted ? 'map' : 'intro');
  const [activeZoneId, setActiveZoneId] = useState<ZoneId | null>(null);
  const [reward, setReward] = useState<ChapterReward | null>(null);

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
    if (!isChapterCompleted && progress.zonesCompleted.length === 3 && stage !== 'outro') {
      const t = window.setTimeout(() => {
        setStage('outro');
      }, 650);
      return () => window.clearTimeout(t);
    }
  }, [isChapterCompleted, progress.zonesCompleted.length, stage]);

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
    const newsProgress = state.chapterProgress?.news_1 as { revealed?: boolean; correct?: boolean } | undefined;
    const newsScore = (newsProgress?.revealed ? 2 : 0) + (newsProgress?.correct ? 2 : 0);
    const chapterReward = completeChapterRun(1, {
      score: 14 + progress.zonesCompleted.length * 2 + (progress.bridgeTermId ? 2 : 0) + (progress.collocationUnlocked ? 2 : 0) + newsScore,
      fragmentIds: progress.fragmentsCollected,
    });
    setReward(chapterReward);
  };

  const replayChapter = () => {
    restartChapter(1);
    setProgress(createEmptyForestProgress());
    setStage('intro');
    setActiveZoneId(null);
    setReward(null);
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
            <div className="ch1-side-panel">
              <ChapterCompass
                chapterId={1}
                objective="探索三个区域，收集分类、关系和迁徙碎片。"
                progress={`已完成 ${progress.zonesCompleted.length} / 3 个区域`}
              />
            </div>
            <div className="ch1-map-panel">
              <ForestMap zones={ZONES} completedZones={progress.zonesCompleted} onEnterZone={enterZone} />
              {isChapterCompleted && progress.zonesCompleted.length >= 3 && stage === 'map' && (
                <div className="ch1-return-panel">
                  <div>
                    <div className="title">黑话起源之森已通关</div>
                    <div className="desc">本章结算已经完成，你可以直接返回世界地图，或重新游玩本章流程。</div>
                  </div>
                  <div className="actions">
                    <Button size="sm" variant="primary" onClick={() => navigate('/world-map', { state: { fromChapter: 1 } })}>
                      返回世界地图
                    </Button>
                    <Button size="sm" variant="secondary" onClick={replayChapter}>
                      重新游玩本章
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
      <ChapterRewardOverlay
        reward={reward}
        onContinue={() => navigate('/world-map', { state: { fromChapter: 1 } })}
      />
    </div>
  );
};

export default OriginForest;
