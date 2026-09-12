import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  MapPin,
  UserRound,
  X,
} from 'lucide-react';
import type { Organization, MediaAsset } from '../../data/model';
import { organizations, sources, getAncestors } from '../../data/catalog';
import media from '../../data/media.json';
import { insignia } from '../../data/insignia';
import { byId } from './navigation';
import Hierarchy, { OrganizationRow } from './Hierarchy';
import Symbol from './Symbol';
const assets = new Map((media as MediaAsset[]).map((a) => [a.id, a]));
function Portrait({ asset, name }: { asset?: MediaAsset; name?: string }) {
  const [failed, setFailed] = useState(false);
  return asset && !failed ? (
    <img
      src={asset.localPath || asset.url}
      alt={asset.subject}
      onError={() => setFailed(true)}
      style={{
        objectPosition: `${(asset.focalPoint?.[0] ?? 0.5) * 100}% ${(asset.focalPoint?.[1] ?? 0.35) * 100}%`,
        transform: asset.identityNote?.includes('portrait')
          ? 'none'
          : 'scale(2.1)',
        transformOrigin: `${(asset.focalPoint?.[0] ?? 0.5) * 100}% ${(asset.focalPoint?.[1] ?? 0.4) * 100}%`,
      }}
    />
  ) : (
    <div className="portrait-placeholder">
      <UserRound />
      <span>{name ? 'Portrait unavailable' : 'Leader not verified'}</span>
    </div>
  );
}
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
  const photo = assets.get(org.commander?.portraitId || '');
  const emblem = insignia[org.service];
  const sourceIds = [
    ...new Set([
      ...org.sourceIds,
      ...org.relationshipSourceIds,
      ...(org.location?.sourceIds || []),
      ...(org.commander?.sourceIds || []),
      ...(org.institutionalAffiliations || []).flatMap((a) => a.sourceIds),
      ...Object.values(org.evidence || {}).flatMap((e) => e.sourceIds),
    ]),
  ];
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
                : org.status === 'newly-approved'
                  ? 'APPROVED · OPENING UNVERIFIED'
                  : org.level.toUpperCase()}
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
              ? 'Organizational asset · no position'
              : org.location?.name || 'Headquarters not verified'}
          </div>
          {org.historicalAsOf && (
            <p className="data-note historical-record">
              Historical record · {org.historicalAsOf}. Current status
              unverified.
            </p>
          )}
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
              <div className="leader-block">
                <div className="leader-photo">
                  <Portrait
                    key={photo?.id || org.id}
                    asset={photo}
                    name={org.commander?.name}
                  />
                </div>
                <div>
                  <span className="eyebrow">
                    {org.commander?.role || 'COMMANDING OFFICER'}
                  </span>
                  <h2>{org.commander?.name || 'Not verified'}</h2>
                  {org.commander ? (
                    <>
                      <p>
                        {org.commander.assumedOffice
                          ? 'Assumed office ' + org.commander.assumedOffice
                          : org.commander.evidenceKind === 'undated-profile'
                            ? 'Profile checked ' + org.commander.asOf
                            : 'Reported ' + org.commander.asOf}
                      </p>
                      {!org.commander.assumedOffice && (
                        <small>Appointment date not verified</small>
                      )}
                    </>
                  ) : (
                    <p>No office-holder is asserted in this snapshot.</p>
                  )}
                </div>
              </div>
            )}
            {photo && (
              <details className="photo-credit">
                <summary>Photo credit</summary>
                <p>
                  {photo.credit}.{' '}
                  <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                    Source ↗
                  </a>
                </p>
                <p>{photo.identityNote}</p>
                <p>
                  {photo.rights}{' '}
                  <a href={photo.rightsUrl} target="_blank" rel="noreferrer">
                    Reuse terms ↗
                  </a>
                </p>
              </details>
            )}
            {org.announcedSuccessor && (
              <p className="data-note">
                Announced successor: {org.announcedSuccessor.name}.{' '}
                {org.announcedSuccessor.note}
              </p>
            )}
            {(children.length > 0 || org.level !== 'unit') && (
              <div className="dossier-section">
                <div className="section-heading">
                  <h2>
                    {org.service === 'navy'
                      ? 'Organizations & assets'
                      : 'Subordinate organizations'}
                  </h2>
                  <span>
                    {children.length
                      ? String(children.length).padStart(2, '0')
                      : '—'}
                  </span>
                </div>
                {children.length ? (
                  <>
                    {children.slice(0, 6).map((c) => (
                      <OrganizationRow key={c.id} org={c} onSelect={onSelect} />
                    ))}
                    {children.length > 6 && (
                      <button
                        className="text-link"
                        onClick={() => setTab('structure')}
                      >
                        View all in tree <ChevronRight size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  <p className="empty">
                    {org.level === 'asset'
                      ? 'Ships are listed as organizational assets. No live or inferred ship positions are recorded.'
                      : 'No subordinate entries have been verified for this record yet.'}
                  </p>
                )}
                {children.some(
                  (c) => c.evidence?.parent?.status === 'unverified',
                ) && (
                  <p className="data-note">
                    Some relationships are reported associations; current
                    subordination has not been corroborated.
                  </p>
                )}
              </div>
            )}
            {parent && (
              <div className="parent-block">
                <span className="eyebrow">
                  {org.relationshipKind === 'service-affiliation'
                    ? 'BROWSING AFFILIATION'
                    : org.relationshipKind === 'asset-association'
                      ? 'REPORTED ASSET ASSOCIATION'
                      : 'PARENT ORGANIZATION'}
                </span>
                <button onClick={() => onSelect(parent)}>
                  {parent.name}
                  <ArrowUpRight size={16} />
                </button>
                {org.evidence?.parent?.asOf && (
                  <small>
                    Relationship documented {org.evidence.parent.asOf}
                  </small>
                )}
                {org.evidence?.parent?.status === 'unverified' && (
                  <small>Current relationship not independently verified</small>
                )}
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
                    {a.sourceIds.map((id) => (
                      <a
                        key={id}
                        className="text-link"
                        href={sources.find((s) => s.id === id)?.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Institutional source ↗
                      </a>
                    ))}
                  </div>
                ))}
              </details>
            )}
            <details className="disclosure">
              <summary>
                Description <ChevronRight size={14} />
              </summary>
              <p>{org.description}</p>
              {org.note && <p>{org.note}</p>}
              {org.geographicCoverage && (
                <p>{org.geographicCoverage.description}</p>
              )}
            </details>
          </>
        ) : (
          <div className="dossier-section">
            <div className="tree-breadcrumbs">
              {getAncestors(org).map((a) => (
                <button key={a.id} onClick={() => onSelect(a)}>
                  {a.shortName}
                  <ChevronRight size={12} />
                </button>
              ))}
            </div>
            <div className="selected-tree-symbol">
              <Symbol org={org} />
              <span>Connected organizational tree</span>
            </div>
            <Hierarchy
              key={org.id}
              root={org}
              onSelect={onSelect}
              selectedId={org.id}
            />
            <p className="data-note">
              An empty branch means the dataset has no further entries. It does
              not imply that the organization has no subordinates. Tree
              connections are organizational, never deployment routes.
            </p>
          </div>
        )}
        <details className="disclosure sources-disclosure">
          <summary>
            Sources & verification <span>{sourceIds.length}</span>
            <ChevronRight size={14} />
          </summary>
          {sourceIds.map((id) => {
            const s = sources.find((x) => x.id === id);
            return s ? (
              <a
                className="source-link"
                href={s.url}
                target="_blank"
                rel="noreferrer"
                key={id}
              >
                <span className="eyebrow">
                  {s.kind === 'official' ? 'OFFICIAL' : 'REFERENCE'} ·{' '}
                  {s.publisher}
                </span>
                <strong>
                  {s.title}
                  <ArrowUpRight size={14} />
                </strong>
                <small>
                  Checked {s.accessed}
                  {s.published ? ' · Published ' + s.published : ''}
                </small>
              </a>
            ) : null;
          })}
          {org.wikipedia && (
            <a
              className="text-link"
              href={org.wikipedia}
              target="_blank"
              rel="noreferrer"
            >
              Wikipedia <ArrowUpRight size={14} />
            </a>
          )}
          {org.verificationGaps?.length && (
            <div className="verification-gaps">
              <h3>Remaining gaps</h3>
              <ul>
                {org.verificationGaps.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          )}
          {emblem && (
            <p className="data-note">
              Service emblem:{' '}
              <a href={emblem.source} target="_blank" rel="noreferrer">
                {emblem.label}
              </a>
              . {emblem.credit} · {emblem.license}. This is a service emblem;
              formation insignia is not yet verified.
            </p>
          )}
        </details>
      </div>
      <footer className="dossier-footer">
        <span>
          {org.location ? 'CITY-LEVEL HEADQUARTERS' : 'ORGANIZATIONAL RECORD'}
        </span>
        <output>
          {copyError
            ? 'Copy unavailable — use address bar'
            : copied
              ? 'Link copied'
              : 'PUBLIC SNAPSHOT'}
        </output>
      </footer>
    </aside>
  );
}
