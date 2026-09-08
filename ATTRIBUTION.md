# Sources and attribution

## Cartography

- India outline: [Survey of India](https://surveyofindia.gov.in/pages/outline-maps-of-india), source scale 1:16 million. Generalized for national overview; not a precise local boundary layer.
- NCC administrative regions: [Survey of India ABDB](https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-), 2025 state edition (metadata published 6 May 2026), 1:50,000 source, generalized to 250 metres. Copyright Survey of India; used with attribution. Directorate remit is sourced separately in the dataset. Four source-designated interstate disputed features remain unassigned.
- Vector basemap: [CARTO](https://carto.com/attributions), based on [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Attribution remains visible on the map.
- Portable review-map context: Natural Earth 1:110m public-domain country polygons, clipped against the Survey of India outline for the design overview.

## Photographs and insignia

Every included portrait has its own source, identity association and reuse statement in `data/media.json`. Ministry of Defence/PIB images are reproduced with source acknowledgement under the [PIB copyright policy](https://www.pib.gov.in/content/3622_2_CopyrightPolicy.aspx?lang=6&reg=17); third-party exceptions are respected. Anindya Sengupta's portrait is credited to Indian Army via Wikimedia Commons under the CC BY 4.0 declaration on its file page. Original images are preserved; the interface crops some images for display.

Service emblems have separate credits in `data/insignia.ts`. They are labeled service emblems, not passed off as formation-specific insignia. Missing formation insignia is explicitly reported.

## Interface assets

- APP-6-style organizational symbols: [milsymbol](https://github.com/spatialillusions/milsymbol), MIT. Generated SVGs retain renderer provenance in `scripts/generate-symbols.mjs`.
- Utility icons: Lucide, ISC.
- IBM Plex Sans / IBM Plex Mono / Barlow Condensed: SIL Open Font License, distributed through Fontsource.
- MapLibre GL JS: BSD-3-Clause.

Source material retains its respective rights. A public source URL does not itself imply unrestricted image reuse.
