# Armoury: coverage, evidence and visual assets

Reference research: 23 September 2026. Browser and model-license review: 24 September 2026.

The first collection has **27 weapon records and 10 cartridge profiles**. It covers selected service weapons, Indian NCC training rifles and named defence-industry products. Country membership means a documented association; it does not certify current issue across that country's forces. This is a growing reference, not an exhaustive inventory.

## Coverage

| Country | Included records |
| --- | --- |
| India | AK-203, INSAS, .22 No. II Mk IV, .22 Deluxe, .22 Sporting, SIG 716, JVPC |
| Pakistan | G3A3, G3P4, MP5A2 / POF, MG3 / POF, PSR-90 |
| China | QBZ-95, QBZ-95B, QBB-95, QBZ-191, QBU-191, QSZ-92-5.8 |
| Russia | AK-74M, AK-12 (2023), SVD, PKP Pecheneg |
| United States | M4A1, M249 SAW, M240B, M110 SASS, M17 |

Cartridges: .22 LR, 5.56 × 45, 7.62 × 39, 7.62 × 51, 5.45 × 39, 7.62 × 54R, 5.8 × 42, 9 × 19, 5.56 × 30 and 5.8 × 21 mm. The dimensions used to draw cartridge profiles are illustrative proportions, separate from nominal case-length reference facts. No chamber, pressure, loading or interchangeability specifications are implied.

## Evidence and unresolved specifications

`data/armoury/sources.ts` records primary references, publishers and page locators. Each populated technical fact names its source. Mass and length retain the source's configuration rather than silently mixing loaded/unloaded weights or folded/extended lengths. The comparison table preserves this context. A missing field displays **Not established**.

- **Indian .22 trainers:** the 2025 NCC Technical Skills handbook, printed pp. 61–62, names three variants. No. II is 45 inches / 3.93 kg; Deluxe and Sporting are 43 inches with different listed masses and capacities. The precise commercial manufacturer/model for the latter two is unresolved. The handbook's 2,700 ft/s velocity is excluded as inconsistent with .22 LR. Its No. II 10-round claim conflicts with the Australian War Memorial's single-shot No. 2 Mk IV* example, which has a case-collecting magazine shell; feed is withheld rather than treating the two records as equivalent. Deluxe/Sporting capacities remain explicitly handbook listings.
- **INSAS:** DRDO's 2025 export catalogue gives a folding-stock rifle configuration. NCC fixed-stock figures differ; the record does not merge them. The exterior study represents a fixed-stock family silhouette and is explicitly approximate.
- **AK-203:** IRRPL's product table supplies the named Indian-production dimensions. Its 3.8 kg mass lacks a clear loading condition, which remains stated alongside the value. Rostec's 2024 delivery release corroborates Indian deliveries.
- **SIG 716:** India's MoD documents procurement/use, but that alone does not justify copying civilian 716i TREAD specifications. Variant-specific dimensions are withheld.
- **JVPC and PSR-90:** the directory/catalogue association is displayed. Manufacturer availability alone does not establish Army-wide adoption.
- **POF:** the public POF catalogue and Pakistan defence-production records establish named configurations. POF's G3 barrel/length figures are retained rather than silently replacing them with generic HK values. The POF PDF was intermittently unavailable during review; accessible indexed catalogue extracts supported the populated figures. Several detailed fields remain withheld.
- **China:** the US Army's historical equipment guide, ODIN and the Australian Army's equipment reference support the named variants; these are equipment references, not current inventory counts. No fictional DATE exercise ORBAT is used as real organizational evidence. China's MoD supports commissioning of the 191 family. QBZ-191 mass differs among references and is labeled as an Australian Army reference value. QBU-191 and the 5.8 mm QSZ-92 lack verified variant dimensions in this collection. QBB-95 drum capacity is withheld because references conflict.
- **Russia:** official Rosgvardiya/Rostec references and historical WEG specifications are identified. The AK-12 record refers to the 2023 pattern; older variant dimensions are not substituted.
- **US:** Army portfolio pages support M4A1, M249, M240 and M17 identities/configurations. The original M110 uses an archived Army fact sheet. The M17 record does not copy civilian P320 measurements. These selected records do not cover every current US small arm.
- **Ammunition:** velocity is load- and barrel-dependent. Only a specifically identified CCI .22 LR example appears; it is not a universal cartridge velocity.

The check date means these references were reviewed, not that every historical claim was independently reconfirmed as current that day.

## 3D representation and reuse

Community models are hosted by their creators on Sketchfab and embedded with visible model title, author, source link and license. `data/armoury/assets.ts` and the AK-203/QBZ-95 entries in `catalog.ts` record the exact model IDs. The public Data API's model identity, author and **CC BY 4.0** license declarations were checked. Artist previews were visually reviewed for the named pattern; this is not manufacturer certification or dimensional validation.

The G3A3 and MP5A2 assets depict HK patterns, not verified POF-specific production examples. M249 furniture/accessories may differ from its tabulated standard configuration. Other creator choices such as sights, rails and suppressors need not match the specification configuration.

Every weapon also has an original **simplified exterior study** generated in Three.js. These are low-detail educational shapes with exterior annotations; they are not scans, engineering models or measured replicas. In particular, Deluxe and Sporting share an approximate sporting-pattern study rather than fabricated measured differences. A flat silhouette remains available without WebGL. No authenticated licensed model was located for INSAS or the three Indian .22 variants in this review.

External embeds require a network connection and Sketchfab availability. The **Study** and flat-view controls remain available independently. No third-party model files are scraped, redistributed or downloaded through an authenticated API. Original study geometry is part of the repository; third-party artwork retains its own license.

All 12 embedded models reached Sketchfab's `viewerready` event in headed Chrome during the 24 September browser review. Headless Chrome failed the provider's initialization, so a visible-browser check was necessary; static preview thumbnails were not counted as successful 3D renders. AK-203 rotation was also checked visually. External availability can still change independently of this deployment.

## Architecture and verification

- `/armoury` is a lazy-loaded sibling route in the existing application, repository and Vercel project.
- `data/armoury/` separates the typed schema, catalogue, references and external model registry.
- `components/armoury/` separates browsing/comparison, the WebGL viewer, original geometry and flat silhouettes.
- Shared URLs preserve country, category and selected weapon or cartridge. Browser history restores selection; invalid IDs recover to a valid record.
- Local rendering occurs on interaction/resize, without an idle animation loop. WebGL resources and contexts are released when specimens change.
- Data checks validate identifiers, references, cartridge links, measurement context and finite geometry. Browser checks cover all 27 local models, filters, search recovery, shared URLs, keyboard controls, comparison, cartridges, graphics failure and viewport overflow. These checks do not establish factual accuracy.

Adding another country or specimen requires sourced records and an appropriate visual representation; it does not require another deployment.
