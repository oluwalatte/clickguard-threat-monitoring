/* Hand-written story data. Copy follows docs/decisions.md: plain language before scores
   (D4), three confidence labels (D5), exposure only as a visible sum of CPC (D6), the
   Monitoring template (D8), and the decision and the sync as separate events (D11).
   Real data comes from src/data in P3; stories never import it. */
import type { EvidenceItemProps } from '../EvidenceItem/EvidenceItem';
import type { SignalTagProps } from '../SignalTag/SignalTag';
import type { SidebarNavGroup } from '../SidebarNav/SidebarNav';
import type { StatusKind } from '../StatusBadge/StatusBadge';
import type { VisitTimelineItem } from '../VisitTimeline/VisitTimeline';

export interface VisitorRow extends Record<string, unknown> {
  id: string;
  visitorLabel: string;
  ip: string;
  location: string;
  status: StatusKind;
  visits: number;
  paidVisits: number;
  lastSeen: string;
  lastSeenRelative: string;
  reason: string;
  signals: SignalTagProps[];
}

export const VISITOR_ROWS: VisitorRow[] = [
  {
    id: 'v-1042',
    visitorLabel: '185.220.101.34, Frankfurt, Germany',
    ip: '185.220.101.34',
    location: 'Frankfurt, Hesse, Germany',
    status: 'blocked',
    visits: 6,
    paidVisits: 4,
    lastSeen: '19 Feb 2026, 14:53:44 UTC',
    lastSeenRelative: '2 hours ago',
    reason: 'Returned through four paid ads in 41 minutes and showed no scroll or mouse movement on any visit',
    signals: [{ label: '4 paid clicks / 41 min', kind: 'primary' }, { label: 'No interaction', kind: 'primary' }, { label: 'Bot: 95%' }, { label: 'Datacenter' }],
  },
  {
    id: 'v-1039',
    visitorLabel: '72.14.201.88, Atlanta, United States',
    ip: '72.14.201.88',
    location: 'Atlanta, Georgia, United States',
    status: 'monitoring',
    visits: 3,
    paidVisits: 3,
    lastSeen: '19 Feb 2026, 12:08:57 UTC',
    lastSeenRelative: '5 hours ago',
    reason: 'Monitoring: 3 paid visits in 12 minutes with shallow engagement. Not blocked because there is no automation signal and the history is three visits long.',
    signals: [{ label: '3 paid clicks / 12 min', kind: 'primary' }, { label: 'Low interaction', kind: 'primary' }, { label: 'Same keyword' }],
  },
  {
    id: 'v-1036',
    visitorLabel: '45.155.204.12, Amsterdam, Netherlands',
    ip: '45.155.204.12',
    location: 'Amsterdam, North Holland, Netherlands',
    status: 'blocked',
    visits: 9,
    paidVisits: 7,
    lastSeen: '19 Feb 2026, 09:41:02 UTC',
    lastSeenRelative: '8 hours ago',
    reason: 'Seven paid clicks over 3 days from a datacenter network with under 6 seconds on the page each time',
    signals: [{ label: '7 paid clicks / 3 days', kind: 'primary' }, { label: 'No interaction', kind: 'primary' }, { label: 'Bot: 91%' }, { label: 'Datacenter' }],
  },
  {
    id: 'v-1031',
    visitorLabel: '98.42.17.203, Austin, United States',
    ip: '98.42.17.203',
    location: 'Austin, Texas, United States',
    status: 'safe',
    visits: 2,
    paidVisits: 1,
    lastSeen: '19 Feb 2026, 08:22:19 UTC',
    lastSeenRelative: '9 hours ago',
    reason: 'Real engagement on both visits and a valid form on the second',
    signals: [{ label: 'Email: Valid', kind: 'contradictory' }, { label: 'Converted', kind: 'contradictory' }, { label: 'High interaction', kind: 'contradictory' }],
  },
  {
    id: 'v-1028',
    visitorLabel: '103.77.19.6, Kuala Lumpur, Malaysia',
    ip: '103.77.19.6',
    location: 'Kuala Lumpur, Malaysia',
    status: 'neutral',
    visits: 1,
    paidVisits: 1,
    lastSeen: '18 Feb 2026, 23:14:55 UTC',
    lastSeenRelative: '18 hours ago',
    reason: 'One visit is not enough history to evaluate',
    signals: [{ label: 'High interaction', kind: 'contradictory' }],
  },
  {
    id: 'v-1024',
    visitorLabel: '62.210.88.140, Paris, France',
    ip: '62.210.88.140',
    location: 'Paris, France',
    status: 'allowed',
    visits: 5,
    paidVisits: 4,
    lastSeen: '18 Feb 2026, 17:02:31 UTC',
    lastSeenRelative: 'yesterday',
    reason: 'Blocked after visit 4, then manually allowed on 18 Feb 2026 as internal QA traffic',
    signals: [{ label: '4 paid clicks / 2 days', kind: 'primary' }, { label: 'Low interaction', kind: 'primary' }, { label: 'Datacenter' }],
  },
];

/* A row with long content in every wrapping column, to prove nothing truncates. */
export const LONG_ROW: VisitorRow = {
  id: 'v-1099',
  visitorLabel: '2001:db8:85a3:8d3:1319:8a2e:370:7348, Ciudad Autonoma de Buenos Aires, Argentina',
  ip: '2001:db8:85a3:8d3:1319:8a2e:370:7348',
  location: 'Ciudad Autonoma de Buenos Aires, Buenos Aires, Argentina (mobile carrier, location changed twice)',
  status: 'blocked',
  visits: 14,
  paidVisits: 11,
  lastSeen: '17 Feb 2026, 03:12:09 UTC',
  lastSeenRelative: '2 days ago',
  reason:
    'Eleven paid clicks over 5 days on the same keyword from three different reported locations and four device identities, with no scroll on any visit and two forms submitted with undeliverable email addresses',
  signals: [{ label: '11 paid clicks / 5 days', kind: 'primary' }, { label: 'Low interaction', kind: 'primary' }, { label: '4 devices' }, { label: 'Location changed' }, { label: 'Email: Invalid' }, { label: 'No conversion' }, { label: 'Same keyword' }],
};

export const EVIDENCE_FULL: Array<EvidenceItemProps & { id: string }> = [
  {
    id: 'e-1',
    kind: 'primary',
    statement: 'Four paid visits in 41 minutes',
    rawValue: 'paid=[14:12:08, 14:26:31, 14:41:02, 14:53:44] window=41m',
    sourceVisit: 'From visit 4, 14:53:44',
    sourceHref: '#visit-4',
  },
  {
    id: 'e-2',
    kind: 'primary',
    statement: 'Every paid visit came from one datacenter network',
    rawValue: '185.220.101.34, AS14061',
    sourceVisit: 'From visit 1, 14:12:08',
    sourceHref: '#visit-1',
  },
  {
    id: 'e-3',
    kind: 'supporting',
    statement: 'No scroll and under 6 seconds on the page across 4 of 4 paid visits',
    rawValue: 'scroll=[0, 0.02, 0, 0] duration_s=[3, 2, 4, 2]',
  },
  {
    id: 'e-4',
    kind: 'supporting',
    statement: 'Automation likelihood 94%',
    rawValue: 'bot_probability=[0.91, 0.95, 0.96, 0.94]',
  },
  {
    id: 'e-5',
    kind: 'contradictory',
    statement: 'One organic visit between the paid ones reached the pricing page directly',
    sourceVisit: 'From visit 3, 14:41:02',
    sourceHref: '#visit-3',
  },
  {
    id: 'e-6',
    kind: 'missing',
    statement: 'Device fingerprint unavailable because JavaScript was blocked on every paid visit',
  },
];

export const EVIDENCE_LONG_COPY: Array<EvidenceItemProps & { id: string }> = [
  {
    id: 'l-1',
    kind: 'primary',
    statement:
      'Eleven paid clicks over five days on the same keyword, "competitor clicking my ads", from three different reported locations (Buenos Aires, Santiago, Montevideo) and four device identities, with no scroll on any visit',
    rawValue:
      'paid=11 span=5d keyword="competitor clicking my ads" locations=[AR-C, CL-RM, UY-MO] devices=[Chrome 121/Windows, Safari 17/iOS, Chrome 120/Android, Firefox 122/Linux] scroll_max=0.0',
    sourceVisit: 'From visit 14, 17 Feb 2026, 03:12:09 UTC',
    sourceHref: '#visit-14',
  },
  {
    id: 'l-2',
    kind: 'contradictory',
    statement:
      'Two visits in the middle of the journey lasted over a minute and reached the features page, which is the behaviour of a person reading rather than a script',
    sourceVisit: 'From visits 6 and 7',
  },
];

const t = (hms: string) => `19 Feb, ${hms}`;
const full = (hms: string) => `19 Feb 2026, ${hms} UTC`;

const paidRecord = (time: string, secs: number, scroll: number, bot: number, extra: Array<{ label: string; value: string }> = []) => [
  { label: 'Time', value: full(time) },
  { label: 'Platform', value: 'Google Ads, Non-brand Search, keyword "ppc fraud", $9.60' },
  { label: 'Landing page', value: '/pricing' },
  { label: 'Time on page', value: `${secs} seconds, scroll ${scroll}%, pointer still` },
  { label: 'Bot probability', value: `${bot}%` },
  { label: 'Location', value: 'Frankfurt, Germany' },
  { label: 'Device', value: 'HeadlessChrome 121, Linux' },
  { label: 'Network', value: 'Datacenter, no VPN or proxy' },
  { label: 'Form', value: 'Not submitted' },
  { label: 'Conversion', value: 'No' },
  ...extra,
];

/* Golden case 1: clearly malicious. Visits, the decision, then the sync as its own event. */
export const JOURNEY_BLOCK_AND_SYNC: VisitTimelineItem[] = [
  {
    id: 'visit-1',
    type: 'paid',
    timestamp: t('14:12'),
    relativeTime: 'start of journey',
    description: 'Google Ads · Non-brand Search',
    summary: ['3 seconds', '0% scroll', 'No conversion'],
    changes: [{ label: 'Datacenter' }, { label: 'Bot: 93%' }, { label: 'No fingerprint', kind: 'missing' }],
    contributed: ['Datacenter network, not a residential or mobile connection', 'Device fingerprint unavailable because JavaScript was blocked on every visit'],
    record: paidRecord('14:12:08', 3, 0, 93),
  },
  {
    id: 'visit-2',
    type: 'paid',
    timestamp: t('14:26'),
    relativeTime: '14 minutes later',
    description: 'Google Ads · Non-brand Search',
    summary: ['2 seconds', '0% scroll', 'No conversion'],
    record: paidRecord('14:26:31', 2, 0, 95),
  },
  {
    id: 'visit-3',
    type: 'paid',
    timestamp: t('14:41'),
    relativeTime: '15 minutes later',
    description: 'Google Ads · Non-brand Search',
    summary: ['4 seconds', '0% scroll', 'No conversion'],
    record: paidRecord('14:41:02', 4, 0, 96),
  },
  {
    id: 'visit-4',
    type: 'paid',
    timestamp: t('14:53'),
    relativeTime: '12 minutes later',
    decisionVisit: true,
    defaultExpanded: true,
    description: 'Google Ads · Non-brand Search',
    summary: ['2 seconds', '0% scroll', 'No conversion'],
    changes: [{ label: '4 paid clicks / 41 min', kind: 'primary' }, { label: 'No interaction', kind: 'primary' }],
    contributed: ['4 paid clicks in 41 minutes', 'No scroll and under 6 seconds on the page across 4 of 4 visits', 'No mouse movement on any visit'],
    record: paidRecord('14:53:20', 2, 0, 94),
  },
  { type: 'block', timestamp: t('14:53'), relativeTime: 'at the same time', description: 'Blocked after visit 4. High confidence.' },
  {
    type: 'sync-pending',
    timestamp: t('14:53'),
    relativeTime: '2 seconds later',
    description: 'Google Ads exclusion queued. Blocking begins when the platform confirms it.',
  },
  { type: 'sync-active', timestamp: t('15:02'), relativeTime: '8 minutes later', description: 'Google Ads confirmed the exclusion.' },
];

/* Golden case 6: a paid click lands between the decision and the exclusion becoming active. */
export const JOURNEY_SYNC_DELAY: VisitTimelineItem[] = [
  JOURNEY_BLOCK_AND_SYNC[0],
  JOURNEY_BLOCK_AND_SYNC[1],
  { ...JOURNEY_BLOCK_AND_SYNC[3], id: 'visit-3', timestamp: t('14:41'), relativeTime: '15 minutes later', changes: [{ label: '3 paid clicks / 29 min', kind: 'primary' }, { label: 'No interaction', kind: 'primary' }], contributed: ['3 paid clicks in 29 minutes', 'No scroll and under 6 seconds on the page across 3 of 3 visits'] },
  { type: 'block', timestamp: t('14:41'), relativeTime: 'at the same time', description: 'Blocked after visit 3. High confidence.' },
  {
    type: 'sync-pending',
    timestamp: t('14:41'),
    relativeTime: '2 seconds later',
    description: 'Google Ads exclusion queued. Blocking begins when the platform confirms it.',
  },
  {
    id: 'visit-4',
    type: 'paid',
    timestamp: t('14:58'),
    relativeTime: '17 minutes later',
    description: 'Google Ads · Non-brand Search',
    summary: ['2 seconds', '0% scroll', 'No conversion'],
    changes: [{ label: 'Paid click after the decision', kind: 'primary' }],
    record: paidRecord('14:58:20', 2, 0, 94),
  },
  { type: 'sync-active', timestamp: t('15:02'), relativeTime: '4 minutes later', description: 'Google Ads confirmed the exclusion. No paid clicks since.' },
];

/* Golden case 5: organic return that converts after the block. Conflicting evidence, not proof. */
export const JOURNEY_ORGANIC_RETURN: VisitTimelineItem[] = [
  ...JOURNEY_BLOCK_AND_SYNC,
  {
    id: 'visit-5',
    type: 'organic',
    timestamp: '21 Feb, 10:14',
    relativeTime: '2 days later',
    description: 'Organic search · /features',
    summary: ['3 minutes 12 seconds', '95% scroll', 'Converted'],
    changes: [{ label: 'Converted', kind: 'contradictory' }, { label: 'Email: Valid', kind: 'contradictory' }, { label: 'New device identity' }],
    contributed: ['Completed a purchase on visit 5', 'Submitted a valid form with a deliverable email address on visit 5'],
    record: [
      { label: 'Time', value: '21 Feb 2026, 10:14:33 UTC' },
      { label: 'Landing page', value: '/features' },
      { label: 'Time on page', value: '192 seconds, scroll 95%, pointer moved' },
      { label: 'Bot probability', value: '6%' },
      { label: 'Location', value: 'Frankfurt, Germany' },
      { label: 'Device', value: 'Chrome 121, macOS 15' },
      { label: 'Network', value: 'Datacenter, no VPN or proxy' },
      { label: 'Form', value: 'Submitted, email deliverability Valid' },
      { label: 'Conversion', value: 'Yes' },
    ],
  },
];

export const JOURNEY_SYNC_FAILED: VisitTimelineItem[] = [
  ...JOURNEY_BLOCK_AND_SYNC.slice(0, 5),
  {
    type: 'sync-failed',
    timestamp: t('14:53'),
    relativeTime: '7 seconds later',
    description: 'Meta Ads rejected the exclusion request twice. This visitor can still reach the site through Meta ads.',
  },
];

/* Golden case 8: single visit. */
export const JOURNEY_SINGLE: VisitTimelineItem[] = [
  {
    id: 'visit-1',
    type: 'paid',
    timestamp: '18 Feb, 23:14',
    description: 'Google Ads · Brand Search',
    summary: ['48 seconds', '30% scroll', 'No conversion'],
    record: [
      { label: 'Time', value: '18 Feb 2026, 23:14:55 UTC' },
      { label: 'Platform', value: 'Google Ads, Brand Search, keyword "clickguard", $1.40' },
      { label: 'Time on page', value: '48 seconds, scroll 30%, pointer moved' },
      { label: 'Bot probability', value: '12%' },
      { label: 'Network', value: 'Mobile carrier, no VPN or proxy' },
      { label: 'Form', value: 'Not submitted' },
      { label: 'Conversion', value: 'No' },
    ],
  },
];

export const NAV_GROUPS: SidebarNavGroup[] = [
  {
    label: 'Reporting',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'threat-monitoring', label: 'Threat monitoring', icon: 'zap' },
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
