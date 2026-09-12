import type { StyleSpecification } from 'maplibre-gl';
import type { CountryPresentation } from '../../../data/country-config';
export function cartoRequest(url: string, key: string) {
  const parsed = new URL(url, 'https://local.invalid');
  if (
    parsed.hostname === 'basemaps.cartocdn.com' ||
    parsed.hostname.endsWith('.basemaps.cartocdn.com')
  ) {
    if (key) parsed.searchParams.set('key', key);
    return parsed.href;
  }
  return url;
}
export function decorateStyle(
  style: StyleSpecification,
  country: CountryPresentation,
): StyleSpecification {
  // Suppress competing administrative borders and labels. The SOI overview is
  // explicitly limited to its source scale, never promoted to facility precision.
  const layers = style.layers.filter(
    (layer) =>
      !/(boundary|border|admin|country|state|province)/i.test(layer.id),
  );
  for (const layer of layers) {
    if (layer.type === 'background')
      layer.paint = { 'background-color': '#253034' };
    if (layer.type === 'fill' && /water/i.test(layer.id))
      layer.paint = { ...layer.paint, 'fill-color': '#111b22' };
    if (layer.type === 'symbol') {
      layer.minzoom = Math.max(layer.minzoom || 0, 6.8);
      layer.paint = { ...layer.paint, 'text-opacity': 0.55 };
    }
  }
  return {
    ...style,
    sources: {
      ...style.sources,
      'country-outline': {
        type: 'geojson',
        data: country.outline,
        attribution: `<a href="${country.outlineSource}" target="_blank">${country.outlineCredit}</a>`,
      },
    },
    layers: [
      ...layers,
      {
        id: 'soi-overview-land',
        type: 'fill',
        source: 'country-outline',
        maxzoom: country.outlineMaxZoom,
        paint: {
          'fill-color': '#3d4545',
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3,
            0.22,
            6,
            0.04,
          ],
        },
      },
      {
        id: 'soi-overview-outline',
        type: 'line',
        source: 'country-outline',
        maxzoom: country.outlineMaxZoom,
        paint: {
          'line-color': '#80877e',
          'line-width': 1,
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3,
            0.65,
            6,
            0.45,
            7,
            0,
          ],
        },
      },
    ],
  };
}
export function fallbackStyle(
  country: CountryPresentation,
): StyleSpecification {
  return decorateStyle(
    {
      version: 8,
      sources: {},
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#11191e' },
        },
      ],
    },
    country,
  );
}
