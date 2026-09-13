import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './SidebarNav.module.css';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: IconName;
  href?: string;
  /** Count of items needing attention, e.g. failed syncs. Uses the blocked tone. */
  badge?: string | number;
}

export interface SidebarNavGroup {
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarNavProps {
  /** Section groups in product order: Reporting, Protection, Connections. */
  groups: SidebarNavGroup[];
  activeId?: string;
  /** Omit to let the anchors navigate normally. */
  onNavigate?: (id: string) => void;
  /** Wordmark text. The system ships no logo asset. */
  brand?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Workspace switcher or account row, pinned to the bottom. */
  footer?: ReactNode;
}

function NavItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: SidebarNavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: (id: string) => void;
}) {
  return (
    <a
      href={item.href || '#'}
      className={styles.item}
      aria-current={active ? 'page' : undefined}
      data-active={active || undefined}
      data-collapsed={collapsed || undefined}
      title={collapsed ? item.label : undefined}
      onClick={(e) => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(item.id);
        }
      }}
    >
      <Icon name={item.icon} size="nav" />
      {!collapsed ? <span className={styles.itemLabel}>{item.label}</span> : null}
      {!collapsed && item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
    </a>
  );
}

export function SidebarNav({
  groups,
  activeId,
  onNavigate,
  brand = 'ClickGuard',
  collapsed = false,
  onToggleCollapse,
  footer,
}: SidebarNavProps) {
  return (
    <nav className={styles.nav} aria-label="Main" data-collapsed={collapsed || undefined}>
      <div className={styles.head}>
        {!collapsed ? <span className={styles.brand}>{brand}</span> : null}
        {onToggleCollapse ? (
          <button
            type="button"
            className={styles.toggle}
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
          >
            <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size="nav" />
          </button>
        ) : null}
      </div>

      <div className={styles.groups}>
        {groups.map((group) => (
          <div key={group.label || 'ungrouped'} className={styles.group}>
            {group.label && !collapsed ? <span className={styles.groupLabel}>{group.label}</span> : null}
            {group.items.map((item) => (
              <NavItem key={item.id} item={item} active={item.id === activeId} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.footer}>{footer}</div>
    </nav>
  );
}
