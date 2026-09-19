import test from 'node:test';
import assert from 'node:assert/strict';
import { organizations, rootFor, getAncestors, sources } from '../data/catalog';
import { countryPresentation } from '../data/country-config';
import { mapOrganizations } from '../components/explorer/map/visibility';
import media from '../data/media.json';
const pakistan = organizations.filter((o) => o.country === 'PK');
const index = new Map(pakistan.map((o) => [o.id, o]));
void test('Pakistan services traverse independent roots and exclude NCC', () => {
  assert.equal(pakistan.length, 117);
  assert.deepEqual(Object.keys(countryPresentation.PK.services), [
    'army',
    'navy',
    'airforce',
  ]);
  assert.ok(!pakistan.some((o) => o.service === 'ncc'));
  for (const service of ['army', 'navy', 'airforce'] as const) {
    const root = rootFor('PK', service)!;
    assert.ok(root);
    for (const org of pakistan.filter(
      (o) => o.service === service && o !== root,
    ))
      assert.equal(getAncestors(org)[0].id, root.id);
    const portrait = media.find((a) => a.id === root.commander?.portraitId);
    assert.equal(portrait?.subject, root.commander?.name);
  }
});
void test('Pakistan field corps remain visible at overview; naval assets remain unlocated', () => {
  const army = pakistan.filter((o) => o.service === 'army');
  const overview = mapOrganizations(army, null, 0);
  assert.equal(
    overview.filter((o) => o.id.startsWith('pk-army-corps-')).length,
    9,
  );
  for (const org of pakistan.filter((o) => o.category === 'ship')) {
    assert.equal(org.location, null);
    assert.equal(org.relationshipKind, 'asset-association');
  }
});
void test('Pakistan base associations do not silently resolve conflicting command evidence', () => {
  for (const org of pakistan.filter((o) => o.aviation)) {
    assert.equal(org.parentId, org.aviation!.baseId);
    assert.ok(index.has(org.aviation!.baseId));
    assert.equal(org.location, null);
    if (org.aviation!.commandId) {
      assert.ok(index.has(org.aviation!.commandId));
      assert.equal(org.evidence?.command?.status, 'supported');
    } else assert.equal(org.evidence?.command?.status, 'conflicting');
  }
  assert.equal(
    index.get('pk-airforce-squadron-27')!.aviation!.commandId,
    undefined,
  );
  const ids = new Set(sources.map((s) => s.id));
  for (const org of pakistan)
    for (const evidence of Object.values(org.evidence || {}))
      for (const id of evidence.sourceIds)
        assert.ok(ids.has(id), `${org.id}: ${id}`);
});
