/**
 * Everything the screens read is derived here from `visits`, so totals, exposure and
 * timings cannot contradict the journey (build plan 6.1). Selectors are pure.
 */
import type { AdPlatform, Confidence, DisplayStatus, ExclusionEvent, Visit, Visitor } from './types';

const ms = (iso: string) => new Date(iso).getTime();

/** The system's finding, or the person's override on top of it (D3). */
export function displayStatus(v: Visitor): DisplayStatus {
  return v.manualOverride ? 'allowed' : v.status;
}

export const firstSeen = (v: Visitor) => v.visits[0].occurredAt;
export const lastSeen = (v: Visitor) => v.visits[v.visits.length - 1].occurredAt;

export function counts(v: Visitor) {
  const paid = v.visits.filter((x) => x.source === 'paid').length;
  return { total: v.visits.length, paid, organic: v.visits.length - paid };
}

export function platforms(v: Visitor): AdPlatform[] {
  return [...new Set(v.visits.flatMap((x) => (x.platform ? [x.platform] : [])))];
}

/** The latest exclusion event per platform. */
export function syncByPlatform(v: Visitor): Partial<Record<AdPlatform, ExclusionEvent>> {
  const out: Partial<Record<AdPlatform, ExclusionEvent>> = {};
  for (const e of v.exclusionEvents) out[e.platform] = e;
  return out;
}

/** When the exclusion became active on a platform, if it did. */
export function activeSince(v: Visitor, platform: AdPlatform): string | undefined {
  return v.exclusionEvents.find((e) => e.platform === platform && e.state === 'active')?.at;
}

/** Is the platform's exclusion active at a given moment? */
export function exclusionActiveAt(v: Visitor, platform: AdPlatform, iso: string): boolean {
  const since = activeSince(v, platform);
  return since !== undefined && ms(since) <= ms(iso);
}

export interface Exposure {
  /** Paid visits up to and including the decision visit, or all paid visits when no decision was made. */
  paidBefore: number;
  /** Sum of CPC on those visits. Null when any of them lacks a cost, because a partial sum would mislead (D6). */
  spendBefore: number | null;
  /** Paid visits after the decision, which reached the site while an exclusion was not yet active. */
  paidAfter: number;
  spendAfter: number | null;
  total: number;
  paid: number;
  organic: number;
}

function sum(visits: Visit[]): number | null {
  if (visits.some((x) => x.cpc === undefined)) return null;
  return Math.round(visits.reduce((s, x) => s + (x.cpc ?? 0), 0) * 100) / 100;
}

/** D6: what the traffic cost, with the calculation visible. Nothing is estimated. */
export function exposure(v: Visitor): Exposure {
  const paidVisits = v.visits.filter((x) => x.source === 'paid');
  const cut = v.decision ? ms(v.decision.madeAt) : Infinity;
  const before = paidVisits.filter((x) => ms(x.occurredAt) <= cut);
  const after = paidVisits.filter((x) => ms(x.occurredAt) > cut);
  const c = counts(v);
  return { paidBefore: before.length, spendBefore: before.length ? sum(before) : 0, paidAfter: after.length, spendAfter: after.length ? sum(after) : 0, total: c.total, paid: c.paid, organic: c.organic };
}

export function confidence(v: Visitor): Confidence | undefined {
  return v.decision?.confidence ?? v.monitoring?.confidence;
}

/** The one-line "why" for the table. Plain language, never a score. */
export function reasonLine(v: Visitor): string {
  if (v.decision) return v.decision.summary;
  if (v.monitoring) return v.monitoring.note;
  if (v.status === 'not-evaluated') return 'One visit is not enough history to evaluate.';
  const c = counts(v);
  const engaged = v.visits.every((x) => x.engagement.durationSec >= 45);
  const converted = v.visits.some((x) => x.converted);
  const form = v.visits.some((x) => x.formResult === 'valid');
  const parts = [`${c.total} visit${c.total === 1 ? '' : 's'}${c.paid ? `, ${c.paid} paid` : ''}`];
  if (engaged) parts.push('real engagement on every visit');
  if (converted) parts.push('a completed purchase');
  else if (form) parts.push('a valid form');
  return `Not blocked: ${parts.join(', ')}.`;
}

export function decidedAt(v: Visitor): string | undefined {
  return v.decision?.madeAt;
}

/** What the table shows per visitor. Derived on read; never stored. */
export interface VisitorRow extends Record<string, unknown> {
  id: string;
  ip: string;
  visitorLabel: string;
  location: string;
  status: DisplayStatus;
  confidence?: Confidence;
  totalVisits: number;
  paidVisits: number;
  organicVisits: number;
  firstSeenAt: string;
  lastSeenAt: string;
  decidedAt?: string;
  reason: string;
  platforms: AdPlatform[];
  sync: Partial<Record<AdPlatform, ExclusionEvent['state']>>;
}

export function toRow(v: Visitor): VisitorRow {
  const c = counts(v);
  const sync: VisitorRow['sync'] = {};
  for (const [p, e] of Object.entries(syncByPlatform(v))) sync[p as AdPlatform] = e.state;
  return {
    id: v.id,
    ip: v.ip,
    visitorLabel: `${v.ip}, ${v.location.city}, ${v.location.country}`,
    location: `${v.location.city}, ${v.location.region}, ${v.location.country}`,
    status: displayStatus(v),
    confidence: confidence(v),
    totalVisits: c.total,
    paidVisits: c.paid,
    organicVisits: c.organic,
    firstSeenAt: firstSeen(v),
    lastSeenAt: lastSeen(v),
    decidedAt: decidedAt(v),
    reason: reasonLine(v),
    platforms: platforms(v),
    sync,
  };
}

/** D7: recency by default; block time, visit count, paid clicks and confidence as options. */
export type SortKey = 'recency' | 'block-time' | 'visits' | 'paid-clicks' | 'confidence';
export type SortDirection = 'asc' | 'desc';

const CONFIDENCE_RANK: Record<Confidence, number> = { high: 3, moderate: 2, conflicting: 1 };

function sortValue(row: VisitorRow, key: SortKey): number {
  switch (key) {
    case 'recency':
      return ms(row.lastSeenAt);
    case 'block-time':
      return row.decidedAt ? ms(row.decidedAt) : Number.NEGATIVE_INFINITY;
    case 'visits':
      return row.totalVisits;
    case 'paid-clicks':
      return row.paidVisits;
    case 'confidence':
      return row.confidence ? CONFIDENCE_RANK[row.confidence] : 0;
  }
}

export function sortRows(rows: VisitorRow[], key: SortKey = 'recency', direction: SortDirection = 'desc'): VisitorRow[] {
  const dir = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = sortValue(a, key);
    const bv = sortValue(b, key);
    if (av === bv) return ms(b.lastSeenAt) - ms(a.lastSeenAt);
    /* Rows without a value for the key always sink, whatever the direction. */
    if (av === Number.NEGATIVE_INFINITY) return 1;
    if (bv === Number.NEGATIVE_INFINITY) return -1;
    return (av - bv) * dir;
  });
}

/** `paid`: at least one paid visit. `unpaid`: no paid visits at all. */
export type TrafficFilter = 'any' | 'paid' | 'unpaid';

export interface RowFilter {
  query?: string;
  statuses?: DisplayStatus[];
  traffic?: TrafficFilter;
  platforms?: AdPlatform[];
}

export function filterRows(rows: VisitorRow[], f: RowFilter): VisitorRow[] {
  const q = f.query?.trim().toLowerCase();
  return rows.filter((r) => {
    if (q && !r.ip.includes(q) && !r.location.toLowerCase().includes(q)) return false;
    if (f.statuses && f.statuses.length && !f.statuses.includes(r.status)) return false;
    if (f.traffic === 'paid' && r.paidVisits === 0) return false;
    if (f.traffic === 'unpaid' && r.paidVisits > 0) return false;
    if (f.platforms && f.platforms.length && !r.platforms.some((p) => f.platforms!.includes(p))) return false;
    return true;
  });
}

/** Visits, the decision and the sync events merged into one chronological journey (D11). */
export type JourneyEvent =
  | { kind: 'visit'; at: string; visit: Visit; index: number }
  | { kind: 'decision'; at: string }
  | { kind: 'sync'; at: string; event: ExclusionEvent }
  | { kind: 'override'; at: string };

export function journey(v: Visitor): JourneyEvent[] {
  const events: JourneyEvent[] = v.visits.map((visit, index) => ({ kind: 'visit', at: visit.occurredAt, visit, index }));
  if (v.decision) events.push({ kind: 'decision', at: v.decision.madeAt });
  for (const event of v.exclusionEvents) events.push({ kind: 'sync', at: event.at, event });
  if (v.manualOverride) events.push({ kind: 'override', at: v.manualOverride.at });
  const order: Record<JourneyEvent['kind'], number> = { visit: 0, decision: 1, sync: 2, override: 3 };
  return events.sort((a, b) => ms(a.at) - ms(b.at) || order[a.kind] - order[b.kind]);
}

/** Success criterion 7: did the block work? */
export function paidClicksSinceActive(v: Visitor): number {
  return v.visits.filter((x) => x.source === 'paid' && x.platform && exclusionActiveAt(v, x.platform, x.occurredAt)).length;
}

export function summarizeStatuses(visitors: Visitor[]) {
  const by: Record<DisplayStatus, number> = { blocked: 0, monitoring: 0, 'not-blocked': 0, 'not-evaluated': 0, allowed: 0 };
  for (const v of visitors) by[displayStatus(v)] += 1;
  return by;
}
