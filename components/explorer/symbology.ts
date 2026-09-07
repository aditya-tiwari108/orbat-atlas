import type { Organization } from '../../data/model';
import symbols from '../../data/symbols.json';
// Reproducible milsymbol output. Generate with scripts/generate-symbols.mjs.
// Keep the full renderer out of the initial browser bundle.
export function militarySymbol(org: Pick<Organization, 'level' | 'symbol'>) {
  if (org.level !== 'corps' && org.level !== 'division') return null;
  const key =
    `${org.level}-${org.symbol || 'headquarters'}` as keyof typeof symbols;
  return symbols[key]?.svg || null;
}
