import type { ReactNode } from 'react';
import styles from './FilterChip.module.css';

export interface FilterChipProps {
  children: ReactNode;
  pressed: boolean;
  onToggle: () => void;
  /** Optional count shown after the label, e.g. how many rows the filter would keep. */
  count?: number;
  disabled?: boolean;
}

/** A toggle for one filter value. Pressed state is carried by aria-pressed and a weight change, not colour alone. */
export function FilterChip({ children, pressed, onToggle, count, disabled }: FilterChipProps) {
  return (
    <button type="button" className={styles.chip} aria-pressed={pressed} onClick={onToggle} disabled={disabled}>
      <span className={styles.label}>{children}</span>
      {count !== undefined ? <span className={styles.count}>{count}</span> : null}
    </button>
  );
}

export interface FilterGroupProps {
  /** Accessible name for the group, e.g. "Status". Also rendered as the visible caption. */
  label: string;
  children: ReactNode;
}

export function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.groupLabel}>{label}</span>
      <div className={styles.chips}>{children}</div>
    </div>
  );
}
