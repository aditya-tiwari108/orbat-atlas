import type { Map as LibreMap, MapLayerMouseEvent } from 'maplibre-gl';
import type { Organization } from '../../../data/model';
import type { CountryPresentation } from '../../../data/country-config';

/** The country configuration supplies published regions; the renderer knows no borders. */
export function connectRegions(
  map: LibreMap,
  config: NonNullable<CountryPresentation['regions']>[string] | undefined,
  nodes: Organization[],
  selected: Organization | null,
  onSelect: (org: Organization) => void,
) {
  if (!config) return () => {};
  const source = 'organization-regions';
  const fill = 'organization-region-fill';
  const line = 'organization-region-outline';
  const byId = new Map(nodes.map((o) => [o.id, o]));
  let parent = selected;
  while (parent && !parent.geographicCoverage?.geometryPath)
    parent = parent.parentId ? byId.get(parent.parentId) || null : null;
  if (!map.getSource(source)) {
    map.addSource(source, {
      type: 'geojson',
      data: config.path,
      attribution: `<a href="${config.sourceUrl}" target="_blank">${config.credit}</a>`,
      promoteId: 'organizationId',
    });
    map.addLayer({
      id: fill,
      type: 'fill',
      source,
      maxzoom: config.maxZoom,
      paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.3 },
    });
    map.addLayer({
      id: line,
      type: 'line',
      source,
      maxzoom: config.maxZoom,
      paint: { 'line-color': '#b1acbf', 'line-width': 1, 'line-opacity': 0.55 },
    });
  }
  for (const id of ['soi-overview-land', 'soi-overview-outline'])
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
  map.setLayoutProperty(fill, 'visibility', 'visible');
  map.setLayoutProperty(line, 'visibility', 'visible');
  map.setPaintProperty(fill, 'fill-opacity', [
    'case',
    ['==', ['get', 'organizationId'], parent?.id || ''],
    0.55,
    0.22,
  ]);
  map.setPaintProperty(line, 'line-width', [
    'case',
    ['==', ['get', 'organizationId'], parent?.id || ''],
    2,
    1,
  ]);
  const click = (e: MapLayerMouseEvent) => {
    if ((e.originalEvent.target as HTMLElement)?.closest('.map-organization'))
      return;
    const org = byId.get(String(e.features?.[0]?.properties.organizationId));
    if (org) onSelect(org);
  };
  const enter = () => {
    map.getCanvas().style.cursor = 'pointer';
  };
  const leave = () => {
    map.getCanvas().style.cursor = '';
  };
  map.on('click', fill, click);
  map.on('mouseenter', fill, enter);
  map.on('mouseleave', fill, leave);
  return () => {
    map.off('click', fill, click);
    map.off('mouseenter', fill, enter);
    map.off('mouseleave', fill, leave);
    if (map.getLayer(fill)) map.setLayoutProperty(fill, 'visibility', 'none');
    if (map.getLayer(line)) map.setLayoutProperty(line, 'visibility', 'none');
    for (const id of ['soi-overview-land', 'soi-overview-outline'])
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible');
    map.getCanvas().style.cursor = '';
  };
}
