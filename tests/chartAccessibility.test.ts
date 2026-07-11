import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');
const chartPaths = [
  'src/pages/DataMetropolis/components/charts/TermDistributionChart.tsx',
  'src/pages/DataMetropolis/components/charts/SentimentDistributionChart.tsx',
  'src/pages/DataMetropolis/components/charts/CategorySentimentChart.tsx',
  'src/pages/DataMetropolis/components/charts/MultiGameRadarChart.tsx',
];

test('every chapter 4 chart exposes a text summary and data table', () => {
  for (const path of chartPaths) {
    const source = read(path);
    assert.match(source, /AccessibleChartTable/);
    assert.match(source, /className="chart-text-summary"/);
  }
});

test('chart series use non-color encodings and readable selection state', () => {
  const term = read(chartPaths[0]);
  const sentiment = read(chartPaths[1]);
  const category = read(chartPaths[2]);
  const multi = read(chartPaths[3]);

  assert.match(term, /decal:/);
  assert.match(sentiment, /formatter: '\{b\}: \{d\}%'/);
  assert.match(sentiment, /decal:/);
  assert.match(category, /type: 'dashed'/);
  assert.match(category, /symbol: 'triangle'/);
  assert.match(multi, /aria-pressed={selectedGame === gameData\.game}/);
});
