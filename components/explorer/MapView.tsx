import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as LibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(workerUrl);
import { LocateFixed, Minus, Plus, RotateCcw } from 'lucide-react';
import type { Organization, Service } from '../../data/model';
import type { CountryPresentation } from '../../data/country-config';
import { militarySymbolGraphic } from './symbology';
import { cartoRequest, decorateStyle, fallbackStyle } from './map/style';
import { connectRegions } from './map/regions';
import { placeLabel, type LabelRect } from './map/labels';
import { detailAtZoom, mapOrganizations, type Detail } from './map/visibility';
interface Props {
  country: CountryPresentation;
  nodes: Organization[];
  selected: Organization | null;
  service: Service;
  onSelect: (o: Organization) => void;
  onBrowse: () => void;
  labels: boolean;
  reset: number;
}
function viewportPadding(selected: boolean) {
  const mobile = window.innerWidth < 760;
  return {
    top: mobile ? 168 : selected ? 155 : 100,
    bottom: mobile && selected ? window.innerHeight * 0.54 + 45 : 85,
    left: mobile ? 30 : 100,
    right: !mobile && selected ? 450 : mobile ? 30 : 100,
  };
}
export default function MapView({
  country,
  nodes,
  selected,
  service,
  onSelect,
  onBrowse,
  labels,
  reset,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<LibreMap | null>(null);
  const markers = useRef(
    new Map<
      string,
      {
        marker: Marker;
        signature: string;
        org: Organization;
        el: HTMLButtonElement;
        command: boolean;
      }
    >(),
  );
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [fatal, setFatal] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [detail, setDetail] = useState<Detail>(0);
  const [overlap, setOverlap] = useState<Organization[]>([]);
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    const markerStore = markers.current;
    let cancelled = false;
    const controller = new AbortController();
    let instance: LibreMap | null = null;
    async function start() {
      let style = fallbackStyle(country);
      const key = import.meta.env.VITE_CARTO_API_KEY || '';
      try {
        const response = await fetch(
          cartoRequest(
            'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            key,
          ),
          {
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(12000),
            ]),
          },
        );
        if (!response.ok) throw new Error('style');
        style = decorateStyle(await response.json(), country);
      } catch {
        if (controller.signal.aborted) return;
        setError(
          'Basemap unavailable. The public outline and organizations remain available.',
        );
      }
      if (cancelled || !host.current) return;
      try {
        instance = new maplibregl.Map({
          container: host.current,
          style,
          center: [80, 23],
          zoom: 4,
          minZoom: 2.6,
          maxZoom: 9,
          attributionControl: false,
          renderWorldCopies: false,
          transformRequest: (url) => ({ url: cartoRequest(url, key) }),
        });
        map.current = instance;
        const observer = new ResizeObserver(() => instance?.resize());
        observer.observe(host.current);
        instance.once('remove', () => observer.disconnect());
        instance.addControl(
          new maplibregl.AttributionControl({
            compact: true,
          }),
          'bottom-right',
        );
        instance.on('style.load', () => {
          if (cancelled || !instance) return;
          setReady(true);
          instance.fitBounds(country.bounds, {
            padding: viewportPadding(false),
            duration: 0,
          });
        });
        instance.on('movestart', () => setOverlap([]));
        instance.on('moveend', () => {
          if (instance) {
            setDetail((previous) =>
              detailAtZoom(instance!.getZoom(), previous),
            );
          }
        });
        instance.on('error', () => {
          if (!cancelled)
            setError(
              'Some map detail could not load. Organizations and the hierarchy are still available.',
            );
        });
      } catch {
        setFatal(true);
        setError(
          'Interactive map is unavailable in this browser. Explore every organization in the hierarchy.',
        );
      }
    }
    void start();
    return () => {
      cancelled = true;
      controller.abort();
      markerStore.forEach(({ marker }) => marker.remove());
      markerStore.clear();
      instance?.remove();
      map.current = null;
    };
  }, [country, attempt]);
  useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (selected?.geographicCoverage?.bounds) {
      m.fitBounds(selected.geographicCoverage.bounds, {
        padding: viewportPadding(true),
        maxZoom: 6.5,
        duration: reduced ? 0 : 1100,
      });
    } else if (selected?.location) {
      const [lat, lng] = selected.location.coordinates;
      const children = nodes.filter(
        (o) => o.parentId === selected.id && o.location && o.level !== 'asset',
      );
      if (
        children.length &&
        (selected.level === 'command' || selected.level === 'directorate')
      ) {
        const bounds = new maplibregl.LngLatBounds([lng, lat], [lng, lat]);
        children.forEach((o) =>
          bounds.extend([
            o.location!.coordinates[1],
            o.location!.coordinates[0],
          ]),
        );
        m.fitBounds(bounds, {
          padding: viewportPadding(true),
          maxZoom: 6,
          duration: reduced ? 0 : 1100,
        });
      } else
        m.fitBounds(
          [
            [lng, lat],
            [lng, lat],
          ],
          {
            maxZoom:
              selected.level === 'command' || selected.level === 'directorate'
                ? 5.5
                : 6.5,
            padding: viewportPadding(true),
            duration: reduced ? 0 : 1100,
          },
        );
    } else if (!selected)
      m.fitBounds(country.bounds, {
        padding: viewportPadding(false),
        duration: reduced ? 0 : 950,
      });
  }, [ready, selected, service, reset, country, nodes]);
  useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;
    const config = country.regions?.[service];
    return connectRegions(m, config, nodes, selected, (o) =>
      selectRef.current(o),
    );
  }, [ready, country, service, nodes, selected]);
  useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;
    const shown = mapOrganizations(nodes, selected, detail);
    const groups = new Map<string, Organization[]>();
    for (const org of shown) {
      const key = org.location!.coordinates.map((n) => n.toFixed(2)).join(',');
      groups.set(key, [...(groups.get(key) || []), org]);
    }
    const retained = new Set<string>();
    for (const [key, group] of groups) {
      // A colocated fleet/corps must not replace its command when detail appears.
      const o =
        group.find((x) => x.level === 'command' || x.level === 'directorate') ||
        group.find((x) => x.id === selected?.id) ||
        group[0];
      retained.add(key);
      const signature =
        group.map((x) => x.id).join('|') + ':' + selected?.id + ':' + labels;
      const existing = markers.current.get(key);
      if (existing?.signature === signature) continue;
      if (existing && existing.org.id === o.id) {
        // Keep the actual button (and keyboard focus) when its shared-HQ list changes.
        existing.signature = signature;
        existing.el.classList.toggle(
          'active',
          group.some((x) => x.id === selected?.id),
        );
        existing.el.classList.toggle('no-label', !labels);
        existing.el.setAttribute(
          'aria-label',
          group.length > 1
            ? `${group.length} headquarters in ${o.location!.name}`
            : `${o.name}, headquarters ${o.location!.name}`,
        );
        existing.el.querySelector('em')?.remove();
        if (group.length > 1) {
          const count = document.createElement('em');
          count.textContent = `+${group.length - 1}`;
          existing.el.appendChild(count);
        }
        existing.el.onclick = (event) => {
          event.stopPropagation();
          if (group.length > 1) setOverlap(group);
          else selectRef.current(o);
        };
        continue;
      }
      existing?.marker.remove();
      const command = o.level === 'command' || o.level === 'directorate';
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `map-organization ${command ? 'command-label' : 'formation-label'} ${group.some((x) => x.id === selected?.id) ? 'active' : ''} ${labels ? '' : 'no-label'}`;
      el.dataset.organizationId = o.id;
      el.setAttribute(
        'aria-label',
        group.length > 1
          ? `${group.length} headquarters in ${o.location!.name}`
          : `${o.name}, headquarters ${o.location!.name}`,
      );
      if (
        command &&
        [
          'in-army-south-western',
          'in-army-western',
          'in-navy-western',
        ].includes(o.id)
      )
        el.classList.add('label-west');
      const symbol = militarySymbolGraphic(o);
      if (symbol) {
        const s = document.createElement('span');
        s.className = 'mil-symbol';
        s.innerHTML = symbol.svg;
        // milsymbol's HQ reference is the foot of the staff, not the SVG center.
        const scale = Math.min(46 / symbol.size.width, 47 / symbol.size.height);
        s.style.width = `${symbol.size.width * scale}px`;
        s.style.height = `${symbol.size.height * scale}px`;
        s.style.left = `${5 - symbol.anchor.x * scale}px`;
        s.style.top = `${5 - symbol.anchor.y * scale}px`;
        el.appendChild(s);
      } else {
        const point = document.createElement('span');
        point.className = 'hq-point';
        el.appendChild(point);
      }
      const text = document.createElement('span');
      text.className = 'marker-text';
      const title = document.createElement('strong');
      title.textContent =
        country.mapLabels?.[o.id] ||
        (command
          ? o.shortName
              .replace(/ Command$/, '')
              .replace(/ NCC Directorate$/, '')
          : o.shortName);
      const sub = document.createElement('small');
      sub.textContent =
        o.classification === 'tri-service'
          ? 'TRI-SERVICE COMMAND'
          : `${o.location!.name}${command ? ' · HQ' : ''}`;
      text.appendChild(title);
      text.appendChild(sub);
      el.appendChild(text);
      if (group.length > 1) {
        const count = document.createElement('em');
        count.textContent = `+${group.length - 1}`;
        el.appendChild(count);
      }
      el.onclick = (event) => {
        event.stopPropagation();
        if (group.length > 1) setOverlap(group);
        else selectRef.current(o);
      };
      const [lat, lng] = o.location!.coordinates;
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(m);
      {
        const line = document.createElement('span');
        line.className = 'label-leader';
        line.setAttribute('aria-hidden', 'true');
        el.prepend(line);
      }
      markers.current.set(key, { marker, signature, org: o, el, command });
    }
    for (const [key, entry] of markers.current) {
      if (!retained.has(key)) {
        entry.marker.remove();
        markers.current.delete(key);
      }
    }
    function layoutLabels() {
      const occupied: LabelRect[] = [];
      const context = document
        .querySelector('.map-context')
        ?.getBoundingClientRect();
      if (context) occupied.push(context);
      for (const overlay of document.querySelectorAll(
        '.map-controls, .non-territorial, .bottom-controls',
      ))
        occupied.push(overlay.getBoundingClientRect());
      const width = host.current!.clientWidth;
      const height = host.current!.clientHeight;
      const viewport = {
        left: 24,
        top: 110,
        right: width - (selected && width >= 760 ? 425 : 65),
        bottom: height - (selected && width < 760 ? height * 0.54 + 20 : 80),
      };
      // Fixed geographic order prevents data ordering or newly visible units from
      // changing which command gets first choice of space.
      const entries = [...markers.current.values()].sort(
        (a, b) =>
          Number(b.org.id === selected?.id) -
            Number(a.org.id === selected?.id) ||
          Number(b.command) - Number(a.command) ||
          b.org.location!.coordinates[0] - a.org.location!.coordinates[0],
      );
      // Reserve every visible HQ anchor as well as the labels. A callout must
      // not cover a different organization's click target.
      for (const { org, el } of markers.current.values()) {
        const p = m.project([
          org.location!.coordinates[1],
          org.location!.coordinates[0],
        ]);
        if (p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height) {
          const glyph = el.querySelector('.mil-symbol');
          if (glyph) occupied.push(glyph.getBoundingClientRect());
          occupied.push({
            left: p.x - 8,
            right: p.x + 8,
            top: p.y - 8,
            bottom: p.y + 8,
          });
        }
      }
      for (const { org, el } of entries) {
        const point = m.project([
          org.location!.coordinates[1],
          org.location!.coordinates[0],
        ]);
        const text = el.querySelector<HTMLElement>('.marker-text')!;
        const line = el.querySelector<HTMLElement>('.label-leader')!;
        // Labels leave the viewport with their real HQ, never detach to an edge.
        const outside =
          point.x < 0 || point.x > width || point.y < 0 || point.y > height;
        el.style.visibility = outside ? 'hidden' : '';
        if (outside || !labels) continue;
        const placement = placeLabel(
          point,
          text.offsetWidth,
          text.offsetHeight,
          occupied,
          viewport,
          !el.querySelector('.mil-symbol') &&
            (el.classList.contains('label-west') ||
              org.location!.coordinates[1] < 78),
          el.querySelector('.mil-symbol') ? 44 : 20,
          el.querySelector('.mil-symbol') ? 100 : 0,
        );
        occupied.push(placement.rect);
        text.style.left = `${placement.x + 5}px`;
        text.style.top = `${placement.y + 5}px`;
        const dx =
          placement.x > 0
            ? placement.x - 4
            : placement.x + text.offsetWidth + 4;
        const dy = placement.y + text.offsetHeight / 2;
        line.style.width = `${Math.hypot(dx, dy)}px`;
        line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      }
    }
    layoutLabels();
    m.on('move', layoutLabels);
    m.on('resize', layoutLabels);
    void document.fonts.ready.then(() => {
      if (map.current === m) layoutLabels();
    });
    return () => {
      m.off('move', layoutLabels);
      m.off('resize', layoutLabels);
    };
  }, [ready, nodes, selected, detail, labels, country]);
  const move = (delta: number) =>
    map.current?.zoomTo((map.current?.getZoom() || 4) + delta, {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 250,
    });
  return (
    <section className="map-canvas" aria-label="Headquarters map">
      <div ref={host} className="map-host" />
      {fatal && (
        <div className="map-fallback">
          <img
            src="/geography/india-context.svg"
            alt="Survey of India national outline"
          />
          <button onClick={onBrowse}>Explore organizational hierarchy</button>
        </div>
      )}
      {!ready && !fatal && !error && (
        <div className="map-loading" role="status">
          Loading the atlas…
        </div>
      )}
      <div className="map-controls">
        <button aria-label="Zoom in" onClick={() => move(1)} disabled={fatal}>
          <Plus />
        </button>
        <button aria-label="Zoom out" onClick={() => move(-1)} disabled={fatal}>
          <Minus />
        </button>
        <span />
        <button
          aria-label="Show all India"
          onClick={() =>
            map.current?.fitBounds(country.bounds, {
              padding: viewportPadding(!!selected),
              duration: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 0
                : 700,
            })
          }
        >
          <LocateFixed />
        </button>
      </div>
      {error && (
        <div className="map-error" role="status">
          <span>{error}</span>
          <button
            onClick={() => {
              setReady(false);
              setError('');
              setFatal(false);
              setAttempt((a) => a + 1);
            }}
          >
            <RotateCcw size={14} />
            Retry
          </button>
        </div>
      )}
      {overlap.length > 0 && overlap[0].service === service && (
        <div className="overlap-picker">
          <header>
            <strong>{overlap[0].location?.name}</strong>
            <button
              onClick={() => setOverlap([])}
              aria-label="Close shared headquarters"
            >
              ×
            </button>
          </header>
          <p>Organizations sharing this headquarters city</p>
          {overlap.map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setOverlap([]);
                onSelect(o);
              }}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
