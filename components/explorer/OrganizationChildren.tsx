import { useState } from 'react';
import type { Organization } from '../../data/model';
import { searchOrganizations } from '../../data/catalog';
import { OrganizationRow } from './Hierarchy';

export default function OrganizationChildren({
  org,
  items,
  onSelect,
}: {
  org: Organization;
  items: Organization[];
  onSelect: (org: Organization) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  if (!items.length) return null;
  const matches = searchOrganizations(query, items);
  const shown = query || expanded ? matches : matches.slice(0, 6);
  const title =
    org.classification === 'tri-service' && org.country === 'CN'
      ? 'Service components'
      : org.category === 'air-station'
        ? org.country === 'CN'
          ? 'Flying units based here'
          : 'Squadrons based here'
        : org.level === 'fleet' || org.category === 'training-squadron'
          ? 'Ships'
          : org.service === 'navy'
            ? org.country === 'CN'
              ? 'Ships & establishments'
              : 'Fleets & establishments'
            : org.service === 'airforce'
              ? 'Bases & organizations'
              : 'Subordinate organizations';
  return (
    <section className="dossier-section organization-children">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{items.length}</span>
      </div>
      {items.length > 8 && (
        <input
          className="children-search"
          aria-label={`Filter ${title.toLowerCase()}`}
          placeholder={`Find ${title.toLowerCase()}…`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      )}
      {shown.map((child) => (
        <OrganizationRow key={child.id} org={child} onSelect={onSelect} />
      ))}
      {!matches.length && (
        <p className="empty">No matches in this organization.</p>
      )}
      {!query && items.length > 6 && (
        <button
          className="text-link"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show fewer' : `Show all ${items.length}`}
        </button>
      )}
    </section>
  );
}
