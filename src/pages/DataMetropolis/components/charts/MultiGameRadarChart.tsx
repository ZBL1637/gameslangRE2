import React, { useEffect, useRef, useState } from 'react';
import { TERM_DISTRIBUTION_DATA, TERM_CATEGORIES } from '../../data';
import { AccessibleChartTable } from './AccessibleChartTable';
import './MultiGameRadarChart.scss';

declare global {
  interface Window {
    echarts: any;
  }
}

export const MultiGameRadarChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chartInstances = useRef<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  useEffect(() => {
    const loadECharts = async () => {
      if (!window.echarts) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise(resolve => {
          script.onload = resolve;
        });
      }
      
      initCharts();
    };

    loadECharts();

    const handleResize = () => {
      chartInstances.current.forEach(instance => {
        instance?.resize();
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstances.current.forEach(instance => {
        if (instance) instance.dispose();
      });
    };
  }, []);

  const initCharts = () => {
    if (!window.echarts) return;

    // 清理已存在的实例
    chartInstances.current.forEach(instance => {
      if (instance) instance.dispose();
    });
    chartInstances.current = [];

    // 游戏颜色
    const gameColors = [
      '#7F0056', '#A6006B', '#B5007A', '#9A0070', '#5A003D',
      '#8F0062', '#6B0049', '#4A0030', '#9A0070', '#B5007A',
      '#5A003D', '#7F0056', '#A6006B', '#5A003D'
    ];

    // 为每个游戏创建雷达图
    TERM_DISTRIBUTION_DATA.forEach((gameData, index) => {
      const container = chartRefs.current[index];
      if (!container) return;
      
      const radarChart = window.echarts.init(container);
      chartInstances.current.push(radarChart);

      // 准备当前游戏的数据
      const values = TERM_CATEGORIES.map(category => gameData.categories[category] || 0);
      const gameColor = gameColors[index % gameColors.length];

      // 计算最大值
      const maxValue = Math.max(...values);
      const radarMax = Math.ceil(maxValue * 1.2 * 10) / 10;

      // 准备雷达图指标
      const indicators = TERM_CATEGORIES.map(category => ({
        name: category.length > 6 ? category.slice(0, 6) + '...' : category,
        max: radarMax || 1
      }));

      const option = {
        aria: {
          enabled: true,
          description: `${gameData.game}的本章示意术语分类雷达图，完整数值见图后数据表。`,
        },
        title: {
          text: gameData.game,
          left: 'center',
          top: 5,
          textStyle: {
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params: any) {
            if (params.dataIndex !== undefined) {
              const category = TERM_CATEGORIES[params.dataIndex];
              const value = (parseFloat(params.value) * 100).toFixed(1);
              return `${category}: ${value}%`;
            }
            return '';
          },
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderColor: gameColor,
          textStyle: {
            color: '#fff'
          }
        },
        radar: {
          indicator: indicators,
          center: ['50%', '55%'],
          radius: '60%',
          startAngle: 90,
          splitNumber: 4,
          shape: 'polygon',
          axisName: {
            color: '#9ca3af',
            fontSize: 8
          },
          splitLine: {
            lineStyle: {
              color: '#374151',
              width: 1
            }
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(127, 0, 86, 0.02)', 'rgba(127, 0, 86, 0.05)']
            }
          },
          axisLine: {
            lineStyle: {
              color: '#4b5563',
              width: 1
            }
          }
        },
        series: [{
          name: gameData.game,
          type: 'radar',
          data: [{
            value: values,
            name: gameData.game,
            itemStyle: { color: gameColor },
            lineStyle: { color: gameColor, width: 2 },
            areaStyle: { color: `${gameColor}40` }
          }],
          symbol: 'circle',
          symbolSize: 4
        }],
        animationDuration: 800,
        animationEasing: 'cubicOut'
      };

      radarChart.setOption(option);

      // 点击事件
      radarChart.on('click', () => {
        setSelectedGame(gameData.game);
      });
    });
  };

  // 获取选中游戏的详细信息
  const getGameDetail = () => {
    if (!selectedGame) return null;
    return TERM_DISTRIBUTION_DATA.find(d => d.game === selectedGame);
  };

  const gameDetail = getGameDetail();

  return (
    <div className="multi-game-radar-chart" ref={containerRef}>
      {/* 说明文字 */}
      <div className="chart-intro">
        <p>
          本章把不同游戏的预设术语分类画成"指纹"，用于比较分布差异。
          这些静态数值不能单独证明玩法或社群文化的成因。
        </p>
      </div>
      <p className="chart-text-summary">
        文本摘要：本章示意数据中，三角洲行动的“跨游戏通用语”预设占比最高，为30.8%。
      </p>
      <AccessibleChartTable
        title="多游戏术语分类分布"
        columns={TERM_CATEGORIES}
        rows={TERM_DISTRIBUTION_DATA.map(game => ({
          id: game.game,
          label: game.game,
          values: TERM_CATEGORIES.map(category => `${((game.categories[category] || 0) * 100).toFixed(1)}%`),
        }))}
        selectedId={selectedGame}
        onSelect={setSelectedGame}
      />

      {/* 雷达图网格 */}
      <div className="radar-grid">
        {TERM_DISTRIBUTION_DATA.map((gameData, index) => (
          <div
            key={gameData.game}
            className="radar-chart-container"
            id={`multi-radar-${index}`}
            role="button"
            tabIndex={0}
            aria-label={`查看${gameData.game}术语分布`}
            aria-pressed={selectedGame === gameData.game}
            onClick={() => setSelectedGame(gameData.game)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              setSelectedGame(gameData.game);
            }}
            ref={(el) => { chartRefs.current[index] = el; }}
          />
        ))}
      </div>

      {/* 选中游戏详情 */}
      {gameDetail && (
        <div className="game-detail-panel">
          <h4>{gameDetail.game} 术语分布</h4>
          <div className="detail-list">
            {TERM_CATEGORIES.map(category => {
              const value = gameDetail.categories[category] || 0;
              if (value > 0.01) {
                return (
                  <div key={category} className="detail-item">
                    <span className="category-name">{category}</span>
                    <div className="value-bar">
                      <div 
                        className="value-fill" 
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                    <span className="value-text">{(value * 100).toFixed(1)}%</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      <div className="chart-description">
        <p>
          <strong>图表说明：</strong>
          每个雷达图展示一款游戏的术语分类分布。
          注意观察哪款游戏的"跨游戏通用语"占比最高。
        </p>
      </div>
    </div>
  );
};
