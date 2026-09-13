import { useState } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { SignalTags, type SignalTagProps } from '../SignalTag/SignalTag';
import styles from './VisitTimeline.module.css';

/** Visit types use round markers; system events use square ones. */
export type TimelineItemType =
  | 'paid'
  | 'organic'
  | 'direct'
  | 'referral'
  | 'block'
  | 'sync-pending'
  | 'sync-active'
  | 'sync-failed'
  | 'override';

export interface VisitTimelineItem {
  /** Anchor target, e.g. "visit-4", so evidence can link back to it. */
  id?: string;
  type: TimelineItemType;
  /** The scanning form, e.g. "10 Sep, 22:47". The complete form belongs in `record`. */
  timestamp: string;
  /** Relative time for scanning, e.g. "12 hours later". */
  relativeTime?: string;
  /** Overrides the default type label. */
  label?: string;
  /** The visit the decision followed: labelled and opened by default. */
  decisionVisit?: boolean;
  /** One line: where the visit came from, e.g. "Meta Ads · Prospecting LATAM". */
  description: string;
  /** One line of engagement, e.g. ["2 seconds", "5% scroll", "No conversion"]. */
  summary?: string[];
  /** Only what changed since the previous visit or is unusual, as signal tags. */
  changes?: Array<SignalTagProps & { id?: string }>;
  /** Sentences from the evidence that this visit supports. Opens the disclosure. */
  contributed?: string[];
  /** The full record, one row per fact. Behind the disclosure. */
  record?: Array<{ label: string; value: string }>;
  defaultExpanded?: boolean;
}

export interface VisitTimelineProps {
  /** Oldest first. A single-item timeline is a supported state. */
  items: VisitTimelineItem[];
  title?: string;
  /** Range or count summary, e.g. "5 events, 19 Feb 2026". */
  caption?: string;
}

const TYPE: Record<TimelineItemType, { icon: IconName; label: string; system: boolean }> = {
  paid: { icon: 'mouse-pointer-click', label: 'Paid visit', system: false },
  organic: { icon: 'search', label: 'Organic visit', system: false },
  direct: { icon: 'link', label: 'Direct visit', system: false },
  referral: { icon: 'external-link', label: 'Referral visit', system: false },
  block: { icon: 'shield-ban', label: 'Block decision', system: true },
  'sync-pending': { icon: 'clock', label: 'Exclusion sync pending', system: true },
  'sync-active': { icon: 'circle-check', label: 'Exclusion active', system: true },
  'sync-failed': { icon: 'triangle-alert', label: 'Exclusion sync failed', system: true },
  /* A person's action, in the info tone (D3). Square, like every non-visit event. */
  override: { icon: 'circle-check', label: 'Manually allowed', system: true },
};

function Row({ item, isLast }: { item: VisitTimelineItem; isLast: boolean }) {
  const [open, setOpen] = useState(Boolean(item.defaultExpanded));
  const tone = TYPE[item.type];
  const expandable = Boolean((item.contributed && item.contributed.length) || (item.record && item.record.length));

  return (
    <li
      id={item.id}
      className={styles.row}
      data-type={item.type}
      data-system={tone.system || undefined}
      data-last={isLast || undefined}
      data-decision-visit={item.decisionVisit || undefined}
    >
      <div className={styles.rail}>
        <span className={styles.marker}>
          <Icon name={tone.icon} size="sm" />
        </span>
        {!isLast ? <span aria-hidden="true" className={styles.connector} /> : null}
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.typeLabel}>
            {item.label || tone.label}
            {item.decisionVisit ? <span className={styles.decisionTag}>Decision visit</span> : null}
          </span>
          <span className={styles.time}>
            <span>{item.timestamp}</span>
            {item.relativeTime ? <span>{item.relativeTime}</span> : null}
          </span>
        </div>

        <p className={styles.description}>{item.description}</p>

        {item.summary && item.summary.length ? (
          <p className={styles.summary}>
            {item.summary.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </p>
        ) : null}

        {item.changes && item.changes.length ? (
          <div className={styles.changes}>
            <SignalTags signals={item.changes} label="What changed on this visit" />
          </div>
        ) : null}

        {expandable ? (
          <div className={styles.details}>
            <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={styles.disclosure}>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" />
              {open ? 'Hide details' : 'Details'}
            </button>
            {open ? (
              <div className={styles.panel}>
                {item.contributed && item.contributed.length ? (
                  <>
                    <h4 className={styles.panelTitle}>What this visit added to the evidence</h4>
                    <ul className={styles.contributed}>
                      {item.contributed.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {item.record && item.record.length ? (
                  <>
                    <h4 className={styles.recordTitle}>Record</h4>
                    <dl className={styles.record}>
                      {item.record.map((r) => (
                        <div key={r.label} className={styles.recordRow}>
                          <dt className={styles.recordLabel}>{r.label}</dt>
                          <dd className={styles.recordValue}>{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function VisitTimeline({ items, title = 'Visitor journey', caption }: VisitTimelineProps) {
  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {caption ? <span className={styles.caption}>{caption}</span> : null}
      </div>
      <ol className={styles.list}>
        {items.map((item, i) => (
          <Row key={item.id ?? i} item={item} isLast={i === items.length - 1} />
        ))}
      </ol>
    </section>
  );
}
