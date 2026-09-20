# Platform and rank explorer

The existing repository, Vercel project and domain host a platform homepage (`/`), ORBAT Atlas (`/atlas`) and the rank reference (`/ranks`). Existing root query links still open Atlas. Future tools can be added as sibling routes without another deployment.

## Brand

Edit **data/platform.ts** to change the umbrella name, tagline and description. React UI, document titles and Vite-generated HTML metadata read this one configuration. ORBAT Atlas remains a product name. The repository and deployment identifiers intentionally do not change when the public brand changes.

## Visual language

UI/UX Pro Max research: comparison-table structure, restrained dark reference library, low motion, accessible focus. Use existing IBM Plex Sans and Mono for continuity, charcoal surfaces, warm paper accents and subtle service colors. Avoid marketing counters, ornamental gradients, fake insignia and invented NATO grade codes.

Three fixed service columns: Navy, Army, Air Force. Large authentic insignia lead each cell; hovering or focusing a row highlights all confirmed equivalents with no layout shift. Clicking opens a native dialog with enlarged insignia, share link and expandable citations/credits. Empty cells stay empty. Missing artwork and a rank that wears no insignia are distinct states.

Country tabs only compare within-country ranks. India NCC has a separate context with Cadets, Senior ANOs and Junior ANOs. Five-star ranks and training ranks have separate categories. Search covers every category in the chosen country and returns the full equivalent row.

Desktop first; three columns remain together on small screens. Reduced motion suppresses insignia elevation. Native dialog handles focus containment, Escape and focus restoration.
