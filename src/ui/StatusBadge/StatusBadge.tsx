import styles from './StatusBadge.module.css';

/** Decision states per decisions.md D3. `blocked` is the only one that uses red. */
export type StatusKind = 'blocked' | 'monitoring' | 'safe' | 'allowed' | 'neutral';

export interface StatusBadgeProps {
  status: StatusKind;
  /** Overrides the default wording. The badge is never label-less. */
  label?: string;
  /** `sm` is the table form, `md` the detail form. */
  size?: 'sm' | 'md';
  /** Short qualifier shown after the label in the `md` form, e.g. "after visit 4". */
  detail?: string;
}

export const STATUS_LABEL: Record<StatusKind, string> = {
  blocked: 'Blocked',
  monitoring: 'Monitoring',
  safe: 'Not blocked',
  allowed: 'Manually allowed',
  neutral: 'Not evaluated',
};

/* Colour never works alone: square for blocked, diamond for monitoring,
   filled circle for not blocked, hollow ring for manual and unevaluated. */
const SHAPE: Record<StatusKind, 'square' | 'diamond' | 'circle' | 'ring'> = {
  blocked: 'square',
  monitoring: 'diamond',
  safe: 'circle',
  allowed: 'ring',
  neutral: 'ring',
};

export function StatusBadge({ status, label, size = 'md', detail }: StatusBadgeProps) {
  return (
    <span className={styles.badge} data-status={status} data-size={size}>
      <span aria-hidden="true" className={styles.marker} data-shape={SHAPE[status]} />
      <span>{label || STATUS_LABEL[status]}</span>
      {detail && size !== 'sm' ? <span className={styles.detail}>{detail}</span> : null}
    </span>
  );
}
