# Contributing

Prefer an official organization page, appointment release or government document. Reputable secondary references may fill gaps when clearly identified. Do not infer deployments, coordinates or parent relationships from an exercise, proximity, shared city or historical association.

For each change:

1. Preserve existing organization IDs and add aliases for renamed records.
2. Add the source to `data/india.json`, including publisher, URL, kind and check date. Keep publication dates separate.
3. Attach evidence to the specific field it supports. An HQ source does not establish a commander or current parent.
4. For leaders, distinguish appointment dates from dated observations and undated profiles. Keep announced successors separate until assumption is documented.
5. For photographs, identify the exact subject visually and in the source context. Include credit, source URL and applicable reproduction terms in `data/media.json`. Do not substitute a service chief or previous commander for a missing portrait.
6. Keep unverified headquarters unmapped. Ships always have `location: null`. Document organizational assets without current positions.
7. Run `npm test`, `npm run lint` and `npm run build`. Regenerate the coverage report. Manually check the affected record and image in the browser.

An empty branch means missing dataset coverage, not that an organization has no subordinates. Data validation tests establish structural consistency; they do not establish factual truth.
