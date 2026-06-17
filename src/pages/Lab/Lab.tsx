import React, { useEffect, useRef, useMemo } from 'react';
import { Panel } from '@/components/Panel/Panel';
import { Quiz } from '@/components/Quiz/Quiz';
import rawData from '@/data/words_sort_data.json';
import './Lab.scss';

// Type definitions for the raw data
interface RawTerm {
  一级分类: string;
  二级分类: string;
  三级分类: string | null;
  title: string;
}

interface SunburstNode {
  name: string;
  value?: number;
  children?: SunburstNode[];
}

const Lab: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    const data = rawData as RawTerm[];
    const root: SunburstNode = { name: 'DataNews', children: [] };

    data.forEach(item => {
      const l1 = item.一级分类 || 'Uncategorized';
      const l2 = item.二级分类 || 'General';
      
      let l1Node = root.children?.find(c => c.name === l1);
      if (!l1Node) {
        l1Node = { name: l1, children: [] };
        root.children?.push(l1Node);
      }

      let l2Node = l1Node.children?.find(c => c.name === l2);
      if (!l2Node) {
        l2Node = { name: l2, children: [], value: 0 };
        l1Node.children?.push(l2Node);
      }

      // Add simple count to L2 node, or add specific children if needed
      // For sunburst, leaf nodes with values determine size
      l2Node.children?.push({ name: item.title, value: 1 });
    });

    return root.children ?? [];
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    let disposed = false;
    let chart: { resize: () => void; dispose: () => void; setOption: (option: unknown) => void } | null = null;

    const handleResize = () => chart?.resize();
    window.addEventListener('resize', handleResize);

    void Promise.all([
      import('echarts/core'),
      import('echarts/charts'),
      import('echarts/components'),
      import('echarts/renderers'),
    ]).then(([echarts, charts, components, renderers]) => {
      if (disposed || !chartRef.current) return;
      echarts.use([
        charts.SunburstChart,
        components.TooltipComponent,
        renderers.CanvasRenderer,
      ]);
      chart = echarts.init(chartRef.current);
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} terms'
        },
        series: {
          type: 'sunburst',
          data: chartData,
          radius: [0, '90%'],
          label: {
            rotate: 'radial'
          },
          itemStyle: {
            borderRadius: 0,
            borderColor: '#1a1b26',
            borderWidth: 1
          },
          levels: [
            {},
            {
              r0: '0%',
              r: '35%',
              itemStyle: {
                color: '#c0a080'
              },
              label: {
                rotate: 'tangential'
              }
            },
            {
              r0: '35%',
              r: '70%',
              label: {
                align: 'right'
              }
            },
            {
              r0: '70%',
              r: '72%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false
              },
              itemStyle: {
                borderWidth: 3
              }
            }
          ]
        }
      });
    });

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      chart?.dispose();
    };
  }, [chartData]);

  return (
    <div className="lab-container">
      <h2 className="pixel-title">Data Laboratory</h2>
      <p className="lab-subtitle">Experimental Tools & Visualizations</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1, minHeight: 0 }}>
        <Panel title="Knowledge Test">
          <Quiz count={5} />
        </Panel>
        
        <Panel title="Taxonomy Sunburst">
          <div ref={chartRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
        </Panel>
      </div>
    </div>
  );
};

export default Lab;
