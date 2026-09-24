import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Mesh, Vector3 } from 'three';
import {
  weapons,
  cartridges,
  cartridgeById,
  matchWeapon,
} from '../data/armoury/catalog';
import { armouryCountries, weaponCategories } from '../data/armoury/model';
import { armsSources } from '../data/armoury/sources';
import {
  weaponGeometry,
  cartridgeGeometry,
} from '../components/armoury/geometry';

void test('catalogue relationships and field references resolve without duplicate identities', () => {
  for (const collection of [weapons, cartridges]) {
    assert.equal(new Set(collection.map((r) => r.id)).size, collection.length);
    for (const r of collection) {
      assert(r.description.length > 50, r.id);
      assert(r.sources.length > 0, r.id);
      for (const source of r.sources)
        assert(armsSources[source], `${r.id}: ${source}`);
    }
  }
  for (const w of weapons) {
    assert(cartridgeById[w.cartridge], w.id);
    assert(weaponCategories[w.category], w.id);
    for (const country of w.countries) assert(armouryCountries[country]);
    for (const fact of [
      w.action,
      w.mass,
      w.length,
      w.barrel,
      w.feed,
      w.cyclic,
      w.modes,
    ]) {
      if (fact) assert(armsSources[fact.source], `${w.id}: ${fact.source}`);
    }
    for (const measurement of [w.mass, w.length]) {
      if (measurement) {
        assert(measurement.configuration.length > 0, w.id);
        if (measurement.metric !== undefined)
          assert(measurement.metric > 0, w.id);
      }
    }
    if (w.model) {
      assert.match(w.model.uid, /^[a-f0-9]{32}$/);
      assert(w.model.author && w.model.license && w.model.url);
    }
  }
  for (const source of Object.values(armsSources))
    assert.equal(new URL(source.url).protocol, 'https:');
});

void test('all five country filters and the separate NCC trainer variants remain discoverable', () => {
  for (const country of Object.keys(armouryCountries)) {
    const found = weapons.filter((w) => matchWeapon(w, '', country, 'all'));
    assert(found.length >= 3, country);
    assert(found.every((w) => w.countries.includes(country as never)));
  }
  const trainers = weapons.filter((w) =>
    matchWeapon(w, '.22', 'IN', 'trainer'),
  );
  assert.deepEqual(
    trainers.map((w) => w.id),
    ['22-no2', '22-deluxe', '22-sporting'],
  );
  assert.equal(
    trainers[0].feed,
    undefined,
    'Disputed No. II feed capacity must not become a verified specification',
  );
  assert(
    weapons.some(
      (w) => w.id === 'ak-203' && matchWeapon(w, 'AK203', 'all', 'all'),
    ),
  );
  assert.equal(
    weapons.filter((w) => matchWeapon(w, '7.62 39', 'all', 'all'))[0].id,
    'ak-203',
  );
});

void test('every specimen builds finite, bounded geometry and identifies exterior parts', () => {
  for (const record of [...weapons, ...cartridges]) {
    const object =
      'profile' in record ? weaponGeometry(record) : cartridgeGeometry(record);
    const size = new Box3().setFromObject(object).getSize(new Vector3());
    assert(
      [size.x, size.y, size.z].every(
        (v) => Number.isFinite(v) && v > 0 && v < 10,
      ),
      record.id,
    );
    let meshes = 0;
    object.traverse((o) => {
      if (o instanceof Mesh) {
        meshes++;
        assert(o.name, record.id);
        const positions = o.geometry.getAttribute('position');
        assert(Array.from(positions.array).every(Number.isFinite), record.id);
        o.geometry.dispose();
        for (const material of Array.isArray(o.material)
          ? o.material
          : [o.material])
          material.dispose();
      }
    });
    assert(meshes >= 4, record.id);
  }
});
