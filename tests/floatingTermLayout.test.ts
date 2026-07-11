import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFramePositions, pointOverlapsBlockedArea } from '../src/pages/PlayerTown/floatingTermLayout.ts';

test('漂浮热点不会生成在任务罗盘或结算面板区域内', () => {
  const blocked = [
    { left: 0, right: 32, top: 18, bottom: 62 },
    { left: 55, right: 100, top: 72, bottom: 100 },
  ];
  const randomValues = [0.1, 0.2, 0.12, 0.4, 0.8, 0.8, 0.7, 0.65];
  let randomIndex = 0;
  const random = () => randomValues[randomIndex++ % randomValues.length];

  const positions = buildFramePositions(
    [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    blocked,
    random,
  );

  assert.equal(positions.length, 3);
  for (const position of positions) {
    assert.equal(pointOverlapsBlockedArea(position, blocked), false);
  }
});

test('连续随机命中阻挡区时使用安全网格兜底', () => {
  const blocked = [{ left: 30, right: 70, top: 30, bottom: 70 }];
  const positions = buildFramePositions([{ id: 'only' }], blocked, () => 0.5);

  assert.equal(positions.length, 1);
  assert.equal(pointOverlapsBlockedArea(positions[0], blocked), false);
});

test('热点中心保持间距，避免点击命中相邻词条', () => {
  const positions = buildFramePositions(
    Array.from({ length: 6 }, (_, index) => ({ id: String(index) })),
    [],
    () => 0.5,
  );

  for (let index = 0; index < positions.length; index++) {
    for (let other = index + 1; other < positions.length; other++) {
      const xDistance = Math.abs(positions[index].x - positions[other].x);
      const yDistance = Math.abs(positions[index].y - positions[other].y);
      assert.ok(xDistance >= 12 || yDistance >= 8);
    }
  }
});
