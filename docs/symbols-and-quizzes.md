# Symbols and practice

Checked 21 September 2026.

## Scope and reference

`/symbols` is a formation-focused library, as approved by the user. It contains 62 records: 24 land functions, six aviation organizations, six maritime organizations, 14 echelons, six identities and six HQ/status examples. It is not the complete equipment, activity or control-measure catalogue.

The public APP-06 **Edition E, Version 1 (October 2023)** is the content reference. NATO is acknowledged as its publisher. The accessible [text reproduction](https://studylib.net/doc/28566139/app-6e-nato-joint-military-symbology%EF%BC%882023%E7%89%88%EF%BC%89) was consulted alongside the renderer implementation. The NATO-hosted PDF returned HTTP 403; the former Wikimedia PDF returned 404. No claim is made that this is the newest published edition or an exact/certified implementation of every drawing rule.

- Chapter 1 and Table A-8: identity, status, headquarters/task-force amplifiers and echelons.
- Table 3-2 and the land-unit entity tables: unit function icons, including aviation organizations.
- Table 5-2: naval task organization, force, group, unit, element and convoy.
- `milsymbol` 3.0.4 in APP6 mode supplies drawings. Its numeric SIDC interface is shown as a renderer code. The library documents harmonization toward APP-6 E and MIL-STD-2525E, including some differences from earlier drawings. A light outline keeps external echelon marks and headquarters staffs legible on the dark canvas without changing their geometry.

Function, echelon, identity and HQ/status are separate fields. No fixed troop strengths or universal tactical/operational/strategic assignments are asserted. The empty function field is intentionally empty; field artillery alone uses the artillery dot. Naval organizations use sea-surface task-organization symbols, with no artificial army-echelon assignment. Aviation unit symbols describe organizations, not aircraft tracks.

## Implementation

- `data/symbology/catalog.ts`: typed, described and reference-linked records; builder choices and SIDC composition.
- `components/symbols/render.ts`: local SVG renderer; bounded URI cache. The renderer is loaded only with the symbols route.
- `components/symbols/Symbols.tsx`: category/search library, live builder, anatomy explanations, SVG download and deep links. Browser Back restores a configuration.
- `data/ranks/learning.ts`: descriptions derived from the existing same-country, same-service category ladder and the explicit equivalence cells. Blank cells remain unknown. This does not create cross-country rank equivalences.
- `data/quiz/engine.ts`: reusable session generator, with injectable random source for deterministic tests.
- `components/quiz/Quiz.tsx`: scope selection, six-choice questions, locked feedback, scoring, review and restart. Native modal semantics, focus restoration, keyboard support and failed-image fallback.

## Quiz generation rules

Questions are generated from the records, without an authored question bank. Rank scope supports any country/collection and any service/wing. Every rank question carries its specific country, service and category; answer candidates stay in that country's service. NCC cadets and ANOs are named explicitly in the question context.

Symbol questions stay within a selected topic; six naval symbols, six aviation symbols and six identity/modifier examples each support a complete six-option pool. A session has up to ten non-repeating entries. Alternatives are shuffled and deduplicated by answer name, with exactly one keyed answer. Pools smaller than six are ineligible. Image questions are used only when an image exists and the same asset is not assigned to a differently named entry within the pool. Missing/unverified rank artwork and failed image loads use text questions. Text prompts and answer explanations use the same source record.

No quiz progress is sent to a server or retained between sessions. References and rank image credits remain in the linked reference views.

## Visual direction and homepage correction

The UI/UX skill was consulted. Its generic education query recommended claymorphism; this conflicts with the established desktop reference design and was not adopted. The module extends the existing charcoal/IBM Plex/quiet brass system, with standard symbol fills retaining their identity colours, clear focus states, restrained transitions and reduced-motion support.

The user rejected a generated compass image. It is not used or shipped. The homepage keeps the existing India outline/context artwork, with all decorative command labels removed. It links three modules in the existing repository and Vercel project.

## Validation

Unit tests check all records, renderer validity across exposed land/aviation builder combinations, field independence, rank coverage, every country/service filter, six distinct options, ambiguity handling and undersized pools. Browser tests exercise all topics, search, deep links, Back, SVG download, both quiz formats, full scoring/review/retry, image failure, modal focus restoration and small screens. Existing rank and Atlas flows remain under regression tests.

Local validation on 21 September 2026: lint, production build and all unit-test files passed; all 55 browser tests passed, including six new learning-module flows.
