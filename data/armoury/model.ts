export const armouryCountries = {
  IN: 'India',
  PK: 'Pakistan',
  CN: 'China',
  RU: 'Russia',
  US: 'United States',
} as const;
export type ArmsCountry = keyof typeof armouryCountries;
export const weaponCategories = {
  rifle: 'Rifles',
  carbine: 'Carbines & SMGs',
  precision: 'Precision rifles',
  machinegun: 'Machine guns',
  pistol: 'Pistols',
  trainer: 'Training rifles',
} as const;
export type WeaponCategory = keyof typeof weaponCategories;
export type Profile =
  | 'ak'
  | 'insas'
  | 'ar'
  | 'g3'
  | 'mp5'
  | 'bullpup'
  | '191'
  | 'trainer'
  | 'sporting'
  | 'svd'
  | 'mg'
  | 'pistol';
export type Fact = { value: string; source: string; note?: string };
export type Measurement = Fact & { metric?: number; configuration: string };
export type Weapon = {
  id: string;
  name: string;
  subtitle: string;
  countries: ArmsCountry[];
  origin: string;
  category: WeaponCategory;
  cartridge: string;
  description: string;
  association: string;
  sources: string[];
  profile: Profile;
  furniture?: 'wood' | 'orange' | 'olive' | 'black' | 'sand';
  length?: Measurement;
  mass?: Measurement;
  barrel?: Fact;
  action: Fact;
  feed?: Fact;
  modes?: Fact;
  cyclic?: Fact;
  features: string[];
  notes?: string[];
  model?: {
    uid: string;
    title: string;
    author: string;
    license: string;
    url: string;
    note?: string;
  };
};
export type Cartridge = {
  id: string;
  name: string;
  short: string;
  kind: string;
  ignition: 'Rimfire' | 'Centerfire';
  caseForm: string;
  nominalCase: number;
  description: string;
  sources: string[];
  example?: { label: string; bullet: string; velocity: string; source: string };
  illustration: {
    length: number;
    width: number;
    shoulder: boolean;
    rim: boolean;
  };
};
export type ArmsSource = {
  title: string;
  url: string;
  publisher: string;
  locator?: string;
};
export const checkedOn = '2026-09-23';
