import test from 'node:test';
import assert from 'node:assert/strict';
import {
  organizations,
  sources,
  getAncestors,
  visibleOrganizations,
  searchOrganizations,
  rootFor,
} from '../data/catalog';
import { countries } from '../data/model';
import type { Organization } from '../data/model';
const index = new Map(organizations.map((n) => [n.id, n]));
const sourceIndex = new Map(sources.map((s) => [s.id, s]));
void test('catalog IDs, country registrations, parent chains and citations are valid', () => {
  assert.equal(index.size, organizations.length);
  assert.equal(sourceIndex.size, sources.length);
  for (const n of organizations) {
    assert.ok(
      countries.some((c) => c.code === n.country),
      n.id + ' country',
    );
    assert.ok(n.name && n.description, n.id + ' content');
    assert.ok(n.sourceIds.length, n.id + ' source');
    const refs = [
      ...n.sourceIds,
      ...n.relationshipSourceIds,
      ...(n.location?.sourceIds || []),
      ...(n.commander?.sourceIds || []),
    ];
    for (const ref of refs) assert.ok(sourceIndex.has(ref), n.id + ': ' + ref);
    if (n.parentId) {
      const p = index.get(n.parentId);
      assert.ok(p, n.id + ' parent exists');
      assert.equal(p.country, n.country);
      assert.equal(p.service, n.service);
      assert.ok(n.relationshipSourceIds.length);
    }
    const seen = new Set<string>();
    let current: Organization | undefined = n;
    while (current) {
      assert.ok(!seen.has(current.id), 'Cycle at ' + n.id);
      seen.add(current.id);
      current = current.parentId ? index.get(current.parentId) : undefined;
    }
    if (n.location) {
      const [lat, lng] = n.location.coordinates;
      assert.ok(Number.isFinite(lat) && lat >= -90 && lat <= 90);
      assert.ok(Number.isFinite(lng) && lng >= -180 && lng <= 180);
      assert.equal(n.location.precision, 'city');
      assert.ok(n.location.sourceIds.length);
    }
  }
  for (const s of sources) {
    assert.equal(new URL(s.url).protocol, 'https:');
    assert.ok(!Number.isNaN(Date.parse(s.accessed)));
    if (s.published)
      assert.ok(Date.parse(s.published) <= Date.parse(s.accessed));
  }
});
void test('all four modes have an independently traversable national root', () => {
  for (const svc of ['army', 'navy', 'airforce', 'ncc'] as const) {
    const root = rootFor('IN', svc);
    assert.ok(root);
    for (const n of organizations.filter(
      (o) => o.service === svc && o.id !== root.id,
    )) {
      assert.equal(getAncestors(n)[0]?.id, root.id);
    }
  }
  assert.equal(
    organizations.filter(
      (o) => o.service === 'ncc' && o.level === 'directorate',
    ).length,
    19,
  );
});
void test('naval assets and unresolved formation locations never become map points', () => {
  for (const n of organizations.filter((o) => o.level === 'asset')) {
    assert.equal(n.location, null);
    assert.equal(n.relationshipKind, 'asset-association');
  }
  for (const n of organizations.filter((o) => o.status === 'newly-approved'))
    assert.equal(n.location, null);
  assert.ok(
    visibleOrganizations(organizations, 12, null).every(
      (o) => o.level !== 'asset',
    ),
  );
});
void test('national density, selected descendants and city co-location retain every organization', () => {
  const army = organizations.filter((o) => o.service === 'army');
  const northern = index.get('in-army-northern')!;
  assert.ok(
    !visibleOrganizations(army, 4, null).some((o) => o.level === 'corps'),
  );
  assert.ok(
    visibleOrganizations(army, 4, northern).some(
      (o) => o.id === 'in-army-corps-xiv',
    ),
  );
  assert.ok(
    visibleOrganizations(army, 7, null).some(
      (o) => o.id === 'in-army-corps-xiv',
    ),
  );
  const navy = visibleOrganizations(
    organizations.filter((o) => o.service === 'navy'),
    7,
    null,
  );
  assert.ok(navy.some((o) => o.id === 'in-navy-western'));
  assert.ok(navy.some((o) => o.id === 'in-navy-fleet-western'));
});
void test('global discovery supports fleet names, aliases, cities and unmapped units', () => {
  assert.ok(
    searchOrganizations('chinar').some((o) => o.id === 'in-army-corps-xv'),
  );
  assert.ok(
    searchOrganizations('14 corps').some((o) => o.id === 'in-army-corps-xiv'),
  );
  assert.ok(
    searchOrganizations('Delhi Girls').some(
      (o) => o.service === 'ncc' && !o.location,
    ),
  );
  assert.ok(
    searchOrganizations('Visakhapatnam').some((o) => o.level === 'fleet'),
  );
  assert.deepEqual(searchOrganizations('nonexistent unit zzyx'), []);
});
void test('new country schemas do not assume Indian locations or root IDs', () => {
  const sample: Organization = {
    ...organizations[0],
    id: 'example-national',
    country: 'ZZ',
    location: null,
    parentId: null,
  };
  const child: Organization = {
    ...sample,
    id: 'example-child',
    parentId: sample.id,
    level: 'command',
  };
  assert.deepEqual(
    getAncestors(child, [sample, child]).map((n) => n.id),
    ['example-national'],
  );
});

void test('Karnataka Goa register preserves historical gaps and the engineer company hierarchy', () => {
  const groups = organizations.filter(
    (o) => o.parentId === 'in-ncc-karnataka-goa',
  );
  const ids = new Set(groups.map((o) => o.id));
  const units = organizations.filter((o) => ids.has(o.parentId || ''));
  assert.equal(groups.length, 6);
  assert.equal(units.length, 55);
  const company = index.get('in-ncc-4-kar-engineer')!;
  assert.equal(company.parentId, 'in-ncc-group-mangaluru');
  assert.equal(company.location?.name, 'Manipal');
  assert.equal(company.commander?.asOf, '2025-08-13');
  assert.equal(company.commander?.assumedOffice, undefined);
  assert.ok(searchOrganizations('4 Kar Eng Coy').includes(company));
  for (const o of organizations) {
    for (const affiliation of o.institutionalAffiliations || [])
      for (const id of affiliation.sourceIds) assert.ok(sourceIndex.has(id));
    for (const evidence of Object.values(o.evidence || {}))
      if (evidence.asOf)
        assert.ok(Date.parse(evidence.asOf) <= Date.parse(evidence.checkedAt));
    if (o.historicalAsOf)
      assert.ok(
        o.verificationGaps?.length &&
          o.evidence?.parent?.status === 'unverified',
      );
  }
});
