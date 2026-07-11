import assert from 'node:assert/strict';
import test from 'node:test';
import { createBattleTimerRegistry } from '../src/pages/FinalChapter/battleTimers.ts';
import { advancePlayerStatusEffects } from '../src/pages/FinalChapter/battleState.ts';

type PendingTimer = { callback: () => void; cancelled: boolean };

function createFakeTimers() {
  const pending: PendingTimer[] = [];
  let nextTimer = 0;

  return {
    setTimer(callback: () => void) {
      const timer = { callback, cancelled: false };
      pending.push(timer);
      return timer;
    },
    clearTimer(timer: PendingTimer) {
      timer.cancelled = true;
    },
    flush() {
      while (nextTimer < pending.length) {
        const timer = pending[nextTimer++];
        if (!timer.cancelled) timer.callback();
      }
    },
  };
}

test('未结束的战斗会按顺序执行玩家收尾和 Boss 回合', () => {
  const fake = createFakeTimers();
  const registry = createBattleTimerRegistry(fake.setTimer, fake.clearTimer);
  const events: string[] = [];

  registry.schedule(() => {
    events.push('player-finished');
    registry.schedule(() => events.push('boss-turn'), 500);
  }, 1000);
  fake.flush();

  assert.deepEqual(events, ['player-finished', 'boss-turn']);
});

test('使用转化后自然结束战斗会取消所有待执行回合', () => {
  const fake = createFakeTimers();
  const registry = createBattleTimerRegistry(fake.setTimer, fake.clearTimer);
  const events: string[] = [];

  registry.schedule(() => events.push('post-victory-boss-turn'), 1500);
  registry.dispose();
  fake.flush();

  assert.deepEqual(events, []);
});

test('使用转化后立即结束战斗时，释放后的注册表不能排程回合', () => {
  const fake = createFakeTimers();
  const registry = createBattleTimerRegistry(fake.setTimer, fake.clearTimer);
  const events: string[] = [];

  registry.dispose();
  registry.schedule(() => events.push('stale-boss-turn'), 500);
  fake.flush();

  assert.deepEqual(events, []);
});

test('转化效果等待下一次伤害时保持可见，消费后同步移除', () => {
  const effects = [{
    id: 'damage_convert',
    name: '言灵·转化',
    icon: '🔮',
    type: 'damage_convert' as const,
    value: 30,
    remainingTurns: 1,
    source: 'player' as const,
  }];

  assert.deepEqual(advancePlayerStatusEffects(effects, true), effects);
  assert.deepEqual(advancePlayerStatusEffects(effects, false), []);
});
