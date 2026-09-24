import type { ArmsSource } from './model';
const us =
  'https://cpeground.army.mil/Equipment/Equipment-Portfolio/PM-SL-Portfolio/';
export const armsSources: Record<string, ArmsSource> = {
  ncc: {
    title: 'NCC Technical Skills handbook · 2025',
    publisher: 'National Cadet Corps',
    url: 'https://ncc.kerala.gov.in/images/pdf/handbook/army_jr/Copy%20of%20%20TECH%20SKILLS%20JD%20JW%20WEB%20FINAL%2017%20OCT%202025.pdf',
    locator:
      'Printed pp. 61–62: three .22 rifle variants; inconsistent velocity and feed data excluded.',
  },
  awm: {
    title: 'Lee-Enfield No. 2 Mk IV* · collection record',
    publisher: 'Australian War Memorial',
    url: 'https://www.awm.gov.au/collection/C250774',
  },
  drdo: {
    title: 'Products for Export · 2025',
    publisher: 'DRDO',
    url: 'https://www.drdo.gov.in/drdo/sites/default/files/schemes_services/CompendiumProductforExport2025.pdf',
    locator:
      'Printed pp. 65–69. INSAS measurements describe the catalogue folding-stock configuration; catalogue listing alone does not establish Army adoption.',
  },
  insas: {
    title: 'INSAS induction',
    publisher: 'Ministry of Defence, India',
    url: 'https://www.pib.gov.in/newsite/PrintRelease.aspx?relid=155188',
  },
  irrpl: {
    title: 'AK-203 · product specifications',
    publisher: 'Indo-Russian Rifles Private Limited',
    url: 'https://irrpl.co.in/home-2/',
  },
  ak203: {
    title: '35,000 AK-203 rifles delivered to India',
    publisher: 'Rostec',
    url: 'https://rostec.ru/media/pressrelease/rostekh-sovmestnoe-rossiysko-indiyskoe-predpriyatie-peredalo-35-tysyach-ak-203-armii-indii/',
  },
  sigindia: {
    title: 'Night sights for SIG 716 · October 2025',
    publisher: 'Ministry of Defence, India',
    url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2179522&lang=2&reg=48',
  },
  pof: {
    title: 'Pakistan Ordnance Factories · public catalogue',
    publisher: 'Defence Export Promotion Organisation, Pakistan',
    url: 'https://www.depo.gov.pk/download/catalogue/public/POF.pdf',
    locator:
      'G3A3/G3P4: printed p. 12. Specifications are POF configurations, not every HK variant.',
  },
  pkyear: {
    title: 'Defence Production Year Book 2017–18',
    publisher: 'Ministry of Defence Production, Pakistan',
    url: 'https://modp.gov.pk/SiteImage/Publication/Year%20Book%202017-18%20final%20Revised.pdf',
  },
  pkproducts: {
    title: 'Pakistan defence industry product directory',
    publisher: 'Defence Export Promotion Organisation, Pakistan',
    url: 'https://depo.gov.pk/searchproducts.php',
  },
  cn191: {
    title: 'The PLA 191 rifle family',
    publisher: 'Ministry of National Defense, China',
    url: 'https://eng.mod.gov.cn/xb/News_213114/Videos/4908922.html',
  },
  date191: {
    title: 'QBZ 191 · equipment reference',
    publisher: 'Australian Army DATE',
    url: 'https://date.army.gov.au/equipment/qbz-191',
    locator:
      'Reference specifications, not a manufacturer certification. Weight differs from other published figures.',
  },
  cn95: {
    title: 'QBZ-95 · Worldwide Equipment Guide',
    publisher: 'US Army ODIN',
    url: 'https://odin.t2com.army.mil/WEG/Asset/QBZ-95_Chinese_5.8mm_Bullpup-Style_Assault_Rifle',
  },
  weg: {
    title: 'Worldwide Equipment Guide · Ground Systems 2015',
    publisher: 'US Army TRADOC (Commons-hosted copy)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/WorldwideEquipmentGuide_2015_Ground_Systems.pdf',
    locator:
      'Historical equipment specifications; not evidence of universal current issue.',
  },
  qsz: {
    title: 'QSZ-92 · equipment reference',
    publisher: 'US Army ODIN',
    url: 'https://odin.t2com.army.mil/WEG/Asset/2986694664e3279bba3a4ff62b8f9c24',
  },
  cnbook: {
    title: 'Equipment reference · 2024',
    publisher: 'Australian Army DATE',
    url: 'https://date.army.gov.au/sites/default/files/2024-02/DATE%20Battlebook%20-Part%202%20ORBATS%20and%20Equip.pdf',
    locator:
      'Equipment appendix only; fictional exercise orders of battle are not used as real force data.',
  },
  ak74: {
    title: 'AK-74M · museum reference',
    publisher: 'Rosgvardiya',
    url: 'https://rosguard.gov.ru/ru/page/index/avtomat-ak74m',
  },
  ak12: {
    title: 'Deliveries of the AK-12, 2023 pattern',
    publisher: 'Rostec',
    url: 'https://rostec.ru/media/news/kalashnikov-zavershil-otgruzku-ocherednoy-partii-usovershenstvovannykh-ak-12-/',
  },
  svd: {
    title: 'Dragunov SVD · service reference',
    publisher: 'Rosgvardiya',
    url: 'https://rosguard.gov.ru/page/index/legenda-v-stroyu-arsenal-rosgvardii-snajperskaya-vintovka-dragunova',
  },
  pecheneg: {
    title: 'Pecheneg · specifications',
    publisher: 'Rosgvardiya',
    url: 'https://rosguard.gov.ru/page/index/pulemet-pecheneg',
  },
  m4: {
    title: 'M4A1 Carbine',
    publisher: 'US Army · PAE Maneuver Ground',
    url: us + 'M4A1-Carbine/',
  },
  m249: {
    title: 'M249 Squad Automatic Weapon',
    publisher: 'US Army · PAE Maneuver Ground',
    url: us + 'M249-Squad-Automatic-Weapon/',
  },
  m240: {
    title: 'M240B/L/H Medium Machine Gun',
    publisher: 'US Army · PAE Maneuver Ground',
    url: us + 'M240B-L-H-Medium-Machine-Gun/',
  },
  usportfolio: {
    title: 'Soldier Lethality portfolio',
    publisher: 'US Army · PAE Maneuver Ground',
    url: us,
  },
  m110: {
    title: 'M110 SASS · fact sheet',
    publisher: 'US Army PEO Soldier (archived copy)',
    url: 'https://www.usarmorment.com/pdf/SW_CSW_M110.pdf',
  },
  m17: {
    title: 'M17/M18 Modular Handgun System',
    publisher: 'US Army · PAE Maneuver Ground',
    url: us + 'M17-M18-Modular-Handgun-System/',
  },
  cci: {
    title: 'Ammunition catalogue · 2026',
    publisher: 'CCI',
    url: 'https://www.cci-ammunition.com/on/demandware.static/-/Library-Sites-VistaCCISharedLibrary/default/v91e820dd9e99e25799a98c3df74baf9b44b130a9/pdfDocuments/catalog/CC313_Catalog-2026_WEB.pdf',
  },
};
