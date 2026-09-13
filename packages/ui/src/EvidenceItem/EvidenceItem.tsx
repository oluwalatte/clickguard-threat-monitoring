import { useState } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './EvidenceItem.module.css';

export type EvidenceKind = 'primary' | 'supporting' | 'contradictory' | 'missing';

export interface EvidenceItemProps {
  /** How this signal relates to the verdict. `contradictory` must be shown, never hidden. */
  kind?: EvidenceKind;
  /** Plain-language sentence, e.g. "Four paid visits in 41 minutes". */
  statement: string;
  /** Optional raw measurement behind the statement; revealed by a disclosure button. */
  rawValue?: string;
  /** Human reference to the visit this came from, e.g. "From visit 4 at 14:12:08". */
  sourceVisit?: string;
  /** Anchor for the source visit, typically "#visit-4". */
  sourceHref?: string;
  defaultExpanded?: boolean;
}

const KIND: Record<EvidenceKind, { icon: IconName; note: string }> = {
  primary: { icon: 'circle-chevron-right', note: 'Primary contributor' },
  supporting: { icon: 'circle-plus', note: 'Supporting context' },
  contradictory: { icon: 'circle-minus', note: 'Mitigating evidence' },
  missing: { icon: 'circle-help', note: 'Unavailable' },
};

export function EvidenceItem({
  kind = 'supporting',
  statement,
  rawValue,
  sourceVisit,
  sourceHref,
  defaultExpanded = false,
}: EvidenceItemProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const tone = KIND[kind];
  const expandable = Boolean(rawValue);

  return (
    <li className={styles.item} data-kind={kind}>
      <span aria-hidden="true" className={styles.glyph}>
        <Icon name={tone.icon} size="sm" />
      </span>
      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.statement}>{statement}</span>
          <span className={styles.note}>{tone.note}</span>
        </div>

        {sourceVisit || expandable ? (
          <div className={styles.footer}>
            {sourceVisit ? (
              sourceHref ? (
                <a href={sourceHref} className={styles.source}>{sourceVisit}</a>
              ) : (
                <span className={styles.sourceText}>{sourceVisit}</span>
              )
            ) : null}
            {expandable ? (
              <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={styles.disclosure}>
                <Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" />
                {open ? 'Hide raw value' : 'Show raw value'}
              </button>
            ) : null}
          </div>
        ) : null}

        {open && expandable ? <div className={styles.raw}>{rawValue}</div> : null}
      </div>
    </li>
  );
}
