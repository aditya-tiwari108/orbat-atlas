import {
  rankRows,
  rankServices,
  rankCategories,
  rankCountries,
  rankAssets,
} from './model';
import type { RankRow, RankService } from './model';
import type { QuizItem } from '../quiz/engine';
export const serviceLabels = { navy: 'Navy', army: 'Army', air: 'Air Force' };
export function describeRank(row: RankRow, service: RankService) {
  const ladder = rankRows.filter(
    (r) =>
      r.country === row.country &&
      r.category === row.category &&
      r.cells[service],
  );
  const at = ladder.indexOf(row);
  const above = ladder[at - 1]?.cells[service]?.name;
  const below = ladder[at + 1]?.cells[service]?.name;
  const equivalents = rankServices
    .filter(
      (s) =>
        s !== service &&
        row.cells[s] &&
        row.cells[s]!.name !== row.cells[service]!.name,
    )
    .map((s) => `${row.cells[s]!.name} (${serviceLabels[s]})`);
  const position = [above && `below ${above}`, below && `above ${below}`]
    .filter(Boolean)
    .join(' and ');
  return `${rankCategories[row.category]} category in ${rankCountries[row.country].name}’s ${serviceLabels[service]}${row.country === 'NCC' ? ' wing' : ''}. ${position ? `In this category’s published ladder, it sits ${position}. ` : ''}${equivalents.length ? `Aligned here with ${equivalents.join(' and ')}.` : rankServices.some((s) => s !== service && row.cells[s]) ? 'Other wings use the same title at this level.' : 'No cross-service equivalent is confirmed in this comparison.'}`;
}
export const rankQuizItems: QuizItem[] = rankRows.flatMap((row) =>
  rankServices.flatMap((service) => {
    const r = row.cells[service];
    if (!r) return [];
    return [
      {
        id: r.id,
        name: r.name,
        context: `${rankCountries[row.country].name} / ${serviceLabels[service]}${row.country === 'NCC' ? ' wing' : ''} / ${rankCategories[row.category]}`,
        description: describeRank(row, service),
        pool: `${row.country}-${service}`,
        country: row.country,
        service,
        category: row.category,
        image: r.file ? rankAssets[r.file]?.path : undefined,
        link: `/ranks?country=${row.country}&rank=${row.id}`,
      },
    ];
  }),
);
