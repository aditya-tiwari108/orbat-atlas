import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  MapPin,
  X,
} from 'lucide-react';
import type { Organization } from '../../data/model';
import { organizations, sources, getAncestors } from '../../data/catalog';
import { insignia } from '../../data/insignia';
import { byId } from './navigation';
import Hierarchy from './Hierarchy';
import CommanderCard from './CommanderCard';
import OrganizationFacts from './OrganizationFacts';
import OrganizationChildren from './OrganizationChildren';
import { accuracyNote } from './LeadershipPanel';
export default function Dossier({
  org,
  onSelect,
  onClose,
}: {
  org: Organization;
  onSelect: (o: Organization) => void;
  onClose: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [tab, setTab] = useState<'overview' | 'structure'>('overview');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [org.id]);
  const children = organizations.filter((o) => o.parentId === org.id);
  const parent = org.parentId ? byId.get(org.parentId) : undefined;
  const emblem = insignia[org.service];
  const more =
    org.wikipedia || sources.find((s) => org.sourceIds.includes(s.id))?.url;
  return (
    <aside className="dossier" aria-labelledby="dossier-title">
      <div className="sheet-handle" />
      <header className="dossier-toolbar">
        <button
          className="back-link"
          onClick={() =>
            parent && parent.level !== 'headquarters'
              ? onSelect(parent)
              : onClose()
          }
        >
          <ArrowLeft size={15} />
          {parent && parent.level !== 'headquarters'
            ? parent.shortName
            : 'Overview'}
        </button>
        <div>
          <button
            className="icon-button"
            aria-label="Copy organization link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setCopyError(false);
              } catch {
                setCopyError(true);
              }
            }}
          >
            {copied ? <Check /> : <Copy />}
          </button>
          <button
            className="icon-button"
            aria-label="Close dossier"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
      </header>
      <div className="dossier-scroll">
        <div className="dossier-heading">
          <div className="dossier-kicker">
            <span>
              {org.classification === 'tri-service'
                ? 'TRI-SERVICE COMMAND'
                : org.function === 'training'
                  ? 'TRAINING COMMAND'
                  : org.function === 'maintenance'
                    ? 'MAINTENANCE COMMAND'
                    : org.historicalAsOf
                      ? 'HISTORICAL RECORD'
                      : org.status === 'newly-approved'
                        ? 'ANNOUNCED'
                        : (org.category || org.level)
                            .replaceAll('-', ' ')
                            .toUpperCase()}
            </span>
            {emblem && (
              <img
                src={emblem.image}
                alt={emblem.label + ' (service emblem)'}
              />
            )}
          </div>
          <h1 id="dossier-title" ref={heading} tabIndex={-1}>
            {org.name}
          </h1>
          <div className="hq-fact">
            <MapPin size={14} />
            {org.level === 'asset'
              ? 'Fleet asset'
              : org.aviation
                ? `Based at ${byId.get(org.aviation.baseId)?.shortName || 'unresolved base'}`
                : org.location?.name || 'Headquarters not verified'}
          </div>
        </div>
        <nav className="dossier-tabs" aria-label="Dossier views">
          <button
            aria-pressed={tab === 'overview'}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button
            aria-pressed={tab === 'structure'}
            onClick={() => setTab('structure')}
          >
            Organization tree
          </button>
        </nav>
        {tab === 'overview' ? (
          <>
            {(org.level === 'command' ||
              org.level === 'directorate' ||
              org.commander) && (
              <CommanderCard key={org.id} commander={org.commander} />
            )}
            <div className="dossier-intro">
              <p>{org.summary || org.description}</p>
              {more && (
                <a
                  className="read-more"
                  href={more}
                  target="_blank"
                  rel="noreferrer"
                >
                  {org.wikipedia ? 'Read on Wikipedia' : 'Learn more'} ↗
                </a>
              )}
            </div>
            <OrganizationFacts org={org} onSelect={onSelect} />
            <OrganizationChildren
              key={org.id}
              org={org}
              items={children}
              onSelect={onSelect}
            />
            {parent && parent.level !== 'headquarters' && (
              <div className="parent-block">
                <span className="eyebrow">
                  {org.relationshipKind === 'base-association'
                    ? 'Home base'
                    : 'Parent organization'}
                </span>
                <button onClick={() => onSelect(parent)}>
                  {parent.name}
                  <ArrowUpRight size={16} />
                </button>
              </div>
            )}
            {!!org.institutionalAffiliations?.length && (
              <details className="disclosure">
                <summary>
                  Institutional associations{' '}
                  <span>{org.institutionalAffiliations.length}</span>
                  <ChevronRight size={14} />
                </summary>
                {org.institutionalAffiliations.map((a) => (
                  <div key={a.name}>
                    <h3>{a.name}</h3>
                    <p>{a.note}</p>
                  </div>
                ))}
              </details>
            )}
          </>
        ) : (
          <section className="dossier-section">
            <div className="tree-breadcrumbs">
              {getAncestors(org).map((a) => (
                <button key={a.id} onClick={() => onSelect(a)}>
                  {a.shortName}
                  <ChevronRight size={12} />
                </button>
              ))}
            </div>
            <Hierarchy
              key={org.id}
              root={org}
              onSelect={onSelect}
              selectedId={org.id}
            />
          </section>
        )}
        {copyError && (
          <p role="status" className="accuracy-note">
            Could not copy. You can copy the address from your browser.
          </p>
        )}
        {copied && (
          <span className="sr-only" role="status">
            Organization link copied
          </span>
        )}
        <p className="accuracy-note">{accuracyNote}</p>
      </div>
    </aside>
  );
}
