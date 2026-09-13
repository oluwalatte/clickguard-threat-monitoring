import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './ActiveFilterChip.module.css';

export interface ActiveFilterChipProps {
  /** The applied value, e.g. "Google Ads". Read with the dimension when it is ambiguous, e.g. "Country: Germany". */
  label: string;
  onRemove: () => void;
}

/** One applied filter with a remove control. Not a toggle: removing it is the only action. */
export function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <span className={styles.chip}>
      <span className={styles.label}>{label}</span>
      <button type="button" className={styles.remove} onClick={onRemove} aria-label={`Remove filter: ${label}`}>
        <Icon name="x" size="sm" />
      </button>
    </span>
  );
}

export interface ActiveFilterBarProps {
  children: ReactNode;
  /** Clears every filter shown in the bar. */
  onClearAll?: () => void;
  /** Accessible name for the group. */
  label?: string;
}

/** The applied secondary filters in one row, so a closed menu never hides what narrows the table. */
export function ActiveFilterBar({ children, onClearAll, label = 'Active filters' }: ActiveFilterBarProps) {
  return (
    <div className={styles.bar} role="group" aria-label={label}>
      <span className={styles.caption}>{label}</span>
      <div className={styles.chips}>{children}</div>
      {onClearAll ? (
        <Button variant="quiet" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      ) : null}
    </div>
  );
}
