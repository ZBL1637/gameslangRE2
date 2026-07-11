import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('chapter map and navigation hotspots use native controls with readable state', () => {
  const townMap = read('src/pages/PlayerTown/components/layout/TownMap.tsx');
  const cityOverview = read('src/pages/DataMetropolis/components/layout/CityOverview.tsx');
  const bazaarHub = read('src/pages/TranslationTower/components/layout/BazaarHub.tsx');
  const challengeHub = read('src/pages/TranslationTower/components/layout/ChallengeHub.tsx');

  assert.match(townMap, /<button[\s\S]*?className={`npc-wrapper dna-npc/);
  assert.match(townMap, /aria-disabled={!archiveUnlocked}/);
  assert.match(cityOverview, /<button[\s\S]*?className={`node-card/);
  assert.match(cityOverview, /disabled={!isAvailable}/);
  assert.match(bazaarHub, /aria-current={state\.currentFloor === item\.id \? 'page' : undefined}/);
  assert.match(bazaarHub, /aria-expanded={isActive}/);
  assert.match(challengeHub, /<button[\s\S]*?className={`challenge-level/);
});

test('chapter task choices expose pressed or expanded state through buttons', () => {
  const bazaarHub = read('src/pages/TranslationTower/components/layout/BazaarHub.tsx');
  const metaphor = read('src/pages/TranslationTower/components/challenges/MetaphorChallenge.tsx');
  const finalTask = read('src/pages/TranslationTower/components/layout/FinalTask.tsx');

  assert.match(bazaarHub, /className="slang-highlight"[\s\S]*?aria-label=/);
  assert.match(bazaarHub, /className="option-item"[\s\S]*?onClick=/);
  assert.match(metaphor, /aria-pressed={draggedSourceId === source\.id}/);
  assert.match(metaphor, /aria-pressed={isConnected}/);
  assert.match(finalTask, /aria-expanded={showHints\[index\]}/);
  assert.match(finalTask, /aria-pressed={selectedOptions\.includes\(option\.id\)}/);
});

test('final chapter story advance surfaces are keyboard operable', () => {
  for (const path of [
    'src/pages/FinalChapter/components/layout/VictoryScreen.tsx',
    'src/pages/FinalChapter/components/layout/DefeatScreen.tsx',
  ]) {
    const source = read(path);
    assert.match(source, /role="button"/);
    assert.match(source, /tabIndex={0}/);
    assert.match(source, /onKeyDown={handleAdvanceKeyDown}/);
  }
});

test('chapter dialogue advances have names and keyboard activation', () => {
  for (const path of [
    'src/pages/DataMetropolis/components/ui/PixelDialogBox.tsx',
    'src/pages/TranslationTower/components/ui/PixelDialogBox.tsx',
    'src/pages/PlayerTown/components/layout/OutroSection.tsx',
    'src/pages/TranslationTower/components/layout/OutroSection.tsx',
    'src/pages/TranslationTower/components/layout/SkillUnlock.tsx',
  ]) {
    const source = read(path);
    assert.match(source, /role=.*button/);
    assert.match(source, /tabIndex=/);
    assert.match(source, /onKeyDown=/);
  }
});
