# FKUI themes in fk-demo-app

How themes work in FKUI, how this app loads them, and how to change or extend them.

## What a theme is

A theme is a set of CSS custom properties on `:root`. The component styles in `@fkui/design`
never use fixed colours. They only read these variables, so changing a theme means changing
variable values, nothing else.

`@fkui/theme-default` (6.65) defines 186 variables per theme:

- **77 design tokens**, named `--fkds-color-…`, grouped by purpose: action, feedback, select,
  border, text, navigation, interactive and background. Example:
  `--fkds-color-action-background-primary-default` is the primary button's colour
  (`#4a52b6` in light, `#a4a8db` in dark).
- **101 component variables**, named `--f-…`: font sizes, spacing, border radii, shadows,
  logo images and so on.

The theme must be loaded before `@fkui/design`.

## What the package contains

| File | Content |
|---|---|
| `dist/theme-light.css` | Light theme on `:root`. This is what `import "@fkui/theme-default"` loads. |
| `dist/theme-dark.css` | Dark theme on `:root`. |
| `dist/theme-auto.css` | Both, chosen with `@media (prefers-color-scheme: …)`. |
| `src/_default.scss` | SCSS mixins `light`, `dark` and `auto`, for placing a theme on any selector. |
| `dist/fkui-css-variables.css` / `.js` | The variable names, for reference or tooling. |
| `dist/deprecated-variables.json` | Old variable names. Do not use these in new code. |
| `dist/palette.json` | The raw colour palette the themes are built from. |

To see every variable and its value, open
`node_modules/@fkui/theme-default/dist/theme-light.css` (or `theme-dark.css`).

## How this app does it

The app has a light/dark/auto switch in the page header.

- **`src/theme.scss`** builds all three themes from the package's SCSS source and ties them to
  the `data-theme` attribute on `<html>`:

  ```scss
  @use "@fkui/theme-default/src/default" as fkui with ($global: false);

  :root { @include fkui.auto; }                         // no attribute: follow the OS
  :root[data-theme="light"] { @include fkui.light; }
  :root[data-theme="dark"]  { @include fkui.dark; }
  ```

  `$global: false` stops the package from writing its own light `:root` block, which would
  otherwise sit underneath. `:root[data-theme]` has a higher specificity than `:root`, so an
  explicit choice wins over the OS setting. This needs `sass`, which is a dev dependency.

- **`src/theme.ts`** holds the choice in a shared `ref` (`theme`), sets or removes
  `data-theme` on `<html>`, and remembers the choice in `localStorage` (key `fk-demo-theme`).
  It runs when `main.ts` imports it, before the app mounts, so the page never shows in the
  wrong theme first.

- **`src/App.vue`** shows the three buttons ("Ljust", "Mörkt", "Auto") in the `right` slot of
  `FPageHeader`. The full-screen layout demos have no header, but they keep the chosen theme.

To change the theme from code anywhere in the app:

```ts
import { theme } from "../theme"; // path relative to your file
theme.value = "dark";
```

## Other ways to load a theme

### A single fixed theme (no Sass)

Replace the theme import in `main.ts` with one of the ready-made files:

```ts
import "@fkui/theme-default";                         // light (same as dist/theme-light.css)
import "@fkui/theme-default/dist/theme-dark.css";     // always dark
import "@fkui/theme-default/dist/theme-auto.css";     // follows the OS setting
```

### Switching at runtime without Sass

Import the CSS files as URLs and swap one `<link>` element:

```ts
import light from "@fkui/theme-default/dist/theme-light.css?url";
import dark from "@fkui/theme-default/dist/theme-dark.css?url";

const link = document.createElement("link");
link.rel = "stylesheet";
document.head.prepend(link); // before @fkui/design
link.href = light;
// later: link.href = dark;
```

This works, but the page can flash briefly while the new file loads. The Sass approach above
keeps all themes in one stylesheet and avoids that.

## Making the theme your own

FKUI's advice is to start from one of its themes and adjust it. The simplest way is to
override tokens after the theme is loaded, for example in `src/style.css`:

```css
:root {
    --fkds-color-action-background-primary-default: #1b4a7a;
    --fkds-color-action-background-primary-hover: #143a60;
}
```

With the light/dark switch, give each theme its own values:

```css
:root[data-theme="dark"] {
    --fkds-color-action-background-primary-default: #8fb4dc;
}
```

Keep the auto case in mind: with no `data-theme`, the dark values come from the
`prefers-color-scheme: dark` media query, so a dark override must also go inside
`@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }`.

Check contrast when you change colours. The default themes are tuned for WCAG contrast, and an
override can break that.

For a full theme of your own, FKUI provides `@fkui/theme-builder` (the `fkui-theme-builder`
command), which `@fkui/theme-default` itself is built with. It generates the CSS files from a
palette and token definitions.

FKUI's documentation also mentions `@fkui/theme-desktop`, a theme designed for large screens
first. It is not installed in this project.

## Your own CSS

Use the tokens in your own styles too, so they follow the theme:

```css
.my-box {
    background: var(--fkds-color-background-secondary);
    color: var(--fkds-color-text-primary);
    border: 1px solid var(--fkds-color-border-primary);
}
```

A fixed colour such as `#f0f0f0` will look wrong in the dark theme. A fallback value
(`var(--token, #f0f0f0)`) is only used if the variable is missing, which never happens once a
theme is loaded.
