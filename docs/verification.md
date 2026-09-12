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

## Design workflow

On 8 September 2026 the user explicitly instructed: “Don't use figma, ditch it.” Figma is removed from the remaining deliverables and review gates. Design work proceeds directly in the React application, with rendered browser previews and interaction tests. The temporary capture script was removed without publishing it. Existing review SVGs remain historical artifacts, not an outstanding Figma transfer requirement.

## Desktop zoom regression audit (subsequent user feedback)

The original six tests missed visual and camera-state defects. The revised implementation removes collision-driven hiding of command names, preserves command DOM nodes through level-of-detail changes, stages subordinate layers with transition hysteresis, and keeps command identity when subordinate HQs share a city. Connected callouts avoid other names and HQ click targets. Point-centered `fitBounds` replaces persistent fly-to padding, fixing repeated dossier visits shrinking and shifting the national overview.

Sixteen local browser scenarios passed after these fixes. Additional coverage includes four-mode zoom-in/out cycles, panning, command-button identity, all 17 mapped NCC labels at 1440×900, 1280×720 and 1280×633, clicking every directorate at each size, comparing HQ positions before/after repeated selections, and Karnataka & Goa’s six groups/shared Bengaluru HQs/Goa unit navigation. Animated mouse-wheel transitions and the Mysuru air-unit flow also passed. All sixteen scenarios also passed against the production alias on 8 September 2026 (deployment `dpl_7ZSinAddiE8XguvEACAcKrS4EErM`, application commit `c3a162b`). A separate live check confirmed 33 successful CARTO responses, the region GeoJSON loaded successfully, six group rows, and no browser errors or map-error messages. Mobile redesign is deferred per user instruction; its existing smoke test remains.

GitHub validation passed for `c3a162b`: https://github.com/aditya-tiwari108/orbat-atlas/actions/runs/34224390632.

## Desktop visual audit — 12 September 2026

The reported XVI Corps displacement was a rendering defect: MapLibre centered the entire variable-width symbol/label button on the location. The military glyph therefore sat west of the actual coordinate, and the geographic size of that pixel error changed with zoom. The marker now has a fixed geographic anchor; the generated milsymbol reference point (the HQ staff tip) is placed on it. Symbol size and reference metadata are version-controlled with each generated SVG. Labels use independent callouts and cannot shift the glyph.

Collision placement now includes corps, divisions, groups and units as well as commands, reserves symbol bounds and controls, and gives military text room to the right of its glyph. Selected-view camera padding keeps staff/echelon graphics below the header. Background place names appear later and are subdued. Short desktop dossiers use compact spacing and smaller missing-photo placeholders; shared-HQ menus have bounded scrolling; search repositions the highlighted result after a query change. Figma remains excluded per user instruction.

The visual regression suite checks rendered SVG staff endpoints through zoom/label/font changes, selected-view label overlap at 1280, 1440 and 1920 pixels, long shared-HQ menus on a 633-pixel-high viewport, and query-change scroll behavior. Existing four-mode zoom, NCC region, keyboard, deep-link, fallback and mobile smoke scenarios remain in the suite. Screenshots of Northern Command and Karnataka & Goa were visually reviewed. These checks establish the tested cases, not an assertion that every possible visual state is bug-free.

Local validation for this pass: TypeScript/Vite build, lint, data/symbol tests and all 21 Playwright scenarios passed on 12 September 2026.

## NCC cartography and research expansion — 13 September 2026

The previous collision solver could move a command label hundreds of pixels away from its HQ when zooming out. Callouts now have a maximum 32-pixel vertical offset and a fixed side gap. Labels compact at wide zoom without moving the HQ anchor. The new Central Command regression checks both the label/HQ distance and the leader length during animated wheel and button zoom, covering the geographic-association defect that earlier overlap-only checks missed.

NCC directorate names now occupy fixed interior rectangles derived from the published region geometry. Full and compact rectangles share a geographic center and are checked for containment by the preparation script. Font metrics determine text width; both rectangle height and width constrain the type size. Small regions abbreviate or defer their label until there is room, and all 17 remain in the directorate index, search and region selection. The map stays north-up and flat so projected label rectangles retain their containment guarantee. Directorate names are cartographic labels, distinct from selected HQ points. Group boundaries are not inferred.

Karnataka & Goa coverage expands from 19 to 55 unit records across six groups. The 2017 parliamentary register supplies a dated baseline; later official and institutional sources corroborate fields independently. Two historical-only units remain accessible in the hierarchy but do not appear as ordinary current map markers. The 4 Karnataka Engineer Company dossier includes Manipal, its Mangaluru parent, a dated Officer Commanding record and separately sourced institutional associations. The public research report lists 63 consulted/retained sources and field-specific limitations. Structural checks do not certify factual completeness or current incumbency.

The revised browser suite covers four desktop sizes (1920×1080, 1440×900, 1280×720 and 1280×633), interior label fitting through zoom cycles, directorate-index interaction, polygon selection, 4 Kar Eng Coy search → dossier → sources → parent/tree, military HQ staff anchoring, overlapping labels and controls, shared-HQ menus, all four modes, deep links, keyboard access and tile/portrait failures. The existing mobile smoke test remains; mobile redesign is deferred. Manual short-desktop screenshots were also reviewed. One intermediate run exposed wide-letter overflow in compact region names; font measurement replaced the initial character-count estimate.

Local validation: production build, lint and all catalog/evidence/map tests passed. All 22 browser scenarios passed after the cartographic fixes. After the final unit-dossier spacing change, the 4 Kar Eng Coy search/evidence/parent flow was checked again. Production verification is recorded separately after deployment.
