import dataset from './india.json';
import navalAir from './india-naval-air.json';
import type { Organization, Source } from './model';
export const sources = [...dataset.sources, ...navalAir.sources] as Source[];
export const organizations = [
  ...dataset.organizations,
  ...navalAir.organizations,
] as Organization[];
export const reviewedAt = dataset.reviewedAt;
