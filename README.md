# ORBAT Atlas

[Open the live atlas](https://orbat-atlas.vercel.app) · [Public dataset](https://github.com/aditya-tiwari108/orbat-atlas/tree/main/data)

A map-first explorer of publicly documented Indian, Pakistani and Chinese Army, Navy and Air Force organizations, plus India’s NCC. Built with React, TypeScript, MapLibre and CARTO vector basemaps.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
cp .env.example .env.local
# Set VITE_CARTO_API_KEY in .env.local
npm run dev
```

`npm run build` creates `dist/`. `npm run preview` serves the production build. `npm test` validates data and cartography invariants; `npm run lint` checks application code. Run `npx playwright install chromium` once, then `npm run test:e2e` to verify the production build. Set `ATLAS_TEST_URL` to check a deployment and `CHROME_PATH` to select an installed Chrome binary.

## Explore

Switch service modes, select a command or directorate, then browse subordinate formations in its dossier or connected tree. Select India, Pakistan or China with the country control. Pakistan and China have three service modes. China’s five joint theaters are browsed in Army mode, with linked service components. See [the China audit](docs/china-audit.md) for dated evidence and unresolved fields. Search across countries and services with Ctrl/⌘ K. Share the address bar URL (`?org=organization-id`); browser Back restores earlier selections. Headquarters sharing a city open a chooser.

Commands use geographic names; corps and divisions use generated APP-6-style headquarters symbols. Training and maintenance commands appear on the map alongside the other command headquarters. Each service opens a dismissible leadership panel with its chief and the CDS (NCC shows its Director General). Command dossiers emphasize a large commander photograph, short overview, Wikipedia link and subordinate organizations. Ships are organizational assets and have no map positions.

## Public data and limitations

See [coverage and record-specific gaps](docs/data-coverage.md). This is a dated, partial public-source snapshot, **not a complete or live order of battle**. Names, headquarters cities and command-level relationships were manually reviewed. Leadership evidence and appointment dates are separate. Unknown or conflicting office-holders and portraits are explicitly labeled.

Headquarters coordinates are approximate city centers, not facility or deployment coordinates. Some subordinate relationships remain reported associations with uncorroborated current status; the dataset and coverage report retain those field-level limitations. Announced NCC reorganizations remain distinct from documented operating directorates. Andaman and Nicobar Command is tri-service; its placement in Navy mode is a browsing affiliation.

No territorial polygons are inferred from HQ points. India's national outline is derived from Survey of India's 1:16 million source and hidden at close zoom. CARTO administrative border and region-label layers are suppressed to avoid conflicting outlines. This generalized geometry is not suitable for local boundary interpretation.

## Data architecture

- `data/india.json` and `data/pakistan.json`: country organizations and source registries, with stable IDs.
- `data/model.ts`: typed records, field evidence, dated leadership, sourced geography and verification gaps.
- `data/media.json`: exact leader-to-portrait associations, source and reproduction attribution.
- `data/leadership.json`: country-level defence leadership, independent of service command hierarchies.
- `data/review/`: field audit and unresolved image candidates.
- `data/country-config.ts`: per-country map bounds, outline, service labels and presentation.
- `data/catalog.ts`: country dataset registration, search and traversal.
- `components/explorer/`: navigation, map, search, dossier and hierarchy modules.

To add a country, add a dataset and source registry, register it in `catalog.ts`, and add country metadata and map presentation. IDs must be globally unique. Service browsing categories and actual organizational subordination are distinct concepts.

## Reproducible artifacts

`node scripts/generate-image-credits.mjs` regenerates the public portrait-credit page linked from About. `python3 scripts/coverage-report.py` regenerates the coverage report from canonical records. Copy it to `public/data-coverage.md` for the app. `node scripts/generate-symbols.mjs` regenerates the browser SVG symbol registry using milsymbol, keeping the full renderer out of the initial bundle. Geography preparation scripts document the downloaded source and generalization process. The review map script accepts the Natural Earth GeoJSON and SOI `.prj` as command-line arguments, and requires Shapely and pyproj. Historical review SVGs and PNGs live in `design/review/`. The user dropped Figma on 8 September 2026; design changes are reviewed directly in the running application.

## Deployment

Vercel configuration is included. Set `VITE_CARTO_API_KEY` for Production and Preview in the Vercel project before building. It is a browser basemap key: its value is delivered to the browser to authorize tile requests, while `.env.local` is never committed. Restrict usage in the provider account where supported. No database, login, server-side secret or live tracking service is required.

See [contribution guidance](CONTRIBUTING.md) and [attribution](ATTRIBUTION.md).

Production is deployed through the Vercel CLI. The attempted GitHub integration did not connect, so pushes currently run validation without automatically publishing a new deployment. Use `npx vercel deploy --prod --scope aditya-ed1c` from the linked project to publish a tested update.

### NCC regions

NCC mode joins the 19 approved directorate remits to Survey of India's 2025 ABDB state/UT boundaries. Andhra Pradesh and Jharkhand were approved on 15 June 2026; their operational opening and new headquarters remain unverified. The predecessor office records retain their sourced combined names during the transition. Karnataka & Goa is a single combined region; selecting it reveals six group headquarters. Group boundaries are not inferred. Four disputed interstate polygons from the source remain neutral. The layer is generalized by 250 metres and stops at zoom 10; headquarters and the organizational tree remain accessible.

To regenerate the region file, download the state archive from [SOI ABDB](https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-), extract `State Boundary.shp` and its companion files, install `pyshp`, `shapely` and `pyproj` in a Python environment, then run:

```sh
python scripts/prepare-ncc-regions.py /path/to/extracted/state-directory
```

The script validates the 36 state/UT assignments, preserves source-designated disputed areas, and writes GeoJSON plus sourced coverage/bounds into the dataset. See [Karnataka & Goa's field audit](docs/ncc-karnataka-goa-audit.md) for dated unit evidence and unresolved records.

### NCC cartographic labels

`python scripts/prepare-region-labels.py` (Shapely and pyproj required) derives horizontal label boxes from the existing NCC region polygons in Web Mercator. Full and compact boxes share a fixed center; every box is checked for containment in its directorate's largest land polygon. These are cartographic positions, independent of headquarters. The north-up browser map measures font widths and fits or abbreviates names within those boxes; tiny regions remain selectable through their polygon, search and the directorate index. No group boundaries are inferred.

The September 12 research expansion documents six Karnataka & Goa groups and 55 units, including 4 Karnataka Engineer Company at Manipal. Two unit records are historical-only, and older parent/HQ evidence is dated individually. This is not a certified current roster. The [field audit](docs/ncc-karnataka-goa-audit.md) provides the complete register, primary-source links, institution associations and unresolved conflicts.

### Navy and Air Force detail

The [September 15 field audit](docs/navy-airforce-audit.md) documents 40 flying squadrons linked to 23 air stations, 27 ships in total, 19 additional naval shore establishments and the 1st Training Squadron. `data/india-naval-air.json` extends the original dataset through `data/india.ts`. Squadron parent edges mean **based at**; separately sourced `aviation.commandId` and field evidence preserve the command relationship. Ships remain unlocated assets. Dossiers support aircraft/class facts, base navigation and expandable, filterable child lists. Coverage remains partial and the audit lists excluded conflicting records.

### Pakistan

The [Pakistan audit](docs/pakistan-audit.md) describes 117 organizations: field corps and divisions, naval commands and ships, and air commands, bases and squadrons. This is partial public reference coverage. Three service-chief portraits have identified Commons sources and reuse licenses; command-level portraits remain research gaps. Pakistan uses Natural Earth’s public-domain 1:50 million **de facto** outline, including its disputed-boundary convention. No military territorial boundaries are inferred. The outline is hidden above zoom 7.

### China

The [China audit](docs/china-audit.md) documents five joint theaters, linked service components, all thirteen group armies, selected commissioned ships and twenty published aviation-brigade/base associations. Leadership is dated individually; unresolved current appointments and portraits are withheld. Aircraft/base coverage is partial and underlying evidence is sometimes older than the review date. `jointCommandId` preserves operational theater links independently of administrative `parentId` trees. China uses a documented Natural Earth/SOI-clipped overview; it does not merge Aksai Chin or Arunachal Pradesh into its outline. Pakistan's de facto geography and India's separate SOI presentation are retained.

## Platform hub and rank explorer

The same application and Vercel project now serve a broader reference hub at `/`, the map at `/atlas`, and rank comparisons at `/ranks`. Existing root query links such as `/?org=in-army-northern` remain supported.

**To rename the platform, edit `data/platform.ts`.** The header, homepage, Atlas home link, footers, page titles and generated HTML metadata read this single configuration. Product names such as ORBAT Atlas and the existing repository/domain do not need to change. Design and route decisions are documented in [the platform design notes](docs/ranks-design.md).

The rank explorer compares Navy, Army and Air Force within India, Pakistan or China. India NCC has separate cadet and ANO categories for its three wings. Hover and keyboard focus highlight a comparison row; selecting a rank opens enlarged insignia and a shareable URL. Search covers all categories within the selected country. Unknown equivalents are empty cells, and missing artwork is distinguished from ranks without insignia.

`data/ranks/rows.json` contains rank comparisons; `sources.json` stores references; `assets.json` records the author, license and source of every locally hosted insignia. [Coverage and known gaps](public/ranks-coverage.md) describe disputed NCC mappings, Pakistan's unmatched technical grades and unverified ANO-specific artwork. Rank data is independent of the ORBAT organization schema. The hub and rank page do not load MapLibre until Atlas is opened.

## NATO symbols and practice

Open `/symbols` for the formation library, live symbol builder, anatomy explanations, shared configurations and SVG downloads. The small **Quiz yourself** button on `/ranks` and `/symbols` creates a session from the underlying records: image and description prompts, six choices, feedback and a review. Rank quizzes can be scoped by country and/or service; symbols can be scoped by topic. See [scope, references and architecture](docs/symbols-and-quizzes.md).
