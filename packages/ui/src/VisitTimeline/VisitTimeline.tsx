import { useState } from 'react';
import { EvidenceList } from '../EvidenceList/EvidenceList';
import type { EvidenceItemProps } from '../EvidenceItem/EvidenceItem';
import { Icon, type IconName } from '../Icon/Icon';
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
  | 'sync-failed';

export interface VisitTimelineItem {
  /** Anchor target, e.g. "visit-4", so evidence can link back to it. */
  id?: string;
  type: TimelineItemType;
  /** Complete timestamp. The auditable value. */
  timestamp: string;
  /** Relative time for scanning, e.g. "41 minutes later". */
  relativeTime?: string;
  /** Overrides the default type label. */
  label?: string;
  /** Plain-language sentence describing the event. */
  description: string;
  /** Compact key/value pairs: campaign, keyword, time on page, IP. */
  meta?: Array<{ label: string; value: string }>;
  /** Signals attached to this visit, revealed by a disclosure button. */
  evidence?: Array<EvidenceItemProps & { id?: string }>;
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
};

function Row({ item, isLast }: { item: VisitTimelineItem; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const tone = TYPE[item.type];
  const expandable = Boolean(item.evidence && item.evidence.length);

  return (
    <li id={item.id} className={styles.row} data-type={item.type} data-system={tone.system || undefined} data-last={isLast || undefined}>
      <div className={styles.rail}>
        <span className={styles.marker}>
          <Icon name={tone.icon} size="sm" />
        </span>
        {!isLast ? <span aria-hidden="true" className={styles.connector} /> : null}
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.typeLabel}>{item.label || tone.label}</span>
          <span className={styles.time}>
            {item.timestamp}
            {item.relativeTime ? `, ${item.relativeTime}` : ''}
          </span>
        </div>

        <p className={styles.description}>{item.description}</p>

        {item.meta && item.meta.length ? (
          <div className={styles.meta}>
            {item.meta.map((m) => (
              <span key={m.label} className={styles.metaItem}>
                <span className={styles.metaLabel}>{m.label}: </span>
                {m.value}
              </span>
            ))}
          </div>
        ) : null}

        {expandable ? (
          <div className={styles.evidence}>
            <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={styles.disclosure}>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" />
              {open ? 'Hide visit evidence' : 'Show visit evidence'}
            </button>
            {open && item.evidence ? (
              <div className={styles.evidencePanel}>
                <EvidenceList title="Signals from this visit" items={item.evidence} />
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
