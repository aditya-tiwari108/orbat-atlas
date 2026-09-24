import type { Weapon, Cartridge } from '../../data/armoury/model';
export function WeaponOutline({ weapon }: { weapon: Weapon }) {
  const p = weapon.profile;
  const wood = ['trainer', 'sporting', 'svd'].includes(p);
  return (
    <svg
      viewBox="0 0 500 150"
      fill="none"
      className="weapon-outline"
      aria-hidden="true"
    >
      <g
        fill="currentColor"
        opacity=".78"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        {p === 'pistol' ? (
          <>
            <path d="M155 40H343V70H253L239 132H177L190 72H155Z" />
            <path d="M253 70H292V93H248" fill="none" />
          </>
        ) : p === 'bullpup' ? (
          <>
            <path d="M60 43H325V74H235L224 118H202L206 76H60Z" />
            <path d="M104 75H137L139 123H107Z" />
            <path d="M125 43V22H235V43" fill="none" />
            <path d="M325 53H435V61H325Z" />
          </>
        ) : wood ? (
          <>
            <path
              d={`M28 48L125 51L158 67L${p === 'trainer' ? 455 : 303} 61V72L144 79L112 98L28 103Z`}
            />
            <path d="M142 50H464V59H142Z" />
            <path d="M125 76Q118 100 160 87" fill="none" />
          </>
        ) : (
          <>
            <path d="M30 38H132L160 50H282V75H203L194 117H174L177 72H132L70 97H30Z" />
            <path d="M281 49H372V75H281Z" />
            <path d="M372 57H466V64H372Z" />
            <path
              d={
                weapon.category === 'machinegun'
                  ? 'M217 77H285V117H217Z'
                  : 'M233 77H260L268 109L281 132L251 142L238 115Z'
              }
            />
            <path d="M386 62V44H395V63" />
            {weapon.category === 'precision' && (
              <path d="M172 29H262V42H172Z" />
            )}
            {weapon.category === 'machinegun' && (
              <path d="M366 72L345 132M366 72L387 132" fill="none" />
            )}
          </>
        )}
      </g>
    </svg>
  );
}
export function CartridgeOutline({
  cartridge,
  scale = 1,
}: {
  cartridge: Cartridge;
  scale?: number;
}) {
  const k = cartridge.illustration,
    h = k.length * scale,
    w = k.width * scale;
  const shoulder = k.shoulder;
  return (
    <svg
      width={Math.max(w + 18, 36)}
      height={h + 12}
      viewBox={`${-w} -4 ${w * 2} ${k.length + 8}`}
      aria-hidden="true"
      className="cartridge-outline"
    >
      <path
        d={
          shoulder
            ? `M${-k.width / 2},${k.length}V${k.length * 0.4}L${-k.width * 0.31},${k.length * 0.28}V${k.length * 0.25}H${k.width * 0.31}V${k.length * 0.28}L${k.width / 2},${k.length * 0.4}V${k.length}Z`
            : `M${-k.width / 2},${k.length}V${k.length * 0.35}H${k.width / 2}V${k.length}Z`
        }
        fill="#bba274"
        stroke="#e6cea0"
        strokeWidth=".4"
      />
      <path
        d={`M${-k.width * (shoulder ? 0.31 : 0.49)},${k.length * (shoulder ? 0.25 : 0.35)}Q${-k.width * 0.28},2 0,0Q${k.width * 0.28},2 ${k.width * (shoulder ? 0.31 : 0.49)},${k.length * (shoulder ? 0.25 : 0.35)}Z`}
        fill={cartridge.ignition === 'Rimfire' ? '#9a9f9e' : '#b7825e'}
        stroke="#d4b896"
        strokeWidth=".4"
      />
      <path
        d={`M${-k.width * (k.rim ? 0.61 : 0.5)},${k.length - 1}H${k.width * (k.rim ? 0.61 : 0.5)}V${k.length + 1}H${-k.width * (k.rim ? 0.61 : 0.5)}Z`}
        fill="#d7bc84"
      />
    </svg>
  );
}
