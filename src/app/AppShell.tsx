import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AccountRow, NARROW_BREAKPOINT_PX, SidebarNav, type SidebarNavGroup } from '@clickguard/ui';
import styles from './AppShell.module.css';

/* The product's navigation, in product order. Only Threat monitoring is routable
   in this prototype; the other items are shown so the shell reads as the product. */
const GROUPS: SidebarNavGroup[] = [
  {
    label: 'Reporting',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'threat-monitoring', label: 'Threat monitoring', icon: 'zap', href: '/threat-monitoring' },
      { id: 'forensics', label: 'Click forensics', icon: 'scan-search' },
      { id: 'reports', label: 'Scheduled reports', icon: 'calendar' },
    ],
  },
  {
    label: 'Protection',
    items: [
      { id: 'rules', label: 'AI + custom rules', icon: 'shield' },
      { id: 'exclusions', label: 'Exclusions', icon: 'circle-check' },
      { id: 'blacklist', label: 'Blacklist', icon: 'ban' },
    ],
  },
  {
    label: 'Connections',
    items: [
      { id: 'authorizations', label: 'Authorizations', icon: 'key-round' },
      { id: 'accounts', label: 'Ad accounts', icon: 'layout-grid' },
    ],
  },
];

/* Below the narrow breakpoint the rail starts collapsed so the content keeps its width.
   The person can still expand it; the choice is theirs from then on. */
function useStartsCollapsed() {
  const query = `(max-width: ${NARROW_BREAKPOINT_PX - 1}px)`;
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return [collapsed, setCollapsed] as const;
}

export function AppShell() {
  const [collapsed, setCollapsed] = useStartsCollapsed();
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = location.pathname.startsWith('/threat-monitoring') ? 'threat-monitoring' : undefined;

  return (
    <div className={styles.shell}>
      <div className={styles.rail}>
          <SidebarNav
          groups={GROUPS}
          activeId={activeId}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onNavigate={(id) => {
            const item = GROUPS.flatMap((g) => g.items).find((i) => i.id === id);
            if (item?.href) navigate(item.href);
          }}
          footer={<AccountRow name="Latte's workspace" detail="latte@clickguard.com" initials="LW" collapsed={collapsed} />}
        />
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
