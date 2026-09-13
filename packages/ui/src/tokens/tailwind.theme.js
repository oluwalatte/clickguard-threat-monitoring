/* Tailwind v3 export, same mapping contract as tokens/tailwind-theme.css.
   Values are var() references, so the CSS tokens stay the single source of
   truth and `npm run check:tokens` has exactly one place to diff against.

   tailwind.config.js:
     const { clickguardTheme } = require("@clickguard/threat-ui/tokens/tailwind.theme");
     module.exports = { corePlugins: { preflight: false }, theme: { extend: clickguardTheme } };
*/
const clickguardTheme = {
  fontFamily: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  colors: {
    surface: {
      canvas: "var(--surface-canvas)",
      panel: "var(--surface-panel)",
      subtle: "var(--surface-subtle)",
      inset: "var(--surface-inset)",
      hover: "var(--surface-hover)",
      selected: "var(--surface-selected)",
    },
    text: {
      primary: "var(--text-primary)",
      secondary: "var(--text-secondary)",
      muted: "var(--text-muted)",
      inverse: "var(--text-inverse)",
      link: "var(--text-link)",
    },
    border: {
      DEFAULT: "var(--border-default)",
      strong: "var(--border-strong)",
      hover: "var(--border-hover)",
    },
    action: {
      primary: "var(--action-primary)",
      primaryHover: "var(--action-primary-hover)",
      primaryActive: "var(--action-primary-active)",
      primarySurface: "var(--action-primary-surface)",
      primaryBorder: "var(--action-primary-border)",
      onPrimary: "var(--action-on-primary)",
      primaryInk: "var(--action-primary-ink)",
      primaryFill: "var(--action-primary-fill)",
      primaryFillHover: "var(--action-primary-fill-hover)",
      primaryFillActive: "var(--action-primary-fill-active)",
    },
    status: {
      blocked: "var(--status-blocked)",
      blockedSurface: "var(--status-blocked-surface)",
      blockedBorder: "var(--status-blocked-border)",
      blockedFill: "var(--status-blocked-fill)",
      monitoring: "var(--status-monitoring)",
      monitoringSurface: "var(--status-monitoring-surface)",
      monitoringBorder: "var(--status-monitoring-border)",
      monitoringFill: "var(--status-monitoring-fill)",
      safe: "var(--status-safe)",
      safeSurface: "var(--status-safe-surface)",
      safeBorder: "var(--status-safe-border)",
      safeFill: "var(--status-safe-fill)",
      info: "var(--status-info)",
      infoSurface: "var(--status-info-surface)",
      neutral: "var(--status-neutral)",
      neutralSurface: "var(--status-neutral-surface)",
    },
    focus: { ring: "var(--focus-ring)" },
  },
  spacing: {
    0: "var(--space-0)",
    1: "var(--space-1)",
    2: "var(--space-2)",
    3: "var(--space-3)",
    4: "var(--space-4)",
    5: "var(--space-5)",
    6: "var(--space-6)",
    7: "var(--space-7)",
  },
  borderRadius: {
    marker: "var(--radius-marker)",
    xs: "var(--radius-xs)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    pill: "var(--radius-pill)",
  },
  boxShadow: {
    overlay: "var(--shadow-overlay)",
    panel: "var(--shadow-panel)",
  },
  fontSize: {
    "page-title": ["var(--text-page-title-size)", { lineHeight: "var(--text-page-title-line)" }],
    section: ["var(--text-section-size)", { lineHeight: "var(--text-section-line)" }],
    "card-title": ["var(--text-card-title-size)", { lineHeight: "var(--text-card-title-line)" }],
    body: ["var(--text-body-size)", { lineHeight: "var(--text-body-line)" }],
    support: ["var(--text-support-size)", { lineHeight: "var(--text-support-line)" }],
    label: ["var(--text-label-size)", { lineHeight: "var(--text-label-line)" }],
    data: ["var(--text-data-size)", { lineHeight: "var(--text-data-line)" }],
    metric: ["var(--text-metric-size)", { lineHeight: "var(--text-metric-line)" }],
  },
  transitionTimingFunction: { standard: "var(--ease-standard)" },
};

module.exports = { clickguardTheme };
