import type { ReactNode } from 'react';
import styles from './Page.module.css';

/* App-level layout: a page header and a main column. Composition only; no visual decisions
   beyond spacing tokens. */
export function PageHeader({ title, description, breadcrumb }: { title: string; description?: string; breadcrumb?: ReactNode }) {
  return (
    <header className={styles.header}>
      {breadcrumb ? <div>{breadcrumb}</div> : null}
      <div className={styles.headerText}>
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <main className={styles.main}>{children}</main>;
}

export function Panel({ children }: { children: ReactNode }) {
  return <section className={styles.panel}>{children}</section>;
}
