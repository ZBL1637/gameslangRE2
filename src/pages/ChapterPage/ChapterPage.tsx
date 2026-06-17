import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel } from '@/components/Panel/Panel';
import { Button } from '@/components/Button/Button';
import { GameTerm } from '@/components/GameTerm/GameTerm';
import { usePlayer } from '@/context/PlayerContext';
import { QUESTS } from '@/data/quests';
import { DialogBox } from '@/components/DialogBox/DialogBox';
import { getDataProcessor } from '@/utils/dataProcessor';
import { ChartSunburst } from '@/components/Charts/ChartSunburst';
import { ChartGameBar } from '@/components/Charts/ChartGameBar';
import { ChartSourcePie } from '@/components/Charts/ChartSourcePie';
import { ChartTrend } from '@/components/Charts/ChartTrend';
import { ChartCooccurrenceGraph } from '@/components/Charts/ChartCooccurrenceGraph';
import { ChartCooccurrenceHeatmap } from '@/components/Charts/ChartCooccurrenceHeatmap';
import './ChapterPage.scss';

type ChapterCharts = {
  partA?: React.FC;
  partB?: React.FC;
};

const CHART_MAPPING: Record<string, ChapterCharts> = {
  '1': { partA: ChartSunburst },
  '3': { partA: ChartGameBar },
  '4': { partA: ChartSourcePie },
  '5': { partA: ChartTrend },
  '6': { partA: ChartSunburst }
};

const CHAPTER_TITLES: Record<string, string> = {
  '1': '黑话起源之森',
  '3': '玩家生态城镇',
  '4': '经济与氪金之都',
  '5': '弹幕大峡谷',
  '6': '终章·魔王城'
};

const CHAPTER_SUBTITLES: Record<string, string> = {
  '1': '起源之森',
  '3': '玩家小镇',
  '4': '氪金之都',
  '5': '弹幕峡谷',
  '6': '算法城堡'
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

type FocusClue =
  | { kind: 'fragment'; termId: string; l1Category: string }
  | { kind: 'graphTerm'; termId: string; degree: number }
  | { kind: 'collocation'; a: string; b: string; value: number };

const asNonEmptyString = (v: unknown): string | null => {
  const s = typeof v === 'string' ? v : v == null ? '' : String(v);
  const trimmed = s.trim();
  return trimmed ? trimmed : null;
};

const asNumber = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** 向列表追加去重元素（基于全等），返回新数组 */
const pushUnique = <T,>(list: T[], item: T): T[] => {
  if (list.includes(item)) return list;
  return [...list, item];
};

// Chapter Content Data
const CHAPTER_CONTENT: Record<string, {
  intro: { text: string, speaker: string },
  partA: { title: string, text: React.ReactNode },
  partB: { title: string, text: React.ReactNode },
  outro: { text: string }
}> = {
  '1': {
    intro: {
      speaker: '图书管理员',
      text: '欢迎，旅行者。你听过队友喊“开团”、盯“DPS”，结算时又刷一句“GG”吗？这些词像森林里的路标与符文：短、硬、信息密度极高。第一章，我们不背诵词条——我们把它们当作地图，沿着“分类 → 关系 → 流向”三条路线，追溯黑话为何能让陌生人瞬间协作。'
    },
    partA: {
      title: '林冠之环：术语谱系与“词根碎片”',
      text: (
        <>
          <p>在这片森林里，黑话不是“暗号”，更像一种可复用的分类系统：先有一级类（玩法/机制/社交/经济等），再分出子类，最后落到具体词条。你一旦学会“它属于哪一类”，就能在新游戏里举一反三。</p>
          <p>下方旭日图是一张“林冠地图”：从内圈的一级类开始，越往外越具体。点击扇区聚焦，再次点击返回上一级。每次锁定一个词，我们都会把它当成一枚“词根碎片”——写下释义、日常语言翻译与常见语境，放进你的背包。</p>
          <p>操作提示与收获：</p>
          <ul>
            <li>点击扇区聚焦：更清楚地看到同一语义家族的分支。</li>
            <li>观察从内到外：从“类别”走到“可直接在队伍里喊出来的词”。</li>
            <li>点亮 3 枚碎片：来自不同一级类，各自记录一条“在什么情况下会被用到”。</li>
          </ul>
          <p>例如在团队协作语境里，玩家会围绕 <GameTerm termId="开团">开团</GameTerm>、<GameTerm termId="DPS">DPS</GameTerm> 这类高频词压缩沟通成本：一句话就能分工、报状态、下指令。</p>
        </>
      )
    },
    partB: {
      title: '藤蔓与溪流：共现关系与术语迁徙',
      text: (
        <>
          <p>森林的第二条路叫“关系”。有些词常常一起出现，它们未必同义，却往往属于同一流程阶段或同一协作场景：像藤蔓一样把语境结成网。你可以通过阈值与筛选，把噪声剪掉，只看最强的共鸣。</p>
          <p>第三条路叫“流向”。术语会迁徙：先在某款游戏里出现，再被直播、攻略与社群搬运，最后进入跨游戏通用词库。<GameTerm termId="GG">GG</GameTerm> 就是典型例子：它既可以是礼貌的“打得好”，也可能被当成“这把要寄了”的情绪表达。</p>
          <p>操作提示与收获：</p>
          <ul>
            <li>藤蔓网络（共词图）：拖拽/缩放，调高“边权阈值”只看强关系；找到一个连接两团词群的“桥接词”，获得线索卡片。</li>
            <li>符文石阵（热力图）：悬停查看两词与强度；找一组高强度搭配，系统会生成一句队伍语境示例台词。</li>
          </ul>
          <p>这一节的图表会以“符文菜单”的方式呈现：你每完成一次选择，就会掉落一条线索，逐步填满本章的探索指标。</p>
        </>
      )
    },
    outro: {
      text: '篝火已燃。你见过了三张地图：它们如何被分类、如何在语境中结网、又如何跨圈层迁徙。带上你的词根碎片与迁徙印记，下一站是“真正的战场”——在那里，黑话会在协作与冲突中被反复锻造。'
    }
  },
  '3': {
    intro: {
      speaker: '镇长',
      text: '欢迎来到我们的小镇！在这里，“Troll” 不指巨魔，“Smurf” 也不是蓝精灵。这关乎你在社区中的身份。'
    },
    partA: {
      title: '玩家原型',
      text: (
        <>
          <p>社区是由人建立的。有些人是正在摸索门道的 <GameTerm termId="Newbie">萌新</GameTerm>，而另一些则是指引方向的 <GameTerm termId="Pro">大佬</GameTerm>。</p>
          <p>当心那些破坏和平的 <GameTerm termId="Troll">喷子</GameTerm>，或者是碾压低级玩家的 <GameTerm termId="Smurf">炸鱼者</GameTerm>。</p>
        </>
      )
    },
    partB: {
      title: '社交动态',
      text: (
        <>
          <p>公会、帮派、联盟。我们抱团生存。柱状图展示了哪些游戏拥有最活跃的社交术语。</p>
          <p>你是“独狼”还是“团队玩家”？你的选择决定了你的体验。</p>
        </>
      )
    },
    outro: {
      text: '你已经认识了当地人。现在，让我们谈谈生意。黄金之城在等待着你。'
    }
  },
  '4': {
    intro: {
      speaker: '地精商人',
      text: '时间就是金钱，朋友！“F2P”，“P2W”，“微交易”。如果你想要最好的装备，你得了解市场。'
    },
    partA: {
      title: '游戏经济学',
      text: (
        <>
          <p>这游戏是 <GameTerm termId="F2P">免费游玩</GameTerm> 吗？还是 <GameTerm termId="P2W">氪金致胜</GameTerm>？界限往往很模糊。</p>
          <p>我们的饼图揭示了这些术语的来源——是官方营销还是愤怒的玩家？</p>
        </>
      )
    },
    partB: {
      title: '鲸鱼与小虾米',
      text: (
        <>
          <p><GameTerm termId="Whale">氪金大佬（鲸鱼）</GameTerm> 一掷千金。小虾米一毛不拔。生态系统两者都需要。</p>
          <p>在掏空钱包之前，学会识别“抽卡”陷阱！</p>
        </>
      )
    },
    outro: {
      text: '你的钱包变轻了，但你的头脑变富有了。下一站：充满梗的混乱峡谷。'
    }
  },
  '5': {
    intro: {
      speaker: '玩梗大师',
      text: '2333！666！你会说互联网的语言吗？在峡谷里，文字的传播速度比光还快。'
    },
    partA: {
      title: '病毒式传播',
      text: (
        <>
          <p>黑话通过直播和聊天传播。<GameTerm termId="Pog">Pog</GameTerm> 起初是一个表情，现在它是一种感觉。</p>
          <p>趋势线展示了一个术语的人气是如何迅速飙升——又迅速跌落的。</p>
        </>
      )
    },
    partB: {
      title: '语境为王',
      text: (
        <>
          <p>在游戏葬礼上说 <GameTerm termId="F">F</GameTerm> 是表示尊敬，但在其他地方可能会让人困惑。</p>
          <p>掌握这些细微差别是区分“老古董”和“Z世代”的关键。</p>
        </>
      )
    },
    outro: {
      text: '你经受住了尴尬的考验。你已经准备好迎接最终的试炼。魔王在等待。'
    }
  },
  '6': {
    intro: {
      speaker: '魔王',
      text: '那么，你已经走到了这一步。你了解了词汇、系统、人群。但你能将它们融会贯通吗？'
    },
    partA: {
      title: '宏伟档案馆',
      text: (
        <>
          <p>我们穿越了森林、平原、城镇、城市和峡谷。</p>
          <p>最后看一眼旭日图。这是我们整个文化的地图。</p>
        </>
      )
    },
    partB: {
      title: '你的传承',
      text: (
        <>
          <p>你不再是一个 <GameTerm termId="Newbie">萌新</GameTerm>。你是知识的守护者。</p>
          <p>去吧，分享这些知识。游戏从未结束，它只是在更新。</p>
        </>
      )
    },
    outro: {
      text: '恭喜你，玩家。你通关了游戏。……或者是吗？二周目已开启。'
    }
  }
};

const ChapterPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completeChapter, completeQuest, restartChapter, updateChapterProgress, state, getQuestStatus } = usePlayer();
  const [activeSection, setActiveSection] = useState('intro');
  const [showIntroDialog, setShowIntroDialog] = useState(true);
  const [showSettlement, setShowSettlement] = useState(false);
  const [toast, setToast] = useState<{ key: string; text: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [dpReady, setDpReady] = useState(false);
  const dpRef = useRef<unknown>(null);
  const [focusExplain, setFocusExplain] = useState<string | null>(null);
  const chapterKey = useMemo(() => `ch${String(id ?? '')}`, [id]);
  const chapterProgress = useMemo(() => {
    const raw = state.chapterProgress?.[chapterKey];
    return isRecord(raw) ? raw : {};
  }, [chapterKey, state.chapterProgress]);

  const clues = useMemo(() => {
    const raw = chapterProgress.clues;
    return Array.isArray(raw) ? (raw as Array<{ id: string; title: string; text: string }>) : [];
  }, [chapterProgress.clues]);

  const fragments = useMemo(() => {
    const raw = chapterProgress.fragments;
    return isRecord(raw) ? (raw as Record<string, string>) : {};
  }, [chapterProgress.fragments]);

  const litTerms = useMemo(() => {
    const raw = chapterProgress.litTerms;
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [chapterProgress.litTerms]);

  const foundPairs = useMemo(() => {
    const raw = chapterProgress.foundPairs;
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [chapterProgress.foundPairs]);

  const bridge = useMemo(() => {
    const raw = chapterProgress.bridge;
    return isRecord(raw) ? (raw as { termId?: string }) : {};
  }, [chapterProgress.bridge]);

  const collocation = useMemo(() => {
    const raw = chapterProgress.collocation;
    return isRecord(raw) ? (raw as { a?: string; b?: string; value?: number }) : {};
  }, [chapterProgress.collocation]);

  const settlementSeen = useMemo(() => Boolean(chapterProgress.settlementSeen), [chapterProgress.settlementSeen]);

  const focus = useMemo<FocusClue | null>(() => {
    const raw = chapterProgress.focus;
    if (!isRecord(raw)) return null;
    const kind = asNonEmptyString(raw.kind);
    if (!kind) return null;

    if (kind === 'fragment') {
      const termId = asNonEmptyString(raw.termId);
      const l1Category = asNonEmptyString(raw.l1Category);
      if (!termId || !l1Category) return null;
      return { kind: 'fragment', termId, l1Category };
    }

    if (kind === 'graphTerm') {
      const termId = asNonEmptyString(raw.termId);
      if (!termId) return null;
      return { kind: 'graphTerm', termId, degree: asNumber(raw.degree) };
    }

    if (kind === 'collocation') {
      const a = asNonEmptyString(raw.a);
      const b = asNonEmptyString(raw.b);
      if (!a || !b) return null;
      return { kind: 'collocation', a, b, value: asNumber(raw.value) };
    }

    return null;
  }, [chapterProgress.focus]);

  const addClue = useCallback(
    (title: string, text: string) => {
      const clueId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : `${Date.now()}_${Math.random()}`;
      const next = [...clues, { id: String(clueId), title, text }];
      updateChapterProgress(chapterKey, { clues: next });
    },
    [chapterKey, clues, updateChapterProgress]
  );

  const showToast = useCallback((key: string, text: string) => {
    if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    setToast({ key, text });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (String(id) !== '1') return;
    let disposed = false;
    void getDataProcessor()
      .then((dp) => {
        if (disposed) return;
        dpRef.current = dp;
        setDpReady(true);
      })
      .catch(() => {
        if (disposed) return;
        dpRef.current = null;
        setDpReady(false);
      });
    return () => {
      disposed = true;
    };
  }, [id]);

  useEffect(() => {
    if (String(id) !== '1') return;
    if (!dpReady) {
      setFocusExplain(null);
      return;
    }
    if (!focus) {
      setFocusExplain(null);
      return;
    }

    const dp = dpRef.current as { getTerm?: (termId: string) => unknown } | null;
    const getTermDef = (termId: string) => {
      const t = dp?.getTerm?.(termId) as { definition?: unknown } | undefined;
      const def = String(t?.definition ?? '').trim();
      if (!def) return null;
      const firstBlock = def.split('\n\n')[0]?.trim() ?? def;
      const brief = firstBlock.length > 160 ? `${firstBlock.slice(0, 160)}…` : firstBlock;
      return brief || null;
    };

    if (focus.kind === 'fragment' || focus.kind === 'graphTerm') {
      const def = getTermDef(focus.termId);
      setFocusExplain(def ?? '暂无词典解释');
      return;
    }

    if (focus.kind === 'collocation') {
      const a = getTermDef(focus.a);
      const b = getTermDef(focus.b);
      const text = [a ? `「${focus.a}」：${a}` : `「${focus.a}」：暂无词典解释`, b ? `「${focus.b}」：${b}` : `「${focus.b}」：暂无词典解释`].join('\n');
      setFocusExplain(text);
      return;
    }

    setFocusExplain(null);
  }, [dpReady, focus, id]);

  const handleSelectFragment = useCallback(
    (termId: string, l1Category: string) => {
      if (String(id) !== '1') return;
      const isNewFragment = fragments[l1Category] !== termId;
      const nextFragments = { ...fragments, [l1Category]: termId };
      const nextLitTerms = pushUnique(litTerms, termId);
      updateChapterProgress(chapterKey, {
        fragments: nextFragments,
        litTerms: nextLitTerms,
        focus: { kind: 'fragment', termId, l1Category }
      });
      addClue('词根碎片已点亮', `你从「${l1Category}」获得碎片：${termId}`);
      if (isNewFragment) showToast(`fragment:${l1Category}:${termId}`, `掉落：词根碎片「${termId}」`);
      if (!isNewFragment) showToast(`fragment-focus:${l1Category}:${termId}`, `已选中：${termId}`);

      const unique = Object.keys(nextFragments).length;
      if (unique >= 3) completeQuest('main_ch1');
    },
    [addClue, chapterKey, completeQuest, fragments, id, litTerms, showToast, updateChapterProgress]
  );

  const handleSelectGraphTerm = useCallback(
    (meta: { termId: string; degree: number }) => {
      if (String(id) !== '1') return;
      const nextLitTerms = pushUnique(litTerms, meta.termId);
      updateChapterProgress(chapterKey, {
        litTerms: nextLitTerms,
        focus: { kind: 'graphTerm', termId: meta.termId, degree: meta.degree }
      });
      addClue('藤蔓共鸣', `你触碰到「${meta.termId}」（连接数：${meta.degree}）`);
      showToast(`graph:${meta.termId}`, `共鸣：${meta.termId}（连接 ${meta.degree}）`);

      if (!bridge.termId && meta.degree >= 8) {
        updateChapterProgress(chapterKey, { bridge: { termId: meta.termId } });
        addClue('桥接词线索已获得', `「${meta.termId}」像藤蔓枢纽，把不同词群连在一起。`);
        showToast(`bridge:${meta.termId}`, `掉落：桥接词线索「${meta.termId}」`);
        completeQuest('side_ch1_bridge');
      }
    },
    [addClue, bridge.termId, chapterKey, completeQuest, id, litTerms, showToast, updateChapterProgress]
  );

  const handleSelectCollocation = useCallback(
    (pair: { a: string; b: string; value: number }) => {
      if (String(id) !== '1') return;
      const key = `${pair.a}×${pair.b}`;
      const nextFoundPairs = pushUnique(foundPairs, key);
      const isNewPair = !foundPairs.includes(key);
      updateChapterProgress(chapterKey, { collocation: pair, foundPairs: nextFoundPairs, focus: { kind: 'collocation', ...pair } });
      addClue('符文搭配记录', `你解读到「${pair.a}」×「${pair.b}」（强度：${pair.value}）`);
      if (isNewPair) showToast(`pair:${key}`, `掉落：搭配「${pair.a}×${pair.b}」`);
      if (!isNewPair) showToast(`pair-focus:${key}`, `已选中：${pair.a}×${pair.b}`);
      if (pair.value >= 200) {
        addClue('示例台词解锁', `队友语境示例：${pair.a} 先开，${pair.b} 跟上。`);
        showToast(`pair-unlock:${key}`, '解锁：示例台词');
        completeQuest('side_ch1_collocation');
      }
    },
    [addClue, chapterKey, completeQuest, foundPairs, id, showToast, updateChapterProgress]
  );

  // 获取当前章节关联的任务
  const chapterQuests = useMemo(() => {
    const chapterId = Number(id);
    if (!chapterId || Number.isNaN(chapterId)) return [];
    return QUESTS.filter(q => q.chapterId === chapterId && (q.type === 'main' || q.type === 'side'))
      .map(q => ({ ...q, status: getQuestStatus(q.id) }))
      .filter(q => q.status !== 'locked')
      .sort((a, b) => {
        const order: Record<string, number> = { main: 0, side: 1 };
        return (order[a.type] ?? 9) - (order[b.type] ?? 9);
      });
  }, [id, state.activeQuests, state.completedQuests, getQuestStatus]);

  const isChapterCompleted = state.completedChapters.includes(Number(id));

  const totalChapterQuestExp = useMemo(() => {
    const chapterId = Number(id);
    if (!chapterId || Number.isNaN(chapterId)) return 0;
    return QUESTS.filter(q => q.chapterId === chapterId && (q.type === 'main' || q.type === 'side')).reduce(
      (sum, q) => sum + q.expReward,
      0
    );
  }, [id]);

  useEffect(() => {
    if (isChapterCompleted) return;
    if (settlementSeen) return;
    if (chapterQuests.length === 0) return;
    const allDone = chapterQuests.every(q => q.status === 'completed');
    if (!allDone) return;
    setShowSettlement(true);
    updateChapterProgress(chapterKey, { settlementSeen: true });
  }, [chapterKey, chapterQuests, isChapterCompleted, settlementSeen, updateChapterProgress]);

  const charts = id ? CHART_MAPPING[id] : undefined;
  const PartAChart = charts?.partA || null;
  const PartBChart = charts?.partB || null;
  const chapterTitle = id ? CHAPTER_TITLES[id] : 'Unknown Chapter';
  const chapterSubtitle = id ? CHAPTER_SUBTITLES[id] : '';
  
  // Fallback content if specific chapter content is missing
  const content = (id && CHAPTER_CONTENT[id]) || {
    intro: { speaker: '系统', text: '正在加载章节数据...' },
    partA: { title: '分析', text: <p>本章节内容正在建设中。</p> },
    partB: { title: '案例研究', text: <p>更多数据分析即将推出。</p> },
    outro: { text: '章节已完成。' }
  };

  const handleComplete = () => {
    completeChapter(Number(id));
    navigate('/world-map');
  };

  const handleRestart = () => {
    const chapterId = Number(id);
    if (!chapterId || Number.isNaN(chapterId)) return;
    if (!confirm('重新开始将清空本章已保存的进度（不重置已获得的经验与成就）。继续？')) return;
    restartChapter(chapterId);
    setShowSettlement(false);
    setShowIntroDialog(true);
    setActiveSection('intro');
    setFocusExplain(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDictionary = useCallback(
    (termId: string) => {
      if (!state.dictionaryUnlocked) {
        showToast('dict-locked', '术语图鉴未解锁：通关第一章后获得');
        return;
      }
      navigate(`/dictionary?term=${encodeURIComponent(termId)}`);
    },
    [navigate, showToast, state.dictionaryUnlocked]
  );

  const getQuestProgressSuffix = useCallback(
    (questId: string) => {
      if (String(id) !== '1') return '';
      if (questId === 'main_ch1') return `（${Object.keys(fragments).length}/3）`;
      if (questId === 'side_ch1_bridge') return bridge.termId ? '（1/1）' : '（0/1）';
      if (questId === 'side_ch1_collocation') return collocation.value != null && collocation.value >= 200 ? '（1/1）' : '（0/1）';
      return '';
    },
    [bridge.termId, collocation.value, fragments, id]
  );

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chapter-container">
      {toast && (
        <div className="chapter-toast" key={toast.key}>
          {toast.text}
        </div>
      )}
      {/* 左侧导航 */}
      <Panel className="chapter-sidebar">
        <h3 className="sidebar-title">Chapter {id}</h3>
        
        {chapterQuests.length > 0 && (
          <div className="chapter-quest-card">
            <div className="quest-label">本章任务</div>
            <div className="quest-list">
              {chapterQuests.map((q) => (
                <div key={q.id} className="quest-row">
                  <div className="quest-name">
                    {q.type === 'main' ? 'MAIN' : 'SIDE'} · {q.title}
                    {getQuestProgressSuffix(q.id)}
                  </div>
                  <div className={`quest-status ${q.status}`}>
                    {q.status === 'completed' ? '✅ 已完成' : '⭕ 进行中'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ul className="chapter-nav">
          <li className={activeSection === 'intro' ? 'active' : ''} onClick={() => scrollToSection('intro')}>
            序幕：引入
          </li>
          <li className={activeSection === 'part-a' ? 'active' : ''} onClick={() => scrollToSection('part-a')}>
            第一节：深度解析
          </li>
          <li className={activeSection === 'part-b' ? 'active' : ''} onClick={() => scrollToSection('part-b')}>
            第二节：案例研究
          </li>
          <li className={activeSection === 'outro' ? 'active' : ''} onClick={() => scrollToSection('outro')}>
            结语
          </li>
        </ul>
        
        <div className="sidebar-footer">
           <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>退出</Button>
        </div>
      </Panel>

      {/* 右侧内容区 (滚动) */}
      <Panel className="chapter-content animate-fade-in-up delay-200">
        <div className="content-scroll">
          
          {/* Scene 0: Intro */}
          <div id="section-intro" className="story-section animate-fade-in-up delay-300">
            <h1 className="section-title">
              {chapterTitle}
              <span className="section-subtitle">{chapterSubtitle}</span>
            </h1>
            
            {showIntroDialog ? (
              <DialogBox 
                text={content.intro.text}
                speaker={content.intro.speaker}
                avatar={<div className="npc-avatar">🧙‍♂️</div>}
                onComplete={() => {}}
              />
            ) : (
              <div className="intro-recap" onClick={() => setShowIntroDialog(true)}>
                重播剧情
              </div>
            )}
          </div>

          {/* Part A */}
          <div id="section-part-a" className="story-section">
            <h2>{content.partA.title}</h2>
            <div className="text-content">{content.partA.text}</div>
            <div className="chart-container">
              {id === '1' ? (
                <ChartSunburst onSelectFragment={handleSelectFragment} />
              ) : PartAChart ? (
                <PartAChart />
              ) : (
                <div className="chart-placeholder">图表加载中...</div>
              )}
            </div>
          </div>

          {/* Part B */}
          <div id="section-part-b" className="story-section">
            <h2>{content.partB.title}</h2>
            <div className="text-content">{content.partB.text}</div>
            {id === '1' ? (
              <div className="ch1-partb-layout">
                <div className="ch1-partb-charts">
                  <div className="ch1-chart-block">
                    <div className="ch1-chart-title">藤蔓共鸣（共现网络）</div>
                    <div className="chart-container">
                      <ChartCooccurrenceGraph onSelectTermMeta={handleSelectGraphTerm} />
                    </div>
                  </div>

                  <div className="ch1-chart-block">
                    <div className="ch1-chart-title">符文石阵（共现热力）</div>
                    <div className="chart-container">
                      <ChartCooccurrenceHeatmap onSelectPair={handleSelectCollocation} />
                    </div>
                  </div>
                </div>

                <div className="ch1-partb-sidebar">
                  <div className="chart-container clue-panel">
                    <h3>线索面板</h3>

                    {focus && (
                      <div className="clue-focus">
                        <div className="clue-focus-title">当前焦点</div>
                        {focus.kind === 'fragment' && (
                          <div className="clue-focus-body">
                            <div className="clue-focus-text">
                              词根碎片：{focus.l1Category} · <GameTerm termId={focus.termId} />
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => handleOpenDictionary(focus.termId)}>
                              查看图鉴
                            </Button>
                          </div>
                        )}
                        {focus.kind === 'graphTerm' && (
                          <div className="clue-focus-body">
                            <div className="clue-focus-text">
                              藤蔓节点：<GameTerm termId={focus.termId} />（连接数：{focus.degree}）
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => handleOpenDictionary(focus.termId)}>
                              查看图鉴
                            </Button>
                          </div>
                        )}
                        {focus.kind === 'collocation' && (
                          <div className="clue-focus-body">
                            <div className="clue-focus-text">
                              固定搭配：{focus.a} × {focus.b}（强度：{focus.value}）
                            </div>
                          </div>
                        )}
                        {focusExplain && <div className="clue-focus-explain">{focusExplain}</div>}
                      </div>
                    )}

                    <div className="clue-stats">
                      <div className="clue-stat">
                        <div className="clue-stat-label">点亮词条</div>
                        <div className="clue-stat-value">{litTerms.length}</div>
                      </div>
                      <div className="clue-stat">
                        <div className="clue-stat-label">词根碎片</div>
                        <div className="clue-stat-value">{Object.keys(fragments).length} / 3</div>
                      </div>
                      <div className="clue-stat">
                        <div className="clue-stat-label">桥接词</div>
                        <div className="clue-stat-value">{bridge.termId ? '已发现' : '未发现'}</div>
                      </div>
                      <div className="clue-stat">
                        <div className="clue-stat-label">固定搭配</div>
                        <div className="clue-stat-value">{foundPairs.length}</div>
                      </div>
                    </div>
                    <div className="clue-bag">
                      <div className="clue-bag-title">当前收集</div>
                      <div className="clue-bag-row">
                        <div className="clue-bag-key">碎片</div>
                        <div className="clue-bag-value">
                          {Object.keys(fragments).length === 0
                            ? '—'
                            : Object.entries(fragments)
                                .map(([k, v]) => `${k}：${v}`)
                                .join(' · ')}
                        </div>
                      </div>
                      <div className="clue-bag-row">
                        <div className="clue-bag-key">桥接词</div>
                        <div className="clue-bag-value">{bridge.termId ?? '—'}</div>
                      </div>
                      <div className="clue-bag-row">
                        <div className="clue-bag-key">搭配</div>
                        <div className="clue-bag-value">
                          {collocation.a && collocation.b ? `${collocation.a} × ${collocation.b}（${collocation.value ?? 0}）` : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="clue-list">
                      {clues.length === 0 ? (
                        <div className="clue-empty">还没有线索。试着点击图表中的词条或搭配。</div>
                      ) : (
                        clues
                          .slice()
                          .reverse()
                          .slice(0, 8)
                          .map((c) => (
                            <div key={c.id} className="clue-item">
                              <div className="clue-title">{c.title}</div>
                              <div className="clue-text">{c.text}</div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              PartBChart && (
                <div className="chart-container">
                  <PartBChart />
                </div>
              )
            )}
          </div>

          {/* Outro */}
          <div id="section-outro" className="story-section">
            <h2>结语</h2>
            <p className="narrative-text">{content.outro.text}</p>
            <div className="chapter-actions">
              {isChapterCompleted ? (
                <Button size="sm" variant="secondary" onClick={handleRestart}>
                  重新开始本章
                </Button>
              ) : (
                <Button onClick={handleComplete} className="animate-pulse">
                  完成章节
                </Button>
              )}
            </div>
          </div>

        </div>
      </Panel>

      {showSettlement && (
        <div className="chapter-settlement-overlay" role="dialog" aria-modal="true">
          <div className="chapter-settlement-modal">
            <div className="chapter-settlement-title">章节结算</div>
            <div className="chapter-settlement-body">
              <div className="chapter-settlement-row">
                <div className="k">本章任务</div>
                <div className="v">
                  {chapterQuests.length}/{chapterQuests.length} 已完成
                </div>
              </div>
              <div className="chapter-settlement-row">
                <div className="k">经验奖励</div>
                <div className="v">XP +{totalChapterQuestExp}</div>
              </div>
              <div className="chapter-settlement-row">
                <div className="k">解锁提示</div>
                <div className="v">领取结算后将在世界地图解锁下一章</div>
              </div>
            </div>
            <div className="chapter-settlement-actions">
              <Button size="sm" variant="secondary" onClick={() => setShowSettlement(false)}>
                稍后
              </Button>
              <Button onClick={handleComplete}>领取结算</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterPage;
