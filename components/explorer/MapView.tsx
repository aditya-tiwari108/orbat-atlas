import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map as LibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(workerUrl);
import { LocateFixed, Minus, Plus, RotateCcw } from 'lucide-react';
import type { Organization, Service } from '../../data/model';
import type { CountryPresentation } from '../../data/country-config';
import { militarySymbol } from './symbology';
import { cartoRequest, decorateStyle, fallbackStyle } from './map/style';
import { chooseLabelSide, type LabelRect } from './map/labels';
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
    top: mobile ? 168 : 100,
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
  const markers = useRef<Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [fatal, setFatal] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(4);
  const [revision, setRevision] = useState(0);
  const [overlap, setOverlap] = useState<Organization[]>([]);
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
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
            customAttribution:
              '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> · <a href="https://carto.com/attributions" target="_blank">© CARTO</a>',
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
        instance.on('moveend', () => {
          if (instance) {
            setZoom(instance.getZoom());
            setRevision((r) => r + 1);
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
      markers.current.forEach((m) => m.remove());
      markers.current = [];
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
    if (selected?.location) {
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
        m.flyTo({
          center: [lng, lat],
          zoom:
            selected.level === 'command' || selected.level === 'directorate'
              ? 5.5
              : 6.5,
          padding: viewportPadding(true),
          duration: reduced ? 0 : 1100,
        });
    } else if (!selected)
      m.fitBounds(country.bounds, {
        padding: viewportPadding(false),
        duration: reduced ? 0 : 950,
      });
  }, [ready, selected, service, reset, country, nodes]);
  useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    const focusParent = selected?.parentId;
    const shown = nodes.filter(
      (o) =>
        o.location &&
        o.level !== 'asset' &&
        o.level !== 'headquarters' &&
        o.status !== 'newly-approved' &&
        (o.id === selected?.id ||
          ((o.level === 'command' || o.level === 'directorate') &&
            o.function !== 'training' &&
            o.function !== 'maintenance' &&
            !selected) ||
          (selected &&
            (o.parentId === selected.id ||
              (selected.level !== 'command' &&
                selected.level !== 'directorate' &&
                o.parentId === focusParent &&
                o.level === selected.level))) ||
          (zoom >= 6.5 && o.level !== 'command' && o.level !== 'directorate')),
    );
    const groups = new Map<string, Organization[]>();
    for (const org of shown) {
      const key = org.location!.coordinates.map((n) => n.toFixed(2)).join(',');
      groups.set(key, [...(groups.get(key) || []), org]);
    }
    const occupied: LabelRect[] = [];
    for (const group of groups.values()) {
      const o = group.find((x) => x.id === selected?.id) || group[0];
      const command = o.level === 'command' || o.level === 'directorate';
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `map-organization ${command ? 'command-label' : 'formation-label'} ${o.id === selected?.id ? 'active' : ''} ${labels ? '' : 'no-label'}`;
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
      const symbol = militarySymbol(o);
      if (symbol) {
        const s = document.createElement('span');
        s.className = 'mil-symbol';
        s.innerHTML = symbol;
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
      el.addEventListener('click', () => {
        if (group.length > 1) setOverlap(group);
        else selectRef.current(o);
      });
      const [lat, lng] = o.location!.coordinates;
      let marker = new maplibregl.Marker({
        element: el,
        anchor: el.classList.contains('label-west')
          ? 'right'
          : command
            ? 'left'
            : 'center',
        offset: el.classList.contains('label-west')
          ? [5, 0]
          : command
            ? [-5, 0]
            : [0, 0],
      })
        .setLngLat([lng, lat])
        .addTo(m);
      if (command && o.id !== selected?.id && labels) {
        const rect = el.getBoundingClientRect();
        const point = m.project([lng, lat]);
        const placement = chooseLabelSide(
          point,
          rect.width,
          rect.height,
          occupied,
          {
            width: host.current!.clientWidth,
            height: host.current!.clientHeight,
          },
          el.classList.contains('label-west'),
        );
        if (placement) {
          occupied.push(placement.rect);
          marker.remove();
          el.classList.toggle('label-west', placement.side === 'west');
          marker = new maplibregl.Marker({
            element: el,
            anchor: placement.side === 'west' ? 'right' : 'left',
            offset: placement.side === 'west' ? [5, 0] : [-5, 0],
          })
            .setLngLat([lng, lat])
            .addTo(m);
        } else {
          el.classList.add('quiet-label');
          el.title = o.name + ' · ' + o.location!.name;
        }
      }
      markers.current.push(marker);
    }
  }, [ready, nodes, selected, zoom, labels, revision, country]);
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
      {overlap.length > 0 && (
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
