# Contributing

Prefer an official organization page, appointment release or government document. Reputable secondary references may fill gaps when clearly identified. Do not infer deployments, coordinates or parent relationships from an exercise, proximity, shared city or historical association.

For each change:

1. Preserve existing organization IDs and add aliases for renamed records.
2. Add the source to `data/india.json`, including publisher, URL, kind and check date. Keep publication dates separate.
3. Attach evidence to the specific field it supports. An HQ source does not establish a commander or current parent.
4. For leaders, distinguish appointment dates from dated observations and undated profiles. Keep announced successors separate until assumption is documented.
5. For photographs, identify the exact subject visually and in the source context. Include credit, source URL and applicable reproduction terms in `data/media.json`. Do not substitute a service chief or previous commander for a missing portrait.
6. Keep unverified headquarters unmapped. Ships always have `location: null`. Document organizational assets without current positions.
7. Run `npm test`, `npm run lint` and `npm run build`. Regenerate the coverage report. Manually check the affected record and image in the browser.

An empty branch means missing dataset coverage, not that an organization has no subordinates. Data validation tests establish structural consistency; they do not establish factual truth.

For Navy/Air Force expansion records, use `data/india-naval-air.json` and its source registry. Preserve existing records in `data/india.json`. Flying squadrons use `location: null`, `relationshipKind: base-association`, and a separately sourced `aviation.baseId` / `aviation.commandId`; add evidence for base, aircraft and command individually. Do not infer command affiliation from the base's city. Update `docs/navy-airforce-audit.md` and its public copy when coverage changes.

## Rank comparisons and branding

- Change the umbrella name and tagline only in `data/platform.ts`; the public UI and HTML metadata read it automatically.
- Add or correct rank rows in `data/ranks/rows.json`, with explicit evidence for equivalence within the same country and category. A missing equivalent is `null`, not a best guess based on seniority or a similar English name.
- Keep armed-forces, NCC cadet and NCC ANO ladders separate. Chinese native grades, not English translations, anchor China comparisons.
- Every insignia file needs a creator, reuse license, source page and checked date in `data/ranks/assets.json`. Preserve the distinction between `noInsignia: true` and an unverified image.
- Run `npm test`, `npm run lint`, `npm run build` and `npx playwright test`. Rank UI tests cover hover, keyboard focus, direct links, empty cells, image failures and narrow layouts; Atlas tests retain legacy root query URLs.

## Arms and cartridges

- Add records in `data/armoury/catalog.ts` and primary references in `sources.ts`. Name the exact variant, country association and source for each technical field. A manufacturer's product listing does not establish service adoption.
- Retain loading, stock and accessory configuration with measurements. Do not substitute civilian/export-variant specifications for a military variant without explicit supporting evidence. Leave conflicting or unverified fields unset and explain the gap.
- Attribute any community model with its exact model page, creator and reuse license. Visually inspect the named pattern and check public license metadata. Do not substitute a visually similar weapon or conceal production-variant differences. Never relabel original simplified geometry as a verified replica.
- Keep public data separate from visual drawing proportions. Cartridge illustrations are not engineering dimensions. Update `docs/armoury-coverage.md` with substantive additions or corrections.
- Check the local and external views, keyboard controls, comparison, shared URLs and unavailable-WebGL fallback when changing the viewer. Run the existing checks before publishing to the same Vercel project.
