import dataset from './india.json';
import type { Organization, Source } from './model';
export const sources = dataset.sources as Source[];
export const organizations = dataset.organizations as Organization[];
export const reviewedAt = dataset.reviewedAt;
