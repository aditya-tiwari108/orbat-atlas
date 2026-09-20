import ms from 'milsymbol';
import { symbolCode, defaultSettings } from '../../data/symbology/catalog';
import type {
  SymbolRecord,
  SymbolSettings,
} from '../../data/symbology/catalog';
const cache = new Map<string, string>();
export function symbolSVG(
  record: SymbolRecord,
  settings: SymbolSettings = defaultSettings,
) {
  return new ms.Symbol(symbolCode(record, settings), {
    standard: 'APP6',
    size: 80,
    strokeWidth: 3,
    outlineWidth: 3,
    outlineColor: '#dfe7e2',
  }).asSVG();
}
export function symbolImage(
  record: SymbolRecord,
  settings: SymbolSettings = defaultSettings,
) {
  const code = symbolCode(record, settings);
  if (!cache.has(code)) {
    if (cache.size > 500) cache.clear();
    cache.set(
      code,
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(symbolSVG(record, settings))}`,
    );
  }
  return cache.get(code)!;
}
