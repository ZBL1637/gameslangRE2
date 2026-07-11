import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('home document has accurate canonical and social metadata', () => {
  const html = read('index.html');

  assert.match(html, /<title>玩家密语：游戏黑话图鉴<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+" \/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/zbl1637\.github\.io\/gameslangRE2\/" \/>/);
  assert.match(html, /<meta property="og:title" content="玩家密语：游戏黑话图鉴" \/>/);
  assert.match(html, /<meta property="og:description" content="[^"]+" \/>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/zbl1637\.github\.io\/gameslangRE2\/" \/>/);
  assert.match(html, /<meta property="og:image" content="https:\/\/zbl1637\.github\.io\/gameslangRE2\/vite\.png" \/>/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/);
});

test('SEO metadata keeps the existing HashRouter and chapter-state behavior', () => {
  const app = read('src/App.tsx');
  const fallback = read('public/404.html');

  assert.match(app, /HashRouter as Router/);
  assert.match(fallback, /window\.location\.replace\(base \+ '#' \+ target\)/);
});
