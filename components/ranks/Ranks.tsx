import { useEffect, useRef, useState } from 'react';
import {
  Anchor,
  ArrowDown,
  ArrowUpRight,
  Check,
  Copy,
  GraduationCap,
  Plane,
  Search,
  Shield,
  X,
} from 'lucide-react';
import Header from '../platform/Header';
import { platform } from '../../data/platform';
import {
  categoriesFor,
  filterRows,
  rankAssets,
  rankCategories,
  rankCountries,
  rankRows,
  rankServices,
  rankSources,
  readRankLocation,
} from '../../data/ranks/model';
import type {
  Rank,
  RankCountry,
  RankRow,
  RankService,
} from '../../data/ranks/model';
const icons = { navy: Anchor, army: Shield, air: Plane };
const serviceNames = { navy: 'Navy', army: 'Army', air: 'Air Force' };
function Insignia({ rank, large = false }: { rank: Rank; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const asset = rank.file && rankAssets[rank.file];
  return (
    <div className={`insignia-stage${large ? ' large' : ''}`}>
      {asset && !failed ? (
        <img
          src={asset.path}
          alt={`${rank.name} insignia`}
          loading={large ? 'eager' : 'lazy'}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="insignia-unavailable">
          {rank.noInsignia
            ? 'No insignia'
            : failed
              ? 'Image unavailable'
              : 'Insignia unverified'}
        </span>
      )}
    </div>
  );
}
function RankDetails({ row, onClose }: { row: RankRow; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, []);
  const count = Object.values(row.cells).filter(Boolean).length;
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="rank-dialog"
      onCancel={onClose}
      aria-labelledby="rank-dialog-title"
    >
      <header>
        <div>
          <span className="field-kicker">
            {rankCountries[row.country].subtitle} /{' '}
            {rankCategories[row.category]}
          </span>
          <h2 id="rank-dialog-title">
            {count > 1 ? 'Side by side.' : 'A service-specific rank.'}
          </h2>
        </div>
        <button
          className="rank-close"
          onClick={onClose}
          aria-label="Close rank details"
        >
          <X size={21} />
        </button>
      </header>
      <div className="rank-detail-grid">
        {rankServices.map((service) => {
          const c = row.cells[service];
          return (
            <section key={service} className={`rank-detail-cell ${service}`}>
              <h3>
                {row.country === 'NCC'
                  ? `${service === 'air' ? 'Air' : serviceNames[service]} Wing`
                  : serviceNames[service]}
              </h3>
              {c ? (
                <>
                  <Insignia rank={c} large />
                  <strong>{c.name}</strong>
                  {c.native && <span lang="zh">{c.native}</span>}
                  {c.note && <p>{c.note}</p>}
                </>
              ) : (
                <div className="rank-detail-empty">No confirmed equivalent</div>
              )}
            </section>
          );
        })}
      </div>
      {row.note && <p className="rank-detail-note">{row.note}</p>}
      <details className="rank-evidence">
        <summary>References &amp; image credits</summary>
        <ul>
          {row.sources.map((id) => (
            <li key={id}>
              <a href={rankSources[id].url} target="_blank" rel="noreferrer">
                {rankSources[id].title} <ArrowUpRight size={12} />
              </a>
            </li>
          ))}
        </ul>
        <div className="rank-credits">
          {rankServices.map((s) => {
            const c = row.cells[s];
            const a = c?.file && rankAssets[c.file];
            return a ? (
              <p key={s}>
                <b>{c.name}:</b>{' '}
                <a href={a.source} target="_blank" rel="noreferrer">
                  {a.author || a.title}
                </a>{' '}
                ·{' '}
                {a.licenseUrl ? (
                  <a href={a.licenseUrl} target="_blank" rel="noreferrer">
                    {a.license}
                  </a>
                ) : (
                  a.license
                )}
                . Unmodified artwork.
              </p>
            ) : null;
          })}
        </div>
        <p>
          References checked 20 September 2026. Equivalence is within this
          country and category only.
        </p>
      </details>
      <footer>
        <span>Keep this comparison handy.</span>
        <button onClick={copy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}{' '}
          {copied ? 'Link copied' : 'Copy comparison link'}
        </button>
      </footer>
      {copyError && (
        <p role="status">
          Copy the address from your browser to share this comparison.
        </p>
      )}
    </dialog>
  );
}
export default function Ranks() {
  const [location, setLocation] = useState(readRankLocation);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [about, setAbout] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const { country, category, query } = location;
  const rows = filterRows(country, category, query);
  const selected = rankRows.find((r) => r.id === location.rank);
  const active = focused || hovered;
  useEffect(() => {
    const pop = () => {
      setLocation(readRankLocation());
      setHovered(null);
      setFocused(null);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  function navigate(next: typeof location, replace = false) {
    const q = new URLSearchParams({
      country: next.country,
      category: next.category,
    });
    if (next.rank) q.set('rank', next.rank);
    if (next.query) q.set('q', next.query);
    window.history[replace ? 'replaceState' : 'pushState'](
      {},
      '',
      '/ranks?' + q,
    );
    setLocation(next);
    setHovered(null);
    setFocused(null);
  }
  function switchCountry(c: RankCountry) {
    navigate({
      country: c,
      category: categoriesFor(c)[0],
      rank: null,
      query: '',
    });
  }
  function close() {
    navigate({ ...location, rank: null }, true);
  }
  return (
    <div className="field-site rank-page">
      <a className="skip-link" href="#rank-matrix">
        Skip to rank comparison
      </a>
      <Header section="ranks" />
      <main className="rank-main">
        <section className="rank-intro">
          <div>
            <span className="field-kicker">THE UNIFORM, DECODED</span>
            <h1>
              Ranks &amp; insignia<span>.</span>
            </h1>
            <p>
              Different services. Corresponding ranks. See how they line up.
            </p>
          </div>
          <button
            className="reading-guide"
            onClick={() => setAbout((v) => !v)}
            aria-expanded={about}
          >
            How to read this <ArrowUpRight size={14} />
          </button>
        </section>
        {about && (
          <section className="rank-guide">
            <h2>Read across, then explore.</h2>
            <p>
              Hover or focus a rank to highlight its counterparts. Select it for
              a larger view and references. A blank cell means no equivalent has
              been confirmed. Comparisons stay within a country; NCC cadets and
              ANOs have their own ladders.
            </p>
            <p>
              Some NCC naval charts disagree, so those matches are left empty.
              ANO-specific insignia are still unverified. Five-star and training
              ranks are separated from the regular ladder.
            </p>
          </section>
        )}
        <div className="rank-toolbar">
          <div className="rank-country-row">
            <nav className="rank-countries" aria-label="Rank country">
              {(['IN', 'PK', 'CN'] as RankCountry[]).map((c) => (
                <button
                  key={c}
                  aria-pressed={country === c}
                  onClick={() => switchCountry(c)}
                >
                  <span className={`country-dot country-${c}`} />
                  {rankCountries[c].name}
                </button>
              ))}
              <span className="country-divider" />
              <button
                className="ncc-country"
                aria-pressed={country === 'NCC'}
                onClick={() => switchCountry('NCC')}
              >
                <GraduationCap size={17} />
                India NCC
              </button>
            </nav>
            <label className="rank-search">
              <Search size={16} />
              <input
                ref={search}
                aria-label="Find a rank"
                placeholder="Find a rank…"
                value={query}
                onChange={(e) =>
                  navigate(
                    { ...location, query: e.target.value, rank: null },
                    true,
                  )
                }
              />
              {query && (
                <button
                  aria-label="Clear rank search"
                  onClick={() => {
                    navigate({ ...location, query: '' }, true);
                    search.current?.focus();
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>
          <div className="rank-category-row">
            <nav aria-label="Rank category">
              {categoriesFor(country).map((c) => (
                <button
                  key={c}
                  aria-pressed={!query && category === c}
                  onClick={() =>
                    navigate({
                      ...location,
                      category: c,
                      query: '',
                      rank: null,
                    })
                  }
                >
                  {rankCategories[c]}
                </button>
              ))}
            </nav>
            <span>
              {query ? `${rows.length} matching levels` : 'HIGHEST TO LOWEST'}{' '}
              <ArrowDown size={12} />
            </span>
          </div>
        </div>
        <div className="rank-table-wrap" id="rank-matrix" tabIndex={-1}>
          <div
            role="table"
            aria-label={`${rankCountries[country].subtitle} rank comparison`}
            className="rank-table"
          >
            <div role="rowgroup" className="rank-column-head">
              <div role="row">
                {rankServices.map((s) => {
                  const Icon = icons[s];
                  return (
                    <div role="columnheader" className={s} key={s}>
                      <Icon size={21} strokeWidth={1.4} />
                      <div>
                        <strong>
                          {country === 'NCC'
                            ? `${s === 'air' ? 'Air' : s === 'navy' ? 'Naval' : 'Army'} Wing`
                            : serviceNames[s]}
                        </strong>
                        <small>
                          {country === 'NCC'
                            ? 'NATIONAL CADET CORPS'
                            : country === 'CN'
                              ? 'PEOPLE’S LIBERATION ARMY'
                              : `${rankCountries[country].name.toUpperCase()} / ${s === 'air' ? 'AIR' : s.toUpperCase()}`}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div role="rowgroup">
              {rows.map((r, index) => (
                <div
                  role="row"
                  className={`rank-row${active === r.id ? ' is-active' : ''}`}
                  key={r.id}
                  data-rank-row={r.id}
                  onMouseEnter={() => {
                    setHovered(r.id);
                    setFocused(null);
                  }}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => {
                    setFocused(r.id);
                    setHovered(null);
                  }}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget))
                      setFocused(null);
                  }}
                >
                  {rankServices.map((s: RankService) => {
                    const c = r.cells[s];
                    return (
                      <div
                        role="cell"
                        className={`rank-cell ${s}${!c ? ' empty' : ''}`}
                        key={s}
                      >
                        {c ? (
                          <button
                            onClick={() =>
                              navigate({ ...location, rank: r.id })
                            }
                            aria-label={`${c.name}, ${country === 'NCC' ? `${s} wing` : serviceNames[s]}. View comparison`}
                          >
                            <span className="rank-number" aria-hidden="true">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <Insignia rank={c} />
                            <span className="rank-name">
                              <strong>{c.name}</strong>
                              {c.native && <span lang="zh">{c.native}</span>}
                              {query && (
                                <small>{rankCategories[r.category]}</small>
                              )}
                              <span className="rank-open">
                                View comparison <ArrowUpRight size={12} />
                              </span>
                            </span>
                          </button>
                        ) : (
                          <span className="sr-only">
                            No confirmed equivalent
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {!rows.length && (
            <div className="rank-no-results">
              <Search size={25} />
              <h2>No matching ranks</h2>
              <p>
                Try another name in {rankCountries[country].name}, or choose a
                different country.
              </p>
              <button
                onClick={() => navigate({ ...location, query: '' }, true)}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
        <div className="rank-table-note">
          <span>
            <span className="empty-cell-key" /> Empty cell = no confirmed
            equivalent
          </span>
          <span>Hover to compare · Select to explore</span>
        </div>
        <details className="rank-method">
          <summary>About this collection &amp; coverage</summary>
          <p>
            Ranks are compared within each country, using published rank charts.
            The Indian armed-forces mapping follows the DG NCC handbook. Chinese
            mappings follow shared Chinese grades, with the 2022 enlisted-rank
            names. English translations can vary.
          </p>
          <p>
            Pakistan’s extra technical grades and disputed NCC naval alignments
            are kept separate where equivalence is unresolved. NCC ANO names are
            included, but verified NCC-specific insignia artwork is unavailable.
            Missing artwork is labelled separately from a rank with no insignia.
          </p>
          <p>
            <a href="/ranks-coverage.md" target="_blank" rel="noreferrer">
              Read coverage and source notes ↗
            </a>
          </p>
        </details>
      </main>
      <footer className="field-footer">
        <span>{platform.name} / Ranks &amp; insignia</span>
        <span>Carefully researched; corrections are welcome.</span>
      </footer>
      {selected && (
        <RankDetails key={selected.id} row={selected} onClose={close} />
      )}
    </div>
  );
}
