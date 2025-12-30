import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { BaseChart } from './BaseChart';

type HeatmapRawData = {
  categories: string[];
  data: Array<[number, number, number]>;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export type ChartCooccurrenceHeatmapProps = {
  onSelectPair?: (pair: { a: string; b: string; value: number }) => void;
};

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

const reduceHeatmapByTopTerms = (raw: HeatmapRawData, maxTerms: number) => {
  const categories = raw.categories ?? [];
  const n = categories.length;
  if (n === 0) return { categories: [] as string[], data: [] as Array<[number, number, number]> };
  if (!Number.isFinite(maxTerms) || maxTerms <= 0 || maxTerms >= n) return raw;

  const sums = new Array<number>(n).fill(0);
  raw.data.forEach(([x, y, v]) => {
    const val = Number(v ?? 0);
    if (!Number.isFinite(val) || val <= 0) return;
    if (Number.isInteger(x) && x >= 0 && x < n) sums[x] += val;
    if (Number.isInteger(y) && y >= 0 && y < n) sums[y] += val;
  });

  const picked = sums
    .map((sum, idx) => ({ idx, sum }))
    .sort((a, b) => b.sum - a.sum)
    .slice(0, maxTerms)
    .map((x) => x.idx)
    .sort((a, b) => a - b);

  const pickedSet = new Set(picked);
  const oldToNew = new Map<number, number>();
  picked.forEach((oldIdx, newIdx) => oldToNew.set(oldIdx, newIdx));

  const nextCategories = picked.map((i) => categories[i] ?? '').filter(Boolean);
  const nextData = raw.data
    .filter(([x, y]) => pickedSet.has(x) && pickedSet.has(y))
    .map(([x, y, v]) => [oldToNew.get(x) ?? 0, oldToNew.get(y) ?? 0, v] as [number, number, number]);

  return { categories: nextCategories, data: nextData };
};

export const ChartCooccurrenceHeatmap: React.FC<ChartCooccurrenceHeatmapProps> = ({ onSelectPair }) => {
  const { ref: containerRef, inView } = useInViewOnce();
  const [data, setData] = useState<HeatmapRawData | null>(null);
  const [perfModeOverride, setPerfModeOverride] = useState<boolean | null>(null);
  const [maxTerms, setMaxTerms] = useState(42);

  useEffect(() => {
    if (!inView) return;
    let disposed = false;
    const url = `${import.meta.env.BASE_URL}data/heatmap_data.json`;

    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (disposed) return;
        if (!isRecord(d)) {
          setData({ categories: [], data: [] });
          return;
        }
        const categories = Array.isArray(d.categories) ? (d.categories as string[]) : [];
        const raw = Array.isArray(d.data) ? (d.data as Array<[number, number, number]>) : [];
        setData({ categories, data: raw });
      })
      .catch(() => {
        if (disposed) return;
        setData({ categories: [], data: [] });
      });

    return () => {
      disposed = true;
    };
  }, [inView]);

  const autoPerfMode = useMemo(() => {
    const n = data?.categories?.length ?? 0;
    return n > 55;
  }, [data?.categories?.length]);

  const perfMode = perfModeOverride ?? autoPerfMode;

  const reducedData = useMemo(() => {
    if (!data) return null;
    if (!perfMode) return data;
    const safeMax = Math.max(12, Math.min(maxTerms, data.categories.length));
    return reduceHeatmapByTopTerms(data, safeMax);
  }, [data, maxTerms, perfMode]);

  const processed = useMemo(() => {
    if (!reducedData) return { processedData: [] as Array<[number, number, number, number]>, minLog: 0, maxLog: 0 };
    const processedData = reducedData.data.map(([x, y, val]) => [x, y, Math.log(val + 1), val] as [number, number, number, number]);
    const values = processedData.map((d) => d[2]);
    const maxLog = values.length ? Math.max(...values) : 0;
    const minLog = values.length ? Math.min(...values) : 0;
    return { processedData, minLog, maxLog };
  }, [reducedData]);

  const options: EChartsCoreOption = useMemo(() => {
    const categories = reducedData?.categories ?? [];
    const labelInterval = categories.length > 60 ? 2 : categories.length > 42 ? 1 : 0;
    return {
      backgroundColor: 'rgba(0,0,0,0)',
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(18, 26, 46, 0.95)',
        borderColor: 'rgba(124,196,255,0.55)',
        textStyle: { color: '#E8F0FF' },
        formatter: (p: unknown) => {
          if (!isRecord(p)) return '';
          const d = Array.isArray(p.data) ? (p.data as unknown[]) : null;
          if (!d) return '';
          const xIndex = Number(d[0] ?? 0);
          const yIndex = Number(d[1] ?? 0);
          const realValue = Number(d[3] ?? 0);
          const xName = categories[xIndex] ?? '';
          const yName = categories[yIndex] ?? '';
          return `${xName} - ${yName}<br/>共现强度：${realValue}`;
        }
      },
      grid: {
        height: '64%',
        top: '15%',
        bottom: '15%',
        left: '10%',
        right: '10%'
      },
      xAxis: {
        type: 'category',
        data: categories,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.02)']
          }
        },
        axisLabel: {
          rotate: 90,
          color: '#A9B7D6',
          fontSize: 11,
          interval: labelInterval
        },
        axisLine: { lineStyle: { color: 'rgba(169,183,214,0.45)' } }
      },
      yAxis: {
        type: 'category',
        data: categories,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.02)']
          }
        },
        axisLabel: {
          color: '#A9B7D6',
          fontSize: 11,
          interval: labelInterval
        },
        axisLine: { lineStyle: { color: 'rgba(169,183,214,0.45)' } }
      },
      visualMap: {
        min: processed.minLog,
        max: processed.maxLog,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        dimension: 2,
        inRange: {
          color: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#FFE17A']
        },
        textStyle: { color: '#E8F0FF' },
        formatter: (value: number) => {
          return Math.round(Math.exp(value) - 1).toString();
        }
      },
      series: [
        {
          name: 'Co-occurrence',
          type: 'heatmap',
          data: processed.processedData,
          animation: false,
          label: { show: false },
          itemStyle: { borderColor: 'rgba(11, 16, 32, 0.6)', borderWidth: 1 },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              borderColor: '#FFE17A',
              borderWidth: 1
            }
          }
        }
      ]
    };
  }, [processed.maxLog, processed.minLog, processed.processedData, reducedData?.categories]);

  const handleInit = useCallback(
    (instance: EChartsType) => {
      if (!onSelectPair) return;
      const categories = reducedData?.categories ?? null;
      if (!categories) return;
      instance.on('click', (params: unknown) => {
        if (!isRecord(params)) return;
        if (typeof params.seriesIndex === 'number' && typeof params.dataIndex === 'number') {
          instance.dispatchAction({ type: 'downplay', seriesIndex: params.seriesIndex });
          instance.dispatchAction({ type: 'highlight', seriesIndex: params.seriesIndex, dataIndex: params.dataIndex });
          instance.dispatchAction({ type: 'select', seriesIndex: params.seriesIndex, dataIndex: params.dataIndex });
        }
        const d = Array.isArray(params.data) ? (params.data as unknown[]) : null;
        if (!d) return;
        const xIndex = Number(d[0] ?? 0);
        const yIndex = Number(d[1] ?? 0);
        const value = Number(d[3] ?? 0);
        const a = categories[xIndex];
        const b = categories[yIndex];
        if (!a || !b) return;
        onSelectPair({ a, b, value });
      });
    },
    [onSelectPair, reducedData?.categories]
  );

  return (
    <div ref={containerRef}>
      {!inView ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>滚动到此处后加载热力图…</div>
      ) : !data ? (
        <div style={{ color: '#A9B7D6', padding: '12px 0' }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={perfMode}
                onChange={(e) => setPerfModeOverride(e.target.checked)}
              />
              性能保护
            </label>
            {perfMode && (
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '240px' }}>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '6px' }}>最多术语：{Math.max(12, Math.min(maxTerms, data.categories.length))}</div>
                <input
                  type="range"
                  min={12}
                  max={Math.max(12, Math.min(80, data.categories.length))}
                  step={2}
                  value={Math.max(12, Math.min(maxTerms, data.categories.length))}
                  onChange={(e) => setMaxTerms(Number(e.target.value))}
                />
              </div>
            )}
            <div style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '12px' }}>
              Terms: {(reducedData?.categories ?? data.categories).length} / {data.categories.length}
            </div>
          </div>
          <BaseChart options={options} style={{ height: '560px' }} onInit={handleInit} />
        </>
      )}
    </div>
  );
};
