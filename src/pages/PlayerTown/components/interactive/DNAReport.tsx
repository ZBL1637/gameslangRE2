import React, { useEffect, useRef, useState } from 'react';
import { X, Share2, RotateCcw } from 'lucide-react';
import { DNAResult, GameGenre, QuizGameConfig } from '../../types';
import { DNA_THEMES, JARGON_BY_GENRE, PLAYER_TYPE_TAGS } from '../../data';
import './DNAReport.scss';

interface DNAReportProps {
  results: DNAResult[];
  onClose: () => void;
  onRetake?: () => void;
}

// 流派显示名称
const GENRE_DISPLAY: Record<GameGenre, string> = {
  'MOBA': 'MOBA',
  '二次元': '二次元',
  '沙盒': '沙盒',
  'FPS': 'FPS',
  '竞速': '竞速',
  '休闲': '休闲'
};

// 流派颜色
const GENRE_COLORS: Record<GameGenre, string> = {
  'MOBA': '#7F0056',
  '二次元': '#D946EF',
  '沙盒': '#3B82F6',
  'FPS': '#7F0056',
  '竞速': '#3B82F6',
  '休闲': '#D946EF'
};

export const DNAReport: React.FC<DNAReportProps> = ({ results, onClose, onRetake }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const donutContainerRef = useRef<HTMLDivElement>(null);
  const [shareText, setShareText] = useState('');
  const [quizConfig, setQuizConfig] = useState<QuizGameConfig | null>(null);
  const [sampleText, setSampleText] = useState('');
  const [traitModal, setTraitModal] = useState<{ show: boolean; title: string; reason: string; slang: string } | null>(null);
  const [donutSize, setDonutSize] = useState(220);

  const topGenre = results[0];
  const theme = DNA_THEMES[topGenre.genre];
  const axisKeyMap: Record<GameGenre, string> = {
    '休闲': 'casual',
    '竞速': 'racing',
    '二次元': 'gacha',
    'MOBA': 'moba',
    'FPS': 'fps',
    '沙盒': 'sandbox'
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const base = (import.meta as any).env?.BASE_URL ?? '/';
        const res = await fetch(`${base}reference/quizgame.json`);
        if (res.ok) {
          const data = await res.json();
          setQuizConfig(data as QuizGameConfig);
        }
      } catch {
        // ignore
      }
    };
    void loadConfig();
  }, []);

  useEffect(() => {
    const el = donutContainerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const next = Math.max(140, Math.min(220, Math.round(rect.width)));
      setDonutSize(next);
    };

    update();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => update());
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // 绘制环形图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = donutSize;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const stroke = Math.max(14, Math.round(size * 0.1));
    const radius = (size - stroke) / 2;
    const centerX = size / 2;
    const centerY = size / 2;

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 绘制背景圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = stroke;
    ctx.stroke();

    // 绘制各流派占比
    let startAngle = -Math.PI / 2; // 从顶部开始

    results.forEach(item => {
      if (item.percent > 0) {
        const sweepAngle = (item.percent / 100) * Math.PI * 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sweepAngle);
        ctx.strokeStyle = GENRE_COLORS[item.genre];
        ctx.lineWidth = stroke;
        ctx.lineCap = 'butt';
        ctx.stroke();

        startAngle += sweepAngle;
      }
    });
  }, [results, donutSize]);

  // 生成分享文案
  useEffect(() => {
    const copyMap: Record<GameGenre, string> = {
      'MOBA': '我是一个标准的 MOBA 玩家，节奏感拉满！',
      '二次元': '二次元世界的忠实信徒，为爱发电永不停歇！',
      '沙盒': '沙盒游戏建造狂魔，创造力就是我的超能力！',
      'FPS': 'FPS 射击高手，精准操作就是我的代名词！',
      '竞速': '竞速游戏速度狂，追求极限就是我的信仰！',
      '休闲': '休闲游戏佛系玩家，快乐游戏才是王道！'
    };
    setShareText(`${copyMap[topGenre.genre]} 测测你的游戏黑话基因吧~`);
  }, [topGenre]);

  // 获取随机黑话样本
  const getJargonSample = () => {
    const samples: string[] = [];
    results.slice(0, 3).forEach(item => {
      const jargons = JARGON_BY_GENRE[item.genre];
      if (jargons.length > 0) {
        const randomIndex = Math.floor(Math.random() * jargons.length);
        samples.push(jargons[randomIndex]);
      }
    });
    return samples.join(' · ');
  };
  useEffect(() => {
    setSampleText(getJargonSample());
  }, [results]);

  // 获取标签
  const getTags = () => {
    const tags: string[] = [];
    results.slice(0, 3).forEach(item => {
      tags.push(...PLAYER_TYPE_TAGS[item.genre]);
    });
    return tags.slice(0, 6);
  };

  // 分享
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '黑话DNA测试结果',
          text: shareText,
          url: window.location.href
        });
      } catch (e) {
        // 用户取消分享
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('分享文案已复制到剪贴板！');
      } catch (e) {
        alert('分享功能暂不可用');
      }
    }
  };

  return (
    <div className="dna-report-overlay">
      <div className="dna-report-modal">
        {/* 关闭按钮 */}
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="report-title">你的黑话 DNA 报告</h2>
        {/* 职业称号与一句话结论 */}
        {quizConfig && (
          <div className="profile-summary">
            <div className="profile-title">
              {quizConfig.results.axisProfiles[axisKeyMap[topGenre.genre]]?.title ?? ''}
            </div>
            <div className="profile-oneliner">
              {quizConfig.results.axisProfiles[axisKeyMap[topGenre.genre]]?.oneLiner ?? ''}
            </div>
          </div>
        )}

        {/* 环形图区域 */}
        <div className="chart-section">
          <div className="donut-container" ref={donutContainerRef}>
            <canvas 
              ref={canvasRef} 
              className="donut-chart"
            />
            <div className="center-info">
              <span className="center-label">TOP</span>
              <span className="center-genre" style={{ color: theme.accent }}>
                {GENRE_DISPLAY[topGenre.genre]}
              </span>
              <span className="center-percent">{topGenre.percent}%</span>
            </div>
          </div>

          {/* 徽章 */}
          <div className="badges-container">
            {results.slice(0, 3).map((item, index) => (
              <div 
                key={item.genre}
                className={`badge ${index === 0 ? 'rank1' : ''}`}
              >
                <span 
                  className="badge-dot"
                  style={{ background: GENRE_COLORS[item.genre] }}
                ></span>
                <span>{GENRE_DISPLAY[item.genre]} {item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 标签云 */}
        <div className="tags-section">
          <div className="tag-cloud">
            {getTags().map((tag, index) => (
              <button
                key={index}
                className="tag-chip"
                onClick={() =>
                  setTraitModal({
                    show: true,
                    title: tag,
                    reason: '触发原因：你在某题选择了对应选项',
                    slang: '相关黑话：佛系 / 躺平 / 娱乐局'
                  })
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 黑话样本与分享文案 - 合并显示 */}
        <div className="jargon-section">
          <p className="jargon-sample">{sampleText}</p>
          <div className="jargon-actions">
            <button className="action-btn outline" onClick={() => setSampleText(getJargonSample())}>换一条</button>
            <button className="action-btn accent" onClick={() => alert('已加入我的词库')}>加入词库</button>
          </div>
          
          <div className="share-divider" style={{ margin: '0.75rem 0', borderTop: '1px dashed rgba(255,255,255,0.1)' }}></div>
          
          <p className="share-copy" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
            "{shareText}"
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="actions">
          {onRetake && (
            <button className="action-btn retake" onClick={onRetake}>
              <RotateCcw size={18} />
              重新测试
            </button>
          )}
          <button className="action-btn share" onClick={handleShare}>
            <Share2 size={18} />
            分享结果
          </button>
          <button className="action-btn continue" onClick={onClose}>
            继续探索
          </button>
        </div>
        {/* Trait 解释弹卡 */}
        {traitModal?.show && (
          <div className="trait-modal">
            <div className="trait-card">
              <h4>{traitModal.title}</h4>
              <p>{traitModal.reason}</p>
              <p>{traitModal.slang}</p>
              <div className="trait-actions">
                <button className="action-btn outline" onClick={() => setTraitModal(null)}>关闭</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
