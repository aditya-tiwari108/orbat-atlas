import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  X,
  SlidersHorizontal,
  GitCompareArrows,
  Link as LinkIcon,
  Check,
  ChevronRight,
  Box,
} from 'lucide-react';
import Header from '../platform/Header';
import { platform } from '../../data/platform';
import {
  armouryCountries,
  checkedOn,
  weaponCategories,
  type Fact,
  type Weapon,
} from '../../data/armoury/model';
import {
  weapons,
  cartridges,
  weaponById,
  cartridgeById,
  matchWeapon,
} from '../../data/armoury/catalog';
import { armsSources } from '../../data/armoury/sources';
import { CartridgeOutline, WeaponOutline } from './Outline';
import './armoury.css';
const Viewer = lazy(() => import('./Viewer'));
type Navigation = {
  country: string;
  category: string;
  weapon: string;
  cartridge: string;
  tab: 'weapons' | 'cartridges';
};
function readLocation(): Navigation {
  const q = new URLSearchParams(location.search);
  const country = q.get('country') || 'all';
  const validCountry = Object.hasOwn(armouryCountries, country)
    ? country
    : 'all';
  const requested = weapons.find((w) => w.id === q.get('weapon'));
  const weapon =
    requested &&
    (validCountry === 'all' ||
      requested.countries.includes(validCountry as never))
      ? requested
      : weapons.find(
          (w) =>
            validCountry === 'all' ||
            w.countries.includes(validCountry as never),
        )!;
  return {
    country: validCountry,
    category: Object.hasOwn(weaponCategories, q.get('category') || '')
      ? q.get('category')!
      : 'all',
    weapon: weapon.id,
    cartridge:
      cartridges.find(
        (c) =>
          c.id === q.get('cartridge') &&
          (validCountry === 'all' ||
            weapons.some(
              (w) =>
                w.cartridge === c.id &&
                w.countries.includes(validCountry as never),
            )),
      )?.id || weapon.cartridge,
    tab: q.get('tab') === 'cartridges' ? 'cartridges' : 'weapons',
  };
}
function Evidence({ ids, notes }: { ids: string[]; notes?: string[] }) {
  return (
    <details className="arms-evidence">
      <summary>
        References &amp; record notes <span>{ids.length}</span>
      </summary>
      {notes?.map((n) => (
        <p key={n}>{n}</p>
      ))}
      {ids.map((id) => {
        const s = armsSources[id];
        return (
          <a key={id} href={s.url} target="_blank" rel="noreferrer">
            <span>
              {s.publisher}
              <strong>
                {s.title} <ArrowUpRight size={12} />
              </strong>
              {s.locator && <small>{s.locator}</small>}
            </span>
          </a>
        );
      })}
      <p>
        References checked {checkedOn}. Records describe the named
        configuration; they do not claim a complete inventory.
      </p>
    </details>
  );
}
function FactRow({ label, fact }: { label: string; fact?: Fact }) {
  return (
    <div className="technical-row">
      <dt>{label}</dt>
      <dd>
        {fact ? (
          <>
            <span>{fact.value}</span>
            {'configuration' in fact && (
              <small>{String(fact.configuration)}</small>
            )}
            {fact.note && <small>{fact.note}</small>}
            <a
              href={armsSources[fact.source].url}
              title={`Reference: ${armsSources[fact.source].publisher}`}
              aria-label={`${label} reference`}
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRight size={12} />
            </a>
          </>
        ) : (
          'Not established'
        )}
      </dd>
    </div>
  );
}
export default function Armoury() {
  const [nav, setNav] = useState<Navigation>(readLocation),
    [query, setQuery] = useState(''),
    [compare, setCompare] = useState<string[]>([]),
    [copied, setCopied] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const pop = () => {
      setNav(readLocation());
      setQuery('');
    };
    window.addEventListener('popstate', pop);
    return () => {
      window.removeEventListener('popstate', pop);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);
  function navigate(patch: Partial<Navigation>, replace = false) {
    const next = { ...nav, ...patch };
    setNav(next);
    const q = new URLSearchParams();
    if (next.country !== 'all') q.set('country', next.country);
    if (next.category !== 'all') q.set('category', next.category);
    q.set(
      next.tab === 'weapons' ? 'weapon' : 'cartridge',
      next.tab === 'weapons' ? next.weapon : next.cartridge,
    );
    if (next.tab === 'cartridges') q.set('tab', 'cartridges');
    window.history[replace ? 'replaceState' : 'pushState'](
      {},
      '',
      `/armoury?${q}`,
    );
  }
  const current = weaponById[nav.weapon];
  const cartridge = cartridgeById[nav.cartridge];
  const ammo = cartridgeById[current.cartridge];
  const filtered = useMemo(
    () =>
      weapons.filter((w) => matchWeapon(w, query, nav.country, nav.category)),
    [query, nav.country, nav.category],
  );
  const filteredCartridges = cartridges.filter(
    (c) =>
      `${c.name} ${c.kind} ${c.description}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (nav.country === 'all' ||
        weapons.some(
          (w) =>
            w.cartridge === c.id && w.countries.includes(nav.country as never),
        )),
  );
  function chooseCountry(country: string) {
    const first = weapons.find(
      (w) => country === 'all' || w.countries.includes(country as never),
    )!;
    const retains =
      country === 'all' || current.countries.includes(country as never);
    setQuery('');
    navigate({
      country,
      category: 'all',
      weapon: retains ? current.id : first.id,
      cartridge:
        country === 'all' ||
        weapons.some(
          (w) =>
            w.cartridge === nav.cartridge &&
            w.countries.includes(country as never),
        )
          ? nav.cartridge
          : first.cartridge,
    });
  }
  function chooseWeapon(w: Weapon) {
    navigate({ weapon: w.id, cartridge: w.cartridge, tab: 'weapons' });
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  function pin() {
    setCompare((ids) =>
      ids.includes(current.id)
        ? ids.filter((id) => id !== current.id)
        : ids.length < 3
          ? [...ids, current.id]
          : ids,
    );
  }
  return (
    <div className="field-site arms-site">
      <a className="skip-link" href="#arms-main">
        Skip to content
      </a>
      <Header section="armoury" />
      <main id="arms-main" className="arms-main">
        <header className="arms-intro">
          <div>
            <p className="field-kicker">04 / THE EQUIPMENT COLLECTION</p>
            <h1>
              Form. Function. <em>Firearms.</em>
            </h1>
            <p>
              Explore the weapons, understand the cartridges. A closer look, in
              three dimensions.
            </p>
          </div>
          <span className="arms-edition">
            SMALL ARMS REFERENCE<small>IND / PAK / CHN / RUS / USA</small>
          </span>
        </header>
        <div className="arms-toolbar">
          <nav aria-label="Armoury collection">
            <button
              aria-pressed={nav.tab === 'weapons'}
              onClick={() => {
                setQuery('');
                navigate({ tab: 'weapons' });
              }}
            >
              Weapons <span>{weapons.length}</span>
            </button>
            <button
              aria-pressed={nav.tab === 'cartridges'}
              onClick={() => {
                setQuery('');
                navigate({ tab: 'cartridges', cartridge: current.cartridge });
              }}
            >
              Cartridges <span>{cartridges.length}</span>
            </button>
          </nav>
          <div className="arms-countries" aria-label="Country filter">
            <button
              aria-pressed={nav.country === 'all'}
              onClick={() => chooseCountry('all')}
            >
              All countries
            </button>
            {Object.entries(armouryCountries).map(([id, name]) => (
              <button
                key={id}
                aria-pressed={nav.country === id}
                onClick={() => chooseCountry(id)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="arms-workspace">
          <aside className="arms-library" aria-label="Browse collection">
            <label className="arms-search">
              <Search size={16} />
              <input
                aria-label="Search armoury"
                placeholder={
                  nav.tab === 'weapons'
                    ? 'Find a weapon or calibre'
                    : 'Find a cartridge'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery('')}>
                  <X size={14} />
                </button>
              )}
            </label>
            {nav.tab === 'weapons' && (
              <label className="arms-category">
                <SlidersHorizontal size={13} />
                <select
                  aria-label="Weapon category"
                  value={nav.category}
                  onChange={(e) => navigate({ category: e.target.value }, true)}
                >
                  <option value="all">All weapon types</option>
                  {Object.entries(weaponCategories).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="library-count" aria-live="polite">
              {nav.tab === 'weapons'
                ? filtered.length
                : filteredCartridges.length}{' '}
              SPECIMENS{' '}
              <span>{nav.country === 'all' ? 'COLLECTION' : nav.country}</span>
            </div>
            <div className="arms-list">
              {nav.tab === 'weapons'
                ? filtered.map((w) => (
                    <button
                      key={w.id}
                      className="weapon-entry"
                      aria-pressed={current.id === w.id}
                      onClick={() => chooseWeapon(w)}
                    >
                      <WeaponOutline weapon={w} />
                      <span>
                        <strong>{w.name}</strong>
                        <small>
                          {cartridgeById[w.cartridge].short} <b>·</b>{' '}
                          {w.countries.join(' / ')}
                        </small>
                      </span>
                      <ChevronRight size={13} />
                    </button>
                  ))
                : filteredCartridges.map((c) => (
                    <button
                      key={c.id}
                      className="cartridge-entry"
                      aria-pressed={cartridge.id === c.id}
                      onClick={() => navigate({ cartridge: c.id })}
                    >
                      <CartridgeOutline cartridge={c} />
                      <span>
                        <strong>{c.name}</strong>
                        <small>{c.kind}</small>
                      </span>
                      <ChevronRight size={13} />
                    </button>
                  ))}
              {(nav.tab === 'weapons'
                ? filtered.length
                : filteredCartridges.length) === 0 && (
                <div className="arms-empty">
                  <Search size={24} />
                  <h2>No matching specimens</h2>
                  <p>Try another calibre, name or country.</p>
                  <button
                    onClick={() => {
                      setQuery('');
                      navigate({ category: 'all', country: 'all' });
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
            <div className="library-footer">
              A GROWING REFERENCE
              <small>Service, training &amp; defence-industry records</small>
            </div>
          </aside>
          <div
            className="arms-specimen"
            key={nav.tab === 'weapons' ? current.id : cartridge.id}
          >
            <header className="specimen-heading">
              <div>
                <p className="field-kicker">
                  {nav.tab === 'weapons'
                    ? `${current.countries.map((c) => armouryCountries[c]).join(' / ')} / ${weaponCategories[current.category]}`
                    : `AMMUNITION / ${cartridge.kind}`}
                </p>
                <h2>{nav.tab === 'weapons' ? current.name : cartridge.name}</h2>
                <p>
                  {nav.tab === 'weapons'
                    ? current.subtitle
                    : cartridge.caseForm}
                </p>
              </div>
              <button
                className="arms-share"
                onClick={share}
                aria-label={copied ? 'Link copied' : 'Copy specimen link'}
              >
                {copied ? <Check size={17} /> : <LinkIcon size={17} />}
              </button>
            </header>
            <Suspense
              fallback={
                <div className="arm-viewer scene-loading">
                  <Box size={24} />
                  Loading 3D viewer…
                </div>
              }
            >
              <Viewer
                key={nav.tab === 'weapons' ? current.id : cartridge.id}
                weapon={nav.tab === 'weapons' ? current : undefined}
                cartridge={nav.tab === 'cartridges' ? cartridge : undefined}
              />
            </Suspense>
            {nav.tab === 'weapons' ? (
              <div className="specimen-bottom">
                <div>
                  <small>CARTRIDGE</small>
                  <button
                    className="cartridge-jump"
                    onClick={() => {
                      setQuery('');
                      navigate({ tab: 'cartridges', cartridge: ammo.id });
                    }}
                  >
                    <CartridgeOutline cartridge={ammo} />
                    <span>
                      {ammo.name}
                      <small>
                        {ammo.ignition} · {ammo.kind}
                      </small>
                    </span>
                    <ArrowRight size={18} />
                  </button>
                </div>
                <div className="recognition">
                  <small>RECOGNITION NOTES</small>
                  {current.features.map((s, i) => (
                    <p key={s}>
                      <span>0{i + 1}</span>
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="cartridge-cabinet">
                <div>
                  <p className="field-kicker">THE CARTRIDGE FAMILY</p>
                  <p>Compare the profiles. Select one to inspect.</p>
                </div>
                <div className="cartridge-lineup">
                  {cartridges.map((c) => (
                    <button
                      key={c.id}
                      aria-label={`Inspect ${c.name}`}
                      aria-pressed={c.id === cartridge.id}
                      onClick={() =>
                        navigate({ cartridge: c.id, country: 'all' })
                      }
                    >
                      <CartridgeOutline cartridge={c} scale={1.55} />
                      <span>{c.short}</span>
                    </button>
                  ))}
                </div>
                <small>
                  Illustrative relative silhouettes · not engineering dimensions
                </small>
              </div>
            )}
          </div>
          <aside className="arms-dossier" aria-label="Specimen details">
            {nav.tab === 'weapons' ? (
              <>
                <div className="dossier-about">
                  <p className="field-kicker">IN CONTEXT</p>
                  <p>{current.description}</p>
                  <span>{current.association}</span>
                </div>
                <div className="technical-header">
                  <h3>Technical profile</h3>
                  <span>METRIC</span>
                </div>
                <dl className="technical-profile">
                  <FactRow
                    label="Origin"
                    fact={{ value: current.origin, source: current.sources[0] }}
                  />
                  <FactRow
                    label="Cartridge"
                    fact={{ value: ammo.name, source: current.sources[0] }}
                  />
                  <FactRow label="Operation" fact={current.action} />
                  <FactRow label="Overall length" fact={current.length} />
                  <FactRow label="Mass" fact={current.mass} />
                  <FactRow label="Barrel length" fact={current.barrel} />
                  <FactRow label="Feed" fact={current.feed} />
                  {current.modes && (
                    <FactRow label="Fire modes" fact={current.modes} />
                  )}
                  {current.cyclic && (
                    <FactRow label="Cyclic rate" fact={current.cyclic} />
                  )}
                </dl>
                <button
                  className="arms-pin"
                  disabled={
                    compare.length === 3 && !compare.includes(current.id)
                  }
                  onClick={pin}
                >
                  <GitCompareArrows size={16} />
                  {compare.includes(current.id)
                    ? 'Remove from comparison'
                    : compare.length === 3
                      ? 'Comparison full (3)'
                      : 'Add to comparison'}
                </button>
                <Evidence
                  ids={Array.from(
                    new Set([
                      ...current.sources,
                      ...[
                        current.action,
                        current.length,
                        current.mass,
                        current.barrel,
                        current.feed,
                        current.modes,
                        current.cyclic,
                      ].flatMap((f) => (f ? [f.source] : [])),
                    ]),
                  )}
                  notes={current.notes}
                />
              </>
            ) : (
              <>
                <div className="dossier-about">
                  <p className="field-kicker">UNDERSTAND THE ROUND</p>
                  <p>{cartridge.description}</p>
                </div>
                <dl className="technical-profile">
                  <div className="technical-row">
                    <dt>Ignition</dt>
                    <dd>{cartridge.ignition}</dd>
                  </div>
                  <div className="technical-row">
                    <dt>Case form</dt>
                    <dd>{cartridge.caseForm}</dd>
                  </div>
                  <div className="technical-row">
                    <dt>Nominal case length</dt>
                    <dd>{cartridge.nominalCase} mm</dd>
                  </div>
                  <div className="technical-row">
                    <dt>Class</dt>
                    <dd>{cartridge.kind}</dd>
                  </div>
                </dl>
                {cartridge.example && (
                  <div className="cartridge-example">
                    <small>ONE PUBLISHED LOAD</small>
                    <h3>{cartridge.example.label}</h3>
                    <p>
                      {cartridge.example.bullet}
                      <br />
                      {cartridge.example.velocity}
                    </p>
                    <small>
                      A load-specific example, not a universal cartridge value.
                    </small>
                  </div>
                )}
                <div className="linked-weapons">
                  <h3>In this collection</h3>
                  {weapons
                    .filter((w) => w.cartridge === cartridge.id)
                    .map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setQuery('');
                          navigate({
                            tab: 'weapons',
                            weapon: w.id,
                            country: 'all',
                            category: 'all',
                          });
                        }}
                      >
                        {w.name}
                        <ArrowRight size={13} />
                      </button>
                    ))}
                </div>
                <Evidence ids={cartridge.sources} />
              </>
            )}
          </aside>
        </div>
        {compare.length > 0 && (
          <div className="compare-tray" aria-label="Comparison tray">
            <span>
              <GitCompareArrows size={17} />
              COMPARE
            </span>
            <div>
              {compare.map((id) => (
                <button
                  key={id}
                  onClick={() =>
                    setCompare((ids) => ids.filter((i) => i !== id))
                  }
                  aria-label={`Remove ${weaponById[id].name} from comparison`}
                >
                  {weaponById[id].name}
                  <X size={12} />
                </button>
              ))}
            </div>
            <button
              className="open-comparison"
              disabled={compare.length < 2}
              onClick={() => dialog.current?.showModal()}
            >
              {compare.length < 2
                ? 'Add another specimen'
                : 'Compare side by side'}
              <ArrowRight size={15} />
            </button>
          </div>
        )}
        <footer className="arms-footer">
          <span>{platform.name} / The equipment collection</span>
          <p>
            Carefully compiled from public references; details may be
            incomplete.
          </p>
        </footer>
      </main>
      <dialog
        className="arms-comparison"
        ref={dialog}
        aria-labelledby="comparison-title"
      >
        <header>
          <div>
            <p className="field-kicker">SIDE BY SIDE</p>
            <h2 id="comparison-title">
              Different designs. A closer comparison.
            </h2>
          </div>
          <button
            aria-label="Close comparison"
            onClick={() => dialog.current?.close()}
          >
            <X size={22} />
          </button>
        </header>
        <div className="comparison-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">SPECIFICATION</th>
                {compare.map((id) => (
                  <th scope="col" key={id}>
                    <WeaponOutline weapon={weaponById[id]} />
                    {weaponById[id].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                'Cartridge',
                'Category',
                'Operation',
                'Overall length',
                'Mass',
                'Barrel length',
                'Feed',
                'Cyclic rate',
              ].map((label) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {compare.map((id) => {
                    const w = weaponById[id];
                    const field = {
                      Operation: w.action,
                      'Overall length': w.length,
                      Mass: w.mass,
                      'Barrel length': w.barrel,
                      Feed: w.feed,
                      'Cyclic rate': w.cyclic,
                    }[label];
                    return (
                      <td key={id}>
                        {label === 'Cartridge' ? (
                          cartridgeById[w.cartridge].name
                        ) : label === 'Category' ? (
                          weaponCategories[w.category]
                        ) : field ? (
                          <>
                            {field.value}
                            {'configuration' in field && (
                              <small>{String(field.configuration)}</small>
                            )}
                          </>
                        ) : (
                          'Not established'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer>
          Measurements retain their source configurations. Loaded and unloaded
          masses are not directly equivalent.
        </footer>
      </dialog>
    </div>
  );
}
