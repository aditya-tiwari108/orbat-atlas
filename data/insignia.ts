import type { Service } from './model';
export const insignia: Partial<
  Record<
    Service,
    {
      image: string;
      label: string;
      source: string;
      credit: string;
      license: string;
    }
  >
> = {
  army: {
    image: '/insignia/army.svg',
    label: 'Indian Army service insignia',
    source: 'https://commons.wikimedia.org/wiki/File:Indian_Army_Insignia.svg',
    credit: 'Government of India / ChiK',
    license: 'Public domain (Commons PD-India)',
  },
  airforce: {
    image: '/insignia/air-force.svg',
    label: 'IAF service emblem rendition',
    source: 'https://commons.wikimedia.org/wiki/File:IAF_Emblem.svg',
    credit: 'KabirDH',
    license: 'CC0 1.0',
  },
  ncc: {
    image: '/insignia/ncc.jpg',
    label: 'National Cadet Corps emblem',
    source: 'https://commons.wikimedia.org/wiki/File:NCC_emblem.jpg',
    credit: 'Hari212',
    license: 'CC BY-SA 4.0',
  },
};
