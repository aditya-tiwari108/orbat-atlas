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
  const joint = org.jointCommandId && byId.get(org.jointCommandId);
  if (!org.role && !org.vessel && !org.aviation && !joint) return null;
  return (
    <dl className="organization-facts">
      {org.role && (
        <div>
          <dt>Role</dt>
          <dd>{org.role}</dd>
        </div>
      )}
      {!!org.aviation?.aircraft.length && (
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
      {joint && (
        <div>
          <dt>Joint theater</dt>
          <dd>
            <button onClick={() => onSelect(joint)}>
              {joint.name}
              <ArrowUpRight size={14} />
            </button>
          </dd>
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
