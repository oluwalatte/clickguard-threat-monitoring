# Tokens

Adopted from the Claude Design export with names unchanged. `../styles.css` is the only file
consumers import; it is a list of `@import`s.

| File | Contents |
| --- | --- |
| `fonts.css` | Host Grotesk import and the `--font-sans` / `--font-mono` stacks |
| `colors.css` | Reference ramps plus the semantic roles: surface, text, border, action, status, focus |
| `typography.css` | Eight type roles as size / weight / line-height / tracking triples |
| `spacing.css` | The 4 to 48 scale, layout constants, and component sizes added in the conversion |
| `shape.css` | Radii, border widths, the two shadows |
| `motion.css` | Durations, easing, the reduced-motion override |
| `base.css` | Minimal element defaults, the global focus ring, the visually-hidden utility |
| `breakpoints.ts` | Numeric twins of layout tokens that components compare in JavaScript |
| `tailwind-theme.css` | Tailwind v4 `@theme` export. Mapping only; never imported by the app |
| `tailwind.theme.js` | Tailwind v3 `theme.extend` export with the same contract; never imported |

This directory is the only place in the repository's source where a raw hex or pixel value may appear.
`npm run check:tokens` enforces that.

## Adding a token

1. Add the property to the right file under `:root`, named for its role, never its appearance.
2. If it is a spacing, radius, colour or type role, add the matching line to both Tailwind exports.
3. Use it. A value that appears in two components and has no token wants one.
