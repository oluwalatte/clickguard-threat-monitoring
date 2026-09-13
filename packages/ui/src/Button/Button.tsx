import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Button.module.css';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  /** `destructive` is only for actions that remove or block. Never use it for emphasis.
      `link` is a text button in the accent ink with no horizontal padding, for navigation such as "Back". */
  variant?: 'primary' | 'secondary' | 'quiet' | 'destructive' | 'link';
  size?: 'sm' | 'md';
  /** Icon rendered before the label. */
  icon?: IconName;
  /** Icon rendered after the label, e.g. "chevron-down". */
  iconAfter?: IconName;
  /** Swaps the leading icon for a spinner and blocks interaction. Keep the label unchanged. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** React 19 ref as a prop, for composites that manage focus (FilterMenu). */
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconAfter,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className,
  ...rest
}: ButtonProps) {
  const inert = disabled || loading;
  const iconSize = size === 'sm' ? 'sm' : 'md';
  return (
    <button
      {...rest}
      type={type}
      className={[styles.button, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      data-loading={loading || undefined}
      disabled={inert}
      aria-busy={loading || undefined}
      onClick={inert ? undefined : onClick}
    >
      {loading ? <span aria-hidden="true" className={styles.spinner} /> : icon ? <Icon name={icon} size={iconSize} /> : null}
      <span className={styles.label}>{children}</span>
      {iconAfter && !loading ? <Icon name={iconAfter} size={iconSize} /> : null}
    </button>
  );
}
