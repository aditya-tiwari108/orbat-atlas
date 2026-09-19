import type { Organization } from '../../data/model';
import { byId } from './navigation';
import { ArrowUpRight } from 'lucide-react';

export default function OrganizationFacts({
  org,
  onSelect,
}: {
  org: Organization;
  onSelect: (org: Organization) => void;
}) {
  const command = org.aviation?.commandId && byId.get(org.aviation.commandId);
  if (!org.role && !org.vessel && !org.aviation) return null;
  return (
    <dl className="organization-facts">
      {org.role && (
        <div>
          <dt>Role</dt>
          <dd>{org.role}</dd>
        </div>
      )}
      {org.aviation && (
        <div>
          <dt>Aircraft</dt>
          <dd>{org.aviation.aircraft.join(' · ')}</dd>
        </div>
      )}
      {org.vessel && (
        <div>
          <dt>Class</dt>
          <dd>{org.vessel.shipClass}</dd>
        </div>
      )}
      {command && (
        <div>
          <dt>Command</dt>
          <dd>
            <button onClick={() => onSelect(command)}>
              {command.name}
              <ArrowUpRight size={14} />
            </button>
          </dd>
        </div>
      )}
    </dl>
  );
}
