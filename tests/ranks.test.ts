import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  categoriesFor,
  filterRows,
  rankAssets,
  rankCountries,
  rankRows,
  rankServices,
  rankSources,
} from '../data/ranks/model';
void test('rank records have unique identifiers, evidence and attributed local assets', () => {
  const ids = new Set<string>();
  for (const row of rankRows) {
    assert(!ids.has(row.id));
    ids.add(row.id);
    assert(row.country in rankCountries);
    assert(categoriesFor(row.country).includes(row.category));
    assert(row.sources.length);
    for (const source of row.sources) assert(rankSources[source], source);
    assert(Object.values(row.cells).some(Boolean));
    for (const service of rankServices) {
      const c = row.cells[service];
      if (!c) continue;
      assert(!ids.has(c.id));
      ids.add(c.id);
      assert(c.name.trim());
      assert(!(c.file && c.noInsignia));
      if (c.file) {
        const a = rankAssets[c.file];
        assert(a, `Missing asset: ${c.file}`);
        assert(a.author && a.license && a.source.startsWith('https://'));
        assert(existsSync('public' + a.path));
        if (a.path.endsWith('.svg'))
          assert(
            !/<script|<foreignObject/i.test(
              readFileSync('public' + a.path, 'utf8'),
            ),
          );
      }
    }
  }
});
void test('India commissioned equivalence aligns naval Captain with Colonel, not Army Captain', () => {
  const row = filterRows('IN', 'officers', '').find(
    (r) => r.cells.navy?.name === 'Captain',
  )!;
  assert.equal(row.cells.army?.name, 'Colonel');
  assert.equal(row.cells.air?.name, 'Group Captain');
});
void test('uncertain Pakistan/NCC mappings are null, not fabricated', () => {
  const tech = rankRows.find((r) => r.id === 'pk-other-chief-tech')!;
  assert.equal(tech.cells.army, null);
  assert.equal(tech.cells.navy, null);
  const csm = rankRows.find((r) => r.id === 'ncc-cadets-csm')!;
  assert.equal(csm.cells.navy, null);
  assert.equal(csm.cells.air, null);
  for (const r of rankRows.filter((r) => r.category.startsWith('ano'))) {
    for (const c of Object.values(r.cells)) {
      assert(c);
      assert(!c.file);
      assert(!c.noInsignia);
    }
  }
});
void test('China uses post-2022 grades; country search returns full equivalent rows across categories', () => {
  const rows = filterRows('CN', 'officers', '一级上士');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].category, 'other');
  assert.equal(rows[0].cells.navy?.native, '海军一级上士');
  assert(
    !JSON.stringify(rankRows.filter((r) => r.country === 'CN')).includes(
      '四级军士长',
    ),
  );
  assert.equal(filterRows('IN', 'officers', ' warrant ').length, 3);
  assert.equal(filterRows('IN', 'officers', 'unfindable').length, 0);
});
