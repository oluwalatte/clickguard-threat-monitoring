import { Button } from '../Button/Button';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './EmptyState.module.css';

export type EmptyStateVariant = 'no-data' | 'no-matches' | 'unavailable' | 'error';

export interface EmptyStateProps {
  /** `no-data` = nothing in range; `no-matches` = filters excluded everything; `unavailable` = data could not be loaded; `error` = the request failed. */
  variant?: EmptyStateVariant;
  /** States what is absent, e.g. "No traffic in this date range". */
  title: string;
  /** Explains why the space is empty. Never implies the absence is good news. */
  description: string;
  /** Recovery action, e.g. "Clear filters" or "Retry". */
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  /** Tighter padding for use inside a table body. */
  compact?: boolean;
}

const ICON: Record<EmptyStateVariant, IconName> = {
  'no-data': 'calendar-search',
  'no-matches': 'funnel-x',
  unavailable: 'unplug',
  error: 'triangle-alert',
};

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={styles.root}
      role={variant === 'error' ? 'alert' : 'status'}
      data-variant={variant}
      data-compact={compact || undefined}
    >
      <span className={styles.well}>
        <Icon name={ICON[variant]} size="lg" />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel || secondaryLabel ? (
        <div className={styles.actions}>
          {actionLabel ? (
            <Button variant="secondary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
          {secondaryLabel ? (
            <Button variant="quiet" size="sm" onClick={onSecondaryAction}>
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
