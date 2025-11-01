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


