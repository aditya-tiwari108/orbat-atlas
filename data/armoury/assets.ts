import type { Weapon } from './model';

// Public metadata and CC BY licence checked through Sketchfab's Data API.
// These are artist interpretations, not manufacturer-certified digital twins.
function asset(
  uid: string,
  title: string,
  author: string,
  note?: string,
): NonNullable<Weapon['model']> {
  return {
    uid,
    title,
    author,
    license: 'CC BY 4.0',
    url: `https://sketchfab.com/models/${uid}`,
    note,
  };
}
export const communityModels: Record<string, NonNullable<Weapon['model']>> = {
  g3a3: asset(
    'dd0a47dfb65c4872a855c41d8d1bddd8',
    'G3A3 3D Model',
    'Aldensin',
    'H&K G3A3 pattern; POF-specific furniture and markings are not verified.',
  ),
  'pof-mp5': asset(
    '3079b54aa4d84e078349c11935ec1d8c',
    'Low-Poly H&K MP5A2',
    'Kaan',
    'H&K MP5A2 pattern; not a verified POF production specimen.',
  ),
  svd: asset('b18837e316304521a5d2da8d258b6f25', 'SVD Dragunov', 'neyr'),
  ak74m: asset(
    '8eea0d04d81b4476bb36bf7e6cfc389c',
    'AK74M Assault Rifle',
    'creationwasteland',
  ),
  m4a1: asset('33107f38b23c45cc8103768c0e961cdf', 'M4A1', 'TORI106'),
  m249: asset(
    'b1e60faa37de4461822103fe38e5c9ce',
    'M249',
    'Dmitriy Korotkov',
    'Artist configuration; stock and accessory options may differ from the standard-length specification table.',
  ),
  m240b: asset(
    '657a3b8ce0194aae9c7c9036c18c54b9',
    'Low-Poly M240B',
    'TastyTony',
  ),
  m110: asset('df9e38fe9c674c30bd212daccd11414a', 'KAC M110', 'CloudyRain'),
  m17: asset(
    '35e5bc9e68a841788ec8fdb09589fb92',
    'low-poly SIG Sauer M17',
    'D_U',
  ),
  qbz191: asset(
    '88786970cb164adaad127a91a29b3dd8',
    'QBZ-191 - Free',
    'Brahian SG',
  ),
};
