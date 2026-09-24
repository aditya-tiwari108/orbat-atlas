import { useEffect, useRef, useState } from 'react';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  RotateCcw,
  Rotate3D,
  Plus,
  Minus,
  MoveHorizontal,
  ExternalLink,
  Box,
  Eye,
} from 'lucide-react';
import type { Cartridge, Weapon } from '../../data/armoury/model';
import { cartridgeGeometry, partCopy, weaponGeometry } from './geometry';
import { WeaponOutline, CartridgeOutline } from './Outline';
export default function Viewer({
  weapon,
  cartridge,
}: {
  weapon?: Weapon;
  cartridge?: Cartridge;
}) {
  const host = useRef<HTMLDivElement>(null),
    api = useRef<
      | {
          reset: () => void;
          rotate: (n: number) => void;
          zoom: (n: number) => void;
          side: () => void;
          part: (p: string) => void;
        }
      | undefined
    >(undefined);
  const [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false),
    [part, setPart] = useState(''),
    [external, setExternal] = useState(Boolean(weapon?.model)),
    [flat, setFlat] = useState(false),
    [retry, setRetry] = useState(0);
  const name = weapon?.name || cartridge?.name || '';
  useEffect(() => {
    if (!host.current || external || flat) return;
    const el = host.current;
    let renderer: T.WebGLRenderer;
    let disposed = false;
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
    } catch {
      queueMicrotask(() => {
        if (!disposed) setFailed(true);
      });
      return () => {
        disposed = true;
      };
    }
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(1.3, 0.8, 10.4);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const object = weapon
      ? weaponGeometry(weapon)
      : cartridgeGeometry(cartridge!);
    const size = new T.Box3().setFromObject(object).getSize(new T.Vector3());
    let fitDistance = 10.4;
    scene.add(object);
    scene.add(new T.HemisphereLight(0xdcf0ec, 0x3c4247, 2.3));
    const key = new T.DirectionalLight(0xffe4b1, 3.4);
    key.position.set(-2, 4, 5);
    scene.add(key);
    const rim = new T.DirectionalLight(0xa7d0ec, 4);
    rim.position.set(3, 2, -4);
    scene.add(rim);
    const fill = new T.DirectionalLight(0xffffff, 1);
    fill.position.set(-5, 0, -2);
    scene.add(fill);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.minDistance = 4;
    controls.maxDistance = 18;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.05;
    const materials = new Map<T.Mesh, T.MeshStandardMaterial>();
    const originals = new Set<T.Material>();
    object.traverse((o) => {
      if (o instanceof T.Mesh) {
        originals.add(o.material as T.Material);
        const mat = (o.material as T.MeshStandardMaterial).clone();
        o.material = mat;
        materials.set(o, mat);
      }
    });
    originals.forEach((m) => m.dispose());
    const render = () => {
      if (!disposed) renderer.render(scene, camera);
    };
    controls.addEventListener('change', render);
    const highlight = (id: string) => {
      for (const [mesh, mat] of materials) {
        mat.emissive.set(mesh.name === id ? 0x9c7644 : 0x000000);
        mat.emissiveIntensity = 0.35;
      }
      render();
    };
    api.current = {
      reset: () => {
        camera.position.set(fitDistance * 0.12, fitDistance * 0.1, fitDistance);
        object.rotation.set(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();
        render();
      },
      side: () => {
        camera.position.set(0, 0, fitDistance);
        object.rotation.set(0, 0, 0);
        controls.update();
        render();
      },
      rotate: (n) => {
        object.rotation.y += n;
        render();
      },
      zoom: (n) => {
        camera.position.multiplyScalar(n);
        camera.position.clampLength(controls.minDistance, controls.maxDistance);
        controls.update();
        render();
      },
      part: highlight,
    };
    const observer = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      const halfFov = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
      const nextFit = Math.max(
        size.x / (2 * halfFov * camera.aspect * 0.82),
        size.y / (2 * halfFov * 0.68),
      );
      camera.position.multiplyScalar(nextFit / fitDistance);
      fitDistance = nextFit;
      controls.minDistance = fitDistance * 0.42;
      controls.maxDistance = fitDistance * 3;
      controls.update();
      camera.updateProjectionMatrix();
      render();
      setReady(true);
    });
    observer.observe(el);
    const ray = new T.Raycaster();
    let start = { x: 0, y: 0 };
    const down = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY };
    };
    const up = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) return;
      const b = el.getBoundingClientRect();
      ray.setFromCamera(
        new T.Vector2(
          ((e.clientX - b.left) / b.width) * 2 - 1,
          (-(e.clientY - b.top) / b.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray.intersectObject(object, true)[0];
      if (hit) {
        const id = hit.object.name;
        setPart(id);
        highlight(id);
      }
    };
    const lost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointerup', up);
    render();
    return () => {
      disposed = true;
      api.current = undefined;
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointerup', up);
      const geos = new Set<T.BufferGeometry>(),
        mats = new Set<T.Material>();
      scene.traverse((o) => {
        if (o instanceof T.Mesh) {
          geos.add(o.geometry);
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            mats.add(m);
        }
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [weapon, cartridge, external, flat, retry]);
  const parts = cartridge
    ? ['case', 'projectile', 'rim']
    : weapon?.profile === 'pistol'
      ? ['slide', 'grip', 'barrel']
      : [
          'stock',
          'receiver',
          'barrel',
          weapon?.category === 'machinegun' ? 'bipod' : 'sight',
        ];
  return (
    <section className="arm-viewer" aria-label={`${name} interactive specimen`}>
      <div className="specimen-top">
        <span>
          <Box size={14} />
          {external
            ? 'COMMUNITY 3D MODEL'
            : flat
              ? 'EXTERIOR SILHOUETTE'
              : 'INTERACTIVE EXTERIOR STUDY'}
        </span>
        <div className="view-toggles">
          <button
            onClick={() => {
              if (!external && !flat && !failed) return;
              if (failed) setRetry((n) => n + 1);
              setFailed(false);
              setReady(false);
              setPart('');
              setFlat(false);
              setExternal(false);
            }}
            aria-pressed={!external && !flat}
          >
            Study
          </button>
          {weapon?.model && (
            <button
              onClick={() => {
                setExternal(true);
                setFlat(false);
              }}
              aria-pressed={external}
            >
              Artist model <ExternalLink size={11} />
            </button>
          )}
          <button
            aria-label="Switch to flat view"
            onClick={() => {
              setFlat(true);
              setExternal(false);
            }}
            aria-pressed={flat}
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
      {external && weapon?.model ? (
        <div className="artist-view">
          <iframe
            src={`https://sketchfab.com/models/${weapon.model.uid}/embed?autostart=1&autospin=0&animation_autoplay=0&ui_infos=0`}
            title={`${name} community 3D model by ${weapon.model.author}`}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
          <p>
            {weapon.model.title} · {weapon.model.author} ·{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              {weapon.model.license}
            </a>{' '}
            ·{' '}
            <a href={weapon.model.url} target="_blank" rel="noreferrer">
              Open on Sketchfab <ExternalLink size={11} />
            </a>
          </p>
          <p className="artist-note">
            {weapon.model.note ||
              'Community interpretation; geometry and accessories are not manufacturer-certified.'}{' '}
            Use Study for local 3D and annotations if the external viewer is
            unavailable.
          </p>
        </div>
      ) : (
        <>
          <div
            className="specimen-stage"
            data-ready={ready}
            role="group"
            aria-label="3D view. Drag to rotate or use the view controls below."
          >
            <div ref={host} className="three-host" hidden={flat || failed} />
            {(flat || failed) && (
              <div className="flat-specimen">
                {weapon ? (
                  <WeaponOutline weapon={weapon} />
                ) : (
                  <CartridgeOutline cartridge={cartridge!} scale={4} />
                )}
                <span>
                  {failed
                    ? '3D is unavailable on this device. The reference remains accessible.'
                    : 'Simplified exterior silhouette'}
                </span>
              </div>
            )}
            {!ready && !flat && !failed && (
              <div className="scene-loading" role="status">
                Preparing specimen…
              </div>
            )}
            <span className="specimen-index">
              {cartridge ? 'CARTRIDGE' : 'EXTERIOR'} /{' '}
              {weapon?.id.toUpperCase() || cartridge?.short}
            </span>
            <div className="specimen-scale">
              <span />
              {weapon?.length
                ? `${weapon.length.value} · ${weapon.length.configuration}`
                : cartridge
                  ? `${cartridge.nominalCase} mm nominal case length`
                  : 'Form study · dimensions not established'}
              <span />
            </div>
          </div>
          <div className="specimen-controls">
            <span>
              <Rotate3D size={15} />
              {flat ? '2D REFERENCE' : 'DRAG TO ROTATE · SCROLL TO ZOOM'}
            </span>
            <div>
              <button
                aria-label="Rotate left"
                onClick={() => api.current?.rotate(-0.35)}
                disabled={flat || failed}
              >
                <Rotate3D size={17} />
              </button>
              <button
                aria-label="Side view"
                onClick={() => api.current?.side()}
                disabled={flat || failed}
              >
                <MoveHorizontal size={17} />
              </button>
              <button
                aria-label="Zoom in"
                onClick={() => api.current?.zoom(0.86)}
                disabled={flat || failed}
              >
                <Plus size={17} />
              </button>
              <button
                aria-label="Zoom out"
                onClick={() => api.current?.zoom(1.16)}
                disabled={flat || failed}
              >
                <Minus size={17} />
              </button>
              <button
                aria-label="Reset view"
                onClick={() => api.current?.reset()}
                disabled={flat || failed}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className="part-tabs" aria-label="Explore exterior parts">
            {parts.map((p, i) => (
              <button
                key={p}
                aria-pressed={part === p}
                onClick={() => {
                  setPart(p);
                  api.current?.part(p);
                }}
              >
                <small>0{i + 1}</small>
                {p}
              </button>
            ))}
          </div>
          {part && (
            <p className="part-explanation" role="status">
              <strong>{part}</strong>
              {partCopy[part] ||
                'An exterior feature of this illustrative study.'}
            </p>
          )}
          <p className="study-caption">
            {cartridge
              ? 'Schematic cartridge profile. Relative proportions are illustrative.'
              : 'Original, simplified form study. Not a measured replica; small details and variant geometry are approximate.'}
          </p>
        </>
      )}
    </section>
  );
}
