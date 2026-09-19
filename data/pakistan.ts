import dataset from './pakistan.json';
import type { Organization, Source } from './model';
export const organizations = dataset.organizations as Organization[];
export const sources = dataset.sources as Source[];
