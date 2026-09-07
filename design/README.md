# Design review — implementation authorized

Figma: https://www.figma.com/design/rwqxFCnDAv1NxJbmOLnU4S

The saved file contains editable foundations, service navigation and Survey of India geography. Its review screens are **unfinished**: the Figma MCP tool returned the Starter-plan rate-limit paywall on 7 September 2026. On 7 September 2026 the user cleared the review checkpoint ("consider everything approved from my side") and authorized implementation of the prepared map-first direction. The Figma file remains incomplete because of the tool quota; the portable boards below are the implementation reference.

`assets/india-context.svg` is a portable editable map asset, generalized for a national design overview. Survey of India is the source of the Indian outline; surrounding Natural Earth country polygons have been clipped against that outline to avoid conflicting lines. Source geometry scale is 1:16 million. Do not use this simplified design asset as a street-level boundary layer.

`corps-hq.svg` and `division-infantry.svg` were generated using **milsymbol 3.0.4**, configured for APP-6. The corps frame has no invented interior function. `XXX` denotes corps, `XX` denotes division; the headquarters staff is included. The friendly frame is a map-presentation convention and does not assert NATO membership.

Figma node inventory:

- Review page: `0:1`
- Foundations page: `2:42`
- Foundations frame: `4:2`
- Service control component: `4:48`
- Geography component: `6:2`
- National overview frame, geography only: `6:49`

The application UI and MapLibre/CARTO migration are now authorized; publication follows implementation verification.

## Portable review boards

Seven editable SVG boards and matching PNG previews are available in `review/`:

1. `01-army-national` — nearly full-screen national command map.
2. `02-army-command` — selected Southern Command with its identified leader photograph and corps.
3. `03-corps-tree` — XII Corps and a connected, explicitly unmapped division tree.
4. `04-navy` — Western Fleet assets and prominently labeled tri-service Andaman and Nicobar Command.
5. `05-ncc` — Kerala/Lakshadweep, Kottayam Group and 5 Kerala Naval Unit; explicit portrait availability state.
6. `06-mobile-overview` — whole-country mobile overview.
7. `07-mobile-selected` — selected command bottom sheet.

These portable boards are not yet in the Figma file. The user explicitly cleared the design checkpoint before implementation. SVG text remains editable and uses IBM Plex Sans, IBM Plex Mono and Barlow Condensed (open-source font families). Lucide provides utility icons. Identified PIB photographs are embedded with contextual attribution; the original files and provenance remain in `data/media.json`.

The boards intentionally do not invent territorial command polygons. They demonstrate the name-based alternative from the accepted plan. Before implementation, the review must settle whether this balance of geographic labels, color, and selection detail meets the intended visual direction.
