import { useId, type InputHTMLAttributes } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './SearchField.module.css';

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size' | 'type'> {
  /** Accessible name. Rendered visually hidden unless `showLabel`. */
  label: string;
  showLabel?: boolean;
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
}

/** A native text input with a search glyph and a clear button. The label is always present. */
export function SearchField({ label, showLabel = false, value, onChange, size = 'md', className, id, ...rest }: SearchFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-size={size}>
      <label htmlFor={inputId} className={showLabel ? styles.label : 'cg-visually-hidden'}>
        {label}
      </label>
      <div className={styles.field}>
        <span className={styles.glyph}>
          <Icon name="search" size="sm" />
        </span>
        <input {...rest} id={inputId} type="search" className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} />
        {value ? (
          <button type="button" className={styles.clear} onClick={() => onChange('')} aria-label={`Clear ${label.toLowerCase()}`}>
            <Icon name="x" size="sm" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
