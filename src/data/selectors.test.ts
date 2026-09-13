import { describe, expect, it } from 'vitest';
import { GOLDEN_CASES } from './golden';
import { generateVisitors } from './factory';
import { displayStatus, filterRows, journey, reasonLine, sortRows, toRow, syncByPlatform } from './selectors';

const visitors = generateVisitors();
const rows = visitors.map(toRow);
const golden = (n: number) => GOLDEN_CASES.find((g) => g.goldenCase === n)!;

describe('rows are derived, never stored', () => {
  it('reconciles counts and timings with the visitor', () => {
    for (const v of visitors) {
      const r = toRow(v);
      expect(r.totalVisits).toBe(v.visits.length);
      expect(r.paidVisits + r.organicVisits).toBe(r.totalVisits);
      expect(r.lastSeenAt).toBe(v.visits[v.visits.length - 1].occurredAt);
      expect(r.decidedAt).toBe(v.decision?.madeAt);
      expect(r.status).toBe(displayStatus(v));
    }
  });
  it('shows the override on top of the system finding', () => {
    const o = visitors.find((v) => v.manualOverride)!;
    expect(o.status).toBe('blocked');
    expect(displayStatus(o)).toBe('allowed');
  });
  it('writes a plain-language reason for every status', () => {
    expect(reasonLine(golden(1))).toMatch(/^Returned through four paid ads/);
    expect(reasonLine(golden(2))).toMatch(/^Not blocked: 2 visits, 1 paid, real engagement on every visit, a completed purchase\.$/);
    expect(reasonLine(golden(4))).toMatch(/^Monitoring: /);
    expect(reasonLine(golden(8))).toBe('One visit is not enough history to evaluate.');
  });
  it('summarises sync per platform from the latest event', () => {
    expect(syncByPlatform(golden(6))['google-ads']!.state).toBe('active');
    expect(syncByPlatform(golden(7))['meta-ads']!.state).toBe('failed');
    expect(toRow(golden(2)).sync).toEqual({});
  });
});

describe('sorting (D7)', () => {
  const ms = (iso: string) => new Date(iso).getTime();
  it('defaults to most recently active first', () => {
    const sorted = sortRows(rows);
    for (let i = 1; i < sorted.length; i++) expect(ms(sorted[i].lastSeenAt)).toBeLessThanOrEqual(ms(sorted[i - 1].lastSeenAt));
  });
  it('sorts by block time with undecided visitors last in either direction', () => {
    for (const dir of ['asc', 'desc'] as const) {
      const sorted = sortRows(rows, 'block-time', dir);
      const decided = sorted.filter((r) => r.decidedAt);
      const undecided = sorted.filter((r) => !r.decidedAt);
      expect(sorted.slice(decided.length)).toEqual(undecided);
      for (let i = 1; i < decided.length; i++) {
        const a = ms(decided[i - 1].decidedAt!);
        const b = ms(decided[i].decidedAt!);
        expect(dir === 'desc' ? b <= a : b >= a).toBe(true);
      }
    }
  });
  it('sorts by visits, paid clicks and confidence', () => {
    const byVisits = sortRows(rows, 'visits', 'desc');
    expect(byVisits[0].totalVisits).toBe(Math.max(...rows.map((r) => r.totalVisits)));
    const byPaid = sortRows(rows, 'paid-clicks', 'asc');
    expect(byPaid[0].paidVisits).toBe(0);
    const byConfidence = sortRows(rows, 'confidence', 'desc');
    expect(byConfidence[0].confidence).toBe('high');
    expect(byConfidence[byConfidence.length - 1].confidence).toBeUndefined();
  });
  it('does not mutate its input', () => {
    const before = rows.map((r) => r.id);
    sortRows(rows, 'visits', 'asc');
    expect(rows.map((r) => r.id)).toEqual(before);
  });
});

describe('filtering', () => {
  it('searches IP and location, case-insensitively', () => {
    expect(filterRows(rows, { query: '185.220' }).map((r) => r.ip)).toEqual(['185.220.101.34']);
    expect(filterRows(rows, { query: 'frankfurt' }).length).toBeGreaterThanOrEqual(1);
    expect(filterRows(rows, { query: 'nowhere' })).toEqual([]);
  });
  it('filters by status, traffic and platform', () => {
    expect(filterRows(rows, { statuses: ['blocked'] }).every((r) => r.status === 'blocked')).toBe(true);
    expect(filterRows(rows, { statuses: ['allowed'] }).length).toBe(1);
    expect(filterRows(rows, { traffic: 'unpaid' }).every((r) => r.paidVisits === 0)).toBe(true);
    expect(filterRows(rows, { traffic: 'paid' }).every((r) => r.paidVisits > 0)).toBe(true);
    expect(filterRows(rows, { platforms: ['meta-ads'] }).every((r) => r.platforms.includes('meta-ads'))).toBe(true);
    expect(filterRows(rows, { traffic: 'paid' }).length + filterRows(rows, { traffic: 'unpaid' }).length).toBe(rows.length);
  });
  it('is empty when nothing matches, so the table can say why', () => {
    expect(filterRows(rows, { statuses: ['not-evaluated'], traffic: 'unpaid', query: '185.220' })).toEqual([]);
  });
});

describe('the journey (D11)', () => {
  it('puts the decision after the visit it followed, then the sync as its own events', () => {
    const j = journey(golden(6));
    const kinds = j.map((e) => e.kind);
    expect(kinds).toEqual(['visit', 'visit', 'visit', 'decision', 'sync', 'sync', 'visit', 'sync']);
    const decisionAt = j.findIndex((e) => e.kind === 'decision');
    expect(j[decisionAt - 1]).toMatchObject({ kind: 'visit', visit: { id: 'c6-v3' } });
  });
  it('places the override at the end of a journey that has one', () => {
    const o = visitors.find((v) => v.manualOverride)!;
    const j = journey(o);
    expect(j.some((e) => e.kind === 'override')).toBe(true);
    for (let i = 1; i < j.length; i++) expect(new Date(j[i].at).getTime()).toBeGreaterThanOrEqual(new Date(j[i - 1].at).getTime());
  });
});
