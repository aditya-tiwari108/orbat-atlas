import { useCallback, useEffect, useState } from 'react';
import { countryPresentation } from '../../data/country-config';
import { organizations } from '../../data/catalog';
import type { Organization, Service } from '../../data/model';
export const byId = new Map(organizations.map((o) => [o.id, o]));
const services: Service[] = ['army', 'navy', 'airforce', 'ncc'];
export function readLocation() {
  const q = new URLSearchParams(window.location.search);
  const selected = byId.get(q.get('org') || '') || null;
  const mode = q.get('service') as Service;
  const requestedCountry = selected?.country || q.get('country') || 'IN';
  const country = countryPresentation[requestedCountry]
    ? requestedCountry
    : 'IN';
  return {
    selected,
    service:
      selected?.service ||
      ((services.includes(mode) && countryPresentation[country].services[mode]
        ? mode
        : 'army') as Service),
    country,
  };
}
export function useNavigation() {
  const [state, setState] = useState(readLocation);
  useEffect(() => {
    const update = () => setState(readLocation());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  const navigate = useCallback(
    (selected: Organization | null, service?: Service, country?: string) => {
      const next = {
        selected,
        service: selected?.service || service || state.service,
        country: selected?.country || country || state.country,
      };
      if (!countryPresentation[next.country]?.services[next.service])
        next.service = 'army';
      const url = new URL(window.location.href);
      url.searchParams.set('service', next.service);
      url.searchParams.set('country', next.country);
      if (selected) url.searchParams.set('org', selected.id);
      else url.searchParams.delete('org');
      if (url.href !== window.location.href)
        window.history.pushState({}, '', url);
      setState(next);
    },
    [state.service, state.country],
  );
  return { ...state, navigate };
}
