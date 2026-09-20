import rowData from './rows.json' with { type: 'json' };
import sourceData from './sources.json' with { type: 'json' };
import assetData from './assets.json' with { type: 'json' };
export type RankCountry = 'IN' | 'PK' | 'CN' | 'NCC';
export type RankService = 'navy' | 'army' | 'air';
export type RankCategory =
  | 'officers'
  | 'other'
  | 'special'
  | 'training'
  | 'cadets'
  | 'ano'
  | 'ano-junior';
export interface Rank {
  id: string;
  name: string;
  native?: string;
  file?: string;
  note?: string;
  noInsignia?: boolean;
}
export interface RankRow {
  id: string;
  country: RankCountry;
  category: RankCategory;
  cells: Record<RankService, Rank | null>;
  sources: string[];
  note?: string | null;
}
export interface RankSource {
  id: string;
  title: string;
  url: string;
  kind: string;
  checked: string;
}
export interface RankAsset {
  path: string;
  title: string;
  source: string;
  author: string;
  license: string;
  licenseUrl: string;
  checked: string;
  modified: boolean;
}
export const rankRows = rowData as RankRow[];
export const rankSources = sourceData as Record<string, RankSource>;
export const rankAssets = assetData as Record<string, RankAsset>;
export const rankServices: RankService[] = ['navy', 'army', 'air'];
export const rankCountries: Record<
  RankCountry,
  { name: string; subtitle: string }
> = {
  IN: { name: 'India', subtitle: 'Indian Armed Forces' },
  PK: { name: 'Pakistan', subtitle: 'Pakistan Armed Forces' },
  CN: { name: 'China', subtitle: 'People’s Liberation Army' },
  NCC: { name: 'India NCC', subtitle: 'National Cadet Corps' },
};
export const rankCategories: Record<RankCategory, string> = {
  officers: 'Officers',
  other: 'Other ranks',
  special: 'Five-star ranks',
  training: 'In training',
  cadets: 'Cadets',
  ano: 'ANOs · Senior',
  'ano-junior': 'ANOs · Junior',
};
export function categoriesFor(country: RankCountry): RankCategory[] {
  return country === 'NCC'
    ? ['cadets', 'ano', 'ano-junior']
    : country === 'CN'
      ? ['officers', 'other', 'training']
      : ['officers', 'other', 'special', 'training'];
}
export function filterRows(
  country: RankCountry,
  category: RankCategory,
  query: string,
) {
  const q = query.trim().toLocaleLowerCase();
  return rankRows.filter(
    (r) =>
      r.country === country &&
      (!q
        ? r.category === category
        : Object.values(r.cells).some(
            (c) =>
              c &&
              `${c.name} ${c.native || ''}`.toLocaleLowerCase().includes(q),
          )),
  );
}
export function readRankLocation() {
  const q = new URLSearchParams(window.location.search);
  const requested = q.get('country') as RankCountry;
  const country: RankCountry = Object.hasOwn(rankCountries, requested)
    ? requested
    : 'IN';
  const category = q.get('category') as RankCategory;
  const row = rankRows.find(
    (r) => r.id === q.get('rank') && r.country === country,
  );
  return {
    country,
    category:
      row?.category ||
      (categoriesFor(country).includes(category)
        ? category
        : categoriesFor(country)[0]),
    rank: row?.id || null,
    query: q.get('q') || '',
  };
}
