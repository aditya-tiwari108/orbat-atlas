export interface QuizItem {
  id: string;
  name: string;
  context: string;
  description: string;
  pool: string;
  image?: string;
  link: string;
  country?: string;
  service?: string;
  category?: string;
}
export interface Question {
  item: QuizItem;
  kind: 'image' | 'description';
  options: QuizItem[];
}
export function shuffle<T>(values: readonly T[], random = Math.random): T[] {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function eligibleItems(items: QuizItem[]) {
  return items.filter(
    (item) =>
      new Set(items.filter((i) => i.pool === item.pool).map((i) => i.name))
        .size >= 6,
  );
}
export function generateQuiz(
  items: QuizItem[],
  count = 10,
  random = Math.random,
): Question[] {
  return shuffle(eligibleItems(items), random)
    .slice(0, count)
    .map((item, index) => {
      const unique = new Map<string, QuizItem>();
      for (const other of shuffle(items, random)) {
        if (other.pool === item.pool && other.name !== item.name)
          unique.set(other.name, other);
      }
      const sameImage =
        item.image &&
        items.some(
          (i) =>
            i.pool === item.pool &&
            i.name !== item.name &&
            i.image === item.image,
        );
      return {
        item,
        kind:
          item.image && !sameImage && index % 2 === 0 ? 'image' : 'description',
        options: shuffle([item, ...[...unique.values()].slice(0, 5)], random),
      };
    });
}
