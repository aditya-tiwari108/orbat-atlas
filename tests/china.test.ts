import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  organizations,
  getChildren,
  getAncestors,
  rootFor,
} from '../data/catalog';
import { countryPresentation } from '../data/country-config';
import { mapOrganizations } from '../components/explorer/map/visibility';
import { decorateStyle } from '../components/explorer/map/style';
const nodes = organizations.filter((o) => o.country === 'CN');
const byId = new Map(nodes.map((o) => [o.id, o]));
void test('joint theaters retain administrative service parents and distinct operational component links', () => {
  assert.deepEqual(Object.keys(countryPresentation.CN.services), [
    'army',
    'navy',
    'airforce',
  ]);
  const theaters = nodes.filter((o) => o.classification === 'tri-service');
  assert.equal(theaters.length, 5);
  assert.equal(nodes.filter((o) => o.level === 'corps').length, 13);
  for (const theater of theaters) {
    assert.equal(theater.relationshipKind, 'service-affiliation');
    const children = getChildren(theater.id);
    assert.equal(
      children.length,
      ['cn-joint-western', 'cn-joint-central'].includes(theater.id) ? 2 : 3,
    );
    assert.equal(new Set(children.map((o) => o.service)).size, children.length);
    for (const component of children) {
      assert.equal(component.jointCommandId, theater.id);
      assert.equal(component.parentId, `cn-${component.service}`);
      assert.equal(component.evidence?.jointCommand?.status, 'supported');
      assert.equal(
        getAncestors(component)[0],
        rootFor('CN', component.service),
      );
    }
  }
  // Detect cycles in the combined presentation graph, not only parentId chains.
  function visit(id: string, ancestors = new Set<string>()) {
    assert.ok(!ancestors.has(id), id);
    for (const child of getChildren(id))
      visit(child.id, new Set([...ancestors, id]));
  }
  for (const service of ['army', 'navy', 'airforce'] as const)
    visit(rootFor('CN', service)!.id);
});
void test('China overview preserves five theaters without flooding the map with components or flying units', () => {
  const army = nodes.filter((o) => o.service === 'army');
  const overview = mapOrganizations(army, null, 0);
  assert.deepEqual(
    overview.map((o) => o.id).sort(),
    army
      .filter((o) => o.classification === 'tri-service')
      .map((o) => o.id)
      .sort(),
  );
  const selected = byId.get('cn-joint-eastern')!;
  assert.ok(
    mapOrganizations(army, selected, 0).some((o) => o.id === 'cn-army-eastern'),
  );
  for (const service of ['navy', 'airforce'] as const) {
    assert.equal(
      mapOrganizations(
        nodes.filter((o) => o.service === service),
        null,
        0,
      ).length,
      service === 'navy' ? 3 : 5,
    );
  }
  for (const org of nodes.filter((o) => o.aviation)) {
    assert.equal(org.level, 'brigade');
    assert.equal(org.location, null);
    assert.equal(org.parentId, org.aviation!.baseId);
    assert.equal(org.relationshipKind, 'base-association');
    assert.ok(
      mapOrganizations(nodes, org, 0).includes(byId.get(org.aviation!.baseId)!),
    );
  }
});
void test('dated China leadership and ship records exclude superseded claims and live asset positions', () => {
  assert.equal(byId.get('cn-airforce')?.commander?.name, 'General Wang Gang');
  assert.equal(byId.get('cn-airforce')?.commander?.asOf, '2026-07-03');
  assert.equal(byId.get('cn-army')?.commander, undefined);
  assert.equal(byId.get('cn-navy')?.commander, undefined);
  assert.equal(byId.get('cn-joint-eastern')?.commander?.asOf, '2026-09-04');
  assert.equal(byId.get('cn-navy-ship-18')?.parentId, 'cn-navy-southern');
  for (const org of nodes.filter((o) => o.category === 'ship')) {
    assert.equal(org.location, null);
    assert.equal(org.relationshipKind, 'asset-association');
  }
});
// Ray casting checks semantic geography independently of the GIS generation script.
function inRing([x, y]: number[], ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i],
      [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}
function contains(path: string, point: number[]) {
  const geo = JSON.parse(readFileSync('public' + path, 'utf8'));
  return geo.features.some(
    (f: {
      geometry: { type: string; coordinates: number[][][] | number[][][][] };
    }) => {
      const polygons =
        f.geometry.type === 'Polygon'
          ? [f.geometry.coordinates]
          : f.geometry.coordinates;
      return (polygons as number[][][][]).some(
        (poly) =>
          inRing(point, poly[0]) &&
          !poly.slice(1).some((r) => inRing(point, r)),
      );
    },
  );
}
void test('China excludes requested disputed areas; Pakistan retains its de facto geography without India overlay', () => {
  const cn = countryPresentation.CN,
    pk = countryPresentation.PK;
  for (const point of [
    [79, 35],
    [91.87, 27.59],
    [93.62, 27.1],
  ])
    assert.equal(contains(cn.outline, point), false);
  for (const point of [
    [116.4, 39.9],
    [91.13, 29.65],
  ])
    assert.equal(contains(cn.outline, point), true);
  for (const point of [
    [73.47, 34.37],
    [74.31, 35.92],
  ])
    assert.equal(contains(pk.outline, point), true);
  for (const config of [cn, pk]) {
    const style = decorateStyle(
      {
        version: 8,
        sources: {},
        layers: [{ id: 'boundary_country', type: 'line', source: 'unused' }],
      },
      config,
    );
    assert.ok(!style.layers.some((l) => l.id === 'boundary_country'));
    assert.equal(
      (style.sources['country-outline'] as { data: string }).data,
      config.outline,
    );
    assert.ok(!JSON.stringify(style).includes('india-soi-overview'));
  }
});
