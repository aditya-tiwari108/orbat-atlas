import { Marker, type Map as LibreMap } from 'maplibre-gl';
import type { Organization } from '../../../data/model';

interface RegionLabel {
  organizationId: string;
  coordinates: [number, number];
  bounds: [number, number, number, number];
  compactBounds: [number, number, number, number];
  lines: string[];
  compactLines: string[];
}
/** Region names occupy prevalidated interior boxes; they never imply HQ locations. */
export function connectRegionLabels(
  map: LibreMap,
  path: string | undefined,
  nodes: Organization[],
  selected: Organization | null,
  enabled: boolean,
  onSelect: (org: Organization) => void,
) {
  if (!path || !enabled) return () => {};
  const controller = new AbortController();
  const entries: {
    marker: Marker;
    el: HTMLButtonElement;
    label: RegionLabel;
  }[] = [];
  const measure = document.createElement('canvas').getContext('2d');
  const widths = new Map<string, number>();
  const textWidth = (text: string) => {
    if (!widths.has(text)) {
      if (measure) measure.font = '500 100px "Barlow Condensed"';
      widths.set(
        text,
        ((measure?.measureText(text).width ?? text.length * 65) +
          text.length * 1.5) /
          100,
      );
    }
    return widths.get(text)!;
  };
  const byId = new Map(nodes.map((o) => [o.id, o]));
  let ancestor = selected;
  while (ancestor && ancestor.level !== 'directorate')
    ancestor = byId.get(ancestor.parentId || '') || null;
  const layout = () => {
    for (const { el, label } of entries) {
      const dimensions = (bounds: RegionLabel['bounds']) => {
        const sw = map.project([bounds[0], bounds[1]]);
        const ne = map.project([bounds[2], bounds[3]]);
        return { width: Math.abs(ne.x - sw.x), height: Math.abs(sw.y - ne.y) };
      };
      // Both rectangles share a fixed geographic center and fit inside the region.
      let box = dimensions(label.bounds);
      const size = (lines: string[], area: typeof box) =>
        Math.min(
          20,
          area.width / Math.max(...lines.map(textWidth)),
          area.height / (lines.length * 1.2),
        );
      const compact = size(label.lines, box) < 12;
      const lines = compact ? label.compactLines : label.lines;
      if (compact) box = dimensions(label.compactBounds);
      const font = size(lines, box);
      if (el.dataset.text !== lines.join('|')) {
        el.replaceChildren(
          ...lines.map((text) => {
            const span = document.createElement('span');
            span.textContent = text;
            return span;
          }),
        );
        el.dataset.text = lines.join('|');
      }
      el.style.fontSize = `${font}px`;
      el.style.width = `${box.width}px`;
      el.style.visibility =
        font < 9 || label.organizationId === ancestor?.id ? 'hidden' : '';
      el.style.opacity = selected ? '.55' : '1';
    }
  };
  void fetch(path, { signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error('Region labels unavailable');
      return response.json() as Promise<RegionLabel[]>;
    })
    .then((labels) => {
      if (controller.signal.aborted) return;
      for (const label of labels) {
        const org = byId.get(label.organizationId);
        if (!org) continue;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'region-label';
        el.dataset.regionId = org.id;
        el.setAttribute('aria-label', `${org.name}, geographic region`);
        el.title = org.name;
        for (const text of label.lines) {
          const line = document.createElement('span');
          line.textContent = text;
          el.appendChild(line);
        }
        el.onclick = (event) => {
          event.stopPropagation();
          onSelect(org);
        };
        const marker = new Marker({ element: el, anchor: 'center' })
          .setLngLat(label.coordinates)
          .addTo(map);
        entries.push({ marker, el, label });
      }
      layout();
    })
    .catch(() => {
      /* Polygon selection and the complete hierarchy still work. */
    });
  void document.fonts.ready.then(() => {
    if (!controller.signal.aborted) {
      widths.clear();
      layout();
    }
  });
  map.on('move', layout);
  map.on('resize', layout);
  return () => {
    controller.abort();
    map.off('move', layout);
    map.off('resize', layout);
    entries.forEach(({ marker }) => marker.remove());
  };
}
