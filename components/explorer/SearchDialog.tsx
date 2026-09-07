import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchOrganizations } from '../../data/catalog';
import { serviceMeta } from '../../data/model';
import type { Organization } from '../../data/model';
import Symbol from './Symbol';
export default function SearchDialog({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (o: Organization) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  useEffect(() => {
    document
      .getElementById(`search-results`)
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  const results = searchOrganizations(query)
    .filter((o) => query || o.level === 'command' || o.level === 'directorate')
    .slice(0, 40);
  useEffect(() => {
    dialog.current?.showModal();
    input.current?.focus();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="search-modal"
      aria-labelledby="search-title"
      onCancel={onClose}
    >
      <h2 className="sr-only" id="search-title">
        Search all organizations
      </h2>
      <div className="search-input">
        <Search />
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          placeholder="Search a formation, city or commander…"
          aria-label="Search organizations"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={
            results[active] ? `result-${results[active].id}` : undefined
          }
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) =>
                Math.max(
                  0,
                  Math.min(
                    results.length - 1,
                    a + (e.key === 'ArrowDown' ? 1 : -1),
                  ),
                ),
              );
            }
            if (e.key === 'Enter' && results[active]) onSelect(results[active]);
          }}
        />
        <button
          className="icon-button"
          aria-label="Close search"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      <div
        className="search-results"
        id="search-results"
        role="listbox"
        aria-label="Organizations"
      >
        {results.map((o, i) => (
          <button
            id={`result-${o.id}`}
            role="option"
            aria-selected={active === i}
            className="search-result"
            key={o.id}
            onMouseEnter={() => setActive(i)}
            onClick={() => onSelect(o)}
          >
            <Symbol org={o} />
            <span>
              <strong>{o.name}</strong>
              <small>
                {serviceMeta[o.service].label} /{' '}
                {o.location?.name || 'Organizational tree'}
              </small>
            </span>
            <em>{o.level}</em>
          </button>
        ))}
        {!results.length && (
          <p className="empty">
            No documented matches. Try a city or formation number.
          </p>
        )}
      </div>
      <footer>
        <span>↑ ↓ navigate</span>
        <span>↵ select</span>
        <span>esc close</span>
      </footer>
    </dialog>
  );
}
