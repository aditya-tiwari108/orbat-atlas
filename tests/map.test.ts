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
