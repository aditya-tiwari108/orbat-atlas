import {
  organizations as chinaOrganizations,
  sources as chinaSources,
} from './china';
import {
  organizations as indiaOrganizations,
  sources as indiaSources,
} from './india';
import {
  organizations as pakistanOrganizations,
  sources as pakistanSources,
} from './pakistan';
import type { Organization, Service } from './model';
// Register additional country datasets here. IDs are globally unique and country scoped.
export const organizations: Organization[] = [
  ...indiaOrganizations,
  ...pakistanOrganizations,
  ...chinaOrganizations,
];
export const sources = [...indiaSources, ...pakistanSources, ...chinaSources];
export function rootFor(country: string, service: Service) {
  return organizations.find(
    (o) =>
      o.country === country && o.service === service && o.parentId === null,
  );
}
export function getAncestors(
  node: Organization,
  catalog: Organization[] = organizations,
) {
  const index = new Map(catalog.map((o) => [o.id, o]));
  const path: Organization[] = [];
  const seen = new Set([node.id]);
  let current = node;
  while (current.parentId) {
    const parent = index.get(current.parentId);
    if (!parent || seen.has(parent.id)) break;
    path.unshift(parent);
    seen.add(parent.id);
    current = parent;
  }
  return path;
}
export function visibleOrganizations(
  nodes: Organization[],
  zoom: number,
  selected: Organization | null,
) {
  return nodes.filter(
    (o) =>
      o.location &&
      (o.level === 'headquarters' ||
        o.level === 'command' ||
        o.level === 'directorate' ||
        zoom >= 6 ||
        o.id === selected?.id ||
        o.parentId === selected?.id),
  );
}
export function searchOrganizations(
  query: string,
  catalog: Organization[] = organizations,
) {
  const q = query.trim().toLowerCase();
  return catalog.filter((o) =>
    [
      o.name,
      o.shortName,
      o.location?.name || '',
      o.commander?.name || '',
      o.role || '',
      o.vessel?.shipClass || '',
      ...(o.aviation?.aircraft || []),
      ...(o.aliases || []),
    ]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}

/** A joint command exposes service components without changing their administrative parents. */
export function getChildren(
  id: string,
  catalog: Organization[] = organizations,
) {
  return catalog.filter(
    (org) =>
      org.jointCommandId === id ||
      (org.parentId === id &&
        !catalog.some(
          (joint) => joint.id === org.jointCommandId && joint.parentId === id,
        )),
  );
}
