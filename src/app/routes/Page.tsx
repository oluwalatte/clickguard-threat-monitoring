import type { ReactNode } from 'react';
import styles from './Page.module.css';

/* App-level layout: a page header, a main column, panels and a two-column grid.
   Composition only; spacing comes from tokens and every visual decision from @clickguard/ui. */
export function PageHeader({ title, description, breadcrumb, toolbar }: { title: string; description?: string; breadcrumb?: ReactNode; toolbar?: ReactNode }) {
  return (
    <header className={styles.header}>
      {breadcrumb ? <nav aria-label="Breadcrumb">{breadcrumb}</nav> : null}
      <div className={styles.headerText}>
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <main id="main" className={styles.main}>{children}</main>;
}

export function Panel({ children, padded = false }: { children: ReactNode; padded?: boolean }) {
  return <section className={styles.panel} data-padded={padded || undefined}>{children}</section>;
}

export function Columns({ children }: { children: ReactNode }) {
  return <div className={styles.columns}>{children}</div>;
}

export function ToolbarRow({ children }: { children: ReactNode }) {
  return <div className={styles.toolbarRow}>{children}</div>;
}
