import type { Meta, StoryObj } from '@storybook/react-vite';
import styles from './Tokens.module.css';

/* Specimens of the token layer. Stories may not carry raw values either, so every
   swatch reads its colour through a custom property. */
const STATUS_FAMILIES = ['blocked', 'monitoring', 'safe', 'info', 'neutral'] as const;
const STEPS = ['', '-surface', '-border', '-fill', '-marker'] as const;
const SURFACES = ['canvas', 'panel', 'subtle', 'inset', 'hover', 'selected'] as const;
const TEXT = ['primary', 'secondary', 'muted', 'link'] as const;
const SPACES = [0, 1, 2, 3, 4, 5, 6, 7] as const;
const TYPE_ROLES = ['page-title', 'section', 'card-title', 'body', 'support', 'label', 'data', 'metric'] as const;
const RADII = ['xs', 'sm', 'md', 'lg', 'xl', 'pill'] as const;

function Swatch({ token, label }: { token: string; label?: string }) {
  return (
    <div className={styles.swatch}>
      <span className={styles.chip} style={{ background: `var(${token})` }} />
      <code className={styles.code}>{label ?? token}</code>
    </div>
  );
}

function Foundations() {
  return (
    <div className={styles.page}>
      <h2 className={styles.h}>Status families</h2>
      <p className={styles.p}>
        Red is reserved for Blocked and destructive states. Amber is Monitoring. Green is a successful sync or a positive
        outcome. Blue marks a manual override. Grey is unevaluated.
      </p>
      {STATUS_FAMILIES.map((family) => (
        <div key={family} className={styles.row}>
          {STEPS.map((step) => (
            <Swatch key={step} token={`--status-${family}${step}`} />
          ))}
        </div>
      ))}

      <h2 className={styles.h}>Surfaces and ink</h2>
      <div className={styles.row}>
        {SURFACES.map((s) => (
          <Swatch key={s} token={`--surface-${s}`} />
        ))}
      </div>
      <div className={styles.row}>
        {TEXT.map((t) => (
          <Swatch key={t} token={`--text-${t}`} />
        ))}
        <Swatch token="--action-primary" />
        <Swatch token="--action-primary-ink" />
        <Swatch token="--action-primary-fill" />
        <Swatch token="--focus-ring" />
      </div>

      <h2 className={styles.h}>Spacing</h2>
      <div className={styles.row}>
        {SPACES.map((n) => (
          <div key={n} className={styles.swatch}>
            <span className={styles.bar} style={{ width: `var(--space-${n})` }} />
            <code className={styles.code}>--space-{n}</code>
          </div>
        ))}
      </div>

      <h2 className={styles.h}>Shape</h2>
      <p className={styles.p}>Borders before shadows. Elevation exists for overlays only.</p>
      <div className={styles.row}>
        {RADII.map((r) => (
          <div key={r} className={styles.swatch}>
            <span className={styles.chip} style={{ borderRadius: `var(--radius-${r})`, background: 'var(--surface-panel)' }} />
            <code className={styles.code}>--radius-{r}</code>
          </div>
        ))}
        <div className={styles.swatch}>
          <span className={styles.chip} style={{ background: 'var(--surface-panel)', boxShadow: 'var(--shadow-overlay)', border: 0 }} />
          <code className={styles.code}>--shadow-overlay</code>
        </div>
      </div>

      <h2 className={styles.h}>Motion</h2>
      <p className={styles.p}>
        Three durations on one easing curve: instant for press, fast for hover and colour, default for disclosure. All
        collapse under reduced motion. Nothing animates evidence, status or counts.
      </p>

      <h2 className={styles.h}>Type roles</h2>
      {TYPE_ROLES.map((role) => (
        <p
          key={role}
          className={styles.type}
          style={{
            fontSize: `var(--text-${role}-size)`,
            lineHeight: `var(--text-${role}-line)`,
            fontWeight: `var(--text-${role}-weight)`,
          }}
        >
          {role}: Blocked after visit 4 of 6
        </p>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Tokens',
  component: Foundations,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Foundations>;
export default meta;

export const Tokens: StoryObj<typeof meta> = {};
