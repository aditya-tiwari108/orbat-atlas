import * as T from 'three';
import type { Cartridge, Weapon } from '../../data/armoury/model';
export const partCopy: Record<string, string> = {
  stock:
    'The rear support. Stocks may be fixed, folding or adjustable; the exact configuration changes overall length.',
  receiver:
    'The central body. Its position relative to the grip and magazine distinguishes conventional and bullpup layouts.',
  barrel:
    'The long forward tube. Barrel length and overall weapon length are different measurements.',
  handguard:
    'The exterior fore-end around part of the barrel. Materials and accessory interfaces vary by model.',
  magazine:
    'A container that holds cartridges. A box magazine is distinct from a belt and ammunition box.',
  feed: 'The exterior ammunition box on this belt-fed study. Box capacity and firing rate are separate properties.',
  sight:
    'The sighting equipment. Optical sights and iron sights can coexist, depending on the configuration.',
  grip: 'The main hand grip. On a bullpup weapon, the magazine is behind this grip.',
  bipod:
    'A two-legged support fitted to many precision rifles and machine guns.',
  slide:
    'The upper moving assembly of a self-loading pistol, shown here only as an exterior shape.',
  case: 'The cartridge case. It is distinct from the projectile; together with the primer and propellant they form a complete cartridge.',
  projectile:
    'The bullet, or projectile, is only one part of the complete cartridge. The “calibre” describes a diameter, not the case length.',
  rim: 'The case base. A visibly projecting rim characterizes rimmed cartridges; rimless cases still have an extraction groove.',
};
const colors = {
  wood: 0x896342,
  orange: 0x9e5b32,
  olive: 0x626b4c,
  black: 0x344045,
  sand: 0x9a896b,
};
export function weaponGeometry(w: Weapon) {
  const group = new T.Group();
  const metal = new T.MeshStandardMaterial({
    color: 0x58656a,
    metalness: 0.7,
    roughness: 0.44,
  });
  const dark = new T.MeshStandardMaterial({
    color: 0x273137,
    metalness: 0.35,
    roughness: 0.65,
  });
  const furniture = new T.MeshStandardMaterial({
    color: colors[w.furniture || 'black'],
    metalness: 0.12,
    roughness: 0.75,
  });
  const accent = new T.MeshStandardMaterial({
    color: 0xaaa18b,
    metalness: 0.75,
    roughness: 0.35,
  });
  function add(
    geo: T.BufferGeometry,
    mat: T.Material,
    x: number,
    y: number,
    z: number,
    name: string,
  ) {
    const o = new T.Mesh(geo, mat);
    o.position.set(x, y, z);
    o.name = name;
    o.castShadow = true;
    o.receiveShadow = true;
    group.add(o);
    return o;
  }
  function box(
    x: number,
    y: number,
    z: number,
    l: number,
    h: number,
    d: number,
    mat: T.Material,
    name: string,
  ) {
    return add(new T.BoxGeometry(l, h, d), mat, x, y, z, name);
  }
  function cylinder(
    x: number,
    y: number,
    z: number,
    l: number,
    r: number,
    mat: T.Material,
    name: string,
    axis = 'x',
  ) {
    const o = add(new T.CylinderGeometry(r, r, l, 20), mat, x, y, z, name);
    if (axis === 'x') o.rotation.z = Math.PI / 2;
    if (axis === 'z') o.rotation.x = Math.PI / 2;
    return o;
  }
  function poly(
    points: number[][],
    depth: number,
    mat: T.Material,
    name: string,
  ) {
    const s = new T.Shape();
    points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    const geo = new T.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
      bevelSegments: 2,
      steps: 1,
    });
    return add(geo, mat, 0, 0, -depth / 2, name);
  }
  function optic(x = 0) {
    cylinder(x, 0.58, 0, 1, 0.095, dark, 'sight');
    cylinder(x + 0.45, 0.58, 0, 0.13, 0.14, metal, 'sight');
    cylinder(x - 0.42, 0.58, 0, 0.12, 0.12, metal, 'sight');
    box(x - 0.25, 0.39, 0, 0.09, 0.22, 0.09, metal, 'sight');
    box(x + 0.2, 0.39, 0, 0.09, 0.22, 0.09, metal, 'sight');
  }
  function rail(start: number, end: number, y: number) {
    box((start + end) / 2, y, 0, end - start, 0.06, 0.16, metal, 'handguard');
    for (let x = start; x < end; x += 0.095)
      box(x, y + 0.045, 0, 0.055, 0.035, 0.2, dark, 'handguard');
  }
  function bipod(x: number) {
    for (const z of [-1, 1]) {
      const o = cylinder(x, -0.28, z * 0.22, 0.65, 0.025, metal, 'bipod', 'y');
      o.rotation.x = z * 0.5;
      box(x, -0.56, z * 0.39, 0.16, 0.035, 0.07, dark, 'bipod');
    }
  }
  function grip(x = -0.55) {
    poly(
      [
        [x - 0.13, -0.14],
        [x + 0.13, -0.17],
        [x + 0.06, -0.71],
        [x - 0.19, -0.68],
        [x - 0.27, -0.57],
      ],
      0.22,
      furniture,
      'grip',
    );
  }
  function mag(x = 0.12, curved = true) {
    poly(
      curved
        ? [
            [x - 0.18, -0.17],
            [x + 0.18, -0.17],
            [x + 0.18, -0.53],
            [x + 0.4, -1.03],
            [x + 0.1, -1.13],
            [x - 0.1, -0.7],
          ]
        : [
            [x - 0.18, -0.16],
            [x + 0.17, -0.16],
            [x + 0.2, -0.78],
            [x - 0.15, -0.78],
          ],
      0.2,
      dark,
      'magazine',
    );
    for (let k = 0; k < 3; k++)
      box(
        x - 0.09 + k * 0.075,
        -0.45,
        0.108,
        0.018,
        0.36,
        0.013,
        metal,
        'magazine',
      );
  }
  function guard(x = -0.43) {
    const c = new T.CatmullRomCurve3([
      new T.Vector3(x - 0.12, -0.15, 0),
      new T.Vector3(x + 0.03, -0.43, 0),
      new T.Vector3(x + 0.33, -0.4, 0),
      new T.Vector3(x + 0.36, -0.16, 0),
    ]);
    add(new T.TubeGeometry(c, 16, 0.025, 6, false), metal, 0, 0, 0, 'grip');
  }
  const p = w.profile,
    scoped = w.category === 'precision',
    mg = w.category === 'machinegun';
  if (p === 'pistol') {
    box(0.08, 0.16, 0, 1.4, 0.31, 0.27, metal, 'slide');
    box(-0.02, -0.05, 0, 1.23, 0.14, 0.27, furniture, 'receiver');
    poly(
      [
        [-0.58, -0.03],
        [-0.15, -0.04],
        [-0.29, -0.94],
        [-0.76, -0.94],
      ],
      0.3,
      furniture,
      'grip',
    );
    guard(-0.28);
    cylinder(0.8, 0.17, 0, 0.12, 0.055, dark, 'barrel');
    box(0.68, 0.35, 0, 0.05, 0.06, 0.055, dark, 'sight');
    box(-0.45, 0.35, 0, 0.08, 0.07, 0.17, dark, 'sight');
    for (let x = -0.51; x < -0.18; x += 0.055)
      box(x, 0.14, 0.141, 0.017, 0.21, 0.014, dark, 'slide');
    for (let y = -0.78; y < -0.22; y += 0.08)
      box(-0.48, y, 0.16, 0.19, 0.02, 0.01, dark, 'grip');
    group.scale.setScalar(2.6);
  } else if (p === 'trainer' || p === 'sporting') {
    poly(
      [
        [-2.45, 0.03],
        [-1.3, 0.12],
        [-0.98, -0.04],
        [-0.65, -0.03],
        [p === 'trainer' ? 2.28 : 1.18, -0.01],
        [p === 'trainer' ? 2.28 : 1.18, -0.14],
        [-0.6, -0.2],
        [-1, -0.19],
        [-1.2, -0.25],
        [-2.45, -0.45],
      ],
      0.22,
      furniture,
      'stock',
    );
    cylinder(0.81, 0.11, 0, 3.08, 0.055, metal, 'barrel');
    cylinder(-0.72, 0.1, 0, 0.82, 0.085, metal, 'receiver');
    cylinder(-1.04, 0.05, 0.13, 0.26, 0.035, metal, 'receiver', 'z');
    const ball = add(
      new T.SphereGeometry(0.075, 14, 10),
      metal,
      -1.04,
      0.05,
      0.3,
      'receiver',
    );
    ball.position.y = -0.02;
    guard(-0.98);
    box(2.2, 0.2, 0, 0.045, 0.12, 0.06, metal, 'sight');
    box(-0.5, 0.23, 0, 0.14, 0.08, 0.1, metal, 'sight');
    if (p === 'trainer') {
      for (const x of [1, 2.1])
        box(x, -0.005, 0, 0.08, 0.24, 0.27, metal, 'handguard');
    } else box(-0.22, -0.23, 0, 0.25, 0.18, 0.17, metal, 'magazine');
  } else if (p === 'bullpup') {
    poly(
      [
        [-1.83, 0.2],
        [-0.1, 0.2],
        [0.23, 0.07],
        [1.15, 0.05],
        [1.15, -0.2],
        [-0.47, -0.25],
        [-1.5, -0.4],
        [-1.83, -0.33],
      ],
      0.3,
      furniture,
      'receiver',
    );
    box(-1.82, -0.04, 0, 0.09, 0.68, 0.33, dark, 'stock');
    grip(0.05);
    mag(-1.04, false);
    guard(0.11);
    cylinder(
      1.6,
      0.03,
      0,
      w.id === 'qbz95b' ? 0.66 : 1.13,
      0.054,
      metal,
      'barrel',
    );
    box(-0.42, 0.49, 0, 1.33, 0.1, 0.16, dark, 'sight');
    box(-1, 0.3, 0, 0.13, 0.33, 0.17, furniture, 'sight');
    box(0.18, 0.3, 0, 0.14, 0.33, 0.17, furniture, 'sight');
    for (let x = 0.38; x < 1; x += 0.15)
      box(x, -0.03, 0.16, 0.07, 0.085, 0.015, dark, 'handguard');
    if (mg) bipod(1.5);
  } else {
    const isAK = p === 'ak' || p === 'insas',
      isG3 = p === 'g3' || p === 'mp5',
      short = p === 'mp5';
    const end = short ? 1.64 : 2.55;
    box(-0.17, 0.03, 0, 1.43, 0.3, 0.31, metal, 'receiver');
    cylinder(-0.2, 0.17, 0, 1.35, 0.09, metal, 'receiver');
    if (p === 'svd') {
      poly(
        [
          [-2.48, 0.17],
          [-1.07, 0.12],
          [-0.72, -0.18],
          [-1.13, -0.56],
          [-2.48, -0.52],
        ],
        0.22,
        furniture,
        'stock',
      );
      poly(
        [
          [-2.29, -0.06],
          [-1.45, -0.08],
          [-1.56, -0.34],
          [-2.28, -0.32],
        ],
        0.23,
        dark,
        'stock',
      );
      optic(-0.23);
    } else if (p === 'ar' || p === '191' || (p === 'ak' && w.id !== 'ak74m')) {
      cylinder(-1.45, 0.09, 0, 1.25, 0.074, metal, 'stock');
      poly(
        [
          [-2.46, 0.18],
          [-1.42, 0.18],
          [-1.35, -0.05],
          [-1.77, -0.11],
          [-2.08, -0.49],
          [-2.47, -0.49],
        ],
        0.25,
        furniture,
        'stock',
      );
      box(-2.46, -0.16, 0, 0.08, 0.71, 0.29, dark, 'stock');
    } else {
      poly(
        [
          [-2.5, 0.11],
          [-1.05, 0.12],
          [-0.88, -0.04],
          [-1.32, -0.16],
          [-2.5, -0.5],
        ],
        0.23,
        furniture,
        'stock',
      );
      box(-2.5, -0.2, 0, 0.06, 0.66, 0.26, dark, 'stock');
    }
    grip();
    guard();
    cylinder((0.56 + end) / 2, 0.05, 0, end - 0.56, 0.051, metal, 'barrel');
    cylinder(end - 0.04, 0.05, 0, 0.22, 0.087, dark, 'barrel');
    const foreEnd = short ? 1.32 : p === 'ar' || p === '191' ? 1.71 : 1.36;
    box(
      (0.48 + foreEnd) / 2,
      0.01,
      0,
      foreEnd - 0.48,
      0.32,
      0.33,
      furniture,
      'handguard',
    );
    if (isAK) {
      cylinder(1.02, 0.29, 0, 1.17, 0.043, metal, 'barrel');
      box(1.57, 0.18, 0, 0.08, 0.3, 0.08, metal, 'barrel');
    }
    if (isAK || isG3)
      for (let x = 0.59; x < foreEnd - 0.03; x += 0.13)
        box(x, 0.075, 0.175, 0.06, 0.075, 0.018, dark, 'handguard');
    else {
      rail(0.42, foreEnd, 0.24);
      for (let x = 0.57; x < foreEnd; x += 0.17)
        box(x, 0.025, 0.18, 0.09, 0.07, 0.02, dark, 'handguard');
      rail(-0.75, 0.3, 0.28);
    }
    if (mg) {
      box(0.24, -0.41, 0.15, 0.73, 0.58, 0.53, furniture, 'feed');
      bipod(1.72);
      box(0.32, 0.48, 0, 0.62, 0.045, 0.07, dark, 'receiver');
      box(0.12, 0.35, 0, 0.06, 0.26, 0.07, metal, 'receiver');
    } else mag(0.07, isAK);
    if (scoped && p !== 'svd') {
      optic(-0.1);
      bipod(1.2);
    }
    if (!scoped) {
      box(-0.66, 0.31, 0, 0.12, 0.08, 0.12, dark, 'sight');
      box(end - 0.4, 0.21, 0, 0.07, 0.31, 0.08, metal, 'sight');
    }
    if (p === 'insas') {
      box(-0.9, 0.35, 0, 0.14, 0.12, 0.17, metal, 'sight');
      for (let x = 0.57; x < 1.3; x += 0.11)
        box(x, -0.035, 0.184, 0.035, 0.17, 0.01, accent, 'handguard');
    }
    if (w.id === 'g3p4') {
      box(-1.78, 0.05, 0.18, 1.2, 0.045, 0.04, metal, 'stock');
    }
    for (const x of [-0.72, -0.18, 0.35])
      cylinder(x, 0, 0.17, 0.016, 0.028, accent, 'receiver', 'z');
  }
  const bounds = new T.Box3().setFromObject(group),
    size = bounds.getSize(new T.Vector3()),
    center = bounds.getCenter(new T.Vector3());
  group.position.sub(center);
  const root = new T.Group();
  root.add(group);
  root.scale.setScalar(5.5 / Math.max(size.x, size.y));
  return root;
}
export function cartridgeGeometry(c: Cartridge) {
  const root = new T.Group();
  const k = c.illustration;
  const h = k.length / 18,
    r = k.width / 36;
  const brass = new T.MeshStandardMaterial({
    color: 0xbda16b,
    metalness: 0.78,
    roughness: 0.29,
  });
  const copper = new T.MeshStandardMaterial({
    color: c.ignition === 'Rimfire' ? 0x777c80 : 0xb47a56,
    metalness: 0.7,
    roughness: 0.3,
  });
  const caseH = h * (k.shoulder ? 0.72 : 0.64);
  const neck = k.shoulder ? r * 0.62 : r * 0.94;
  const points = k.shoulder
    ? [
        new T.Vector2(r, 0),
        new T.Vector2(r, caseH * 0.77),
        new T.Vector2(neck, caseH * 0.91),
        new T.Vector2(neck, caseH),
      ]
    : [new T.Vector2(r, 0), new T.Vector2(neck, caseH)];
  const body = new T.Mesh(new T.LatheGeometry(points, 48), brass);
  body.name = 'case';
  root.add(body);
  const cap = new T.Mesh(new T.CylinderGeometry(r, r, h * 0.022, 48), brass);
  cap.name = 'rim';
  root.add(cap);
  const rim = new T.Mesh(
    new T.CylinderGeometry(
      k.rim ? r * 1.17 : r,
      k.rim ? r * 1.17 : r,
      h * 0.024,
      48,
    ),
    brass,
  );
  rim.position.y = -h * 0.02;
  rim.name = 'rim';
  root.add(rim);
  const bullet = new T.Mesh(
    new T.LatheGeometry(
      [
        new T.Vector2(neck, 0),
        new T.Vector2(neck, h * 0.08),
        new T.Vector2(neck * 0.8, h * 0.17),
        new T.Vector2(neck * 0.42, h * 0.25),
        new T.Vector2(0.01, h - caseH),
      ],
      48,
    ),
    copper,
  );
  bullet.position.y = caseH;
  bullet.name = 'projectile';
  root.add(bullet);
  root.position.y = -h / 2;
  const shell = new T.Group();
  shell.add(root);
  return shell;
}
