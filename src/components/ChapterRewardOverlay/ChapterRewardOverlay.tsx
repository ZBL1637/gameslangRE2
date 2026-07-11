import React from 'react';
import { ChapterReward, getChapterGrade } from '@/data/chapterProgress';
import { ACHIEVEMENTS, Achievement } from '@/data/achievements';
import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import { useModalDialog } from '@/hooks/useModalDialog';
import './ChapterRewardOverlay.scss';

interface ChapterRewardOverlayProps {
  reward: ChapterReward | null;
  onContinue: () => void;
  continueLabel?: string;
}

export const ChapterRewardOverlay: React.FC<ChapterRewardOverlayProps> = ({ reward, onContinue, continueLabel }) => {
  const dialogRef = useModalDialog<HTMLDivElement>({ active: Boolean(reward) });
  if (!reward) return null;
  const grade = getChapterGrade(reward.score, reward.chapterId);
  const achievements = reward.achievements
    .map(id => ACHIEVEMENTS.find(item => item.id === id) ?? null)
    .filter((item): item is Achievement => Boolean(item));

  return (
    <div
      className="chapter-reward-overlay"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-reward-title"
      tabIndex={-1}
    >
      <div className="chapter-reward-card">
        <div className="reward-kicker">{reward.isNewCompletion ? '章节完成' : '章节已完成'}</div>
        <h2 id="chapter-reward-title">{reward.chapterTitle}</h2>
        <div className={`reward-score grade-${grade.toLowerCase()}`}>
          <span className="score-grade">{grade}</span>
          <span>数据新闻评分：{reward.score}</span>
        </div>

        <div className="reward-grid">
          <div className="reward-item">
            <span className="label">EXP</span>
            <strong>{reward.expReward > 0 ? `+${reward.expReward}` : reward.isNewCompletion ? '已入账' : '+0'}</strong>
          </div>
          <div className="reward-item">
            <span className="label">下一章</span>
            <strong>{reward.nextChapterId ? `解锁 ${reward.nextChapterId}` : '主线收束'}</strong>
          </div>
        </div>

        {reward.skillName && (
          <div className="reward-section">
            <div className="section-title">新技能</div>
            <div className="reward-chip">{reward.skillName}</div>
          </div>
        )}

        {reward.fragments.length > 0 && (
          <div className="reward-section">
            <div className="section-title">数据碎片</div>
            <div className="fragment-list">
              {reward.fragments.map((fragment) => (
                <div key={fragment.id} className="fragment-card">
                  <span className="fragment-spark">◆</span>
                  <strong>{fragment.title}</strong>
                  <span>{fragment.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="reward-section">
            <div className="section-title">成就</div>
            <div className="achievement-list">
              {achievements.map((achievement) => (
                <span key={achievement.id}>
                  <Icon name={achievement.icon} size="sm" />
                  {achievement.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {!reward.isNewCompletion && (
          <p className="reward-note">本章奖励已经领取过，本次只保留当前探索进度。</p>
        )}

        {reward.isNewCompletion && reward.expReward === 0 && (
          <p className="reward-note">主线 EXP 已在章节任务完成时发放，本次结算同步技能、碎片与成就。</p>
        )}

        <Button size="md" onClick={onContinue}>
          {continueLabel ?? '返回世界地图'}
        </Button>
      </div>
    </div>
  );
};
