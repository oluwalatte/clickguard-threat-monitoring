import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import styles from './FilterMenu.module.css';

export interface FilterMenuProps {
  /** Trigger label. */
  label?: string;
  /** How many secondary filters are applied. Shown on the trigger so a closed menu never hides state. */
  activeCount: number;
  /** The controls. Each applies immediately; the menu has no apply step. */
  children: ReactNode;
  /** Clears the controls inside the menu. Rendered as a footer action when something is active. */
  onClear?: () => void;
  /** Opens the panel on first render. For stories and tests. */
  defaultOpen?: boolean;
}

/**
 * Progressive disclosure for low-frequency filters. The trigger carries the active count; the
 * panel is a non-modal dialog under it that closes on Escape, on Done, or on a click outside.
 * Focus goes to the first control on open and back to the trigger on close.
 */
export function FilterMenu({ label = 'Filters', activeCount, children, onClear, defaultOpen = false }: FilterMenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>('input, select, button, [tabindex]:not([tabindex="-1"])');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* The visible label stays inside the accessible name; the count reads as "2 active" rather than a bare number. */}
      <Button
        ref={triggerRef}
        variant="secondary"
        icon="funnel"
        iconAfter={open ? 'chevron-up' : 'chevron-down'}
        aria-label={activeCount > 0 ? `${label}, ${activeCount} active` : label}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
      >
        {label}
        {activeCount > 0 ? <span className={styles.count}>{activeCount}</span> : null}
      </Button>
      {open ? (
        <div ref={panelRef} id={panelId} role="dialog" aria-label={label} className={styles.panel}>
          <div className={styles.controls}>{children}</div>
          <div className={styles.footer}>
            {onClear ? (
              <Button variant="quiet" size="sm" disabled={activeCount === 0} onClick={onClear}>
                Clear
              </Button>
            ) : null}
            <Button variant="secondary" size="sm" onClick={() => close()}>
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
