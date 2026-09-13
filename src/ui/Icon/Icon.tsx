import type { SVGProps } from 'react';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Ban, Calendar, CalendarSearch, ChevronDown, ChevronUp,
  ChevronsUpDown, CircleCheck, CircleChevronRight, CircleHelp, CircleMinus, CirclePlus, Clock, Download,
  ExternalLink, FlaskConical, Funnel, FunnelX, KeyRound, LayoutDashboard, LayoutGrid, Link, ListTree,
  MousePointerClick, PanelLeftClose, PanelLeftOpen, RotateCw, ScanSearch, Search, Shield, ShieldBan,
  TrendingDown, TrendingUp, TriangleAlert, Unplug, X, Zap,
} from 'lucide-react';
import styles from './Icon.module.css';

/* A curated registry rather than a namespace import, so the bundle carries only
   the glyphs the system uses. Add a name here when a component needs one. */
const REGISTRY = {
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  ban: Ban,
  calendar: Calendar,
  'calendar-search': CalendarSearch,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevrons-up-down': ChevronsUpDown,
  'circle-check': CircleCheck,
  'circle-chevron-right': CircleChevronRight,
  'circle-help': CircleHelp,
  'circle-minus': CircleMinus,
  'circle-plus': CirclePlus,
  clock: Clock,
  download: Download,
  'external-link': ExternalLink,
  'flask-conical': FlaskConical,
  funnel: Funnel,
  'funnel-x': FunnelX,
  'key-round': KeyRound,
  'layout-dashboard': LayoutDashboard,
  'layout-grid': LayoutGrid,
  link: Link,
  'list-tree': ListTree,
  'mouse-pointer-click': MousePointerClick,
  'panel-left-close': PanelLeftClose,
  'panel-left-open': PanelLeftOpen,
  'rotate-cw': RotateCw,
  'scan-search': ScanSearch,
  search: Search,
  shield: Shield,
  'shield-ban': ShieldBan,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  'triangle-alert': TriangleAlert,
  unplug: Unplug,
  x: X,
  zap: Zap,
} as const;

export type IconName = keyof typeof REGISTRY;
export const ICON_NAMES = Object.keys(REGISTRY) as IconName[];

/** sm: inline with support text and inside badges. md: tables and buttons. nav: navigation. lg: empty states. */
export type IconSize = 'sm' | 'md' | 'nav' | 'lg';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'ref'> {
  name: IconName;
  size?: IconSize;
  strokeWidth?: number;
  /** Supply only when the glyph is the sole carrier of meaning. Otherwise the icon stays aria-hidden. */
  label?: string;
}

export function Icon({ name, size = 'md', strokeWidth = 1.75, label, className, ...rest }: IconProps) {
  const Glyph = REGISTRY[name];
  return (
    <Glyph
      {...rest}
      className={[styles.icon, className].filter(Boolean).join(' ')}
      data-size={size}
      strokeWidth={strokeWidth}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable={false}
    />
  );
}
