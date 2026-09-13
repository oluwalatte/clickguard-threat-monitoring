import styles from './AccountRow.module.css';

export interface AccountRowProps {
  /** Workspace or account name. */
  name: string;
  /** Secondary line, typically the signed-in address. */
  detail?: string;
  /** One or two characters for the avatar. Derived from `name` when omitted. */
  initials?: string;
  /** Avatar only, for the collapsed rail. The full text stays available as a title. */
  collapsed?: boolean;
}

function initialsOf(name: string) {
  return name
    .replace(/'s\b/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/** The workspace row pinned to the bottom of the sidebar. Identification only; it opens nothing in this prototype. */
export function AccountRow({ name, detail, initials, collapsed = false }: AccountRowProps) {
  const label = detail ? `${name}, ${detail}` : name;
  return (
    <div className={styles.row} data-collapsed={collapsed || undefined} title={collapsed ? label : undefined}>
      {/* Expanded, the text carries the meaning and the avatar is decoration. Collapsed, the avatar is the only thing left, so it becomes an image with the full name. */}
      <span className={styles.avatar} role={collapsed ? 'img' : undefined} aria-label={collapsed ? label : undefined} aria-hidden={collapsed ? undefined : true}>
        {initials ?? initialsOf(name)}
      </span>
      {!collapsed ? (
        <span className={styles.text}>
          <span className={styles.name}>{name}</span>
          {detail ? <span className={styles.detail}>{detail}</span> : null}
        </span>
      ) : null}
    </div>
  );
}
