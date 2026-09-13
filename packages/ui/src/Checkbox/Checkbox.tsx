import { useId, type InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'checked' | 'type'> {
  /** The visible label. Write it as the exact condition the filter applies. */
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Support text under the label. */
  description?: string;
}

/** A native checkbox with its label as the click target. The accent colour is the only styling; the check mark is the browser's. */
export function Checkbox({ label, checked, onChange, description, className, id, disabled, ...rest }: CheckboxProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-disabled={disabled || undefined}>
      <input {...rest} id={inputId} type="checkbox" className={styles.input} checked={checked} disabled={disabled} aria-describedby={descriptionId} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {description ? (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
