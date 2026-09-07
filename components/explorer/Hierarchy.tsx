import { ChevronRight } from 'lucide-react';
import { organizations } from '../../data/catalog';
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
          {org.status === 'newly-approved'
            ? 'Approved · opening not verified'
            : org.level === 'asset'
              ? 'Organizational asset'
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
  const children = organizations.filter((o) => o.parentId === root.id);
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
            {children.length} documented{' '}
            {children.length === 1 ? 'organization' : 'organizations'}
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
