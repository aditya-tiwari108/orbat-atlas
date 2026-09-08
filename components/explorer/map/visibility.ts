import type { Organization } from '../../../data/model';
export type Detail = 0 | 1 | 2;
/** Hysteresis prevents trackpad jitter from repeatedly adding/removing a layer. */
export function detailAtZoom(zoom: number, previous: Detail): Detail {
  if (zoom >= 7.6) return 2;
  if (previous === 2 && zoom >= 7.2) return 2;
  if (zoom >= 6.2) return 1;
  if (previous >= 1 && zoom >= 5.8) return 1;
  return 0;
}
export function mapOrganizations(
  nodes: Organization[],
  selected: Organization | null,
  detail: Detail,
) {
  return nodes.filter((o) => {
    if (
      !o.location ||
      o.level === 'asset' ||
      o.level === 'headquarters' ||
      o.status === 'newly-approved'
    )
      return false;
    if (o.id === selected?.id || o.parentId === selected?.id) return true;
    if (o.level === 'command' || o.level === 'directorate')
      return o.function !== 'training' && o.function !== 'maintenance';
    if (
      selected &&
      selected.level !== 'command' &&
      selected.level !== 'directorate' &&
      o.parentId === selected.parentId &&
      o.level === selected.level
    )
      return true;
    if (detail === 2) return true;
    return detail === 1 && ['corps', 'fleet', 'group'].includes(o.level);
  });
}
