import test from 'node:test';
import assert from 'node:assert/strict';
import {
  organizations,
  sources,
  getAncestors,
  searchOrganizations,
} from '../data/catalog';
import { mapOrganizations } from '../components/explorer/map/visibility';
const byId = new Map(organizations.map((o) => [o.id, o]));
const sourceIds = new Set(sources.map((s) => s.id));

void test('flying units have independently sourced base, command and aircraft associations', () => {
  const squadrons = organizations.filter(
    (o) => o.country === 'IN' && o.aviation,
  );
  assert.equal(squadrons.length, 40);
  for (const org of squadrons) {
    const aviation = org.aviation!;
    const base = byId.get(aviation.baseId)!;
    const command = byId.get(aviation.commandId!)!;
    assert.equal(base.category, 'air-station', org.id);
    assert.equal(command.level, 'command', org.id);
    assert.equal(command.service, org.service);
    assert.equal(base.country, org.country);
    assert.equal(org.parentId, base.id);
    assert.equal(org.relationshipKind, 'base-association');
    assert.equal(org.location, null);
    assert.ok(getAncestors(org).includes(command));
    for (const field of ['base', 'command', 'aircraft'] as const) {
      assert.ok(org.evidence?.[field]?.sourceIds.length, org.id + field);
      for (const id of org.evidence![field]!.sourceIds)
        assert.ok(sourceIds.has(id));
    }
    for (const detail of [0, 1, 2] as const) {
      const visible = mapOrganizations(organizations, org, detail);
      assert.ok(visible.includes(base));
      assert.ok(!visible.includes(org));
      assert.ok(!visible.some((o) => o.level === 'asset'));
    }
  }
});

void test('ships remain unlocated, document fleet associations and never use their namesake as a location', () => {
  const ships = organizations.filter(
    (o) => o.country === 'IN' && o.category === 'ship',
  );
  assert.equal(ships.length, 27);
  for (const ship of ships) {
    assert.equal(ship.location, null);
    assert.equal(ship.relationshipKind, 'asset-association');
    assert.ok(ship.vessel?.shipClass);
    assert.ok(ship.relationshipSourceIds.length);
  }
  assert.equal(
    byId.get('in-navy-ship-visakhapatnam')!.parentId,
    'in-navy-fleet-western',
  );
  assert.equal(
    byId.get('in-navy-ship-delhi')!.parentId,
    'in-navy-fleet-eastern',
  );
  assert.equal(byId.get('in-navy-base-rajali')!.parentId, 'in-navy-eastern');
  assert.equal(byId.get('in-navy-base-valsura')!.parentId, 'in-navy-southern');
});

void test('new detail does not crowd the national view and is discoverable by aircraft or nickname', () => {
  for (const [service, count] of [
    ['navy', 4],
    ['airforce', 7],
  ] as const) {
    const visible = mapOrganizations(
      organizations.filter((o) => o.country === 'IN' && o.service === service),
      null,
      0,
    );
    assert.equal(visible.length, count);
    assert.ok(visible.every((o) => o.level === 'command'));
  }
  assert.ok(
    searchOrganizations('Rafale').some(
      (o) => o.id === 'in-airforce-squadron-17',
    ),
  );
  assert.ok(
    searchOrganizations('Golden Arrows').some(
      (o) => o.id === 'in-airforce-squadron-17',
    ),
  );
  assert.equal(
    byId.get('in-airforce-squadron-18')!.aviation!.baseId,
    'in-airforce-base-naliya',
  );
});
