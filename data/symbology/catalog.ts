export type SymbolCategory =
  | 'functions'
  | 'aviation'
  | 'maritime'
  | 'echelons'
  | 'affiliations'
  | 'modifiers';
export interface SymbolRecord {
  id: string;
  name: string;
  category: SymbolCategory;
  description: string;
  entity: string;
  set?: string;
  echelon?: string;
  identity?: string;
  modifier?: string;
  status?: string;
  reference: string;
}
export const symbolCategories: Record<SymbolCategory, string> = {
  functions: 'Land functions',
  aviation: 'Aviation organizations',
  maritime: 'Maritime organizations',
  echelons: 'Echelons',
  affiliations: 'Affiliations',
  modifiers: 'HQ & status',
};
export const symbolReferences = {
  standard: {
    title: 'NATO APP-06, Edition E, Version 1 (2023)',
    url: 'https://studylib.net/doc/28566139/app-6e-nato-joint-military-symbology%EF%BC%882023%E7%89%88%EF%BC%89',
  },
  renderer: {
    title: 'milsymbol · rendering & compatibility',
    url: 'https://github.com/spatialillusions/milsymbol',
  },
};
const land: [string, string, string, string][] = [
  [
    'unspecified',
    'Unspecified unit',
    '000000',
    'An empty function field: the unit’s role has not been specified. Do not add an artillery dot to represent a generic formation.',
  ],
  [
    'infantry',
    'Infantry',
    '121100',
    'Crossed diagonal lines identify the foot-combat function. The echelon above the frame separately indicates organizational size.',
  ],
  [
    'armour',
    'Armour',
    '120500',
    'An oval identifies the armoured function. The oval is a function icon, not an echelon indicator.',
  ],
  [
    'mechanized-infantry',
    'Mechanized infantry',
    '121102',
    'Crossed diagonals combined with an oval identify infantry with armoured mobility.',
  ],
  [
    'motorized-infantry',
    'Motorized infantry',
    '121104',
    'The infantry icon combined with the motorized indicator identifies infantry using motor transport.',
  ],
  [
    'amphibious-infantry',
    'Amphibious infantry',
    '121101',
    'The infantry and amphibious indicators combine to identify a unit with an amphibious infantry role.',
  ],
  [
    'reconnaissance',
    'Reconnaissance',
    '121300',
    'A diagonal stroke identifies the information-gathering reconnaissance function.',
  ],
  [
    'armoured-recon',
    'Armoured reconnaissance',
    '120501',
    'The reconnaissance stroke combined with the armour oval identifies armoured reconnaissance.',
  ],
  [
    'artillery',
    'Field artillery',
    '130300',
    'A filled central dot identifies the field-artillery function. A dot inside the frame is not a generic headquarters or corps mark.',
  ],
  [
    'air-defence',
    'Air defence',
    '130100',
    'An arch identifies the function of defending against threats from the air.',
  ],
  [
    'anti-armour',
    'Anti-armour',
    '120400',
    'The anti-armour function identifies units organized to counter armoured targets.',
  ],
  [
    'mortar',
    'Mortar',
    '130800',
    'The mortar function distinguishes units equipped for mortar fire from generic field artillery.',
  ],
  [
    'engineer',
    'Engineer',
    '140700',
    'A bridge-like icon identifies the engineering function. Its size or higher headquarters must be shown separately.',
  ],
  [
    'eod',
    'Explosive ordnance disposal',
    '140800',
    'The disposal function identifies specialist units handling explosive ordnance hazards.',
  ],
  [
    'cbrn',
    'CBRN defence',
    '140100',
    'The chemical, biological, radiological and nuclear function identifies specialist protective support.',
  ],
  [
    'military-police',
    'Military police',
    '141200',
    'The policing function identifies military law-enforcement and related support units.',
  ],
  [
    'signal',
    'Signal',
    '111000',
    'The communications function identifies units providing military signal support.',
  ],
  [
    'medical',
    'Medical',
    '161300',
    'The medical function identifies healthcare support units. It does not by itself specify echelon or treatment capacity.',
  ],
  [
    'supply',
    'Supply',
    '163400',
    'The supply function identifies units providing materiel and stores support.',
  ],
  [
    'transport',
    'Transportation',
    '163600',
    'The transportation function identifies units moving personnel or materiel.',
  ],
  [
    'maintenance',
    'Maintenance',
    '161100',
    'The maintenance function identifies units repairing and sustaining equipment.',
  ],
  [
    'fuel',
    'Petroleum, oil & lubricants',
    '162500',
    'The fuel-support function identifies organizations providing petroleum products and lubricants.',
  ],
  [
    'water',
    'Water supply',
    '164700',
    'The water-support function identifies units providing water. It is distinct from water purification.',
  ],
  [
    'water-purification',
    'Water purification',
    '164800',
    'The water-treatment function identifies units that purify water for use.',
  ],
];
const aviation: [string, string, string, string][] = [
  [
    'fixed-wing',
    'Fixed-wing aviation',
    '120800',
    'An aviation organization operating fixed-wing aircraft. This is a unit symbol, not a symbol for a single aircraft in flight.',
  ],
  [
    'rotary-wing',
    'Rotary-wing aviation',
    '120600',
    'An aviation organization operating helicopters. The ground-unit frame represents the organization, not an airborne track.',
  ],
  [
    'composite-aviation',
    'Composite aviation',
    '120700',
    'An aviation organization combining different aviation capabilities. It is not a specific aircraft type.',
  ],
  [
    'air-traffic',
    'Air traffic services',
    '120200',
    'An organization supporting the management and control of aircraft movements.',
  ],
  [
    'air-assault',
    'Air assault with organic lift',
    '120100',
    'A formation combining an air-assault role with its own lift capability.',
  ],
  [
    'aviation-recon',
    'Rotary-wing reconnaissance',
    '120601',
    'A helicopter aviation organization assigned to reconnaissance and information gathering.',
  ],
];
const maritime: [string, string, string, string][] = [
  [
    'naval-task-organization',
    'Naval task organization',
    '121000',
    'A generic grouping of naval forces organized for a task. More specific task-force, group, unit and element symbols are available.',
  ],
  [
    'naval-task-force',
    'Naval task force',
    '121002',
    'A naval task organization that can be divided into task groups. It is a task-based grouping, not a fixed equivalent of an army corps.',
  ],
  [
    'naval-task-group',
    'Naval task group',
    '121003',
    'A subdivision of a naval task force, which can be divided further into task units.',
  ],
  [
    'naval-task-unit',
    'Naval task unit',
    '121004',
    'A subdivision of a naval task group, which can be divided further into task elements.',
  ],
  [
    'naval-task-element',
    'Naval task element',
    '121001',
    'A subdivision of a naval task unit; the lowest named level in this task-organization sequence.',
  ],
  [
    'convoy',
    'Convoy',
    '121005',
    'A group of vessels moving together. This symbol identifies the grouping, not a live position or a particular ship.',
  ],
];
export const echelons = [
  { code: '00', name: 'Unspecified', mark: '—' },
  { code: '11', name: 'Team / crew', mark: 'Ø' },
  { code: '12', name: 'Squad', mark: '•' },
  { code: '13', name: 'Section', mark: '••' },
  { code: '14', name: 'Platoon / detachment', mark: '•••' },
  { code: '15', name: 'Company / battery / troop', mark: 'I' },
  { code: '16', name: 'Battalion / squadron', mark: 'II' },
  { code: '17', name: 'Regiment / group', mark: 'III' },
  { code: '18', name: 'Brigade', mark: 'X' },
  { code: '21', name: 'Division', mark: 'XX' },
  { code: '22', name: 'Corps / MEF', mark: 'XXX' },
  { code: '23', name: 'Army', mark: 'XXXX' },
  { code: '24', name: 'Army group / front', mark: 'XXXXX' },
  { code: '25', name: 'Region / theatre', mark: 'XXXXXX' },
  { code: '26', name: 'Command', mark: '++' },
];
export const identities = [
  {
    code: '3',
    name: 'Friend',
    description:
      'Confirmed friendly identity. A land unit uses a rectangular frame; colour is supplementary.',
  },
  {
    code: '6',
    name: 'Hostile',
    description:
      'Confirmed hostile identity. A diamond-shaped frame distinguishes it without relying only on red colouring.',
  },
  {
    code: '4',
    name: 'Neutral',
    description:
      'An identity classified as neutral. A square frame distinguishes it from friendly and hostile land units.',
  },
  {
    code: '1',
    name: 'Unknown',
    description:
      'Identity has not been determined. A quatrefoil-shaped frame distinguishes this uncertainty.',
  },
  {
    code: '2',
    name: 'Assumed friend',
    description:
      'An identity assessed as friendly but not confirmed. The friendly frame includes a dashed identity treatment.',
  },
  {
    code: '5',
    name: 'Suspect',
    description:
      'An identity assessed as hostile but not confirmed. The hostile frame includes a dashed identity treatment.',
  },
];
export const modifiers = [
  {
    id: 'headquarters',
    name: 'Headquarters',
    modifier: '2',
    status: '0',
    description:
      'A staff extends downward from the frame to identify a headquarters. It is independent of the unit’s function and echelon.',
  },
  {
    id: 'task-force',
    name: 'Task force',
    modifier: '4',
    status: '0',
    description:
      'A bracket above the frame identifies a task-organized formation. It can accompany the echelon indicator.',
  },
  {
    id: 'task-force-hq',
    name: 'Task-force headquarters',
    modifier: '6',
    status: '0',
    description:
      'The headquarters staff and task-force bracket are combined on the same formation symbol.',
  },
  {
    id: 'feint-dummy',
    name: 'Feint / dummy',
    modifier: '1',
    status: '0',
    description:
      'A dashed chevron above the frame identifies a feint or dummy entity. It is distinct from a planned-status frame.',
  },
  {
    id: 'planned',
    name: 'Planned / anticipated',
    modifier: '0',
    status: '1',
    description:
      'A dashed frame expresses anticipated or planned status. Identity and organizational function are separate fields.',
  },
  {
    id: 'present',
    name: 'Present',
    modifier: '0',
    status: '0',
    description:
      'A solid frame expresses present status when the identity is confirmed. It does not establish operational readiness.',
  },
];
export const symbolCatalog: SymbolRecord[] = [
  ...land.map(([id, name, entity, description]) => ({
    id,
    name,
    entity,
    description,
    category: 'functions' as const,
    reference: 'Table 3-2; Annex A, land-unit entities',
  })),
  ...aviation.map(([id, name, entity, description]) => ({
    id,
    name,
    entity,
    description,
    category: 'aviation' as const,
    reference: 'Table 3-2; land-unit aviation functions',
  })),
  ...maritime.map(([id, name, entity, description]) => ({
    id,
    name,
    entity,
    description,
    set: '30',
    category: 'maritime' as const,
    reference: 'Table 5-2; Annex A, sea-surface entities',
  })),
  ...echelons.slice(1).map((e) => ({
    id: `echelon-${e.code}`,
    name: e.name,
    entity: '000000',
    echelon: e.code,
    category: 'echelons' as const,
    description: `The ${e.mark} indicator above the frame denotes this echelon. It specifies organizational level, not troop strength, function or the rank of its commander.`,
    reference: 'Table 1-8; Table A-8. National terminology varies.',
  })),
  ...identities.map((a) => ({
    id: `identity-${a.code}`,
    name: a.name,
    entity: '000000',
    identity: a.code,
    category: 'affiliations' as const,
    description: a.description,
    reference:
      'Chapter 1, standard identities; Annex A, standard identity codes',
  })),
  ...modifiers.map((m) => ({
    ...m,
    entity: '000000',
    echelon: '18',
    category: 'modifiers' as const,
    reference:
      'Chapter 1, amplifiers; Annex A, status and HQ/task-force indicators',
  })),
];
export interface SymbolSettings {
  identity: string;
  echelon: string;
  modifier: string;
  status: string;
}
export const defaultSettings: SymbolSettings = {
  identity: '3',
  echelon: '00',
  modifier: '0',
  status: '0',
};
export function symbolCode(
  record: SymbolRecord,
  settings: SymbolSettings = defaultSettings,
) {
  const fixed = !['functions', 'aviation'].includes(record.category);
  const identity = fixed ? record.identity || '3' : settings.identity;
  const echelon = fixed ? record.echelon || '00' : settings.echelon;
  const modifier = fixed ? record.modifier || '0' : settings.modifier;
  const status = fixed ? record.status || '0' : settings.status;
  return `130${identity}${record.set || '10'}${status}${modifier}${echelon}${record.entity}0000`.padEnd(
    30,
    '0',
  );
}
