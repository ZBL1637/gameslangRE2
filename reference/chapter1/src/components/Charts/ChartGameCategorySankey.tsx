import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import { BaseChart } from './BaseChart';
import { getDataProcessor } from '@/utils/dataProcessor';
import { Term } from '@/types';

interface SankeyNode {
  name: string;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

/** 仅在组件进入视窗后加载一次，用于降低首屏图表渲染开销 */
const useInViewOnce = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    const margin = 120;
    const check = () => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom >= -margin && rect.top <= window.innerHeight + margin) {
        setInView(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setInView(true);
            observer?.disconnect();
            observer = null;
          }
        },
        { root: null, rootMargin: `${margin}px 0px`, threshold: 0.01 }
      );

      observer.observe(el);
    }

    const onScrollOrResize = () => {
      check();
    };

    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      observer?.disconnect();
    };
  }, [inView]);

  return { ref, inView };
};

/**
 * 展示“游戏 -> 一级分类”的流向关系，用于解释术语从不同游戏汇入不同语义类别的过程。
 */
export const ChartGameCategorySankey: React.FC = () => {
  const { ref: containerRef, inView } = useInViewOnce();
  const [{ nodes, links }, setSankey] = useState<{ nodes: SankeyNode[]; links: SankeyLink[] }>({
    nodes: [],
    links: []
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let disposed = false;
    void getDataProcessor().then((dp) => {
      if (disposed) return;
      setSankey(buildGameCategorySankey(dp.getAllTerms()));
      setLoaded(true);
    });
    return () => {
      disposed = true;
    };
  }, [inView]);

  const options: EChartsCoreOption = useMemo(() => {
    return {
      backgroundColor: 'rgba(0,0,0,0)',
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: 'rgba(18, 26, 46, 0.95)',
        borderColor: 'rgba(212,175,55,0.45)',
        textStyle: { color: '#E8F0FF' },
        formatter: (params: any) => {
          if (!params) return '';
          if (params.dataType === 'edge' && params.data) {
            const source = String(params.data.source || '').replace(/^游戏·/, '');
            const target = String(params.data.target || '').replace(/^分类·/, '');
            const value = Number(params.data.value || 0);
            return `${source} → ${target}<br/>术语数量：${value}`;
          }
          if (params.dataType === 'node' && params.data) {
            const name = String(params.data.name || '').replace(/^(游戏|分类)·/, '');
            return name;
          }
          return '';
        }
      },
      series: [
        {
          type: 'sankey',
          data: nodes,
          links,
          emphasis: {
            focus: 'adjacency'
          },
          nodeAlign: 'justify',
          nodeGap: 10,
          draggable: false,
          label: {
            color: '#E8F0FF',
            fontSize: 11,
            formatter: (p: any) => String(p?.data?.name || '').replace(/^(游戏|分类)·/, '')
          },
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
            opacity: 0.7
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: 'rgba(212,175,55,0.45)'
          }
        }
      ]
    };
  }, [nodes, links]);

  return (
    <div ref={containerRef}>
      {!inView ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>滚动到此处后加载“游戏→类别”汇流…</div>
      ) : !loaded ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>Loading…</div>
      ) : (
        <BaseChart options={options} style={{ height: '560px' }} />
      )}
    </div>
  );
};

/**
 * 生成 Sankey 数据：左侧为 Top 游戏节点，右侧为 Top 一级分类节点。
 */
function buildGameCategorySankey(terms: Term[]): { nodes: SankeyNode[]; links: SankeyLink[] } {
  const gameCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const term of terms) {
    const category = term.category?.l1 || '未分类';
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);

    const games = term.games && term.games.length > 0 ? term.games : ['General'];
    for (const game of games) {
      gameCounts.set(game, (gameCounts.get(game) || 0) + 1);
    }
  }

  const topGames = Array.from(gameCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  if (!topGames.includes('General')) {
    topGames.push('General');
  }

  const topCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  const selectedGames = new Set(topGames);
  const selectedCategories = new Set(topCategories);

  const linkCounts = new Map<string, number>();

  for (const term of terms) {
    const category = term.category?.l1 || '未分类';
    if (!selectedCategories.has(category)) continue;

    const games = term.games && term.games.length > 0 ? term.games : ['General'];
    for (const game of games) {
      if (!selectedGames.has(game)) continue;
      const key = `${game}|||${category}`;
      linkCounts.set(key, (linkCounts.get(key) || 0) + 1);
    }
  }

  const gameColor = '#D4AF37';
  const categoryColor = '#4AA3DF';
  const borderColor = 'rgba(124,196,255,0.35)';

  const nodes: SankeyNode[] = [
    ...topGames.map((g) => ({
      name: `游戏·${g}`,
      itemStyle: {
        color: gameColor,
        borderColor,
        borderWidth: 1
      }
    })),
    ...topCategories.map((c) => ({
      name: `分类·${c}`,
      itemStyle: {
        color: categoryColor,
        borderColor,
        borderWidth: 1
      }
    }))
  ];

  const links: SankeyLink[] = Array.from(linkCounts.entries())
    .map(([key, value]) => {
      const [game, category] = key.split('|||');
      return {
        source: `游戏·${game}`,
        target: `分类·${category}`,
        value
      };
    })
    .sort((a, b) => b.value - a.value);

  return { nodes, links };
}
