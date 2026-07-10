import type { BossSlot } from './types';

export interface BossAssemblyScores {
  clarity: number;
  culture: number;
  comms: number;
}

export interface BossAssemblyAssessment {
  translation: string;
  scores: BossAssemblyScores;
  issues: string[];
}

export function normalizeAssemblyText(parts: string[]): string {
  return parts
    .join(' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreBossAssembly(
  slots: BossSlot[],
  selectedOptions: Record<number, string>,
): BossAssemblyAssessment {
  const selected = slots.map(slot => ({
    slot,
    option: slot.options.find(option => option.id === selectedOptions[slot.id]),
  }));
  const completed = selected.filter(
    (entry): entry is { slot: BossSlot; option: BossSlot['options'][number] } => Boolean(entry.option),
  );

  if (completed.length !== slots.length) {
    return {
      translation: normalizeAssemblyText(completed.map(entry => entry.option.text)),
      scores: { clarity: 0, culture: 0, comms: 0 },
      issues: ['译文缺少必要片段，请完成全部槽位后再提交。'],
    };
  }

  const average = (field: keyof BossAssemblyScores) => Math.round(
    completed.reduce((sum, entry) => sum + entry.option.stats[field], 0) / completed.length,
  );
  const issues = completed.flatMap((entry, index) => (
    entry.option.issue
      ? [`第 ${index + 1} 处“${entry.slot.originalText}”：${entry.option.issue}`]
      : []
  ));

  return {
    translation: normalizeAssemblyText(completed.map(entry => entry.option.text)),
    scores: {
      clarity: average('clarity'),
      culture: average('culture'),
      comms: average('comms'),
    },
    issues,
  };
}
