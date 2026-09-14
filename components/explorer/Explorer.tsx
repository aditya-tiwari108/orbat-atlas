import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Anchor,
  ArrowLeft,
  ChevronRight,
  Compass,
  GraduationCap,
  Info,
  Layers,
  ListTree,
  Plane,
  Search,
  Shield,
  X,
} from 'lucide-react';
import { organizations, rootFor } from '../../data/catalog';
import { countries, serviceMeta } from '../../data/model';
import type { Organization, Service } from '../../data/model';
import { countryPresentation } from '../../data/country-config';
import { useNavigation } from './navigation';
import Dossier from './Dossier';
import LeadershipPanel from './LeadershipPanel';
import Hierarchy from './Hierarchy';
import SearchDialog from './SearchDialog';
import AboutDialog from './AboutDialog';
const MapView = lazy(() => import('./MapView'));
const icons = {
  army: Shield,
  navy: Anchor,
  airforce: Plane,
  ncc: GraduationCap,
};
export default function Explorer() {
  const { selected, service, country: countryCode, navigate } = useNavigation();
  const country = countryPresentation[countryCode] || countryPresentation.IN;
  const [search, setSearch] = useState(false);
  const [browse, setBrowse] = useState(false);
  const [layers, setLayers] = useState(false);
  const [about, setAbout] = useState(false);
  const [labels, setLabels] = useState(true);
  const [homeOpen, setHomeOpen] = useState(true);
  const [reset, setReset] = useState(0);
  const nodes = useMemo(
    () =>
      organizations.filter(
        (o) => o.country === country.code && o.service === service,
      ),
    [country.code, service],
  );
  const root = rootFor(country.code, service);
  const choose = useCallback(
    (o: Organization) => {
      navigate(o);
      setSearch(false);
      setBrowse(false);
    },
    [navigate],
  );
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === 'Escape') {
        if (search) return;
        if (about) setAbout(false);
        else if (browse) setBrowse(false);
        else if (layers) setLayers(false);
        else if (selected) {
          navigate(null);
          setHomeOpen(true);
        } else setHomeOpen(false);
      }
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [search, about, browse, layers, selected, navigate]);
  function switchService(s: Service) {
    navigate(null, s);
    setBrowse(false);
    setHomeOpen(true);
    setReset((n) => n + 1);
  }
  return (
    <main
      className={'atlas ' + (selected || homeOpen ? 'has-selection' : '')}
      style={{ '--service': serviceMeta[service].color } as React.CSSProperties}
    >
      <a className="skip-link" href="#browse-button">
        Skip map to hierarchy
      </a>
      <Suspense
        fallback={<div className="map-loading">Preparing the atlas…</div>}
      >
        <MapView
          key={country.code}
          country={country}
          nodes={nodes}
          selected={selected}
          service={service}
          onSelect={choose}
          onBrowse={() => setBrowse(true)}
          labels={labels}
          reset={reset}
          panelOpen={!!selected || homeOpen}
        />
      </Suspense>
      <header className="atlas-header">
        <button
          className="brand"
          onClick={() => {
            navigate(null);
            setHomeOpen(true);
            setReset((n) => n + 1);
          }}
          aria-label="ORBAT Atlas overview"
        >
          <span className="brand-mark">
            <Compass />
          </span>
          <span>
            ORBAT <b>ATLAS</b>
            <small>INDIA / ORGANIZATIONAL ATLAS</small>
          </span>
        </button>
        <nav className="service-switch" aria-label="Service mode">
          {(Object.keys(serviceMeta) as Service[]).map((s) => {
            const Icon = icons[s];
            return (
              <button
                key={s}
                className={s === service ? 'active' : ''}
                aria-pressed={s === service}
                onClick={() => switchService(s)}
              >
                <Icon size={16} />
                <span>{serviceMeta[s].label}</span>
              </button>
            );
          })}
        </nav>
        <button
          className="search-trigger"
          aria-label="Search the atlas"
          onClick={() => setSearch(true)}
        >
          <Search size={17} />
          <span>Search the atlas</span>
          <kbd>
            {/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'}
          </kbd>
        </button>
      </header>
      <div className="map-context">
        {selected ? (
          <button className="context-back" onClick={() => navigate(null)}>
            <ArrowLeft size={14} />
            All {service === 'ncc' ? 'directorates' : 'commands'}
          </button>
        ) : (
          <>
            {!homeOpen && (
              <>
                <span className="eyebrow">
                  {country.name.toUpperCase()} /{' '}
                  {service === 'ncc' ? 'NCC DIRECTORATES' : 'COMMAND OVERVIEW'}
                </span>
                <h2>{country.services[service]}</h2>
                <p>
                  Select a {service === 'ncc' ? 'directorate' : 'command'} to
                  explore its organization.
                </p>
              </>
            )}
            {service === 'ncc' && (
              <button className="text-link" onClick={() => setBrowse(true)}>
                Browse all directorates <ChevronRight size={14} />
              </button>
            )}
          </>
        )}
      </div>
      <div className="bottom-controls">
        <button
          id="browse-button"
          className={'floating-button ' + (browse ? 'active' : '')}
          onClick={() => {
            setBrowse((b) => !b);
            setLayers(false);
          }}
          aria-expanded={browse}
        >
          <ListTree size={16} />
          Hierarchy
        </button>
        <button
          className="floating-button"
          aria-expanded={layers}
          onClick={() => {
            setLayers((l) => !l);
            setBrowse(false);
          }}
        >
          <Layers size={16} />
          Layers
        </button>
        <button
          className="floating-button icon-button"
          aria-label="About the atlas"
          onClick={() => setAbout(true)}
        >
          <Info size={16} />
        </button>
        {countries.length > 1 && (
          <select
            aria-label="Country"
            value={country.code}
            onChange={(e) => navigate(null, service, e.target.value)}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {layers && (
        <section className="layers-panel floating-panel">
          <h2>Map presentation</h2>
          <label>
            <input
              type="checkbox"
              checked={labels}
              onChange={(e) => setLabels(e.target.checked)}
            />
            Organization labels
          </label>
          <p>
            {service === 'ncc'
              ? 'Directorate regions follow published state and union-territory administration. Select a region to explore. Small regions use abbreviated names as space permits; all directorates remain in the hierarchy.'
              : 'Headquarters are city-level points. Command areas are only shown when published geography supports them.'}
          </p>
          <p>
            {service === 'ncc'
              ? 'Regions: Survey of India ABDB states, 2025 edition, generalized to 250 metres. Interstate disputed areas remain unassigned. Headquarters markers indicate cities.'
              : 'India outline: Survey of India, 1:16 million. Hidden at close zoom to respect its scale.'}
          </p>
          <a
            href={
              country.regions?.[service]?.sourceUrl || country.outlineSource
            }
            target="_blank"
            rel="noreferrer"
          >
            Geography source ↗
          </a>
        </section>
      )}
      {browse && (
        <aside
          className="browse-panel floating-panel"
          aria-labelledby="browse-title"
        >
          <header>
            <div>
              <span className="eyebrow">BROWSE ORGANIZATIONS</span>
              <h2 id="browse-title">{country.services[service]}</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Close hierarchy"
              onClick={() => setBrowse(false)}
            >
              <X />
            </button>
          </header>
          <div className="browse-scroll">
            {root && (
              <Hierarchy
                key={root.id}
                root={root}
                onSelect={choose}
                selectedId={selected?.id}
              />
            )}
          </div>
        </aside>
      )}
      {!selected && homeOpen && root && (
        <LeadershipPanel
          root={root}
          onSelect={choose}
          onClose={() => setHomeOpen(false)}
        />
      )}
      {selected && (
        <Dossier
          key={selected.id}
          org={selected}
          onSelect={choose}
          onClose={() => {
            navigate(null);
            setHomeOpen(true);
          }}
        />
      )}
      {search && (
        <SearchDialog onClose={() => setSearch(false)} onSelect={choose} />
      )}
      {about && <AboutDialog onClose={() => setAbout(false)} />}
    </main>
  );
}
