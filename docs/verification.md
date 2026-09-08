# Verification — 8 September 2026

## Data review

All 37 command/directorate entries have field-level review records for identity, headquarters and parent/browsing affiliation. The set includes 17 service commands, the tri-service Andaman and Nicobar Command, 17 documented NCC directorates and two approved creations. Thirty leadership records retain dated or explicitly undated evidence. Fifteen included portrait associations have been visually checked and attributed. Remaining identities, portraits and relationships are itemized in `data-coverage.md`; the dataset is not claimed to be complete or live.

## Local application verification

- TypeScript and Vite production build: passed.
- Oxlint: passed.
- Catalog, field evidence, image association, map source and symbol validation: passed.
- `npm audit`: zero reported vulnerabilities after removing unused prototype server packages and applying compatible updates.
- Six Playwright end-to-end scenarios passed against the production build on 8 September 2026:
  - National overview, keyboard search, corps → unmapped division, reloadable deep link and browser Back.
  - Navy shared-headquarters chooser, fleet navigation, no carrier position markers and tri-service classification.
  - Air Force non-territorial selector and NCC directorate → group → unit navigation.
  - Mobile layout at 390 × 844, reduced motion, selected HQ above the sheet and no horizontal overflow.
  - Blocked CARTO requests preserve the local outline and organization markers; Retry recovers.
  - Missing portrait fallback and keyboard Escape from the search dialog.

Manual desktop/mobile screenshots were reviewed. These checks found and corrected the MapLibre 6 worker URL, the lazy CSS container height, overlapping national labels and mobile camera padding. The same six Playwright scenarios also passed against https://orbat-atlas.vercel.app on 8 September 2026. The deployment was public, and no production browser errors were reported. GitHub CI passed for the published revision.

## Design checkpoint

The user explicitly cleared the checkpoint on 7 September 2026 ("consider everything approved from my side"). The implementation follows the prepared map-first review boards. The Figma file contains editable foundations and geography; tool quota prevented completing the editor transfer. Portable review SVGs retain editable text and geometry. This limitation remains documented rather than representing the Figma file as finished.

## Desktop zoom regression audit (subsequent user feedback)

The original six tests missed visual and camera-state defects. The revised implementation removes collision-driven hiding of command names, preserves command DOM nodes through level-of-detail changes, stages subordinate layers with transition hysteresis, and keeps command identity when subordinate HQs share a city. Connected callouts avoid other names and HQ click targets. Point-centered `fitBounds` replaces persistent fly-to padding, fixing repeated dossier visits shrinking and shifting the national overview.

Sixteen local browser scenarios passed after these fixes. Additional coverage includes four-mode zoom-in/out cycles, panning, command-button identity, all 17 mapped NCC labels at 1440×900, 1280×720 and 1280×633, clicking every directorate at each size, comparing HQ positions before/after repeated selections, and Karnataka & Goa’s six groups/shared Bengaluru HQs/Goa unit navigation. Animated mouse-wheel transitions and the Mysuru air-unit flow also passed. These results apply to the working build until it is redeployed. Mobile redesign is deferred per user instruction; its existing smoke test remains.
