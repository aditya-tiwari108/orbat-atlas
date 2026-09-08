export type Service = 'army' | 'navy' | 'airforce' | 'ncc';
export type Level =
  | 'headquarters'
  | 'command'
  | 'corps'
  | 'division'
  | 'fleet'
  | 'directorate'
  | 'group'
  | 'unit'
  | 'establishment'
  | 'asset';
export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
  accessed: string;
  published?: string;
  kind: 'official' | 'reference';
}
export interface Evidence {
  sourceIds: string[];
  checkedAt: string;
  status: 'supported' | 'conflicting' | 'unverified';
  note?: string;
}
export interface MediaAsset {
  id: string;
  subject: string;
  kind: 'portrait' | 'insignia';
  url: string;
  sourceUrl: string;
  credit: string;
  rights: string;
  rightsUrl: string;
  checkedAt: string;
  identityStatus: 'verified' | 'needs-review';
  localPath?: string;
  capturedAt?: string;
  focalPoint?: [number, number];
  identityNote?: string;
}
export interface Organization {
  id: string;
  country: string;
  service: Service;
  name: string;
  shortName: string;
  level: Level;
  parentId: string | null;
  description: string;
  aliases?: string[];
  location: {
    name: string;
    coordinates: [number, number];
    precision: 'city';
    sourceIds: string[];
  } | null;
  sourceIds: string[];
  relationshipSourceIds: string[];
  commander?: {
    name: string;
    role: string;
    asOf: string;
    sourceIds: string[];
    assumedOffice?: string;
    portraitId?: string;
    evidenceKind?: 'appointment' | 'dated-observation' | 'undated-profile';
  };
  classification?: 'service' | 'tri-service';
  function?: 'territorial' | 'training' | 'maintenance' | 'youth-development';
  geographicCoverage?: {
    kind: 'published-area' | 'published-description';
    sourceIds: string[];
    description: string;
    geometryPath?: string;
    bounds?: [number, number, number, number];
    asOf?: string;
  };
  evidence?: Partial<
    Record<
      'identity' | 'headquarters' | 'parent' | 'commander' | 'coverage',
      Evidence
    >
  >;
  verificationGaps?: string[];
  announcedSuccessor?: {
    name: string;
    sourceIds: string[];
    effectiveDate?: string;
    note: string;
  };
  note?: string;
  coverage: 'partial' | 'leaf';
  status?: 'documented' | 'newly-approved';
  relationshipKind?:
    | 'command'
    | 'administrative'
    | 'service-affiliation'
    | 'asset-association';
  symbol?: 'infantry' | 'armor' | 'artillery' | 'headquarters';
  wikipedia?: string;
}
export interface Country {
  code: string;
  name: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
}
export const countries: Country[] = [
  {
    code: 'IN',
    name: 'India',
    center: [22.5, 80],
    bounds: [
      [6, 67],
      [36, 98],
    ],
  },
];
export const serviceMeta: Record<
  Service,
  { name: string; label: string; color: string; root: string }
> = {
  army: {
    name: 'Indian Army',
    label: 'Army',
    color: '#d8b779',
    root: 'in-army',
  },
  navy: {
    name: 'Indian Navy',
    label: 'Navy',
    color: '#71b9f2',
    root: 'in-navy',
  },
  airforce: {
    name: 'Indian Air Force',
    label: 'Air Force',
    color: '#88d2d9',
    root: 'in-airforce',
  },
  ncc: {
    name: 'National Cadet Corps',
    label: 'NCC',
    color: '#b4a2ef',
    root: 'in-ncc',
  },
};
