export interface LabelRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export function collides(a: LabelRect, b: LabelRect) {
  return (
    a.left < b.right + 8 &&
    a.right + 8 > b.left &&
    a.top < b.bottom + 7 &&
    a.bottom + 7 > b.top
  );
}
/** Keep every HQ name; crowded labels become callouts, never anonymous dots. */
export function placeLabel(
  point: { x: number; y: number },
  width: number,
  height: number,
  occupied: LabelRect[],
  viewport: LabelRect,
  preferWest = false,
) {
  const sides = preferWest ? ['west', 'east'] : ['east', 'west'];
  let best:
    | { x: number; y: number; rect: LabelRect; score: number }
    | undefined;
  for (let distance = 0; distance <= 480; distance += 24) {
    for (const outward of [0, 220, 440]) {
      for (const side of sides) {
        for (const dy of distance ? [-distance, distance] : [0]) {
          const left = Math.max(
            viewport.left,
            Math.min(
              viewport.right - width,
              side === 'west'
                ? point.x - width - 20 - outward
                : point.x + 20 + outward,
            ),
          );
          const top = Math.max(
            viewport.top,
            Math.min(viewport.bottom - height, point.y - height / 2 + dy),
          );
          const rect = { left, top, right: left + width, bottom: top + height };
          const overlaps = occupied.filter((other) =>
            collides(rect, other),
          ).length;
          const score =
            overlaps * 100000 +
            Math.abs(top + height / 2 - point.y) +
            outward * 0.7;
          const result = { x: left - point.x, y: top - point.y, rect, score };
          if (!best || score < best.score) best = result;
          if (overlaps === 0 && distance === 0 && outward === 0) return result;
        }
      }
    }
  }
  return best!;
}
