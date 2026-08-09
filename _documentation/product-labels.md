# Product labels on product cards

## Summary

Adds merchant-configurable label badges to product cards, sourced from a
product metafield holding a list of metaobjects (`list.metaobject_reference`).
Each metaobject's `name` field supplies the badge text. Labels render inside
the existing `.product-badges` container in `blocks/_product-card-gallery.liquid`,
alongside the Sale/Sold out badge, sharing the same position/typography
settings. Logic is split from rendering: `snippets/product-labels.liquid`
resolves the metafield/settings into a plain list of label strings,
`snippets/product-labels-content.liquid` only knows how to draw a list of
strings as badges.

## Merchant-facing settings

Location: Theme settings → **Badges**.

| Setting id | Type | Default | Description |
|---|---|---|---|
| `enable_product_labels` | checkbox | `false` | Master on/off toggle for label badges. |
| `product_labels_metafield` | text | `custom.labels` | Namespace and key of the product metafield holding the label metaobject list, in `namespace.key` format. Each metaobject entry must have a field with handle `name` holding the label text. |
| `badge_label_background_color` | color | theme foreground color | Background of label badges. |
| `badge_label_text_color` | color | theme background color | Text color of label badges (auto-contrasted if left blank). |

Shared with the existing Sale/Sold out badges (not duplicated): `badge_position`,
`badge_corner_radius`, `badge_font_family`, `badge_text_transform`.

## Behavior

- Reads `product.metafields[namespace][key].value`, with `namespace`/`key`
  parsed from `product_labels_metafield` (split on `.`).
- Each entry in that list is a metaobject; its display text comes from the
  metaobject's `name` field (`.name.value` via a chained `map:` filter) — the
  field handle is hardcoded, not configurable.
- Renders nothing when: the feature is off, the product has no value for the
  metafield, the metafield setting is blank or has no `.` separator, or every
  resolved label is blank.
- Multiple labels render as multiple stacked badges (same corner, `gap`
  between them via `.product-badges { display: flex; flex-direction: column }`),
  alongside the Sale/Sold out badge if also present. Badges align to the
  trailing edge (`flex-end`) when `badge_position` is `top-right`, and to the
  leading edge otherwise.
- No special theme-editor placeholder handling — like the Sale/Sold out
  badge, labels only render for a real bound product (`unless product == blank`
  in `blocks/_product-card-gallery.liquid`), not the empty placeholder card.
- Label text is escaped (`| escape`) since it's merchant/metaobject-entered
  content, not developer-controlled.

## Files

- `snippets/product-labels.liquid` — business logic: reads the toggle and
  metafield setting, resolves the metaobject list, builds the label array.
- `snippets/product-labels-content.liquid` — rendering only: one badge div
  per label string.
- `blocks/_product-card-gallery.liquid` — calls `product-labels` inside the
  `.product-badges` container; adds the `--badge-align` custom property.
- `snippets/product-badges-styles.liquid` — `.product-badges` gained
  `display: flex; flex-direction: column; gap` to stack multiple badges.
- `snippets/theme-styles-variables.liquid` — `color-custom-badge-label` color
  scheme via `contrast-override`.
- `config/settings_schema.json` — new settings under the **Badges** group.
- `locales/en.default.schema.json` — `settings.enable_product_labels`,
  `settings.badge_label_background_color`, `settings.badge_label_text_color`,
  `settings.product_labels_metafield`, `settings.product_labels_metafield_info`,
  `content.product_labels`.

## Out of scope

- The metaobject field name (`name`) is not configurable.
- No per-label color/icon customization — all labels share one color scheme.
- No de-duplication or sort order beyond the metafield list's own order.
- Other theme locales (e.g. `fr.json`, `fr.schema.json`) are not updated —
  per the project's localization convention, only `en.default.json` /
  `en.default.schema.json` are authored here in English; translators handle
  the rest.
