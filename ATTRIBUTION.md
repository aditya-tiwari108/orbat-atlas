# Sources and attribution

## Cartography

- India outline: [Survey of India](https://surveyofindia.gov.in/pages/outline-maps-of-india), source scale 1:16 million. Generalized for national overview; not a precise local boundary layer.
- NCC administrative regions: [Survey of India ABDB](https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-), 2025 state edition (metadata published 6 May 2026), 1:50,000 source, generalized to 250 metres. Copyright Survey of India; used with attribution. Directorate remit is sourced separately in the dataset. Four source-designated interstate disputed features remain unassigned.
- Vector basemap: [CARTO](https://carto.com/attributions), based on [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Attribution remains visible on the map.
- Portable review-map context: Natural Earth 1:110m public-domain country polygons, clipped against the Survey of India outline for the design overview.

- Pakistan outline and WebGL fallback: [Natural Earth 1:50 million admin-0 countries](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/), public domain. The PAK feature follows Natural Earth’s [de facto disputed-boundary policy](https://www.naturalearthdata.com/about/disputed-boundaries-policy/).

## Photographs and insignia

Every included portrait has its own source, identity association and reuse statement in `data/media.json`. Ministry of Defence/PIB images are reproduced with source acknowledgement under the [PIB copyright policy](https://www.pib.gov.in/content/3622_2_CopyrightPolicy.aspx?lang=6&reg=17); third-party exceptions are respected. Anindya Sengupta's portrait is credited to Indian Army via Wikimedia Commons under the CC BY 4.0 declaration on its file page. Source URLs are preserved; local copies may be resized and compressed, and the interface crops some images for display. NCC and Indian Air Force official portraits additionally retain their GODL-India declarations and file-page attribution. The public [portrait-credit page](https://orbat-atlas.vercel.app/image-credits.html), linked from About, lists every displayed leader photograph.

Service emblems have separate credits in `data/insignia.ts`. They are labeled service emblems, not passed off as formation-specific insignia. Missing formation insignia is explicitly reported.

## Interface assets

- APP-6-style organizational symbols: [milsymbol](https://github.com/spatialillusions/milsymbol), MIT. Generated SVGs retain renderer provenance in `scripts/generate-symbols.mjs`.
- Utility icons: Lucide, ISC.
- IBM Plex Sans / IBM Plex Mono / Barlow Condensed: SIL Open Font License, distributed through Fontsource.
- MapLibre GL JS: BSD-3-Clause.

Source material retains its respective rights. A public source URL does not itself imply unrestricted image reuse.

## Organizational reference data

The Navy/Air Force extension in `data/india-naval-air.json` attributes Wikipedia contributors through individual article links and source records, supplemented by dated Ministry of Defence/PIB releases. Descriptions are condensed in original wording; Wikipedia text is available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). See the [field audit](docs/navy-airforce-audit.md) for source conflicts and exclusions. No new imagery is imported by this extension.

Pakistan reference data in `data/pakistan.json` similarly attributes individual Wikipedia articles and dated Radio Pakistan reports. The three official-origin service-chief portraits are attributed to ISPR / the relevant service via Wikimedia Commons: Asim Munir and Zaheer Ahmed Baber Sidhu under CC BY-SA 4.0; Naveed Ashraf under CC BY 4.0. The air-chief image uses Wikimedia’s proportionally resized 960px thumbnail. See each exact source and license in `data/media.json`.

## China expansion (19 September 2026)

China organization references and field-level evidence are in `data/china.json`; limitations and dated official releases are listed in [the China audit](docs/china-audit.md). Descriptions are concise original summaries of the linked references. Wikipedia references remain linked to their articles.

China's overview derives from public-domain Natural Earth 1:50m data with Survey of India ABDB Ladakh/Arunachal overlap removed for the configured presentation. Pakistan retains its separate de facto outline. See the audit for source scale, processing and boundary policy.

The Xi Jinping portrait uses an existing Wikimedia Commons derivative of Simon Dawson / No 10 Downing Street's 29 January 2026 photograph. Attribution, source and license links are in `data/media.json` and the generated image-credits page. Unverified or unavailable commander portraits are not substituted.
