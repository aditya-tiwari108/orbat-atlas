import { ChevronRight } from 'lucide-react';
import { getChildren } from '../../data/catalog';
import type { Organization } from '../../data/model';
import Symbol from './Symbol';
export function OrganizationRow({
  org,
  onSelect,
}: {
  org: Organization;
  onSelect: (o: Organization) => void;
}) {
  return (
    <button className="organization-row" onClick={() => onSelect(org)}>
      <Symbol org={org} />
      <span>
        <strong>{org.shortName}</strong>
        <small>
          {org.historicalAsOf
            ? `${org.historicalAsOf.slice(0, 4)} record · ${org.location?.name || 'Unmapped'}`
            : org.status === 'newly-approved'
              ? 'Approved · opening not verified'
              : org.level === 'asset'
                ? org.vessel?.shipClass || 'Organizational asset'
                : org.aviation
                  ? [
                      org.aviation.nickname || org.role,
                      org.aviation.aircraft.join(' / '),
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  : org.location?.name || 'Available in tree'}
        </small>
      </span>
      <ChevronRight size={16} />
    </button>
  );
}
export default function Hierarchy({
  root,
  onSelect,
  selectedId,
  depth = 0,
}: {
  root: Organization;
  onSelect: (o: Organization) => void;
  selectedId?: string;
  depth?: number;
}) {
  const children = getChildren(root.id);
  return (
    <div
      className={
        'hierarchy-node ' + (selectedId === root.id ? 'is-selected' : '')
      }
    >
      <OrganizationRow org={root} onSelect={onSelect} />
      {!!children.length && (
        <details open={depth < 1}>
          <summary>
            {children.length}{' '}
            {root.category === 'air-station'
              ? root.country === 'CN'
                ? 'flying units based here'
                : 'squadrons based here'
              : `documented ${children.length === 1 ? 'organization' : 'organizations'}`}
            <ChevronRight size={13} />
          </summary>
          <div className="tree-connector">
            {children.map((child) => (
              <Hierarchy
                key={child.id}
                root={child}
                onSelect={onSelect}
                selectedId={selectedId}
                depth={depth + 1}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
