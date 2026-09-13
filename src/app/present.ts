/**
 * Presentation adapters: pure functions that turn data into the props the system
 * components take. Composition decisions live here; visual decisions do not.
 */
import type { EvidenceItemProps, SignalTagProps, StatusKind, SyncState as UiSyncState, VisitTimelineItem } from '@clickguard/ui';
import {
  CONFIDENCE_LABEL_MAP,
  NOW,
  counts,
  displayStatus,
  exposure,
  formatDate,
  formatDuration,
  formatLater,
  formatMoney,
  formatRelative,
  formatShortTimestamp,
  formatTime,
  formatTimestamp,
  journey,
  paidClicksSinceActive,
  syncByPlatform,
  type AdPlatform,
  type Confidence,
  type DateRange,
  type DisplayStatus,
  type Evidence,
  type ExclusionEvent,
  type TrafficFilter,
  type Visit,
  type Visitor,
} from '@/data';

export const PLATFORM_LABEL: Record<AdPlatform, string> = { 'google-ads': 'Google Ads', 'meta-ads': 'Meta Ads' };

const SOURCE_LABEL: Record<Visit['source'], string> = { paid: 'Paid visit', organic: 'Organic visit', direct: 'Direct visit', referral: 'Referral visit' };

export const NETWORK_LABEL: Record<Visitor['networkType'], string> = {
  residential: 'Residential connection',
  mobile: 'Mobile carrier',
  corporate: 'Corporate network',
  datacenter: 'Datacenter network',
};

/** The data vocabulary (D3) mapped onto the badge's tones. */
export function toStatusKind(status: DisplayStatus): StatusKind {
  switch (status) {
    case 'blocked':
      return 'blocked';
    case 'monitoring':
      return 'monitoring';
    case 'not-blocked':
      return 'safe';
    case 'allowed':
      return 'allowed';
    case 'not-evaluated':
      return 'neutral';
  }
}

/* No "Manually allowed" filter: the override workflow is not modelled (D9), so no visitor
   carries one. The vocabulary stays in the badge for when it is. */
export const STATUS_FILTERS: Array<{ value: DisplayStatus; label: string }> = [
  { value: 'blocked', label: 'Blocked' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'not-blocked', label: 'Not blocked' },
  { value: 'not-evaluated', label: 'Not evaluated' },
];

/* D16: the toolbar. Search, date range and status stay visible; the rest sits in a Filters
   menu and shows as removable chips while applied. Option text must read on its own because
   the toolbar select hides its label. */
export const DATE_RANGE_OPTIONS: Array<{ value: DateRange; label: string }> = [
  { value: 'all', label: 'All time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];
export const TRAFFIC_OPTIONS: Array<{ value: TrafficFilter; label: string }> = [
  { value: 'any', label: 'Any traffic' },
  { value: 'paid', label: 'Has paid clicks' },
  { value: 'unpaid', label: 'No paid clicks' },
];
export const PLATFORM_OPTIONS: Array<{ value: AdPlatform | ''; label: string }> = [
  { value: '', label: 'Any platform' },
  { value: 'google-ads', label: PLATFORM_LABEL['google-ads'] },
  { value: 'meta-ads', label: PLATFORM_LABEL['meta-ads'] },
];
export const CONFIDENCE_OPTIONS: Array<{ value: Confidence | ''; label: string }> = [
  { value: '', label: 'Any confidence' },
  ...(['high', 'moderate', 'conflicting', 'insufficient'] as Confidence[]).map((c) => ({ value: c, label: CONFIDENCE_LABEL_MAP[c] })),
];
/* Exact labels (D16): a Converted slice is evidence of a purchase, never proof a block was wrong (rule 10). */
export const INVALID_EMAIL_LABEL = 'Submitted an invalid email at least once';
export const CONVERTED_LABEL = 'Converted at least once';

export type SecondaryKey = 'traffic' | 'platform' | 'country' | 'confidence' | 'email' | 'converted';

export interface SecondaryFilters {
  traffic: TrafficFilter;
  platform?: AdPlatform;
  countryCode?: string;
  confidence?: Confidence;
  invalidEmail: boolean;
  converted: boolean;
}

/** The applied secondary filters as chips, in the menu's own order, each removable by key. */
export function activeFilterChips(f: SecondaryFilters, countryName: (code: string) => string): Array<{ key: SecondaryKey; label: string }> {
  const chips: Array<{ key: SecondaryKey; label: string }> = [];
  if (f.traffic !== 'any') chips.push({ key: 'traffic', label: TRAFFIC_OPTIONS.find((o) => o.value === f.traffic)!.label });
  if (f.platform) chips.push({ key: 'platform', label: PLATFORM_LABEL[f.platform] });
  if (f.countryCode) chips.push({ key: 'country', label: `Country: ${countryName(f.countryCode)}` });
  if (f.confidence) chips.push({ key: 'confidence', label: CONFIDENCE_LABEL_MAP[f.confidence] });
  if (f.invalidEmail) chips.push({ key: 'email', label: INVALID_EMAIL_LABEL });
  if (f.converted) chips.push({ key: 'converted', label: CONVERTED_LABEL });
  return chips;
}

/** The visit a decision followed, 1-based, and the journey length. */
export function decisionPosition(v: Visitor): { after: number; of: number } | undefined {
  if (!v.decision) return undefined;
  const after = v.visits.findIndex((x) => x.id === v.decision!.afterVisitId) + 1;
  return { after, of: v.visits.length };
}

export function headline(v: Visitor): string {
  const pos = decisionPosition(v);
  if (v.manualOverride && pos) return `Blocked after visit ${pos.after} of ${pos.of}, then manually allowed`;
  if (pos) return `Blocked after visit ${pos.after} of ${pos.of}`;
  if (v.status === 'monitoring') return 'Monitoring, not blocked';
  if (v.status === 'not-evaluated') return 'Not evaluated';
  return 'Not blocked';
}

export function explanation(v: Visitor): string {
  if (v.manualOverride) {
    return `${v.manualOverride.by} allowed this visitor on ${formatDate(v.manualOverride.at)}: ${v.manualOverride.note} The original decision and its evidence remain on record.`;
  }
  if (v.decision) return v.decision.summary;
  if (v.monitoring) return v.monitoring.note;
  if (v.status === 'not-evaluated') return 'One visit is not enough history to evaluate. ClickGuard decides cumulatively across the journey.';
  const c = counts(v);
  const engaged = v.visits.every((x) => x.engagement.durationSec >= 45);
  const converted = v.visits.some((x) => x.converted);
  const form = v.visits.some((x) => x.formResult === 'valid');
  const bits = [`${c.total} visits${c.paid ? `, ${c.paid} of them paid` : ''}`];
  if (engaged) bits.push('real engagement on every visit');
  if (converted) bits.push('a completed purchase');
  else if (form) bits.push('a valid form');
  return `${bits.join(', ')}. Nothing in the journey crossed the line.`;
}

/** D6: the number and its calculation, or an honest absence. */
export function exposureLine(v: Visitor): string {
  const x = exposure(v);
  if (x.paidBefore === 0) return 'No paid clicks';
  const when = v.decision ? ' before the decision' : '';
  const clicks = `${x.paidBefore} paid click${x.paidBefore === 1 ? '' : 's'}${when}`;
  if (x.spendBefore === null) return `${clicks}, cost not reported for every click`;
  let line = `${formatMoney(x.spendBefore)} across ${clicks}`;
  if (x.paidAfter > 0) line += x.spendAfter === null ? `, plus ${x.paidAfter} after it` : `, plus ${formatMoney(x.spendAfter)} for ${x.paidAfter} after it`;
  return line;
}

/** The calculation behind the exposure line, for the evidence footnote. */
export function exposureFootnote(v: Visitor): string | undefined {
  const x = exposure(v);
  if (x.paidBefore === 0) return undefined;
  const cut = v.decision ? new Date(v.decision.madeAt).getTime() : Infinity;
  const paid = v.visits.filter((y) => y.source === 'paid' && new Date(y.occurredAt).getTime() <= cut);
  if (x.spendBefore === null) return `Paid exposure is not totalled because ${paid.filter((y) => y.cpc === undefined).length} of the ${paid.length} paid clicks came without a reported cost.`;
  const terms = paid.map((y) => formatMoney(y.cpc!)).join(' + ');
  return `Paid exposure is the sum of the recorded cost per click on the ${paid.length} paid visits${v.decision ? ' before the decision' : ''}: ${terms} = ${formatMoney(x.spendBefore)}. Nothing is estimated.`;
}

const CONFIDENCE_NOTE: Record<Confidence, string> = {
  high: 'an automation signal sits behind the pattern.',
  moderate: 'the pattern alone crossed the line, without an automation signal.',
  conflicting: 'the evidence disagrees with itself, so read the journey before trusting the conclusion.',
  insufficient: 'the signals so far are not enough to decide either way; evaluation continues with every visit.',
};

/** The footnote under the evidence list: what the confidence label means, then the exposure calculation. */
export function evidenceFootnote(v: Visitor): string {
  const confidence = v.decision?.confidence ?? v.monitoring?.confidence;
  const hasEvidence = (v.decision?.evidence ?? v.monitoring?.evidence ?? []).length > 0;
  const parts: string[] = [];
  if (!hasEvidence) parts.push('No signal has crossed a threshold for this visitor. That is not a verdict of good faith; evaluation continues with every visit.');
  else if (confidence) parts.push(`${CONFIDENCE_LABEL_MAP[confidence]}: ${CONFIDENCE_NOTE[confidence]}`);
  const exposureNote = exposureFootnote(v);
  if (exposureNote) parts.push(exposureNote);
  return parts.join(' ');
}

export interface SyncPlatformRow {
  name: string;
  state: ExclusionEvent['state'];
  detail?: string;
}

/** One row per platform for the visitor detail: the state and when it got there. */
export function syncPlatforms(v: Visitor): SyncPlatformRow[] {
  const entries = Object.entries(syncByPlatform(v)) as Array<[AdPlatform, ExclusionEvent]>;
  return entries.map(([platform, e]) => {
    const name = PLATFORM_LABEL[platform];
    switch (e.state) {
      case 'active':
        return { name, state: e.state, detail: `since ${formatTimestamp(e.at)}, ${formatLater(v.decision!.madeAt, e.at).replace(' later', ' after the decision')}` };
      case 'pending':
        return { name, state: e.state, detail: `queued ${formatRelative(e.at, NOW)}` };
      case 'delayed': {
        /* Measured from the queue, not from the moment it was marked delayed. */
        const queued = v.exclusionEvents.find((x) => x.platform === platform && x.state === 'pending')?.at ?? e.at;
        return { name, state: e.state, detail: `not confirmed ${formatDuration(new Date(NOW).getTime() - new Date(queued).getTime())} after it was queued` };
      }
      case 'failed':
        return { name, state: e.state, detail: `rejected the exclusion ${formatRelative(e.at, NOW)}` };
    }
  });
}

/** The worst state across platforms with one sentence on what it means; rows carry the rest. */
export function syncSummary(v: Visitor): { state: UiSyncState; note: string; platforms: SyncPlatformRow[] } | undefined {
  const platforms = syncPlatforms(v);
  if (!platforms.length) return undefined;
  const failed = platforms.filter((p) => p.state === 'failed');
  const open = platforms.filter((p) => p.state === 'pending' || p.state === 'delayed');
  const state: UiSyncState = failed.length ? 'failed' : open.length ? 'pending' : 'active';
  const since = paidClicksSinceActive(v);
  const note =
    state === 'failed'
      ? `${failed.map((p) => p.name).join(' and ')} rejected the exclusion. This visitor may still see the advertiser's ads on ${failed.length === 1 ? 'that platform' : 'those platforms'}.`
      : state === 'pending'
        ? `${open.map((p) => p.name).join(' and ')} ${open.length === 1 ? 'has' : 'have'} not confirmed the exclusion yet. Blocking there begins when the platform confirms it, and paid clicks can still reach the site until then.`
        : `The exclusion is active on every platform this visitor used. ${since === 0 ? 'No paid clicks since.' : `${since} paid clicks since.`}`;
  return { state, note, platforms };
}

/** The table shows enforcement only when it needs attention (D14). Active shows nothing. */
export function syncException(v: { sync: Partial<Record<AdPlatform, ExclusionEvent['state']>> }): { state: 'pending' | 'delayed' | 'failed'; platform?: string } | undefined {
  const entries = Object.entries(v.sync) as Array<[AdPlatform, ExclusionEvent['state']]>;
  const failed = entries.find(([, s]) => s === 'failed');
  const delayed = entries.find(([, s]) => s === 'delayed');
  const pending = entries.find(([, s]) => s === 'pending');
  const hit = failed ?? delayed ?? pending;
  if (!hit) return undefined;
  return { state: hit[1] as 'pending' | 'delayed' | 'failed', platform: entries.length > 1 ? PLATFORM_LABEL[hit[0]] : undefined };
}

function visitNumber(v: Visitor, id: string) {
  return v.visits.findIndex((x) => x.id === id) + 1;
}

export function toEvidenceItems(v: Visitor, evidence: Evidence[]): Array<EvidenceItemProps & { id: string }> {
  return evidence.map((e) => {
    const single = e.visitIds.length === 1 ? e.visitIds[0] : undefined;
    const visit = single ? v.visits.find((x) => x.id === single) : undefined;
    return {
      id: e.id,
      kind: e.kind,
      statement: e.statement,
      rawValue: e.rawValue,
      sourceVisit: visit ? `From visit ${visitNumber(v, visit.id)}, ${formatTime(visit.occurredAt)}` : e.visitIds.length > 1 ? `From ${e.visitIds.length} visits` : undefined,
      sourceHref: visit ? `#visit-${visitNumber(v, visit.id)}` : undefined,
    };
  });
}

function interactionLevel(v: Visit): string {
  const shallow = v.engagement.scrollDepth < 0.1 && v.engagement.durationSec < 6;
  if (shallow && !v.engagement.pointerMoved) return 'None';
  if (shallow) return 'Low';
  if (v.engagement.durationSec >= 45 && v.engagement.scrollDepth >= 0.4) return 'High';
  return 'Moderate';
}

function seconds(n: number): string {
  if (n < 60) return `${n} second${n === 1 ? '' : 's'}`;
  const m = Math.floor(n / 60);
  const rest = n % 60;
  return `${m} minute${m === 1 ? '' : 's'}${rest ? ` ${rest} seconds` : ''}`;
}

/** One line: where the visit came from. */
function visitSource(v: Visit): string {
  const page = v.landingPage === '/' ? 'the home page' : v.landingPage;
  if (v.source === 'paid') return `${PLATFORM_LABEL[v.platform!]} · ${v.campaign ?? 'paid ad'}`;
  if (v.source === 'organic') return `Organic search · ${page}`;
  if (v.source === 'direct') return `Direct · ${page}`;
  return `Referral · ${page}`;
}

/** One line of engagement: the number the customer compares visit to visit. */
function visitSummary(v: Visit): string[] {
  return [seconds(v.engagement.durationSec), `${Math.round(v.engagement.scrollDepth * 100)}% scroll`, v.converted ? 'Converted' : 'No conversion'];
}

/** Only what changed since the previous visit, or is unusual on the first. Defaults never appear. */
function visitChanges(v: Visit, index: number, all: Visit[]): Array<SignalTagProps & { id: string }> {
  const before = all.slice(0, index);
  const previous = before[before.length - 1];
  const out: Array<SignalTagProps & { id: string }> = [];
  const push = (id: string, label: string, kind?: SignalTagProps['kind']) => out.push({ id, label, kind });
  if (v.formResult === 'invalid') push('email', 'Email undeliverable', 'primary');
  if (v.formResult === 'valid') push('email', 'Email: Valid', 'contradictory');
  if (v.converted) push('converted', 'Converted', 'contradictory');
  if (previous && v.location.city !== previous.location.city) push('location', `Location changed to ${v.location.city}`);
  if (before.length && !before.some((p) => p.device.id === v.device.id)) push('device', 'New device identity');
  if (v.vpnOrProxy && (!previous || !previous.vpnOrProxy)) push('vpn', 'VPN detected');
  if (!previous && v.networkType === 'datacenter') push('network', 'Datacenter');
  if (v.botProbability >= 0.6 && (!previous || previous.botProbability < 0.6)) push('bot', `Bot: ${Math.round(v.botProbability * 100)}%`);
  if (!v.engagement.jsEnabled && (!previous || previous.engagement.jsEnabled)) push('js', 'No fingerprint', 'missing');
  return out;
}

/** The brief's signals, per visit, every one of them present so absence is never blank. */
function visitRecord(v: Visit, index: number, all: Visit[]): Array<{ label: string; value: string }> {
  const previous = all[index - 1];
  const rec: Array<{ label: string; value: string }> = [{ label: 'Time', value: formatTimestamp(v.occurredAt) }];
  if (v.source === 'paid') {
    const parts = [PLATFORM_LABEL[v.platform!], v.campaign, v.keyword ? `keyword "${v.keyword}"` : undefined, v.cpc === undefined ? 'cost not reported' : formatMoney(v.cpc)].filter(Boolean);
    rec.push({ label: 'Platform', value: parts.join(', ') });
  } else {
    rec.push({ label: 'Source', value: v.source === 'organic' ? 'Organic search' : v.source === 'direct' ? 'Direct' : 'Referral' });
  }
  rec.push({ label: 'Landing page', value: v.landingPage === '/' ? 'Home page' : v.landingPage });
  rec.push({ label: 'Time on page', value: `${seconds(v.engagement.durationSec)}, scroll ${Math.round(v.engagement.scrollDepth * 100)}%, pointer ${v.engagement.pointerMoved ? 'moved' : 'still'}` });
  rec.push({ label: 'Interaction level', value: interactionLevel(v) });
  rec.push({ label: 'Bot probability', value: `${Math.round(v.botProbability * 100)}%` });
  rec.push({ label: 'Location', value: `${v.location.city}, ${v.location.country}${previous && previous.location.city !== v.location.city ? ` (changed from ${previous.location.city})` : ''}` });
  const firstSeenOn = all.findIndex((p) => p.device.id === v.device.id);
  rec.push({ label: 'Device', value: `${v.device.browser}, ${v.device.os}${firstSeenOn < index ? `, first seen on visit ${firstSeenOn + 1}` : index > 0 ? ', new on this visit' : ''}` });
  rec.push({ label: 'Network', value: `${NETWORK_LABEL[v.networkType]}, ${v.vpnOrProxy ? 'VPN or proxy detected' : 'no VPN or proxy'}` });
  rec.push({ label: 'Form', value: v.formResult === 'not-submitted' ? 'Not submitted' : `Submitted, email deliverability ${v.formResult === 'valid' ? 'Valid' : 'Invalid'}` });
  rec.push({ label: 'Conversion', value: v.converted ? 'Yes' : 'No' });
  if (!v.engagement.jsEnabled) rec.push({ label: 'Fingerprint', value: 'Unavailable, JavaScript was blocked' });
  return rec;
}

/** Visits, the decision, the sync events and any override, as timeline items (D11). */
export function toTimelineItems(v: Visitor): VisitTimelineItem[] {
  const events = journey(v);
  const evidence = v.decision?.evidence ?? v.monitoring?.evidence ?? [];
  const pos = decisionPosition(v);
  let previous: string | undefined;
  return events.map((e) => {
    const relativeTime = previous ? formatLater(previous, e.at) : 'start of journey';
    previous = e.at;
    const timestamp = formatShortTimestamp(e.at);
    switch (e.kind) {
      case 'visit': {
        const n = e.index + 1;
        const isDecisionVisit = v.decision?.afterVisitId === e.visit.id;
        const contributed = evidence.filter((x) => x.visitIds.includes(e.visit.id)).map((x) => x.statement);
        return {
          id: `visit-${n}`,
          type: e.visit.source,
          label: `${SOURCE_LABEL[e.visit.source]} ${n}`,
          decisionVisit: isDecisionVisit || undefined,
          defaultExpanded: isDecisionVisit || undefined,
          timestamp,
          relativeTime,
          description: visitSource(e.visit),
          summary: visitSummary(e.visit),
          changes: visitChanges(e.visit, e.index, v.visits),
          contributed: contributed.length ? contributed : undefined,
          record: visitRecord(e.visit, e.index, v.visits),
        };
      }
      case 'decision':
        return {
          type: 'block',
          timestamp,
          relativeTime: 'at the same time',
          description: `Blocked after visit ${pos!.after} of ${pos!.of}. ${CONFIDENCE_LABEL_MAP[v.decision!.confidence]}.`,
        };
      case 'sync':
        return {
          type: e.event.state === 'active' ? 'sync-active' : e.event.state === 'failed' ? 'sync-failed' : 'sync-pending',
          label: e.event.state === 'delayed' ? `${PLATFORM_LABEL[e.event.platform]} exclusion delayed` : `${PLATFORM_LABEL[e.event.platform]} ${e.event.state === 'active' ? 'exclusion active' : e.event.state === 'failed' ? 'exclusion sync failed' : 'exclusion sync pending'}`,
          timestamp,
          relativeTime,
          description: e.event.note ?? '',
        };
      case 'override':
        return {
          type: 'override',
          timestamp,
          relativeTime,
          description: `${v.manualOverride!.by} allowed this visitor: ${v.manualOverride!.note} The decision and its evidence stay on record.`,
        };
    }
  });
}

export function journeyCaption(v: Visitor): string {
  const events = journey(v);
  const first = formatDate(events[0].at);
  const last = formatDate(events[events.length - 1].at);
  return `${events.length} event${events.length === 1 ? '' : 's'}, ${first === last ? first : `${first} to ${last}`}`;
}

/** The page header line under the IP. */
export function visitorDescription(v: Visitor): string {
  const bits = [`${v.location.city}, ${v.location.region}, ${v.location.country}`, NETWORK_LABEL[v.networkType]];
  if (v.vpnOrProxy) bits.push('connection hides its location');
  const c = counts(v);
  bits.push(`${c.total} visit${c.total === 1 ? '' : 's'}, ${c.paid} paid`);
  bits.push(`first seen ${formatDate(v.visits[0].occurredAt)}, last seen ${formatRelative(v.visits[v.visits.length - 1].occurredAt, NOW)}`);
  return bits.join('. ') + '.';
}

export { displayStatus };
