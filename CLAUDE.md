# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a Shopify **Online Store 2.0 theme** — a customized fork of Shopify's flagship "Horizon" theme (theme name `horizon-custom`). It is pure Liquid/CSS/JS with **no build system, no `package.json`, and no test suite** — everything the storefront runs is checked into the repo as-is.

Git history shows two things worth knowing before touching a file:
- Commits titled `Update from Shopify for theme horizon-custom/main` (or `horizon/main`) are auto-sync commits pushed by Shopify's GitHub theme integration whenever someone edits the theme in the Shopify admin/editor. Expect these to appear without warning and to not follow any commit convention.
- Actual custom feature work happens in normal `feat:`/`fix:` commits (e.g. `feat: progress bar`, `feat: product card intensity`) merged via PR.

## Tooling reality check

`.cursor/rules/*.mdc` (see below) documents upstream Horizon conventions, and several of them describe tooling that **does not exist in this repo**: there is no `schemas/` source folder, no `codex/` folder, no `scripts/` folder, and no `package.json`/`pnpm` — so `pnpm run build:schemas` and the commit-msg hook described in `commit-messages.mdc` cannot run here. In practice:

- **`{% schema %}` blocks are authored directly inline in the `.liquid` file** (there is no JS source to generate them from). Ignore the "never edit the schema block directly" warning in `liquid.mdc`/`schemas.mdc` — for this repo, editing it directly is the only option.
- Conventional Commits formatting is still a *convention worth following* for hand-written commits (nothing enforces it), since past feature commits use it.

## Common commands

There's no npm/build workflow. Development happens through the **Shopify CLI** against a connected store:

```sh
shopify theme dev             # local dev server with hot reload
shopify theme check           # lint theme (Theme Check)
shopify theme push            # push local files to the connected theme on Shopify
shopify theme pull            # pull latest from the connected theme
```

There is no automated test suite — verify changes with `shopify theme check` plus manual checking in `shopify theme dev` / the theme editor preview.

## Architecture

Standard Shopify OS2.0 theme layout:

- `layout/theme.liquid` (+ `password.liquid`) — the HTML shell. Loads `snippets/meta-tags`, `stylesheets`, `fonts`, `scripts`, `theme-styles-variables`, `color-palette`, renders `{% sections 'header-group' %}`, then `{{ content_for_header }}` and the page body.
- `templates/*.json` — one JSON template per page type (`index`, `product`, `collection`, `cart`, `search`, `blog`, `article`, `page`, `list-collections`, `404`, plus `page.contact.json` as an alternate template). `gift_card.liquid` and `password.liquid` are Liquid-based templates rather than JSON.
- `sections/` (44 files) — top-level, theme-editor-configurable regions. Accept theme/app blocks via `{"type": "@theme"}` / `{"type": "@app"}` in their schema's `blocks` array.
- `blocks/` (97 files) — reusable theme blocks, nestable inside sections or other blocks via `{% content_for 'blocks' %}` / `{% content_for 'block', type:, id: %}` (static placement).
- `snippets/` (122 files) — `{% render %}`-only partials, documented with `{% doc %}`.
- `config/settings_schema.json` / `settings_data.json` — global theme settings (theme editor "Theme settings" panel).
- `locales/` — `en.default.json` (storefront strings) and `en.default.schema.json` (editor/schema labels) are the only files authored by hand in this repo; ~50 other language files (`fr.json`, `de.json`, etc., each often with a matching `.schema.json`) are translator/Shopify-managed — **don't hand-edit non-English locale files**.
- `assets/` — flat directory (no subfolders allowed) of CSS/JS/images/icons referenced via `asset_url`/`inline_asset_content`.

### Private/static blocks (`_` prefix convention)

53 of the 97 files in `blocks/` are prefixed with `_` (e.g. `_product-card.liquid`, `_product-intensity.liquid`, `_collection-card.liquid`). This marks a block as **private/internal** — meant to be statically referenced (`content_for 'block', type: '_foo'`) from a specific parent and deliberately *not* exposed as a general-purpose block merchants can add anywhere. When adding a block that should only ever live inside one specific surface, follow this convention and restrict it by listing it explicitly in that parent's `blocks` accepts array (don't add `@theme`/`@app` wildcards to something meant to be private).

### JS: the Component framework

Custom elements are built on the shared base class in `assets/component.js` (see `.cursor/rules/javascript-standards.mdc` for the full pattern: `refs`, typed `@typedef`s, `on:click="/methodName"` wiring, event-driven parent/child communication, `AbortController` cleanup in `disconnectedCallback`). `assets/dialog.js` and `assets/accordion-custom.js` are reference implementations for modal and animated-accordion behavior respectively — prefer native `<dialog>`/`<details>` first (see `html-standards.mdc`) and reach for custom JS components only when the native element can't do it.

## Documenting custom features

`_documentation/*.md` holds one file per non-stock customization made to this theme (e.g. `free-shipping-progress-bar.md`, `product-card-intensity.md`). Each follows the same shape: **Summary**, **Merchant-facing settings** (table of setting id/type/default/description + where to find it in the editor), **Behavior**, any currency/locale caveats, **Files** touched, and **Out of scope**. When implementing a new customer-visible customization, add a matching file here — it's the source of truth for "what did we change from stock Horizon and why," since there's no changelog or design doc elsewhere in the repo.

## Coding standards (`.cursor/rules/*.mdc`)

These are auto-attached (by glob) Cursor rules; read the relevant one(s) before editing matching files rather than relying on memory of this summary:

- `liquid.mdc`, `sections.mdc`, `blocks.mdc`, `snippets.mdc`, `schemas.mdc`, `templates.mdc` — Liquid syntax, section/block/snippet structure, schema JSON shape, JSON template shape.
- `css-standards.mdc` — BEM naming, `0 1 0`/`0 4 0` specificity budget, namespaced CSS custom properties (scope instance-specific values via inline `style="--x: ..."` rather than per-id selectors), logical properties for RTL, one level of nesting max (media queries and true parent-state exceptions aside), `:has()` performance caveats.
- `javascript-standards.mdc` — Component framework usage, async/await, early returns, event-driven component communication, JSDoc typing, zero external dependencies.
- `html-standards.mdc` — prefer native elements (`<details>`, `<dialog>`, `popover`) over custom JS; `CamelCase` id convention keyed on `section.id`/`block.id` for uniqueness.
- `theme-settings.mdc` — `config/settings_schema.json` structure/categories.
- `locales.mdc`, `localization.mdc` — translation key structure and `{{ 'key' | t }}` usage; English-only authoring here.
- `assets.mdc` — flat directory, SVG icons need `aria-hidden="true"` on the root `<svg>`.
- `commit-messages.mdc` — Conventional Commits format (see tooling caveat above — not actually hook-enforced in this repo).
- Two dozen `*-accessibility.mdc` files (accordion, carousel, modal, tabs, forms, combobox, product card/gallery/filter, color contrast, focus order, etc.) plus `global-accessibility-standards.mdc` (lang attribute, viewport zoom, skip link, iframe titles) — consult the one matching the component you're touching.
- `prompts-and-references.mdc` — describes a living-document workflow for `.cursor/prompts/`/`.cursor/references/`; neither directory currently exists in this repo, so this rule is aspirational/inherited from upstream and not actionable here.
