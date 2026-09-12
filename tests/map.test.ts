import test from 'node:test';
import assert from 'node:assert/strict';
import ms from 'milsymbol';
import symbols from '../data/symbols.json';
import { militarySymbol } from '../components/explorer/symbology';
import {
  cartoRequest,
  decorateStyle,
  fallbackStyle,
} from '../components/explorer/map/style';
import { countryPresentation } from '../data/country-config';

void test('APP-6 corps and division headquarters use the correct echelon and no arbitrary function', () => {
  for (const [key, data] of Object.entries(symbols)) {
    const metadata = new ms.Symbol(data.sidc, {
      standard: 'APP6',
    }).getMetadata();
    assert.equal(metadata.headquarters, true, key);
    assert.equal(
      metadata.echelon,
      key.startsWith('corps') ? 'Corps/MEF' : 'Division',
      key,
    );
  }
  assert.equal(
    militarySymbol({ level: 'command', symbol: 'headquarters' }),
    null,
  );
  assert.equal(symbols['corps-headquarters'].sidc.slice(4, 10), 'U-----');
});
void test('CARTO key is attached only to CARTO basemap hosts', () => {
  assert.equal(
    new URL(
      cartoRequest('https://tiles.basemaps.cartocdn.com/tiles.json', 'example'),
    ).searchParams.get('key'),
    'example',
  );
  assert.equal(
    cartoRequest('https://unrelated.example/image.jpg', 'example'),
    'https://unrelated.example/image.jpg',
  );
  assert.equal(
    cartoRequest('/geography/india-soi-overview.geojson', 'example'),
    '/geography/india-soi-overview.geojson',
  );
});
void test('country outline replaces conflicting borders and respects national source scale', () => {
  const config = countryPresentation.IN;
  const style = decorateStyle(
    {
      version: 8,
      sources: {},
      layers: [
        { id: 'boundary_country', type: 'line', source: 'unused' },
        { id: 'place_state', type: 'symbol', source: 'unused' },
        { id: 'water', type: 'background' },
      ],
    },
    config,
  );
  assert.ok(
    !style.layers.some(
      (l) => l.id === 'boundary_country' || l.id === 'place_state',
    ),
  );
  assert.equal(
    style.layers.find((l) => l.id === 'soi-overview-outline')?.maxzoom,
    7,
  );
  assert.ok(fallbackStyle(config).sources['country-outline']);
});

void test('detail layers have a stable transition band and never suppress command HQs', async () => {
  const { detailAtZoom, mapOrganizations } =
    await import('../components/explorer/map/visibility');
  const { organizations } = await import('../data/catalog');
  assert.equal(detailAtZoom(6.3, 0), 1);
  assert.equal(detailAtZoom(6.0, 1), 1);
  assert.equal(detailAtZoom(5.7, 1), 0);
  assert.equal(detailAtZoom(7.5, 2), 2);
  for (const service of ['army', 'navy', 'airforce', 'ncc']) {
    const nodes = organizations.filter((o) => o.service === service);
    const overview = mapOrganizations(nodes, null, 0);
    for (const detail of [1, 2] as const) {
      const detailed = mapOrganizations(nodes, null, detail);
      assert.ok(overview.every((o) => detailed.includes(o)));
      assert.ok(detailed.every((o) => o.level !== 'asset'));
    }
  }
});

void test('NCC regions cover each state once, preserve disputed areas and match sourced records', async () => {
  const { readFileSync } = await import('node:fs');
  const { organizations } = await import('../data/catalog');
  const geo: {
    features: Array<{
      properties: {
        organizationId?: string;
        states?: string[];
        unassigned?: boolean;
      };
    }>;
  } = JSON.parse(
    readFileSync('public/geography/india-ncc-regions.geojson', 'utf8'),
  );
  const regions = geo.features.filter((f) => f.properties.organizationId);
  assert.equal(regions.length, 17);
  const states = regions.flatMap((f) => f.properties.states || []);
  assert.equal(states.length, 36);
  assert.equal(new Set(states).size, 36);
  assert.equal(geo.features.filter((f) => f.properties.unassigned).length, 4);
  for (const feature of regions) {
    const org = organizations.find(
      (o) => o.id === feature.properties.organizationId,
    )!;
    assert.equal(org.level, 'directorate');
    assert.notEqual(org.status, 'newly-approved');
    assert.equal(org.evidence?.coverage?.status, 'supported');
    assert.equal(org.geographicCoverage?.bounds?.length, 4);
    assert.ok(
      org.geographicCoverage?.sourceIds.includes('soi-abdb-states-2025'),
    );
  }
});

void test('command labels stay within a short leader of their HQ under crowding', async () => {
  const { placeLabel } = await import('../components/explorer/map/labels');
  for (const occupied of [
    [],
    [{ left: 0, top: 0, right: 1200, bottom: 900 }],
  ]) {
    const result = placeLabel({ x: 500, y: 400 }, 120, 30, occupied, {
      left: 24,
      top: 110,
      right: 1000,
      bottom: 800,
    });
    assert.ok(Math.abs(result.y + 15) <= 32);
    assert.ok(result.x === 20 || result.x === -140);
  }
});
void test('interior labels cover all published directorates separately from HQ positions', async () => {
  const { readFileSync } = await import('node:fs');
  const labels = JSON.parse(
    readFileSync('public/geography/india-ncc-labels.json', 'utf8'),
  );
  assert.equal(labels.length, 17);
  assert.equal(
    new Set(labels.map((l: { organizationId: string }) => l.organizationId))
      .size,
    17,
  );
  for (const label of labels) {
    const [lng, lat] = label.coordinates;
    for (const [w, s, e, n] of [label.bounds, label.compactBounds])
      assert.ok(lng > w && lng < e && lat > s && lat < n);
    assert.ok(label.lines.length && label.compactLines.length);
  }
});
