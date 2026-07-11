import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const dataSource = readFileSync('src/pages/DataMetropolis/data.ts', 'utf8');
const explorerSource = readFileSync(
  'src/pages/DataMetropolis/components/layout/DataNodeExplorer.tsx',
  'utf8',
);

test('chapter 4 labels unverified chart values as game demonstrations', () => {
  assert.match(dataSource, /游戏化示意，不代表真实统计/);
  assert.match(dataSource, /未提供原始样本/);
  assert.match(dataSource, /采集时间/);
  assert.match(dataSource, /标注方法/);
  assert.match(dataSource, /计算脚本/);
  assert.match(explorerSource, /CHAPTER4_DATA_NOTE/);
  assert.match(explorerSource, /className="data-provenance-note"/);
});

test('chapter 4 does not claim an unverifiable population scale', () => {
  assert.doesNotMatch(dataSource, /亿万玩家/);
});
