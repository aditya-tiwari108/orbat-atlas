import type { Service } from './model';
export interface CountryPresentation {
  code: string;
  name: string;
  bounds: [number, number, number, number];
  outline: string;
  fallbackImage: string;
  outlineSource: string;
  outlineCredit: string;
  outlineMaxZoom: number;
  /** Compensate label density for countries with a wider overview extent. */
  labelZoomOffset?: number;
  services: Partial<Record<Service, string>>;
  mapLabels?: Record<string, string>;
  regions?: Record<
    string,
    {
      path: string;
      labelsPath?: string;
      sourceUrl: string;
      credit: string;
      maxZoom: number;
    }
  >;
}
export const countryPresentation: Record<string, CountryPresentation> = {
  CN: {
    labelZoomOffset: 1.3,
    code: 'CN',
    name: 'China',
    bounds: [73, 17, 135, 54],
    outline: '/geography/china-overview.geojson',
    fallbackImage: '/geography/china-context.svg',
    outlineSource: '/china-audit.md#geography',
    outlineCredit: 'Natural Earth · SOI exclusions · 1:50 million',
    outlineMaxZoom: 7,
    services: {
      army: 'PLA Army & Joint Theaters',
      navy: 'PLA Navy',
      airforce: 'PLA Air Force',
    },
    mapLabels: {
      'cn-airforce-eastern': 'Eastern',
      'cn-airforce-southern': 'Southern',
      'cn-airforce-western': 'Western',
      'cn-airforce-northern': 'Northern',
      'cn-airforce-central': 'Central',
    },
  },
  PK: {
    code: 'PK',
    name: 'Pakistan',
    bounds: [60.5, 23.5, 77.5, 37.3],
    outline: '/geography/pakistan-natural-earth.geojson',
    fallbackImage: '/geography/pakistan-context.svg',
    outlineSource:
      'https://www.naturalearthdata.com/about/disputed-boundaries-policy/',
    outlineCredit: 'Natural Earth · de facto boundaries · 1:50 million',
    outlineMaxZoom: 7,
    services: {
      army: 'Pakistan Army',
      navy: 'Pakistan Navy',
      airforce: 'Pakistan Air Force',
    },
  },
  IN: {
    fallbackImage: '/geography/india-context.svg',
    regions: {
      ncc: {
        path: '/geography/india-ncc-regions.geojson',
        labelsPath: '/geography/india-ncc-labels.json',
        sourceUrl:
          'https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-',
        credit: 'Survey of India · ABDB states 2025',
        maxZoom: 10,
      },
    },
    mapLabels: {
      'in-ncc-punjab': 'Punjab · Haryana · HP',
      'in-ncc-jammu-kashmir': 'Jammu, Kashmir & Ladakh',
      'in-ncc-mp-cg': 'MP & Chhattisgarh',
      'in-ncc-tamil-nadu': 'Tamil Nadu · Puducherry · A&N',
      'in-ncc-telangana': 'Telangana',
      'in-ncc-bihar': 'Bihar',
      'in-ncc-kerala': 'Kerala & Lakshadweep',
      'in-ncc-west-bengal': 'West Bengal & Sikkim',
    },
    code: 'IN',
    name: 'India',
    bounds: [67.6, 6.2, 98, 37.6],
    outline: '/geography/india-soi-overview.geojson',
    outlineSource: 'https://surveyofindia.gov.in/pages/outline-maps-of-india',
    outlineCredit: 'Survey of India · 1:16 million',
    outlineMaxZoom: 7,
    services: {
      army: 'Indian Army',
      navy: 'Indian Navy',
      airforce: 'Indian Air Force',
      ncc: 'National Cadet Corps',
    },
  },
};
