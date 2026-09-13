import { EvidenceItem, type EvidenceItemProps } from '../EvidenceItem/EvidenceItem';
import styles from './EvidenceList.module.css';

export interface EvidenceListProps {
  title?: string;
  /** Ordered strongest-first. Contradictory items stay in the list, never in a separate collapsed block. */
  items: Array<EvidenceItemProps & { id?: string }>;
  id?: string;
  /** Assumptions or caveats, e.g. how an estimate was calculated. */
  footnote?: string;
}

export function EvidenceList({ title = 'Evidence', items, id, footnote }: EvidenceListProps) {
  return (
    <section className={styles.root} id={id}>
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.list}>
        {items.map((item, i) => (
          <EvidenceItem key={item.id ?? i} {...item} />
        ))}
      </ul>
      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </section>
  );
}
