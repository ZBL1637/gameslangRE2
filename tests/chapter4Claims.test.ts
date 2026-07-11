import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const data = readFileSync('src/pages/DataMetropolis/data.ts', 'utf8');
const chapterProgress = readFileSync('src/data/chapterProgress.ts', 'utf8');
const radar = readFileSync(
  'src/pages/DataMetropolis/components/charts/MultiGameRadarChart.tsx',
  'utf8',
);
const skill = readFileSync(
  'src/pages/DataMetropolis/components/layout/SkillUnlock.tsx',
  'utf8',
);

test('chapter 4 distinguishes demonstration values from real-world causes', () => {
  assert.match(chapterProgress, /本章数据不足以判定成因/);
  assert.match(chapterProgress, /不能据此推断社群成因/);
  assert.match(radar, /不能单独证明玩法或社群文化的成因/);
  assert.doesNotMatch(chapterProgress, /机制类词更容易聚集负面情绪/);
  assert.doesNotMatch(chapterProgress, /能显示压力来源与关系结构/);
  assert.doesNotMatch(radar, /反映了其玩法特点和社区文化/);
});

test('chapter 4 instructional copy avoids claims of objective or complete truth', () => {
  assert.doesNotMatch(data, /数据的真实形态/);
  assert.doesNotMatch(skill, /数据不会说谎/);
  assert.match(skill, /结合来源、口径与语境/);
});
