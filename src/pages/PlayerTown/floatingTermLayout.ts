export interface PercentRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface TermPosition {
  id: string;
  x: number;
  y: number;
  speed: number;
  delay: number;
  direction: number;
}

export function pointOverlapsBlockedArea(
  point: Pick<TermPosition, 'x' | 'y'>,
  blockedAreas: PercentRect[],
): boolean {
  return blockedAreas.some(area => (
    point.x >= area.left
    && point.x <= area.right
    && point.y >= area.top
    && point.y <= area.bottom
  ));
}

export function buildFramePositions(
  terms: Array<{ id: string }>,
  blockedAreas: PercentRect[],
  random: () => number = Math.random,
  minimumSpacing: { x: number; y: number } = { x: 12, y: 8 },
): TermPosition[] {
  const safe = { left: 8, right: 92, top: 18, bottom: 88 };
  const fallbackPoints: Array<{ x: number; y: number }> = [];
  const occupiedAreas: PercentRect[] = [];

  for (let y = safe.top; y <= safe.bottom; y += 7) {
    for (let x = safe.left; x <= safe.right; x += 7) {
      const point = { x, y };
      if (!pointOverlapsBlockedArea(point, blockedAreas)) fallbackPoints.push(point);
    }
  }

  const randomPoint = () => ({
    x: safe.left + ((random() + random()) / 2) * (safe.right - safe.left),
    y: safe.top + ((random() + random()) / 2) * (safe.bottom - safe.top),
  });

  return terms.map((term, index) => {
    let point = randomPoint();
    let attempts = 0;
    const isUnavailable = () => pointOverlapsBlockedArea(point, [...blockedAreas, ...occupiedAreas]);

    while (isUnavailable() && attempts < 40) {
      point = randomPoint();
      attempts++;
    }
    if (isUnavailable() && fallbackPoints.length > 0) {
      point = fallbackPoints.find(candidate => (
        !pointOverlapsBlockedArea(candidate, [...blockedAreas, ...occupiedAreas])
      )) ?? fallbackPoints[index % fallbackPoints.length];
    }

    occupiedAreas.push({
      left: point.x - (minimumSpacing.x - 0.5),
      right: point.x + (minimumSpacing.x - 0.5),
      top: point.y - (minimumSpacing.y - 0.5),
      bottom: point.y + (minimumSpacing.y - 0.5),
    });

    return {
      id: term.id,
      ...point,
      speed: 0.5 + random() * 1.5,
      delay: index * 0.12,
      direction: random() > 0.5 ? 1 : -1,
    };
  });
}
