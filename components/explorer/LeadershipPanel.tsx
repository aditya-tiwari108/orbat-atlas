import { X } from 'lucide-react';
import { serviceMeta, type Organization } from '../../data/model';
import { organizations } from '../../data/catalog';
import leadership from '../../data/leadership.json';
import CommanderCard from './CommanderCard';
import { OrganizationRow } from './Hierarchy';
export const accuracyNote =
  'We aim to keep this atlas accurate, but some details may be incomplete or out of date.';
export default function LeadershipPanel({
  root,
  onSelect,
  onClose,
}: {
  root: Organization;
  onSelect: (org: Organization) => void;
  onClose: () => void;
}) {
  const cds = (
    leadership as {
      country: string;
      chiefOfDefenceStaff: Organization['commander'];
    }[]
  ).find((entry) => entry.country === root.country)?.chiefOfDefenceStaff;
  const children = organizations.filter(
    (org) => org.parentId === root.id && org.status !== 'newly-approved',
  );
  return (
    <aside className="dossier home-panel" aria-labelledby="leadership-title">
      <header className="dossier-toolbar">
        <span className="eyebrow">LEADERSHIP</span>
        <button
          className="icon-button"
          aria-label="Close leadership panel"
          onClick={onClose}
        >
          <X />
        </button>
      </header>
      <div className="dossier-scroll">
        <div className="dossier-heading">
          <h1 id="leadership-title">{serviceMeta[root.service].name}</h1>
        </div>
        <div
          className={
            'chief-grid ' + (root.service === 'ncc' ? 'single-chief' : '')
          }
        >
          <CommanderCard
            key={root.id}
            commander={root.commander}
            compact={root.service !== 'ncc'}
          />
          {root.service !== 'ncc' && cds && (
            <CommanderCard key={cds.name} commander={cds} compact />
          )}
        </div>
        <div className="dossier-intro">
          <p>{root.summary || root.description}</p>
          {root.wikipedia && (
            <a
              className="read-more"
              href={root.wikipedia}
              target="_blank"
              rel="noreferrer"
            >
              Read on Wikipedia ↗
            </a>
          )}
        </div>
        <section className="dossier-section">
          <div className="section-heading">
            <h2>{root.service === 'ncc' ? 'Directorates' : 'Commands'}</h2>
          </div>
          {children.map((org) => (
            <OrganizationRow key={org.id} org={org} onSelect={onSelect} />
          ))}
        </section>
        <p className="accuracy-note">{accuracyNote}</p>
      </div>
    </aside>
  );
}
