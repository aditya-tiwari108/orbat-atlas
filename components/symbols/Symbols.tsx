import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Copy,
  GraduationCap,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import Header from '../platform/Header';
import Quiz from '../quiz/Quiz';
import {
  symbolCatalog,
  symbolCategories,
  symbolCode,
  symbolReferences,
  defaultSettings,
  echelons,
  identities,
} from '../../data/symbology/catalog';
import type {
  SymbolCategory,
  SymbolSettings,
} from '../../data/symbology/catalog';
import type { QuizItem } from '../../data/quiz/engine';
import { symbolImage, symbolSVG } from './render';
import './symbols.css';
function readLocation() {
  const q = new URLSearchParams(window.location.search);
  const record =
    symbolCatalog.find((r) => r.id === q.get('symbol')) ||
    symbolCatalog.find((r) => r.id === 'infantry')!;
  return {
    id: record.id,
    category: record.category,
    settings: {
      identity: identities.some((a) => a.code === q.get('identity'))
        ? q.get('identity')!
        : '3',
      echelon: echelons.some((a) => a.code === q.get('echelon'))
        ? q.get('echelon')!
        : '00',
      modifier: ['0', '2', '4', '6', '1'].includes(q.get('modifier') || '')
        ? q.get('modifier')!
        : '0',
      status: q.get('status') === '1' ? '1' : '0',
    },
  };
}
const quizItems: QuizItem[] = symbolCatalog.map((r) => ({
  id: r.id,
  name: r.name,
  context: symbolCategories[r.category],
  description: r.description,
  pool: r.category,
  category: r.category,
  image: symbolImage(r),
  link: `/symbols?symbol=${r.id}`,
}));
export default function Symbols() {
  const [location, setLocation] = useState(readLocation);
  const [category, setCategory] = useState<SymbolCategory>(location.category);
  const [query, setQuery] = useState('');
  const [quiz, setQuiz] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [anatomy, setAnatomy] = useState('function');
  const selected = symbolCatalog.find((r) => r.id === location.id)!;
  const settings = location.settings;
  const builder = ['functions', 'aviation'].includes(selected.category);
  const visible = useMemo(
    () =>
      symbolCatalog.filter((r) =>
        query.trim()
          ? `${r.name} ${r.description} ${symbolCategories[r.category]}`
              .toLowerCase()
              .includes(query.toLowerCase().trim())
          : r.category === category,
      ),
    [category, query],
  );
  useEffect(() => {
    const pop = () => {
      const next = readLocation();
      setLocation(next);
      setCategory(next.category);
      setQuery('');
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  function navigate(id: string, next = settings) {
    const record = symbolCatalog.find((r) => r.id === id)!;
    const params = new URLSearchParams({ symbol: id });
    for (const [key, value] of Object.entries(next))
      if (value !== defaultSettings[key as keyof SymbolSettings])
        params.set(key, value);
    window.history.pushState({}, '', `/symbols?${params}`);
    setLocation({ id, settings: next, category: record.category });
    setCopied(false);
    setCopyError(false);
  }
  function topic(next: SymbolCategory) {
    setCategory(next);
    setQuery('');
    navigate(symbolCatalog.find((r) => r.category === next)!.id);
  }
  function change(field: keyof SymbolSettings, value: string) {
    navigate(selected.id, { ...settings, [field]: value });
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopyError(true);
    }
  }
  function download() {
    const blob = new Blob([symbolSVG(selected, settings)], {
      type: 'image/svg+xml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.id}-${symbolCode(selected, settings)}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const explanations: Record<string, string> = {
    frame: identities.find((i) => i.code === settings.identity)!.description,
    function: selected.description,
    echelon:
      settings.echelon === '00'
        ? 'No echelon is specified. An empty field is better than an invented organizational size.'
        : `${echelons.find((e) => e.code === settings.echelon)!.name}: the indicator above the frame states organizational level. It does not imply a fixed headcount or level of warfare.`,
    staff:
      settings.modifier === '2' || settings.modifier === '6'
        ? 'The staff extending downward marks this as a headquarters. Its end can anchor the location when used on a map.'
        : 'No headquarters staff is shown. Choose Headquarters or Task-force HQ to see how the symbol changes.',
  };
  return (
    <div className="field-site symbols-page">
      <a className="skip-link" href="#symbol-library">
        Skip to symbol library
      </a>
      <Header section="symbols" />
      <main className="symbols-main">
        <section className="symbol-intro">
          <div>
            <span className="field-kicker">THE LANGUAGE OF THE MAP</span>
            <h1>
              A symbol. A whole story<span>.</span>
            </h1>
            <p>
              Learn the building blocks of NATO military symbology. Then make
              them your own.
            </p>
          </div>
          <button className="quiz-launch" onClick={() => setQuiz(true)}>
            <GraduationCap size={18} /> Quiz yourself
          </button>
        </section>
        <div className="symbol-workspace">
          <section
            className="symbol-library"
            id="symbol-library"
            aria-label="Symbol library"
          >
            <div className="library-heading">
              <h2>The field guide</h2>
              <span>{symbolCatalog.length} ENTRIES</span>
            </div>
            <label className="symbol-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search infantry, corps, headquarters…"
                aria-label="Search symbols"
              />
              {query && <button onClick={() => setQuery('')}>Clear</button>}
            </label>
            <div className="symbol-topics" aria-label="Symbol topics">
              {Object.entries(symbolCategories).map(([id, name]) => (
                <button
                  key={id}
                  aria-pressed={category === id && !query}
                  onClick={() => topic(id as SymbolCategory)}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="library-caption">
              <span>
                {query
                  ? `${visible.length} search results`
                  : symbolCategories[category]}
              </span>
              <span>SELECT TO EXPLORE</span>
            </div>
            <div className="symbol-grid">
              {visible.map((r) => (
                <button
                  key={r.id}
                  className={`symbol-tile${selected.id === r.id ? ' selected' : ''}`}
                  aria-pressed={selected.id === r.id}
                  onClick={() => navigate(r.id)}
                >
                  <div className="tile-graphic">
                    <img src={symbolImage(r)} alt="" />
                  </div>
                  <span>{r.name}</span>
                  <small>
                    {r.category === 'echelons'
                      ? 'ECHELON'
                      : r.category === 'affiliations'
                        ? 'IDENTITY'
                        : r.category === 'modifiers'
                          ? 'AMPLIFIER'
                          : r.set === '30'
                            ? 'SEA SURFACE'
                            : 'UNIT FUNCTION'}
                  </small>
                </button>
              ))}
            </div>
            {!visible.length && (
              <div className="symbol-empty">
                <h3>No symbols found.</h3>
                <p>
                  Try a function such as engineer, an echelon such as division,
                  or a modifier such as headquarters.
                </p>
                <button onClick={() => setQuery('')}>Clear search</button>
              </div>
            )}
            <details className="symbol-reference">
              <summary>About this collection & references</summary>
              <p>
                A formation-focused teaching collection, not the entire APP-6
                catalogue. The entries cover common land functions, aviation
                organizations, maritime task organizations and the core
                formation amplifiers.
              </p>
              <p>
                Reference: APP-06 Edition E, Version 1 (2023). Rendered with
                milsymbol 3 in APP6 mode; the renderer harmonizes some edition
                differences. This is an educational reference, not a certified
                operational plotting system.
              </p>
              <p>
                National unit names vary. Echelon does not establish troop
                numbers, command rank, or a universal
                tactical/operational/strategic classification. Aviation
                organizations use unit frames; an aircraft track is a different
                symbol.
              </p>
              {Object.values(symbolReferences).map((r) => (
                <a key={r.url} href={r.url} target="_blank" rel="noreferrer">
                  {r.title} <ArrowUpRight size={13} />
                </a>
              ))}
            </details>
          </section>
          <aside
            className="symbol-inspector"
            aria-label="Symbol details and builder"
          >
            <div className="inspector-title">
              <div>
                <span className="field-kicker">
                  {builder ? 'LIVE SYMBOL BUILDER' : 'READ THE SYMBOL'}
                </span>
                <h2>{selected.name}</h2>
              </div>
              <SlidersHorizontal size={20} />
            </div>
            <div className="symbol-canvas">
              <div className="canvas-grid" />
              <span className="canvas-tag">
                {builder ? 'YOUR CONFIGURATION' : 'REFERENCE EXAMPLE'}
              </span>
              <img
                key={symbolCode(selected, settings)}
                src={symbolImage(selected, settings)}
                alt={`${selected.name} symbol${builder ? `, ${identities.find((i) => i.code === settings.identity)?.name}, ${echelons.find((e) => e.code === settings.echelon)?.name}` : ''}`}
              />
              <span className="canvas-foot">
                {builder
                  ? `${identities.find((i) => i.code === settings.identity)?.name} · ${settings.status === '1' ? 'Planned' : 'Present'}`
                  : symbolCategories[selected.category]}
              </span>
            </div>
            {builder ? (
              <>
                <div className="anatomy-tabs" aria-label="Symbol anatomy">
                  {[
                    ['frame', '01 / Frame'],
                    ['function', '02 / Function'],
                    ['echelon', '03 / Echelon'],
                    ['staff', '04 / HQ'],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      aria-pressed={anatomy === id}
                      onClick={() => setAnatomy(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="anatomy-description" aria-live="polite">
                  {explanations[anatomy]}
                </p>
                <div className="builder-fields">
                  <label>
                    Affiliation
                    <select
                      value={settings.identity}
                      onChange={(e) => change('identity', e.target.value)}
                    >
                      {identities.map((i) => (
                        <option key={i.code} value={i.code}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Echelon
                    <select
                      value={settings.echelon}
                      onChange={(e) => change('echelon', e.target.value)}
                    >
                      {echelons.map((e) => (
                        <option key={e.code} value={e.code}>
                          {e.mark} · {e.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Formation modifier
                    <select
                      value={settings.modifier}
                      onChange={(e) => change('modifier', e.target.value)}
                    >
                      <option value="0">None</option>
                      <option value="2">Headquarters</option>
                      <option value="4">Task force</option>
                      <option value="6">Task-force HQ</option>
                      <option value="1">Feint / dummy</option>
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      value={settings.status}
                      onChange={(e) => change('status', e.target.value)}
                    >
                      <option value="0">Present</option>
                      <option value="1">Planned / anticipated</option>
                    </select>
                  </label>
                </div>
              </>
            ) : (
              <div className="reference-explanation">
                <p>{selected.description}</p>
                <p>
                  {selected.category === 'echelons'
                    ? 'These are APP-6 echelon labels. National usage, including section, squadron and regiment, can differ.'
                    : selected.category === 'maritime'
                      ? 'Naval task organizations use their own symbols. Army echelon indicators are not attached here.'
                      : 'The other fields are held constant to make this feature easier to recognize.'}
                </p>
              </div>
            )}
            <div className="symbol-actions">
              <button onClick={download}>
                <ArrowDownToLine size={15} /> Save SVG
              </button>
              <button onClick={copy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}{' '}
                {copied ? 'Copied' : 'Share symbol'}
              </button>
              {builder && (
                <button onClick={() => navigate(selected.id, defaultSettings)}>
                  Reset
                </button>
              )}
            </div>
            {copyError && (
              <p role="status">
                Copy the address from your browser to share this symbol.
              </p>
            )}
            <details className="symbol-code">
              <summary>Code & reference</summary>
              <code>{symbolCode(selected, settings)}</code>
              <p>milsymbol numeric SIDC · APP6 mode</p>
              <p>{selected.reference}</p>
              <a
                href={symbolReferences.standard.url}
                target="_blank"
                rel="noreferrer"
              >
                Open reference ↗
              </a>
            </details>
          </aside>
        </div>
        <section className="symbol-learning-note">
          <span className="field-kicker">START WITH THREE THINGS</span>
          <p>
            The frame tells you identity. The icon tells you function. The mark
            above it tells you echelon.
          </p>
          <span>
            Change one field at a time in the builder to see the difference.
          </span>
        </section>
      </main>
      {quiz && (
        <Quiz
          mode="symbols"
          items={quizItems}
          categories={symbolCategories}
          initialCategory={category}
          onClose={() => setQuiz(false)}
        />
      )}
    </div>
  );
}
