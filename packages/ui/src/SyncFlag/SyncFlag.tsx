import { Icon } from '../Icon/Icon';
import styles from './SyncFlag.module.css';

/** An exclusion that has not reached the platform yet, or was refused. Active needs no flag. */
export type SyncException = 'pending' | 'delayed' | 'failed';

export interface SyncFlagProps {
  state: SyncException;
  /** Optional platform name, e.g. "Meta Ads", when more than one platform is involved. */
  platform?: string;
}

const TEXT: Record<SyncException, string> = { pending: 'Sync pending', delayed: 'Sync delayed', failed: 'Sync failed' };

/** Enforcement information beside a verdict, shown only when something needs attention.
    Amber for pending and delayed, red for failed; always with a glyph and text. */
export function SyncFlag({ state, platform }: SyncFlagProps) {
  return (
    <span className={styles.flag} data-state={state}>
      <Icon name={state === 'failed' ? 'triangle-alert' : 'clock'} size="sm" />
      <span>
        {TEXT[state]}
        {platform ? ` (${platform})` : ''}
      </span>
    </span>
  );
}
