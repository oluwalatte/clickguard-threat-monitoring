import { useId, type SelectHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'size'> {
  /** Accessible name. Visible above the control unless `showLabel` is false. */
  label: string;
  showLabel?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Leading glyph, for a toolbar control whose label is hidden. */
  icon?: IconName;
  size?: 'sm' | 'md';
}

/** A native select. The option text carries the current value; the chevron is decoration. */
export function Select({ label, showLabel = true, value, onChange, options, icon, size = 'md', className, id, ...rest }: SelectProps) {
  const generated = useId();
  const selectId = id ?? generated;
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-size={size}>
      <label htmlFor={selectId} className={showLabel ? styles.label : 'cg-visually-hidden'}>
        {label}
      </label>
      <div className={styles.field}>
        {icon ? (
          <span className={styles.glyph}>
            <Icon name={icon} size="sm" />
          </span>
        ) : null}
        <select {...rest} id={selectId} className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron}>
          <Icon name="chevron-down" size="sm" />
        </span>
      </div>
    </div>
  );
}
