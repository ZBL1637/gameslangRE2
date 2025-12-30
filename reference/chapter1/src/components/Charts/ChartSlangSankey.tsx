import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { BaseChart } from './BaseChart';

type SankeyNode = {
  name: string;
};

type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

type SankeyRawData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

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

export type ChartSlangSankeyProps = {
  onSelectFlow?: (flow: SankeyLink) => void;
  onSelectNode?: (nodeName: string) => void;
};

export const ChartSlangSankey: React.FC<ChartSlangSankeyProps> = ({ onSelectFlow, onSelectNode }) => {
  const { ref: containerRef, inView } = useInViewOnce();
  const [data, setData] = useState<SankeyRawData | null>(null);

  useEffect(() => {
    if (!inView) return;
    let disposed = false;
    const url = `${import.meta.env.BASE_URL}data/sankey_data.json`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (disposed) return;
        if (!isRecord(d)) {
          setData({ nodes: [], links: [] });
          return;
        }
        setData({
          nodes: Array.isArray(d.nodes) ? (d.nodes as SankeyNode[]) : [],
          links: Array.isArray(d.links) ? (d.links as SankeyLink[]) : []
        });
      })
      .catch(() => {
        if (disposed) return;
        setData({ nodes: [], links: [] });
      });

    return () => {
      disposed = true;
    };
  }, [inView]);

  const handleInit = useCallback(
    (instance: EChartsType) => {
      if (!onSelectFlow && !onSelectNode) return;

      instance.on('click', (params: unknown) => {
        if (!isRecord(params)) return;
        const dataType = String(params.dataType ?? '');
        const d = isRecord(params.data) ? params.data : undefined;

        if (dataType === 'edge' && d && onSelectFlow) {
          const source = String(d.source ?? '');
          const target = String(d.target ?? '');
          const value = Number(d.value ?? 0);
          onSelectFlow({ source, target, value });
        }

        if (dataType === 'node' && d && onSelectNode) {
          const name = String(d.name ?? '');
          if (name) onSelectNode(name);
        }
      });
    },
    [onSelectFlow, onSelectNode]
  );

  const options: EChartsCoreOption = useMemo(() => {
    const nodes = data?.nodes ?? [];
    const links = data?.links ?? [];

    return {
      backgroundColor: 'rgba(0,0,0,0)',
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        backgroundColor: 'rgba(18, 26, 46, 0.95)',
        borderColor: 'rgba(212,175,55,0.45)',
        textStyle: { color: '#E8F0FF' },
        formatter: (p: unknown) => {
          if (!isRecord(p)) return '';
          const dataType = String(p.dataType ?? '');
          const d = isRecord(p.data) ? p.data : undefined;

          if (dataType === 'edge') {
            const source = String(d?.source ?? '');
            const target = String(d?.target ?? '');
            const value = Number(d?.value ?? 0);
            return `${source} → ${target}<br/>数量：${value}`;
          }

          const name = String(d?.name ?? p.name ?? '');
          return name;
        }
      },
      series: [
        {
          type: 'sankey',
          data: nodes,
          links,
          emphasis: { focus: 'adjacency' },
          nodeAlign: 'justify',
          nodeGap: 10,
          draggable: false,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
            opacity: 0.7
          },
          label: {
            color: '#E8F0FF',
            fontSize: 11
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: 'rgba(212,175,55,0.45)'
          }
        }
      ]
    };
  }, [data?.links, data?.nodes]);

  return (
    <div ref={containerRef}>
      {!inView ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>滚动到此处后加载汇流之溪…</div>
      ) : !data ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>Loading…</div>
      ) : (
        <BaseChart options={options} style={{ height: '560px' }} onInit={handleInit} />
      )}
    </div>
  );
};
