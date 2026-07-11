import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreBossAssembly } from '../src/pages/TranslationTower/bossAssemblerScoring.ts';
import type { BossSlot } from '../src/pages/TranslationTower/types.ts';

const slots: BossSlot[] = [
  {
    id: 1,
    originalText: '兄弟们，',
    options: [
      { id: '1b', text: 'Guys,', tags: ['domestication'], stats: { clarity: 95, culture: 40, comms: 95 } },
      { id: '1c', text: 'Everyone,', tags: ['neutral'], stats: { clarity: 90, culture: 50, comms: 95 } },
    ],
  },
  {
    id: 2,
    originalText: '这波团战',
    options: [
      { id: '2a', text: 'in this team fight,', tags: ['neutral'], stats: { clarity: 95, culture: 60, comms: 95 } },
      { id: '2b', text: 'during this clash,', tags: ['domestication'], stats: { clarity: 90, culture: 50, comms: 90 } },
    ],
  },
  {
    id: 3,
    originalText: '别上头，',
    options: [
      { id: '3a', text: "don't get overheaded,", tags: ['foreignization'], stats: { clarity: 25, culture: 90, comms: 45 }, issue: '`overheaded` 不是自然英语表达。' },
      { id: '3b', text: "don't get greedy,", tags: ['domestication'], stats: { clarity: 95, culture: 40, comms: 95 } },
      { id: '3c', text: 'stay cool,', tags: ['neutral'], stats: { clarity: 90, culture: 50, comms: 90 } },
    ],
  },
  {
    id: 4,
    originalText: '我们要猥琐发育，',
    options: [
      { id: '4a', text: 'develop wretchedly,', tags: ['foreignization'], stats: { clarity: 20, culture: 100, comms: 35 }, issue: '`develop wretchedly` 是逐字拼接，无法自然传达游戏策略。' },
      { id: '4b', text: 'play safe and farm,', tags: ['domestication'], stats: { clarity: 95, culture: 30, comms: 95 } },
      { id: '4c', text: 'turtle up,', tags: ['neutral'], stats: { clarity: 90, culture: 40, comms: 85 } },
    ],
  },
  {
    id: 5,
    originalText: '等后期。',
    options: [
      { id: '5a', text: 'and wait for late game.', tags: ['neutral'], stats: { clarity: 95, culture: 60, comms: 95 } },
      { id: '5c', text: 'and scale for late game.', tags: ['domestication'], stats: { clarity: 90, culture: 40, comms: 90 } },
    ],
  },
];

test('标准答案得到三项独立高分并组成完整句子', () => {
  const result = scoreBossAssembly(slots, { 1: '1b', 2: '2a', 3: '3b', 4: '4b', 5: '5a' });

  assert.deepEqual(result.scores, { clarity: 95, culture: 46, comms: 95 });
  assert.equal(result.translation, "Guys, in this team fight, don't get greedy, play safe and farm, and wait for late game.");
  assert.deepEqual(result.issues, []);
});

test('合法变体不会因措辞不同被判错', () => {
  const result = scoreBossAssembly(slots, { 1: '1c', 2: '2b', 3: '3c', 4: '4c', 5: '5c' });

  assert.ok(result.scores.clarity >= 85);
  assert.ok(result.scores.comms >= 85);
  assert.deepEqual(result.issues, []);
});

test('错误词形不能获得清晰度或传播值满分，并指出位置', () => {
  const result = scoreBossAssembly(slots, { 1: '1b', 2: '2a', 3: '3a', 4: '4b', 5: '5a' });

  assert.ok(result.scores.clarity < 90);
  assert.ok(result.scores.comms < 90);
  assert.match(result.issues[0], /overheaded/);
});

test('逐字拼接错误不能靠文化度掩盖，并指出位置', () => {
  const result = scoreBossAssembly(slots, { 1: '1b', 2: '2a', 3: '3b', 4: '4a', 5: '5a' });

  assert.ok(result.scores.clarity < 90);
  assert.ok(result.scores.comms < 90);
  assert.match(result.issues[0], /develop wretchedly/);
});
