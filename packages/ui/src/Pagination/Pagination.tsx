import { Icon } from '../Icon/Icon';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** "1 to 20 of 48 visitors". Rendered beside the controls and announced on change. */
  summary?: string;
}

/** Which page numbers to show: everything up to seven pages, otherwise the ends and the neighbours. */
export function pageWindow(page: number, pageCount: number): Array<number | 'gap'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | 'gap'> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

/** Page controls as a navigation landmark. The current page carries aria-current; the summary is a live region. */
export function Pagination({ page, pageCount, onPageChange, summary }: PaginationProps) {
  if (pageCount <= 1) return summary ? <p className={styles.summaryOnly} aria-live="polite">{summary}</p> : null;
  const go = (p: number) => onPageChange(Math.min(pageCount, Math.max(1, p)));
  return (
    <nav className={styles.root} aria-label="Pagination">
      {summary ? <p className={styles.summary} aria-live="polite">{summary}</p> : null}
      <ul className={styles.list}>
        <li>
          <button type="button" className={styles.control} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <Icon name="arrow-left" size="sm" />
            <span>Previous</span>
          </button>
        </li>
        {pageWindow(page, pageCount).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              &hellip;
            </li>
          ) : (
            <li key={p}>
              <button type="button" className={styles.page} onClick={() => go(p)} aria-current={p === page ? 'page' : undefined} aria-label={`Page ${p}`}>
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button type="button" className={styles.control} onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Next page">
            <span>Next</span>
            <Icon name="arrow-right" size="sm" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
