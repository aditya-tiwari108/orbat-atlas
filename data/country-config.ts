import type { Service } from './model';
export interface CountryPresentation {
  code: string;
  name: string;
  bounds: [number, number, number, number];
  outline: string;
  outlineSource: string;
  outlineCredit: string;
  outlineMaxZoom: number;
  services: Record<Service, string>;
  mapLabels?: Record<string, string>;
  regions?: Record<
    string,
    { path: string; sourceUrl: string; credit: string; maxZoom: number }
  >;
}
export const countryPresentation: Record<string, CountryPresentation> = {
  IN: {
    regions: {
      ncc: {
        path: '/geography/india-ncc-regions.geojson',
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
      'in-ncc-telangana': 'AP & Telangana',
      'in-ncc-bihar': 'Bihar & Jharkhand',
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
