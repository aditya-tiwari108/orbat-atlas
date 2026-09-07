import {
  organizations as indiaOrganizations,
  sources as indiaSources,
} from './india';
import type { Organization, Service } from './model';
// Register additional country datasets here. IDs are globally unique and country scoped.
export const organizations: Organization[] = [...indiaOrganizations];
export const sources = [...indiaSources];
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
      ...(o.aliases || []),
    ]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}
