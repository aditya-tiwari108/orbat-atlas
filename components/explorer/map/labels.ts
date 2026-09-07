export interface LabelRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export function collides(a: LabelRect, b: LabelRect) {
  return (
    a.left < b.right + 6 &&
    a.right + 6 > b.left &&
    a.top < b.bottom + 5 &&
    a.bottom + 5 > b.top
  );
}
export function chooseLabelSide(
  point: { x: number; y: number },
  width: number,
  height: number,
  occupied: LabelRect[],
  viewport: { width: number; height: number },
  preferWest = false,
) {
  const sides = preferWest ? ['west', 'east'] : ['east', 'west'];
  for (const side of sides) {
    const left = side === 'west' ? point.x - width + 5 : point.x - 5;
    const rect = {
      left,
      top: point.y - height / 2,
      right: left + width,
      bottom: point.y + height / 2,
    };
    if (
      rect.left >= 12 &&
      rect.right <= viewport.width - 12 &&
      rect.top >= 130 &&
      rect.bottom <= viewport.height - 35 &&
      !occupied.some((other) => collides(rect, other))
    )
      return { side, rect };
  }
  return null;
}
