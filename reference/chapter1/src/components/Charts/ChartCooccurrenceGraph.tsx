import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { BaseChart } from './BaseChart';

type GraphNode = {
  id: string;
  name: string;
  value?: number;
  doc_freq?: number;
  category?: string;
};

type GraphLink = {
  source: string;
  target: string;
  value: number;
};

type GraphRawData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

const PALETTE = [
  '#D4AF37',
  '#4AA3DF',
  '#A66EFA',
  '#4ECDC4',
  '#FF9F43',
  '#FF6B6B',
  '#C7ECEE',
  '#95A5A6'
];

const DEFAULT_WEIGHT_THRESHOLD = 12;
const DEFAULT_TOP_K = 3;
const DEFAULT_SHOW_TOP_K_ONLY = true;
const DEFAULT_NODE_VALUE_THRESHOLD = 50;
const DEFAULT_PERF_MODE = false;

export type ChartCooccurrenceGraphProps = {
  onSelectTerm?: (termId: string) => void;
  onSelectTermMeta?: (meta: { termId: string; degree: number }) => void;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

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
      if (!observer && typeof IntersectionObserver !== 'undefined') return;
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
 * 根据节点数量与性能模式，生成更稳定的力导向参数，避免出现“固定环形”的布局观感。
 */
const buildForceConfig = (nodeCount: number, perfMode: boolean) => {
  const repulsion = perfMode ? 520 : 1100;
  const gravity = perfMode ? 0.16 : 0.08;
  const edgeLength: [number, number] = perfMode ? [18, 110] : [35, 220];

  const largeGraph = nodeCount >= 260;
  const layoutAnimation = !(perfMode || largeGraph);

  return {
    initLayout: 'none',
    repulsion,
    gravity,
    edgeLength,
    friction: perfMode ? 0.75 : 0.62,
    layoutAnimation
  } as const;
};

/**
 * 仅为 Top 节点显示标签，降低网络图拥挤并保留重点词可读性。
 */
const applyTopLabels = <T extends { value?: number; label?: { show?: boolean } }>(
  nodesSortedDesc: T[],
  labelLimit: number
) => {
  return nodesSortedDesc.map((n, idx) => ({
    ...n,
    label: { ...(n.label ?? {}), show: idx < labelLimit }
  }));
};

export const ChartCooccurrenceGraph: React.FC<ChartCooccurrenceGraphProps> = ({ onSelectTerm, onSelectTermMeta }) => {
  const { ref: containerRef, inView } = useInViewOnce();
  const [rawData, setRawData] = useState<GraphRawData | null>(null);
  const perfMode = DEFAULT_PERF_MODE;
  const maxNodes = perfMode ? 220 : 2000;
  const maxEdges = perfMode ? 520 : 20000;

  useEffect(() => {
    if (!inView) return;
    let disposed = false;
    const url = `${import.meta.env.BASE_URL}data/graph_data.json`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (disposed) return;
        setRawData(d as GraphRawData);
      })
      .catch(() => {
        if (disposed) return;
        setRawData({ nodes: [], links: [] });
      });

    return () => {
      disposed = true;
    };
  }, [inView]);

  const getCategoryColor = useCallback((cat?: string) => {
    if (!cat) return PALETTE[0];
    let hash = 0;
    for (let i = 0; i < cat.length; i += 1) {
      hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PALETTE.length;
    return PALETTE[index];
  }, []);

  const filteredData = useMemo(() => {
    if (!rawData) return { nodes: [], links: [] as GraphLink[] };

    let activeLinks = rawData.links.filter((l) => (l.value ?? 0) >= DEFAULT_WEIGHT_THRESHOLD);

    if (DEFAULT_SHOW_TOP_K_ONLY) {
      const adj: Record<string, GraphLink[]> = {};
      rawData.nodes.forEach((n) => {
        adj[n.id] = [];
      });

      activeLinks.forEach((l) => {
        if (adj[l.source]) adj[l.source].push(l);
        if (adj[l.target]) adj[l.target].push(l);
      });

      const kept = new Set<GraphLink>();
      Object.keys(adj).forEach((nodeId) => {
        const edges = adj[nodeId];
        edges.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        edges.slice(0, DEFAULT_TOP_K).forEach((l) => kept.add(l));
      });
      activeLinks = Array.from(kept);
    }

    const activeNodeIds = new Set<string>();
    activeLinks.forEach((l) => {
      activeNodeIds.add(l.source);
      activeNodeIds.add(l.target);
    });

    const activeNodes = rawData.nodes
      .filter((n) => activeNodeIds.has(n.id) && (n.value ?? 0) >= DEFAULT_NODE_VALUE_THRESHOLD)
      .map((n) => {
        const nodeValue = n.value ?? 0;
        const nodeColor = getCategoryColor(n.category);
        return {
          ...n,
          symbolSize: Math.max(3, Math.min(35, Math.log(Math.max(1, nodeValue)) * 5)),
          label: { show: nodeValue > 500 },
          itemStyle: {
            color: nodeColor,
            borderColor: '#fff',
            borderWidth: 1.5,
            shadowBlur: 10,
            shadowColor: nodeColor
          }
        };
      });

    const trimmedNodes = activeNodes
      .slice()
      .sort((a, b) => (Number(b.value ?? 0) || 0) - (Number(a.value ?? 0) || 0))
      .slice(0, maxNodes);
    const labeledNodes = applyTopLabels(trimmedNodes, perfMode ? 10 : 20);
    const finalNodeIds = new Set(labeledNodes.map((n) => n.id));

    const finalLinks = activeLinks
      .filter((l) => finalNodeIds.has(l.source) && finalNodeIds.has(l.target))
      .slice()
      .sort((a, b) => (Number(b.value ?? 0) || 0) - (Number(a.value ?? 0) || 0))
      .slice(0, maxEdges);

    return { nodes: labeledNodes, links: finalLinks };
  }, [getCategoryColor, maxEdges, maxNodes, perfMode, rawData]);

  const handleInit = useCallback(
    (instance: EChartsType) => {
      if (!onSelectTerm && !onSelectTermMeta) return;
      instance.on('click', (params: unknown) => {
        if (!isRecord(params)) return;
        if (params.dataType !== 'node') return;
        if (typeof params.seriesIndex === 'number' && typeof params.dataIndex === 'number') {
          instance.dispatchAction({ type: 'downplay', seriesIndex: params.seriesIndex });
          instance.dispatchAction({ type: 'highlight', seriesIndex: params.seriesIndex, dataIndex: params.dataIndex });
          instance.dispatchAction({ type: 'select', seriesIndex: params.seriesIndex, dataIndex: params.dataIndex });
        }
        const data = isRecord(params.data) ? params.data : undefined;
        const termId = data?.id ?? data?.name;
        if (!termId) return;

        const id = String(termId);
        if (onSelectTerm) onSelectTerm(id);
        if (onSelectTermMeta) {
          let degree = 0;
          filteredData.links.forEach((l) => {
            if (l.source === id || l.target === id) degree += 1;
          });
          onSelectTermMeta({ termId: id, degree });
        }
      });
    },
    [filteredData.links, onSelectTerm, onSelectTermMeta]
  );

  const options: EChartsCoreOption = useMemo(() => {
    const nodeCount = filteredData.nodes.length;
    const force = buildForceConfig(nodeCount, perfMode);
    const showSeriesAnimation = !(perfMode || nodeCount >= 260);

    const series = {
      type: 'graph',
      layout: 'force',
      data: filteredData.nodes,
      links: filteredData.links,
      roam: true,
      animation: showSeriesAnimation,
      label: {
        show: false,
        position: 'right',
        color: '#E8F0FF',
        fontSize: 11,
        fontWeight: 'bold',
        textBorderColor: 'rgba(11, 16, 32, 0.9)',
        textBorderWidth: 2
      },
      labelLayout: { hideOverlap: true },
      force,
      lineStyle: {
        color: 'rgba(169, 183, 214, 0.2)',
        curveness: 0.1,
        opacity: 1,
        width: 1
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 2,
          color: 'rgba(255,225,122,0.75)'
        },
        label: {
          show: true,
          color: '#E8F0FF'
        },
        itemStyle: {
          borderColor: '#FFD34E',
          borderWidth: 2
        }
      },
      select: {
        itemStyle: {
          borderColor: '#FFD34E',
          borderWidth: 2
        },
        lineStyle: {
          color: '#FFD34E',
          width: 3
        }
      }
    } as const;

    return {
      backgroundColor: 'rgba(0,0,0,0)',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(18, 26, 46, 0.95)',
        borderColor: 'rgba(124,196,255,0.55)',
        textStyle: { color: '#E8F0FF' },
        formatter: (p: unknown) => {
          if (!isRecord(p)) return '';
          const dataType = String(p.dataType ?? '');
          const data = isRecord(p.data) ? p.data : undefined;

          if (dataType === 'edge') {
            const source = String(data?.source ?? '');
            const target = String(data?.target ?? '');
            const value = Number(data?.value ?? 0);
            return `${source} ↔ ${target}<br/>共现强度：${value}`;
          }

          const name = String(data?.name ?? p.name ?? '');
          const value = Number(data?.value ?? 0);
          const category = String(data?.category ?? '');
          return `${name}${category ? `（${category}）` : ''}<br/>词频：${value}`;
        }
      },
      series: [series]
    };
  }, [filteredData.links, filteredData.nodes, perfMode]);

  return (
    <div ref={containerRef}>
      {!inView ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>滚动到此处后加载网络图…</div>
      ) : (
        <>
          <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '12px', display: 'flex', gap: '12px' }}>
            <div>边权阈值：{DEFAULT_WEIGHT_THRESHOLD}</div>
            <div>Top K：{DEFAULT_TOP_K}</div>
            <div>词频过滤：{DEFAULT_NODE_VALUE_THRESHOLD}</div>
            <div style={{ marginLeft: 'auto' }}>
              Nodes: {filteredData.nodes.length} | Edges: {filteredData.links.length}
            </div>
          </div>
          {rawData && filteredData.nodes.length === 0 && (
            <div style={{ color: '#A9B7D6', padding: '4px 0 12px' }}>
              当前固定过滤条件下没有可显示的节点。如需调整展示范围，请修改本组件内的默认常量后重新构建。
            </div>
          )}
          <BaseChart options={options} style={{ height: '560px' }} onInit={handleInit} />
        </>
      )}
    </div>
  );
};
