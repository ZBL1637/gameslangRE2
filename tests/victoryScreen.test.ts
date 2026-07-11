import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('../src/pages/FinalChapter/components/layout/VictoryScreen.tsx', import.meta.url),
  'utf8',
);

test('胜利总结不会通过定时器自动离页', () => {
  assert.doesNotMatch(source, /setTimeout\s*\(/);
  assert.match(source, /返回世界地图/);
  assert.match(source, /重新挑战/);
});

test('总结出现时提供可编程聚焦区域', () => {
  assert.match(source, /tabIndex=\{-1\}/);
  assert.match(source, /focus\(/);
});
