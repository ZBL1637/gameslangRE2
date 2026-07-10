import type { StatusEffect } from './types';

export function advancePlayerStatusEffects(
  statusEffects: StatusEffect[],
  damageConvertActive: boolean,
): StatusEffect[] {
  return statusEffects
    .map(effect => {
      if (effect.type === 'damage_convert' && damageConvertActive) return effect;
      return { ...effect, remainingTurns: effect.remainingTurns - 1 };
    })
    .filter(effect => effect.remainingTurns > 0);
}
