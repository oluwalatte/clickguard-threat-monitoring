/**
 * Presentation adapters: pure functions that turn data into the props the system
 * components take. Composition decisions live here; visual decisions do not.
 */
import type { EvidenceItemProps, StatusKind, SyncState as UiSyncState, VisitTimelineItem } from '@clickguard/ui';
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
  formatTime,
  formatTimestamp,
  journey,
  paidClicksSinceActive,
  syncByPlatform,
  type AdPlatform,
  type Confidence,
  type DisplayStatus,
  type Evidence,
  type ExclusionEvent,
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

export const STATUS_FILTERS: Array<{ value: DisplayStatus; label: string }> = [
  { value: 'blocked', label: 'Blocked' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'not-blocked', label: 'Not blocked' },
  { value: 'allowed', label: 'Manually allowed' },
  { value: 'not-evaluated', label: 'Not evaluated' },
];

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

/** The worst state across platforms, so the summary never overstates the exclusion. */
export function syncSummary(v: Visitor): { state: UiSyncState; note: string } | undefined {
  const latest = syncByPlatform(v);
  const entries = Object.entries(latest) as Array<[AdPlatform, ExclusionEvent]>;
  if (!entries.length) return undefined;
  const state: UiSyncState = entries.some(([, e]) => e.state === 'failed') ? 'failed' : entries.some(([, e]) => e.state !== 'active') ? 'pending' : 'active';
  const notes = entries.map(([platform, e]) => {
    const name = PLATFORM_LABEL[platform];
    switch (e.state) {
      case 'active': {
        const since = paidClicksSinceActive(v);
        return `${name} exclusion active since ${formatTimestamp(e.at)}, ${formatLater(v.decision!.madeAt, e.at).replace(' later', ' after the decision')}. ${since === 0 ? 'No paid clicks since.' : `${since} paid clicks since.`}`;
      }
      case 'pending':
        return `${name} exclusion queued ${formatRelative(e.at, NOW)}. Blocking begins when the platform confirms it.`;
      case 'delayed':
        return `${name} has not confirmed the exclusion ${formatDuration(new Date(NOW).getTime() - new Date(e.at).getTime())} after it was queued. Paid clicks can still reach the site.`;
      case 'failed':
        return `${name} rejected the exclusion. This visitor can still reach the site through ${name}.`;
    }
  });
  return { state, note: notes.join(' ') };
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

function visitDescription(v: Visit): string {
  const where = v.landingPage === '/' ? 'the home page' : v.landingPage;
  if (v.source === 'paid') return `Landed on ${where} from ${v.campaign ?? 'a paid ad'} on ${PLATFORM_LABEL[v.platform!]}`;
  if (v.source === 'organic') return `Organic search visit to ${where}`;
  if (v.source === 'direct') return `Direct visit to ${where}`;
  return `Referral visit to ${where}`;
}

function visitMeta(v: Visit, home: Visitor): Array<{ label: string; value: string }> {
  const meta: Array<{ label: string; value: string }> = [];
  if (v.keyword) meta.push({ label: 'Keyword', value: v.keyword });
  if (v.source === 'paid') meta.push({ label: 'CPC', value: v.cpc === undefined ? 'not reported' : formatMoney(v.cpc) });
  meta.push({ label: 'Time on page', value: v.engagement.durationSec < 60 ? `${v.engagement.durationSec}s` : `${Math.floor(v.engagement.durationSec / 60)}m ${v.engagement.durationSec % 60}s` });
  meta.push({ label: 'Scroll', value: `${Math.round(v.engagement.scrollDepth * 100)}%` });
  meta.push({ label: 'Pointer', value: v.engagement.pointerMoved ? 'moved' : 'no movement' });
  if (v.formResult !== 'not-submitted') meta.push({ label: 'Form', value: v.formResult });
  if (v.converted) meta.push({ label: 'Outcome', value: 'converted' });
  if (v.location.city !== home.location.city) meta.push({ label: 'Location', value: `${v.location.city}, ${v.location.country}` });
  meta.push({ label: 'Device', value: `${v.device.browser}, ${v.device.os}` });
  return meta;
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
    const timestamp = formatTimestamp(e.at);
    switch (e.kind) {
      case 'visit': {
        const n = e.index + 1;
        const signals = evidence.filter((x) => x.visitIds.includes(e.visit.id));
        return {
          id: `visit-${n}`,
          type: e.visit.source,
          label: `${SOURCE_LABEL[e.visit.source]} ${n}`,
          timestamp,
          relativeTime,
          description: visitDescription(e.visit),
          meta: visitMeta(e.visit, v),
          evidence: signals.length ? toEvidenceItems(v, signals).map((s) => ({ ...s, sourceVisit: undefined, sourceHref: undefined })) : undefined,
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
