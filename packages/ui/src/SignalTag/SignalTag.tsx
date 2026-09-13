import styles from './SignalTag.module.css';

/** How a signal relates to the verdict. Mirrors EvidenceItem's kinds. */
export type SignalKind = 'primary' | 'supporting' | 'contradictory' | 'missing';

export interface SignalTagProps {
  label: string;
  kind?: SignalKind;
}

/** A scannable evidence label for dense surfaces. Neutral ink; mitigating signals take the
    info tone and unavailable ones a dashed border, so the tone never claims a verdict. */
export function SignalTag({ label, kind = 'supporting' }: SignalTagProps) {
  return (
    <span className={styles.tag} data-kind={kind}>
      {label}
    </span>
  );
}

export interface SignalTagsProps {
  signals: Array<SignalTagProps & { id?: string }>;
  /** Accessible name for the group, e.g. "Key evidence". */
  label?: string;
}

export function SignalTags({ signals, label = 'Key evidence' }: SignalTagsProps) {
  if (!signals.length) return <span className={styles.none}>No signals recorded</span>;
  return (
    <ul className={styles.list} aria-label={label}>
      {signals.map((s, i) => (
        <li key={s.id ?? i} className={styles.item}>
          <SignalTag label={s.label} kind={s.kind} />
        </li>
      ))}
    </ul>
  );
}
