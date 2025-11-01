## Nail Art AI — App-wide Mockup Briefs

Purpose: Provide AI-ready, unambiguous briefs for generating high-fidelity mockups for all screens. Keep visual style consistent: modern, airy, editorial, with generous whitespace, rounded corners, and premium feel.

Design foundations (apply globally unless overridden):
- **Brand**: Insert brand colors, logo, and tone of voice. Default to soft, elegant palette; strong contrast for accessibility.
- **Typography**: Editorial serif for display (H1–H2), clean sans-serif for UI/body. Clear hierarchy, 8px spacing scale.
- **Grid**: Max content width 1280px; 12-column desktop, 6-column tablet, 4-column mobile; 24px gutters.
- **Corners & Shadows**: Cards/buttons radius 12–16px; subtle elevation for interactive elements.
- **Dark mode**: Full support; ensure color tokens are themeable.
- **Accessibility**: WCAG AA min contrast, focus states, keyboard nav, semantic landmarks.
- **Motion**: 150–250ms ease-out for hovers/transitions; avoid parallax on mobile.
- **Imagery**: Prioritize fast-loading, dominant images; use aspect-ratio boxes with graceful blur-up.

Shared layout/components:
- **Header**: Sticky; left logo, centered global search, right actions (Try-On, Gallery, Categories, Blog, FAQ). Collapsible mega-nav on desktop; sheet/drawer on mobile.
- **Footer**: Newsletter, quick links, social, legal, contact. Secondary background.
- **Search**: Prominent global search with autocomplete (designs, categories, colors); keyboard support; recent searches.
- **Filters panel**: Pills + dropdowns (Colors, Season, Occasion, Style, Shape, Length, Finish). Persist selections, clear-all.
- **Card**: Image (3:4), overlay badges (e.g., "Trending"), title, meta (color/chips), quick-actions (save, share, try-on). Hover: lift + reveal secondary actions.
- **Pagination**: Infinite scroll with manual “Load more” fallback.
- **Empty state**: Illustration, friendly copy, primary CTA, secondary helpful links.
- **Toasts/Feedback**: Non-blocking confirmations near bottom-right.

Notes for the AI tool:
- For each page below, create: desktop (1440px), tablet (1024px), and mobile (390px) variants. Include light/dark.
- Provide at least 2 above-the-fold hero variants for core marketing pages (Home, Gallery Index, Hub, Seasonal).

---

## Home — “Inspiration, Personalized” (`/`)
- **Goal**: Inspire and route users to explore; highlight personalization, seasonal trends, and try-on.
- **Hero**: Full-width editorial banner with headline, subcopy, search bar, and “Try On” / “Explore Gallery” CTAs. Optional rotating backgrounds.
- **Sections** (in order):
  - Personalized picks (if known) or “Trending Now” grid (3–4 items per row on desktop).
  - Seasonal spotlight (carousel) with badges (e.g., Fall 2025).
  - Quick category tiles (Colors, Occasions, Styles, Shapes).
  - “Try-On Studio” promo with device mockup and CTA.
  - Editorial/blog highlights (2–3 cards).
  - Newsletter signup strip.
- **Interactions**: Card hover reveals “Save/Share/Try-On”. Search autocomplete. Smooth anchor scroll.
- **Empty/anon**: Show generalized trending + prominent onboarding CTA.
- **Analytics**: Hero CTA CTR, search usage, section click-through, scroll depth.

### Responsive
- Tablet: Reduce columns (3→2), collapse carousels to swipe.
- Mobile: Stack sections; search stays visible; sticky quick nav (Explore, Try-On, Categories).

---

## Gallery Index (`/nail-art-gallery`)
- **Goal**: Fast exploration; strong filters and visual density without overwhelm.
- **Header strip**: Title, result count, view toggle (grid/dense), sort dropdown (Trending, Newest, Most Saved).
- **Filters**: Horizontal pills + expandable drawer for advanced filters (Colors [swatches], Season, Occasion, Style, Shape, Finish, Length, Complexity).
- **Grid**: Masonry or uniform 3:4 cards; lazy-loaded; quick actions on hover/tap.
- **Sidebar (desktop optional)**: Persistent filter summary, recently viewed, saved items.
- **States**: Loading skeleton cards; empty with “Adjust filters” CTA.
- **Interactions**: Multi-select filters with chips; clear-all; URL-synced state.
- **Analytics**: Filter usage, save/share, pagination events.

### Responsive
- Tablet: 3→2 columns; filters as collapsible.
- Mobile: 2 columns; sticky filter bar; bottom sheet for sort/filter.

---

## Gallery by Category (`/nail-art-gallery/category/[category]`)
- **Goal**: Themed discovery page with contextual intro.
- **Hero**: Category title, short description, featured banner, related subcategories as chips.
- **Grid**: Same as index but scoped; “Related categories” rail near footer.
- **SEO**: Category FAQs accordion, breadcrumb.

---

## Design Detail (`/design/[slug]`)
- **Goal**: Showcase one design; drive saves, shares, try-on, and related discovery.
- **Above the fold**: Large image (3:4), title, meta chips (colors, style, occasion), primary CTAs (Try-On, Save), share menu, rich pins markup considerations.
- **Details**: Description, technique notes, difficulty, time estimate, products/tools used (cards with links), salons/booking CTA (optional).
- **Related**: “Similar styles” grid and “Pairs well with” carousel.
- **Social proof**: Saves count, lightweight reviews/testimonials (optional).
- **States**: Image loading placeholder, fallback if try-on unsupported.
- **Interactions**: Zoom on hover (desktop), pinch to zoom (mobile), copy link, save to collection modal.

### Responsive
- Tablet: Image left, details right two-column.
- Mobile: Image top, sticky bottom CTAs.

---

## Categories Overview (`/categories`)
- **Goal**: Entry to taxonomy: show top-level groups with imagery.
- **Layout**: Large tiles for Colors, Seasons, Occasions, Styles, Nail Shapes, Techniques; each tile shows 3–4 example swatches/cards.
- **Search within categories**: Narrow by name; chips for quick filters.

---

## Categories — All (`/categories/all`)
- **Goal**: Exhaustive index; utilitarian list plus compact tiles.
- **Layout**: A–Z list with anchors; grid of compact chips/tiles; breadcrumb.

---

## Categories — Colors (`/categories/colors`)
- **Goal**: Color-led exploration.
- **Layout**: Swatch palette wall; each swatch opens a color detail or filters gallery. Include multi-tone gradients and finishes.
- **Accessibility**: Name + hex code; swatch contrast borders in both themes.

---

## Categories — Nail Shapes (`/categories/nail-shapes`)
- **Layout**: Shape illustrations with names (Almond, Coffin, Stiletto, etc.), hover to see example photos.
- **CTA**: “Explore designs for this shape.”

---

## Categories — Occasions (`/categories/occasions`)
- **Layout**: Occasion cards (Wedding, Date Night, Office, Party, Holiday). Each shows 2–3 thumbnails and count.

---

## Categories — Seasons (`/categories/seasons`)
- **Layout**: Seasonal banners with thematic imagery; each links to season listing.

---

## Categories — Styles (`/categories/styles`)
- **Layout**: Style chips (Minimal, Abstract, French, Glitter, 3D) with visual examples.

---

## Nail Art Hub (`/nail-art-hub`)
- **Goal**: Central hub to route users: curated collections, tools, and learning.
- **Sections**: Quick search; featured collections; “Build your look” (link to Try-On); guides/techniques; latest from blog; community saves.

---

## FAQ (`/faq`)
- **Layout**: Searchable accordion; categories on left (desktop) or tabs (mobile). Contact/support CTA.
- **Schema**: FAQ structured data-ready copy blocks.

---

## Blog Index (`/blog`)
- **Hero**: Editorial masthead; featured article.
- **List**: Blog cards with tag chips; sidebar with topics/popular.
- **Pagination**: Infinite scroll or pages; newsletter CTA inline.

---

## Seasonal Landing — Christmas (`/christmas-nail-art`)
- **Hero**: Festive banner, headline, 2 CTAs (Explore, Try-On seasonal).
- **Content**: Curated sections (Minimal Christmas, Red & Gold, Snowflakes), gift guides, brand promos.
- **Urgency**: Subtle countdown (optional), “Trending this week”.

---

## Technique Detail (`/techniques/[technique]`)
- **Hero**: Technique name, difficulty, duration, tools needed.
- **Content**: Step-by-step with images, video embed area, product list, safety notes.
- **Related**: Designs using this technique.

---

## Color Detail (`/nail-colors/[color]`)
- **Hero**: Large swatch, color name, hex; suggested finishes.
- **Content**: Popular pairings, complementary colors, top designs in this color.

---

## Nail Art by Occasion (`/nail-art/occasion/[occasion]`)
- **Hero**: Occasion context (e.g., Wedding), tone guidance.
- **Grid**: Scoped gallery; tips sidebar (desktop).

---

## Nail Art by Season (`/nail-art/season/[season]`)
- **Hero**: Season imagery; palette suggestions.
- **Grid**: Seasonal curated gallery.

---

## Try-On Studio (`/try-on`)
- **Goal**: Encourage AR try-on and quick switching of designs/colors.
- **Layout**: Camera preview (or model hand), design selector rail, color/finish controls, capture/share/save, permission states.
- **States**: Camera permission denied (educational overlay), low light warning.
- **Interactions**: Swipe to switch designs, long-press compare before/after.

### Responsive
- Tablet/Desktop: Split view—preview left, controls right.
- Mobile: Preview top, sticky bottom control bar.

---

## Dynamic Editorial/Guide (`/[category]/[slug]`)
- **Goal**: Flexible rich content page (guide/editorial/landing).
- **Hero**: Optional cover image, headline, subhead, author/date.
- **Body**: Rich text, images, pull quotes, callouts, inline galleries, CTAs to gallery/try-on.
- **TOC**: Auto-generated on desktop.
- **SEO**: Article schema, breadcrumb.

---

## Not Found (`/not-found`)
- **Layout**: Friendly illustration, search input, quick links to Gallery, Home, Categories, Try-On.
- **Tone**: Light, helpful.

---

## Admin — Login (`/admin/login`)
- **Layout**: Minimal auth card; email/password; SSO buttons (optional), error inline, forgot-password link.

---

## Admin — Content Management (`/admin/content-management`)
- **Goal**: Manage designs, categories, editorial.
- **Layout**: Left nav (Designs, Categories, Editorial), main table with filters, bulk actions, status chips, pagination.
- **Row actions**: Edit, Duplicate, Archive, Publish toggle.
- **Dialogs**: Create/Edit modal with tabs (Details, Media, SEO, Relations).

---

## Admin — Generate (`/admin/generate`)
- **Goal**: AI-assisted content/design generation.
- **Layout**: Prompt builder (fields + presets), preview pane, generation history, validation alerts.
- **Actions**: Generate, Save as Draft, Publish.

---

## Admin — SEO Management (`/admin/seo-management`)
- **Goal**: Control titles, descriptions, canonical, structured data, IndexNow.
- **Layout**: Entity selector, form fields with counters, preview snippet, validation checks, bulk operations panel.
- **Outputs**: Sitemap triggers, Rich Pins status, indexnow submission feedback.

---

## Admin — R2 Sync (`/admin/r2-sync`)
- **Goal**: Storage sync/health.
- **Layout**: Sync controls, status cards (queued/success/failed), logs table, retries, connection health indicator.

---

## Global Accessibility & States
- **Focus order**: Logical, visible outlines.
- **Keyboard**: All interactive elements operable; skip-to-content link.
- **Announcements**: Live regions for async ops.
- **Error states**: Clear copy, recovery actions; form-level and field-level feedback.

## Analytics (per page baseline)
- **Impressions**: Hero, major sections.
- **Engagement**: Filter usage, saves, shares, try-on clicks.
- **Conversion**: Newsletter signup, outbound shop clicks.

## Deliverables from AI
- For each page: desktop, tablet, mobile light/dark mockups; UI kit updates for any new components; interaction notes annotated.




---

## Detailed Field‑Level Specs (for Mockup Generation)

Use the structure below for every page: Sections → Components → Fields. “Type” hints input and visual treatment. All images should use 3:4 aspect unless stated; include graceful blur‑up placeholders.

### Home (`/`)
- Section: Hero Banner
  - Component: Headline
    - fields: text (H1), max 2 lines; emphasis span optional
  - Component: Subcopy
    - fields: text (body), 1–3 lines
  - Component: Search Bar
    - fields: input (placeholder text), prefix icon (search), recent chips (0–5), submit button
  - Component: CTAs
    - fields: primary button “Try On”, secondary button “Explore Gallery”
  - Component: Background
    - fields: image (desktop), image (tablet), image (mobile), overlay gradient (start/stop rgba)

- Section: Trending Now (Carousel)
  - Component: Card (repeated)
    - fields: image, title (design_name), meta chips (0–3: color/style), quick actions (save, share, try-on), badge (optional “Trending”)
  - Component: Controls
    - fields: prev/next arrows (desktop), scroll-snap (mobile)

- Section: Seasonal Spotlight (Carousel)
  - Component: Seasonal Card
    - fields: image, label (season name), subtitle (short promo), badge (e.g., “Fall 2025”), CTA chevron

- Section: Category Tiles (4 up)
  - Component: Tile (Colors / Occasions / Styles / Shapes)
    - fields: background image, title, subline, hover overlay

- Section: Try‑On Studio Promo
  - Component: Copy Block
    - fields: title, description, feature badges (3: text + icon), primary CTA, secondary CTA
  - Component: Device Mockup
    - fields: device frame style, screenshot image, border color, shadow

- Section: Editorial/Blog Highlights
  - Component: Article Card (x3)
    - fields: image 16:9, tag chip, title, excerpt, author/date (optional)

- Section: Newsletter
  - Component: Signup strip
    - fields: title, body, email input (placeholder), submit button, consent text (small)

Interactions: Card hover lift (desktop 200ms), swipe on carousels, focus rings on inputs/buttons.

---

### Gallery Index (`/nail-art-gallery`)
- Section: Header Strip
  - fields: title, result count integer, view toggle (grid/dense), sort dropdown (options: Trending/Newest/Most Saved)
- Section: Filters
  - Component: Pills row
    - fields: selected chips for Colors, Season, Occasion, Style, Shape, Finish, Length; “More filters” button
  - Component: Advanced Drawer
    - fields: multi‑select lists per facet, range controls (e.g., complexity), clear‑all button, apply button
- Section: Grid
  - Component: Design Card (repeated)
    - fields: image 3:4, title, chips (0–4), action buttons (save/share/try-on), hover secondary bar
- Section: Pagination
  - fields: infinite scroll flag, “Load more” button fallback
- States: loading skeleton cards (count), empty state (title, body, CTA link)

---

### Gallery by Category (`/nail-art-gallery/category/[category]`)
- Section: Hero/Intro
  - fields: category title, short description (1–2 lines), banner image (optional), breadcrumb
- Section: Related Subcategories
  - Component: Chips (0–8)
    - fields: label, link
- Section: Grid
  - same as Gallery Index grid
- Section: SEO FAQ
  - Component: Accordion (0–5)
    - fields: question, answer rich text

---

### Design Detail (`/design/[slug]`)
- Section: Above the Fold
  - Component: Large Image 3:4
    - fields: primary image, zoom enable (bool)
  - Component: Title & Meta
    - fields: title, chips (color/style/occasion), save count, share menu
  - Component: Primary CTAs
    - fields: try‑on button, save button
- Section: Description & Specs
  - fields: rich text description, technique notes, difficulty (enum), time estimate (mins), length/shape (chips)
- Section: Tools/Products
  - Component: Product Card (0–6)
    - fields: thumbnail, name, link, price (optional)
- Section: Related
  - Component: “Similar styles” grid (8–12 cards)
  - Component: “Pairs well with” rail (chips/cards)

---

### Categories Overview (`/categories`)
- Section: Page Title + Subline
  - fields: title, body text
- Section: Top‑level Groups (grid tiles)
  - tiles: Colors, Seasons, Occasions, Styles, Nail Shapes, Techniques
  - fields per tile: title, 3–4 image thumbs (swatches/cards), CTA chevron
  - optional: search within categories (input)

---

### Categories — All (`/categories/all`)
- Section: A–Z Index
  - fields: alphabet nav, anchor list of categories (link, count)
- Section: Compact Tile Grid
  - fields: chip tiles (label, icon/emoji), filter input

---

### Categories — Colors (`/categories/colors`)
- Section: Palette Wall
  - Component: Swatch
    - fields: color hex, label, count, contrast border toggle
- Section: Spotlight
  - fields: featured color (image 3:2), CTA

---

### Categories — Nail Shapes (`/categories/nail-shapes`)
- Section: Shape Gallery
  - Component: Shape Card (Almond, Coffin, Square, Oval, Stiletto…)
    - fields: illustration, label, example thumbnails (0–3), CTA link

---

### Categories — Occasions (`/categories/occasions`)
- Section: Occasion Cards
  - fields: card image, label (Wedding/Date Night/Office/Party/Holiday…), count, CTA

---

### Categories — Seasons (`/categories/seasons`)
- Section: Seasonal Banners
  - fields: banner image, season name, subcopy, CTA

---

### Categories — Styles (`/categories/styles`)
- Section: Style Chips Grid
  - fields: chip label (Minimal/Abstract/French/Glitter/3D/etc.), example thumbnail, CTA when selected

---

### Nail Art Hub (`/nail-art-hub`)
- Sections: Quick Search (input, suggestions), Featured Collections (cards), Build Your Look (link to Try‑On), Guides (article cards), Community Saves (masonry)
- Fields per collection card: image, title, count badge, CTA

---

### FAQ (`/faq`)
- Section: Search Bar
  - fields: input with suggestions
- Section: Accordion List
  - fields: category filter tabs, Q/A pairs
- Section: Contact CTA
  - fields: “Didn’t find an answer?” copy, button to Contact page

---

### Blog Index (`/blog`)
- Section: Masthead
  - fields: featured image 16:9, featured tag, title, excerpt, author/date
- Section: Article List
  - Component: Blog Card
    - fields: image, tags (chips), title, excerpt, read time, author avatar
- Sidebar (desktop): topics list, popular posts (mini cards), newsletter box

---

### Seasonal Landing — Christmas (`/christmas-nail-art`)
- Section: Festive Hero
  - fields: banner image, headline, subcopy, primary/secondary CTAs
- Section: Curated Blocks
  - blocks: Minimal Christmas / Red & Gold / Snowflakes / Gift Guides
  - fields per block: title, description, 4–8 design cards
- Section: Trending This Week
  - fields: carousel of 10–16 items

---

### Technique Detail (`/techniques/[technique]`)
- Section: Technique Hero
  - fields: name, difficulty (Easy/Medium/Advanced), typical time, tools list
- Section: Steps
  - fields: step title, description, optional image/video
- Section: Products & Tools
  - fields: product cards (image, name, link)
- Section: Designs Using this Technique
  - fields: grid cards

---

### Color Detail (`/nail-colors/[color]`)
- Section: Swatch Hero
  - fields: large swatch, color name, hex code, gradient suggestion chips
- Section: Popular Pairings
  - fields: color chips (paired), small examples
- Section: Top Designs Grid
  - fields: cards 12–24

---

### Nail Art by Occasion (`/nail-art/occasion/[occasion]`) & Season (`/nail-art/season/[season]`)
- Section: Context Hero
  - fields: title, guidance text, banner (optional)
- Section: Scoped Grid
  - fields: design cards
- Section: Tips Sidebar (desktop)
  - fields: bullet tips, related links

---

### Try‑On Studio (`/try-on`)
- Section: Preview Area
  - fields: camera stream placeholder, model hand toggle, permission states (allow/deny), flash/guide overlay
- Section: Design Selector Rail
  - fields: horizontal thumbnails (snap), filter by category/style/color
- Section: Controls
  - fields: color/finish selector, shape/length, capture button, compare toggle, save/share buttons
- Section: Messages
  - fields: low light warning, permission denied copy + CTA

---

### Dynamic Editorial/Guide (`/[category]/[slug]`)
- Section: Article Hero
  - fields: cover image, headline, subhead, author/date, reading time
- Section: Body
  - fields: rich text, images, pull quotes, callouts, inline galleries, anchor links
- Section: TOC (desktop)
  - fields: headings list with anchors
- Section: CTAs
  - fields: links to gallery/try‑on

---

### Not Found (`/not-found`)
- Section: Illustration & Copy
  - fields: friendly image, title, body, search input, quick links (Gallery, Home, Categories, Try‑On)

---

### Admin — Login (`/admin/login`)
- Section: Auth Card
  - fields: logo, email input, password input, SSO buttons (optional), submit, error text, forgot‑password link

### Admin — Content Management (`/admin/content-management`)
- Section: Left Nav
  - fields: menu items (Designs, Categories, Editorial)
- Section: Table
  - fields: columns (thumbnail, name, status, date, actions), filters row, bulk actions, pagination
- Section: Edit Modal
  - tabs: Details (title, description, images), Media (upload area), SEO (title/description/canonical), Relations (categories/tags)

### Admin — Generate (`/admin/generate`)
- Section: Prompt Builder
  - fields: prompt textarea, preset dropdown, seed/variations, constraints (style/length/finish), generate button
- Section: Preview Pane
  - fields: grid of generated images with select/save
- Section: History
  - fields: list with status chips

### Admin — SEO Management (`/admin/seo-management`)
- Section: Entity Selector
  - fields: dropdown (Design/Category/Page), search
- Section: Form
  - fields: title, description, canonical, noindex toggle, preview snippet, validations
- Section: Bulk Ops
  - fields: sitemap trigger, rich pins status, indexnow submission

### Admin — R2 Sync (`/admin/r2-sync`)
- Section: Controls
  - fields: sync now, queue stats, purge cache
- Section: Status Cards
  - fields: queued/success/failed counts, logs table (time, job, message)

---

Global Accessibility fields
- focus outlines for all buttons/inputs, skip‑to‑content link, semantic landmarks (header/main/nav/footer), keyboard operability, and live regions for async ops.
