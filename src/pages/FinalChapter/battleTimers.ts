export interface BattleTimerRegistry<TimerId> {
  schedule: (callback: () => void, delay: number) => TimerId | null;
  dispose: () => void;
}

export function createBattleTimerRegistry<TimerId>(
  setTimer: (callback: () => void, delay: number) => TimerId,
  clearTimer: (timer: TimerId) => void,
): BattleTimerRegistry<TimerId> {
  const pending = new Set<TimerId>();
  let disposed = false;

  return {
    schedule(callback, delay) {
      if (disposed) return null;

      let timer: TimerId;
      timer = setTimer(() => {
        pending.delete(timer);
        if (!disposed) callback();
      }, delay);
      pending.add(timer);
      return timer;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      pending.forEach(clearTimer);
      pending.clear();
    },
  };
}
