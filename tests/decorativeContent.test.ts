import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('chapter animation and background containers are hidden from the accessibility tree', () => {
  const sources = [
    ['src/pages/PlayerTown/components/layout/TownMap.tsx', 'className="crowd-npcs" aria-hidden="true"'],
    ['src/pages/DataMetropolis/components/layout/CityOverview.tsx', 'className="city-background" aria-hidden="true"'],
    ['src/pages/TranslationTower/TranslationTower.tsx', 'className="tower-background" aria-hidden="true"'],
    ['src/pages/FinalChapter/FinalChapter.tsx', 'className="chapter-background" aria-hidden="true"'],
  ] as const;

  for (const [path, expected] of sources) {
    assert.match(read(path), new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('shared icons are decorative by default without nested repeated image names', () => {
  const source = read('src/components/Icon/Icon.tsx');
  const buttonSource = read('src/components/Button/Button.tsx');
  const hudSource = read('src/components/HUDBar/HUDBar.tsx');

  assert.match(source, /aria-hidden=\{ariaLabel \? undefined : true\}/);
  assert.doesNotMatch(source, /role="img"/);
  assert.doesNotMatch(source, /aria-label="(?:lock|check|star|exp|flag|arrow|skull)"/);
  assert.match(buttonSource, /className="pixel-arrow" aria-hidden="true"/);
  assert.equal((hudSource.match(/aria-hidden="true"/g) || []).length >= 4, true);
});
