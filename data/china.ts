import dataset from './china.json';
import type { Organization, Source } from './model';
export const organizations = dataset.organizations as Organization[];
export const sources = dataset.sources as Source[];
