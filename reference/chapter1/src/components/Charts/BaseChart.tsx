import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import { BarChart, GraphChart, HeatmapChart, LineChart, PieChart, SankeyChart, SunburstChart, TreemapChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import './Charts.scss';

export interface BaseChartProps {
  options: EChartsCoreOption;
  style?: React.CSSProperties;
  className?: string;
  onInit?: (instance: EChartsType) => void;
  renderer?: 'canvas' | 'svg';
}

const ECHARTS_MODULES = [
  BarChart,
  GraphChart,
  HeatmapChart,
  LineChart,
  PieChart,
  SankeyChart,
  SunburstChart,
  TreemapChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
  SVGRenderer
] as const;

export const BaseChart: React.FC<BaseChartProps> = ({ options, style, className = '', onInit, renderer = 'canvas' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<EChartsType | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [activeRenderer, setActiveRenderer] = useState<'canvas' | 'svg'>(renderer);

  const resize = useMemo(() => {
    return () => {
      try {
        chartInstance.current?.resize();
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    echarts.use([...ECHARTS_MODULES]);

    setInitError(null);
    chartInstance.current?.dispose();
    chartInstance.current = null;

    const initWithRenderer = (r: 'canvas' | 'svg') => {
      chartInstance.current = echarts.init(chartRef.current as HTMLDivElement, undefined, { renderer: r });
      setActiveRenderer(r);
      if (onInit) onInit(chartInstance.current);
    };

    try {
      initWithRenderer(renderer);
    } catch (e) {
      if (renderer === 'canvas') {
        try {
          initWithRenderer('svg');
        } catch (e2) {
          setInitError(e2 instanceof Error ? e2.message : String(e2));
          return;
        }
      } else {
        setInitError(e instanceof Error ? e.message : String(e));
        return;
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(chartRef.current);
    window.addEventListener('resize', resize);

    const raf1 = requestAnimationFrame(() => resize());
    const raf2 = requestAnimationFrame(() => resize());
    const t1 = window.setTimeout(() => resize(), 100);
    const t2 = window.setTimeout(() => resize(), 600);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', resize);
      ro.disconnect();
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [onInit, renderer, resize]);

  useEffect(() => {
    if (!chartInstance.current) return;
    try {
      chartInstance.current.setOption(options, { notMerge: true, lazyUpdate: false });
      setInitError(null);
    } catch (e) {
      setInitError(e instanceof Error ? e.message : String(e));
      return;
    }
    resize();
  }, [options, resize]);

  return (
    <div className="rpg-chart-shell" style={{ position: 'relative' }}>
      <div
        ref={chartRef}
        className={`rpg-chart ${className}`}
        style={{ width: '100%', height: '400px', ...style }}
      />
      {initError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '12px',
            color: '#E8F0FF',
            background: 'rgba(8, 12, 24, 0.78)',
            border: '1px solid rgba(255, 107, 107, 0.45)',
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            overflow: 'auto'
          }}
        >
          <div style={{ marginBottom: 8, color: '#FF6B6B', fontWeight: 700 }}>图表渲染失败</div>
          <div style={{ marginBottom: 8, opacity: 0.9 }}>Renderer：{activeRenderer}</div>
          <div>{initError}</div>
        </div>
      )}
    </div>
  );
};
