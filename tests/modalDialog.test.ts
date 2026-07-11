import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('shared modal behavior enters, traps, closes and restores focus', () => {
  const source = read('src/hooks/useModalDialog.ts');

  assert.match(source, /document\.activeElement/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /event\.key !== 'Tab'/);
  assert.match(source, /previouslyFocused\.focus/);
});

test('key chapter overlays use labelled modal semantics and shared focus behavior', () => {
  for (const path of [
    'src/components/ChapterRewardOverlay/ChapterRewardOverlay.tsx',
    'src/pages/PlayerTown/components/visuals/FloatingTerms.tsx',
    'src/pages/PlayerTown/components/interactive/AIQueryPanel.tsx',
    'src/pages/DataMetropolis/components/layout/DataNodeExplorer.tsx',
    'src/pages/FinalChapter/components/battle/SkillPanel.tsx',
  ]) {
    const source = read(path);
    assert.match(source, /useModalDialog/);
    assert.match(source, /role="dialog"/);
    assert.match(source, /aria-modal="true"/);
    assert.match(source, /aria-labelledby=/);
  }
});
