import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BaseChart } from './BaseChart';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';

export type ChartSunburstProps = {
  onSelectFragment?: (termId: string, l1Category: string) => void;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

type SunburstNode = {
  name: string;
  value?: number;
  children?: SunburstNode[];
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

/** 将后端/静态数据归一化为可直接喂给 ECharts 的 sunburst `data` 数组 */
const normalizeSunburstData = (raw: unknown): SunburstNode[] => {
  if (!Array.isArray(raw)) return [];
  const list = raw.filter((n) => isRecord(n) && typeof n.name === 'string') as SunburstNode[];
  if (list.length === 1 && Array.isArray(list[0].children)) return list[0].children ?? [];
  return list;
};

/** 从旭日图结构中构建「叶子词条 → 一级分类」映射，用于“词根碎片”归类 */
const buildTermToL1Map = (nodes: SunburstNode[]): Map<string, string> => {
  const map = new Map<string, string>();

  nodes.forEach((l1) => {
    const l1Name = l1.name;
    const stack: SunburstNode[] = Array.isArray(l1.children) ? [...l1.children] : [];
    while (stack.length) {
      const cur = stack.pop();
      if (!cur) continue;
      const children = Array.isArray(cur.children) ? cur.children : null;
      if (!children || children.length === 0) {
        map.set(cur.name, l1Name);
        continue;
      }
      children.forEach((c) => stack.push(c));
    }
  });

  return map;
};

export const ChartSunburst: React.FC<ChartSunburstProps> = ({ onSelectFragment }) => {
  const { ref: containerRef, inView } = useInViewOnce();
  const [rawData, setRawData] = useState<SunburstNode[] | null>(null);

  useEffect(() => {
    if (!inView) return;
    let disposed = false;
    const url = `${import.meta.env.BASE_URL}data/sunburst_data.json`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (disposed) return;
        setRawData(normalizeSunburstData(d));
      })
      .catch(() => {
        if (disposed) return;
        setRawData([]);
      });

    return () => {
      disposed = true;
    };
  }, [inView]);

  const { chartData, termToL1 } = useMemo(() => {
    const data = rawData ?? [];
    return { chartData: data, termToL1: buildTermToL1Map(data) };
  }, [rawData]);

  const options: EChartsCoreOption = useMemo(() => {
    return {
      color: PALETTE,
      backgroundColor: 'rgba(0,0,0,0)',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(18, 26, 46, 0.95)',
        borderColor: 'rgba(124,196,255,0.55)',
        textStyle: { color: '#E8F0FF' },
        formatter: (p: unknown) => {
          if (!isRecord(p)) return '';
          const data = isRecord(p.data) ? p.data : undefined;
          const name = String(data?.name ?? p.name ?? '');
          const value = Number(data?.value ?? p.value ?? 0);
          return `${name}${Number.isFinite(value) && value > 0 ? `<br/>词频：${value}` : ''}`;
        }
      },
      series: {
        type: 'sunburst',
        data: chartData,
        radius: ['15%', '88%'],
        itemStyle: {
          borderRadius: 0,
          borderColor: 'rgba(124,196,255,0.45)',
          borderWidth: 1.5
        },
        label: {
          rotate: 'radial',
          color: '#E8F0FF',
          fontSize: 11,
          minAngle: 5
        },
        levels: [
          {},
          {
            r0: '15%',
            r: '40%',
            itemStyle: { opacity: 0.9, borderWidth: 2 },
            label: { rotate: 'tangential', fontSize: 12, fontWeight: 'bold' }
          },
          {
            r0: '40%',
            r: '70%',
            itemStyle: { opacity: 0.85 }
          },
          {
            r0: '70%',
            r: '88%',
            label: { position: 'outside', padding: 2, color: 'rgba(232,240,255,0.85)' },
            itemStyle: { opacity: 0.75, borderWidth: 1 }
          }
        ]
      }
    };
  }, [chartData]);

  const handleInit = useCallback(
    (instance: EChartsType) => {
      if (!onSelectFragment) return;
      instance.on('click', (params: unknown) => {
        if (!isRecord(params)) return;
        const data = isRecord(params.data) ? params.data : undefined;
        const name = String(data?.name ?? '');
        if (!name) return;
        const l1 = termToL1.get(name);
        if (!l1) return;
        onSelectFragment(name, l1);
      });
    },
    [onSelectFragment, termToL1]
  );

  return (
    <div ref={containerRef}>
      {!inView ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>滚动到此处后加载林冠之环…</div>
      ) : !rawData ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>Loading…</div>
      ) : (
        <BaseChart options={options} style={{ height: '560px' }} onInit={handleInit} />
      )}
    </div>
  );
};
