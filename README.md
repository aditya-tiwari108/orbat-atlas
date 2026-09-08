# ORBAT Atlas

[Open the live atlas](https://orbat-atlas.vercel.app) · [Public dataset](https://github.com/aditya-tiwari108/orbat-atlas/tree/main/data)

A map-first explorer of publicly documented Indian Army, Navy, Air Force and NCC organizations. Built with React, TypeScript, MapLibre and CARTO vector basemaps.

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

Switch service modes, select a command or directorate, then browse subordinate formations in its dossier or connected tree. Search across services with Ctrl/⌘ K. Share the address bar URL (`?org=organization-id`); browser Back restores earlier selections. Headquarters sharing a city open a chooser.

Commands use geographic names; corps and divisions use generated APP-6-style headquarters symbols. Training and maintenance commands have a separate non-territorial selector. Ships are organizational assets and have no map positions. The initial screen has no permanent sidebars.

## Public data and limitations

See [coverage and record-specific gaps](docs/data-coverage.md). This is a dated, partial public-source snapshot, **not a complete or live order of battle**. Names, headquarters cities and command-level relationships were manually reviewed. Leadership evidence and appointment dates are separate. Unknown or conflicting office-holders and portraits are explicitly labeled.

Headquarters coordinates are approximate city centers, not facility or deployment coordinates. Some subordinate relationships remain reported associations with uncorroborated current status; the dossier exposes that limitation. Announced NCC reorganizations remain distinct from documented operating directorates. Andaman and Nicobar Command is tri-service; its placement in Navy mode is a browsing affiliation.

No territorial polygons are inferred from HQ points. India's national outline is derived from Survey of India's 1:16 million source and hidden at close zoom. CARTO administrative border and region-label layers are suppressed to avoid conflicting outlines. This generalized geometry is not suitable for local boundary interpretation.

## Data architecture

- `data/india.json`: organizations and source registry, with stable IDs.
- `data/model.ts`: typed records, field evidence, dated leadership, sourced geography and verification gaps.
- `data/media.json`: exact leader-to-portrait associations, source and reproduction attribution.
- `data/review/`: field audit and unresolved image candidates.
- `data/country-config.ts`: per-country map bounds, outline, service labels and presentation.
- `data/catalog.ts`: country dataset registration, search and traversal.
- `components/explorer/`: navigation, map, search, dossier and hierarchy modules.

To add a country, add a dataset and source registry, register it in `catalog.ts`, and add country metadata and map presentation. IDs must be globally unique. Service browsing categories and actual organizational subordination are distinct concepts.

## Reproducible artifacts

`python3 scripts/coverage-report.py` regenerates the coverage report from canonical records. Copy it to `public/data-coverage.md` for the app. `node scripts/generate-symbols.mjs` regenerates the browser SVG symbol registry using milsymbol, keeping the full renderer out of the initial bundle. Geography preparation scripts document the downloaded source and generalization process. The review map script accepts the Natural Earth GeoJSON and SOI `.prj` as command-line arguments, and requires Shapely and pyproj. Review SVGs and PNGs live in `design/review/`; the user authorized implementation on 7 September 2026 after the Figma tool quota prevented further transfers.

## Deployment

Vercel configuration is included. Set `VITE_CARTO_API_KEY` for Production and Preview in the Vercel project before building. It is a browser basemap key: its value is delivered to the browser to authorize tile requests, while `.env.local` is never committed. Restrict usage in the provider account where supported. No database, login, server-side secret or live tracking service is required.

See [contribution guidance](CONTRIBUTING.md) and [attribution](ATTRIBUTION.md).

Production is deployed through the Vercel CLI. The attempted GitHub integration did not connect, so pushes currently run validation without automatically publishing a new deployment. Use `npx vercel deploy --prod --scope aditya-ed1c` from the linked project to publish a tested update.

### NCC regions

NCC mode joins the 17 documented directorate remits to Survey of India's 2025 ABDB state/UT boundaries. Karnataka & Goa is a single combined region; selecting it reveals six group headquarters. Group boundaries are not inferred. Four disputed interstate polygons from the source remain neutral. The layer is generalized by 250 metres and stops at zoom 10; headquarters and the organizational tree remain accessible.

To regenerate the region file, download the state archive from [SOI ABDB](https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-), extract `State Boundary.shp` and its companion files, install `pyshp`, `shapely` and `pyproj` in a Python environment, then run:

```sh
python scripts/prepare-ncc-regions.py /path/to/extracted/state-directory
```

The script validates the 36 state/UT assignments, preserves source-designated disputed areas, and writes GeoJSON plus sourced coverage/bounds into the dataset. See [Karnataka & Goa's field audit](docs/ncc-karnataka-goa-audit.md) for dated unit evidence and unresolved records.
