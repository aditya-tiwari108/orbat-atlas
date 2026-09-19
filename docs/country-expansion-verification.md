# Country expansion verification — 19 September 2026

## Dataset and map

- Pakistan: 117 records, three service roots, 101 registered references. Public city/locality coordinates only; no vessel coordinates. Source/parent references and acyclic country-scoped ancestry validated.
- India NCC: 19 approved directorates, with separate Andhra Pradesh and Jharkhand regions. Opening dates, new headquarters and leadership remain unverified. All 36 states/UTs retain unique approved-remit assignments.
- Pakistan uses the Natural Earth de facto outline selected by the user. Country metadata controls service availability, map extent, attribution and WebGL fallback image.
- Three Pakistan service-chief portraits have identified Commons provenance, reuse attribution and local assets. Command-level portraits remain gaps documented in the Pakistan audit.
- No. 27 Squadron's article contains contradictory command references. Its command field is omitted while its Rafiqui base association is retained.

## Verification

- TypeScript and Vite production build passed. Vite still reports the existing large map/data chunks; this is a performance limitation, not a failed build.
- Oxlint passed; five dataset/cartography test files passed.
- The 32-scenario browser suite exercises country switching, portraits, cross-country search, shared headquarters, deep links, back navigation, approved NCC regions, command/base/squadron/ship trees, map failures, reduced motion and zoom stability.
- Initial failures exposed old test selectors that matched the new country select as well as the search input/options. Selectors now address the labeled search input and its results list.
- Manually reviewed desktop screenshots of Pakistan Army, Navy and Air Force, the NCC regional map, and leadership panels. Map-loaded screenshots are captured after markers and tiles settle.
- Recenter now respects the open leadership panel; its accessible name and the WebGL fallback outline follow the selected country. Missing commander photos use a compact placeholder.

Evidence and coverage limitations are maintained in [Pakistan audit](pakistan-audit.md) and [NCC transition](ncc-reorganization.md). Browser tests establish interaction behavior, not factual completeness.
