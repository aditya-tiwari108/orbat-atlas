import {
  Anchor,
  Building2,
  GitBranch,
  GraduationCap,
  Shield,
  Plane,
} from 'lucide-react';
import type { Organization } from '../../data/model';
import { militarySymbol } from './symbology';
export default function Symbol({ org }: { org: Organization }) {
  const svg = militarySymbol(org);
  if (svg)
    return (
      <span
        className="mil-symbol"
        role="img"
        aria-label={`${org.level} headquarters${org.symbol && org.symbol !== 'headquarters' ? `, ${org.symbol}` : ''}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  const Icon =
    org.aviation ||
    org.category === 'flying-squadron' ||
    org.category === 'air-station'
      ? Plane
      : org.level === 'asset' || org.level === 'fleet'
        ? Anchor
        : org.service === 'ncc'
          ? GraduationCap
          : org.level === 'command'
            ? Shield
            : org.level === 'establishment'
              ? Building2
              : GitBranch;
  return <Icon className="organization-icon" aria-hidden="true" />;
}
