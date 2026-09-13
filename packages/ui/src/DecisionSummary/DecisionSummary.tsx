import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { StatusBadge, type StatusKind } from '../StatusBadge/StatusBadge';
import styles from './DecisionSummary.module.css';

export type Confidence = 'high' | 'moderate' | 'conflicting' | 'insufficient' | 'none';
export type SyncState = 'active' | 'pending' | 'failed';

export interface DecisionSummaryProps {
  status: StatusKind;
  statusLabel?: string;
  /** Calibrated label shown next to the badge. Blocked: high, moderate or conflicting.
      Monitoring: conflicting or insufficient. Not blocked: none. */
  confidence?: Confidence;
  /** One sentence naming what happened, e.g. "Blocked after visit 4". */
  headline: string;
  /** Plain-language reason. No model vocabulary, no unexplained metric names. */
  explanation: string;
  /** Complete timestamp of the block decision. This is the auditable field. */
  decisionTime?: string;
  /** Used instead of `decisionTime` while a visitor is still under evaluation. */
  monitoringNote?: string;
  /** Distinguishes "decision made" from "exclusion became active" at the platform. */
  syncState?: SyncState;
  syncNote?: string;
  /** One row per advertising platform, so a mixed picture is never flattened into one word. */
  syncPlatforms?: Array<{ name: string; state: 'active' | 'pending' | 'delayed' | 'failed'; detail?: string }>;
  /** Paid spend attributable to this visitor, with the assumption stated. */
  exposure?: string;
  evidenceHref?: string;
  evidenceCount?: number;
  /** Buttons for the header. Supply Button elements. */
  actions?: ReactNode;
}

export const CONFIDENCE_LABEL: Record<Confidence, string | null> = {
  high: 'High confidence',
  moderate: 'Moderate confidence',
  conflicting: 'Conflicting evidence',
  insufficient: 'Insufficient evidence',
  none: null,
};

const SYNC: Record<SyncState, { text: string; icon: IconName }> = {
  active: { text: 'Exclusion active', icon: 'circle-check' },
  pending: { text: 'Exclusion sync pending', icon: 'clock' },
  failed: { text: 'Exclusion sync failed', icon: 'triangle-alert' },
};

const PLATFORM_STATE: Record<'active' | 'pending' | 'delayed' | 'failed', string> = { active: 'Active', pending: 'Pending', delayed: 'Delayed', failed: 'Failed' };

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue} data-empty={value ? undefined : true} data-mono={mono || undefined}>
        {value || 'Not available'}
      </span>
    </div>
  );
}

export function DecisionSummary({
  status,
  statusLabel,
  confidence = 'none',
  headline,
  explanation,
  decisionTime,
  monitoringNote,
  syncState,
  syncNote,
  syncPlatforms,
  exposure,
  evidenceHref = '#evidence',
  evidenceCount,
  actions,
}: DecisionSummaryProps) {
  const sync = syncState ? SYNC[syncState] : null;
  const confidenceLabel = CONFIDENCE_LABEL[confidence];

  return (
    <section className={styles.root} aria-label="Decision summary">
      <div className={styles.header}>
        <div className={styles.verdict}>
          <div className={styles.badgeRow}>
            <StatusBadge status={status} label={statusLabel} />
            {confidenceLabel ? <span className={styles.confidence}>{confidenceLabel}</span> : null}
          </div>
          <h2 className={styles.headline}>{headline}</h2>
          <p className={styles.explanation}>{explanation}</p>
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>

      {sync && syncState ? (
        <div className={styles.sync} data-sync={syncState}>
          <span className={styles.syncIcon}>
            <Icon name={sync.icon} size="sm" />
          </span>
          <div className={styles.syncBody}>
            <span className={styles.syncText}>{sync.text}</span>
            {syncNote ? <span className={styles.syncNote}>{syncNote}</span> : null}
            {syncPlatforms && syncPlatforms.length ? (
              <dl className={styles.platforms}>
                {syncPlatforms.map((p) => (
                  <div key={p.name} className={styles.platformRow} data-state={p.state}>
                    <dt className={styles.platformName}>{p.name}</dt>
                    <dd className={styles.platformState}>
                      <span className={styles.platformLabel}>{PLATFORM_STATE[p.state]}</span>
                      {p.detail ? <span className={styles.platformDetail}>{p.detail}</span> : null}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={styles.fields}>
        <Field
          label={status === 'monitoring' ? 'Monitoring since' : 'Block decision made'}
          value={decisionTime || monitoringNote}
          mono
        />
        <Field label="Paid exposure" value={exposure} />
        <div className={styles.evidenceLink}>
          <a href={evidenceHref} className={styles.link}>
            <Icon name="list-tree" size="sm" />
            {evidenceCount ? `${evidenceCount} signals` : 'View evidence'}
          </a>
        </div>
      </div>
    </section>
  );
}
