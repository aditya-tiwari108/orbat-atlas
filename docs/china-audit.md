# China: public organization and geography audit

Reviewed **19 September 2026**. Dataset: `data/china.json`. This is a curated public reference snapshot, not a complete or real-time order of battle. Access dates mean a source was reviewed, not that every claim was independently reconfirmed on that date.

## Coverage

| Area | Included | Evidence and remaining gaps |
|---|---:|---|
| Service roots | Army, Navy, Air Force | Service structure sourced; Rocket Force and the strategic arms are outside these three browsing modes. |
| Joint theaters | All five | Eastern, Southern, Western, Northern and Central. HQ cities and joint character documented. No inferred theater polygons. |
| Army theater components | All five | Distinct headquarters and joint links; administrative service parent retained. |
| Group armies | All thirteen, numbered 71–83 | Corps-level formations, documented city headquarters and theater Army affiliation. No claim of a complete current brigade roster. |
| Direct Army districts | Xinjiang and Tibet | Service administrative association. Operational reporting differences are not flattened into a guessed group-army chain. |
| Theater navies | All three | East, South and North Sea Fleets linked to their joint theater. |
| Ships | 27 selected commissioned vessels | Three carriers; selected Type 055/052D destroyers and Type 075/071 amphibious ships. No ship coordinates. Liaoning remains a Navy-level asset because its fleet attribution was insufficiently corroborated. |
| Theater air forces | All five | Service administrative parent and separate operational theater link. |
| Airfield associations | 20 airfields and 20 aviation brigades | Four examples per theater. Published reference tables reviewed; many underlying references date to May 2024. Current home-base assignments need further primary corroboration. |
| Service education | Four institutions | Dalian Naval Academy, Naval Aviation University, Air Force Aviation University and Air Force Engineering University. |

**107 organizations, 55 sources.** These totals describe the register, not completeness or an accuracy score. In particular, it does not cover all Army brigades/divisions, ships, naval shore commands, air bases, intermediate command-base headquarters or aircraft inventories.

## Leadership review

| Role | Published record used | Treatment |
|---|---|---|
| CMC chairman | Xi Jinping, identified at the 3 July 2026 CMC ceremony | National leadership card; explicitly titled CMC Chairman, not Chief of Defence Staff. |
| Air Force commander | General Wang Gang, identified in the same official ceremony | Dated observation, not an inferred appointment date. Supersedes outdated Chang Dingqiu infobox listings. |
| Eastern Theater commander | General Yang Zhibin, official identification on 4 September 2026 | Dated current identification. |
| Central Theater commander | General Han Shengyan, official identification on 22 December 2025 | Latest authoritative identification found in this review; no invented appointment day. |
| Army / Navy commanders | Older infoboxes conflict with 2026 leadership reporting | Current names withheld. Reported successors are not converted into confirmed appointments. |
| Southern / Western / Northern theater commanders | Older names lack current authoritative corroboration | Current names withheld; uncertainty does not mean the office is vacant. |
| Component and subordinate commanders | Not sufficiently verified | No names or portraits inferred. |

Primary leadership sources:

- [Xinhua / Ministry of Justice, 3 July 2026 ceremony](https://www.chinalaw.gov.cn/gwxw/ttxw/202607/t20260703_537130.html): identifies Xi and Wang Gang.
- [Ministry of National Defense, 4 September 2026](https://eng.mod.gov.cn/2025xb/P/16483620.html): identifies Yang Zhibin. The same official release is [mirrored by GlobalSecurity](https://www.globalsecurity.org/wmd/library/news/china/2026/09/china-260904-prc-mnd04.htm) when the original site is unavailable.
- [Xinhua / State Council, 22 December 2025](https://english.www.gov.cn/news/202512/22/content_WS69492a0bc6d00ca5f9a0838d.html): identifies Yang and Han.
- [SCMP syndicated by The Star, 7 August 2026](https://www.thestar.com.my/aseanplus/aseanplus-news/2026/08/07/who-are-the-officers-filling-the-big-shoes-left-behind-in-pla-anti-corruption-drive): flags uncertainty in several senior posts. Inferences from seating, uniforms and absence do not establish a formal appointment in this dataset.

### Portraits

Xi Jinping has an identified January 2026 photograph by Simon Dawson / No 10 Downing Street, using an existing Wikimedia Commons derivative with recorded attribution. See [image credits](/image-credits.html) and `data/media.json`.

No correctly identified portrait with verified reuse rights was found for Wang Gang, Yang Zhibin or Han Shengyan during this review. Those portraits are explicitly unavailable. Images of the politician named Wang Gang must not be used for the Air Force commander. Unknown leaders are never represented with their predecessors’ portraits. Component commanders and other command-level portraits remain gaps.

## Recent fleet changes

- [Fujian and Shandong: official Southern Theater Navy affiliation, 9 November 2025](https://eng.mod.gov.cn/2025xb/D/P_251753/16420768_12.html). Fujian was commissioned on **5 November 2025**; it is not presented as a ship still awaiting commissioning.
- [Dongguan (109) and Anqing (110): official commissioning and Eastern Theater assignment report, 9 March 2026](https://eng.chinamil.com.cn/2025xb/M_251449/V_251467/16447328.html). Publication date is not silently treated as the exact commissioning day.
- [Hubei (34): official Southern Theater affiliation, 11 August 2026](https://eng.mod.gov.cn/2025xb/D/V/16478939.html).
- Other selected fleet assignments are explicit entries in the cited reference tables. A ship’s namesake, a port visit, or participation in an exercise never establishes its fleet parent. Vessels undergoing trials are not added as commissioned assets.

## Air Force associations

The five theater Air Force reference articles contain unit/base tables. The register selects 20 published associations and marks the age and limits of the underlying evidence. It **does not certify that these associations are unchanged in September 2026**. Airfield markers use city centers, not runways, hardened shelters or current aircraft positions.

Aviation brigades are represented as brigades, not mislabeled squadrons. Their parent edge means **based at**. A separate `aviation.commandId` describes published theater affiliation, without claiming that a tactical brigade reports directly to theater headquarters. Intermediate command-base headquarters are not conflated with similarly named airfields.

Aircraft lists are left empty where a current unit-level model/variant association has not been verified. In particular, outdated J-11A-only claims for the 41st Brigade are not copied; [CASI’s April 2024 report](https://www.airuniversity.af.edu/CASI/Display/Article/3759796/status-of-the-41st-aviation-brigade-transition-to-the-j-20/) already documented a likely transition. The 41st is not included in this initial selection. No live deployments are inferred from imagery or exercises.

## Joint relationships and navigation

`parentId` retains a same-service administrative hierarchy. `jointCommandId` records the operational joint theater separately, with `evidence.jointCommand`. Theaters appear in Army mode through a **service-affiliation browsing edge**: they are not subordinate to Army Headquarters. Their dossiers expose the linked Army, Navy and Air Force components. Selecting another service component switches mode. Components link back to their theater.

At national Army zoom the five joint theaters receive priority. Their Army components appear on selection or at more detailed zoom, keeping the overview readable. PLA group armies use a generic corps-level headquarters symbol (XXX); this is a cartographic echelon convention, not a claim of NATO affiliation or an inferred branch function. Flying brigades use aviation icons in the tree and are anchored through their separately sourced base record.

## Geography

China uses Natural Earth’s public-domain **1:50 million** country geometry, with the overlap of Survey of India’s **Ladakh and Arunachal Pradesh** state/UT geometries removed to implement the requested territorial presentation. This excludes Aksai Chin and Arunachal Pradesh; clipping Ladakh also removes other overlap with that SOI claim geometry. It is a documented presentation choice, not a statement that administration and sovereignty claims are identical. Taiwan is not merged into this outline.

- [Natural Earth boundaries and disputed-boundary policy](https://www.naturalearthdata.com/about/disputed-boundaries-policy/)
- [Natural Earth 1:50m country source](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson)
- [Survey of India ABDB state data](https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-)

The overview is generalized to 0.015 degrees and hidden above zoom 7. Do not use it for boundary surveying. CARTO administrative boundaries and regional/country labels are suppressed so they cannot silently contradict the configured outline. Military affiliation is independent of the outline: a documented Chinese organization need not be inside the China polygon. No new Aksai Chin deployment is inferred or plotted.

**Pakistan retains its Natural Earth de facto outline.** India’s SOI claim outline is not loaded in the Pakistan view. Automated checks keep Muzaffarabad and Gilgit inside the Pakistan presentation. India’s existing SOI overview is unchanged.

### Rebuilding the China outline

Install `pyshp`, `shapely` and `pyproj` in a Python environment. Place Natural Earth’s `ne_50m_admin_0_countries.geojson` at `work/china/ne-countries.geojson` and SOI ABDB’s `State Boundary` shapefile and companion files at `work/ncc-audit/extracted/`. Run:

```sh
python scripts/prepare-china-outline.py
```

The script writes `public/geography/china-overview.geojson` and the matching SVG fallback. Independent tests check representative exclusion/interior points, country-specific style sources and Pakistan de facto points.

## Validation

`tests/china.test.ts` checks joint links, combined-graph cycles, 13 group armies, per-service overview density, unlocated ships/flying units, dated leadership and boundary presentation. `e2e/china.spec.ts` checks desktop service switching, portrait loading, cross-service theater navigation, ship selection, base/brigade links, shared URLs, search, zoom and tile failure. These complement the India/Pakistan/NCC regression suite. Structural checks cannot establish factual accuracy; each record retains its source references and field-level gaps for further review.

Release checks completed 20 September 2026: TypeScript production build, lint, six data/geometry test files, and 38 browser tests passed. Desktop screenshots were reviewed at 1280×720, 1440×900 and 1920×1080. The review corrected compact leadership-card overflow, restored China service-component lists, and adjusted overview label density for China’s larger extent.
