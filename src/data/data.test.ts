/**
 * Reconciliation tests for the claims the interface makes (build plan 6.4). If one of these
 * fails, a screen would be showing a number its own data contradicts.
 */
import { describe, expect, it } from 'vitest';
import { evaluate } from './engine';
import { GOLDEN_CASES } from './golden';
import { DEFAULT_COUNT, generateVisitors } from './factory';
import { counts, evidenceFor, exclusionActiveAt, exposure, firstSeen, keySignals, lastSeen, paidClicksSinceActive, summarizeStatuses } from './selectors';
import type { Visitor } from './types';

const ms = (iso: string) => new Date(iso).getTime();
const visitors = generateVisitors();
const golden = (n: number) => GOLDEN_CASES.find((g) => g.goldenCase === n)!;

describe('the dataset', () => {
  it('is deterministic for a seed', () => {
    expect(JSON.stringify(generateVisitors())).toBe(JSON.stringify(visitors));
    expect(JSON.stringify(generateVisitors(7))).not.toBe(JSON.stringify(visitors));
  });
  it('has between 30 and 60 visitors, golden cases first', () => {
    expect(visitors.length).toBe(DEFAULT_COUNT);
    expect(visitors.length).toBeGreaterThanOrEqual(30);
    expect(visitors.length).toBeLessThanOrEqual(60);
    expect(visitors.slice(0, 8).map((v) => v.goldenCase)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('identifies visitors by IP, uniquely', () => {
    const ips = visitors.map((v) => v.ip);
    expect(new Set(ips).size).toBe(ips.length);
    for (const v of visitors) expect(v.id).toBe(v.ip);
  });
  it('covers every system status; the override vocabulary stays out of the data until modelled', () => {
    const s = summarizeStatuses(visitors);
    for (const k of ['blocked', 'monitoring', 'not-blocked', 'not-evaluated'] as const) expect(s[k]).toBeGreaterThan(0);
    expect(s.allowed).toBe(0);
    expect(s.blocked).toBeGreaterThanOrEqual(8);
  });
  it('mixes paid and organic visits and varied journey lengths', () => {
    const all = visitors.flatMap((v) => v.visits);
    const paidShare = all.filter((x) => x.source === 'paid').length / all.length;
    expect(paidShare).toBeGreaterThan(0.3);
    expect(paidShare).toBeLessThan(0.8);
    const lens = visitors.map((v) => v.visits.length);
    expect(Math.min(...lens)).toBe(1);
    expect(Math.max(...lens)).toBeGreaterThanOrEqual(7);
  });
});

describe('every visitor reconciles with its own visits', () => {
  it.each(visitors.map((v) => [v.ip, v] as const))('%s', (_ip, v: Visitor) => {
    /* Chronological. */
    for (let i = 1; i < v.visits.length; i++) expect(ms(v.visits[i].occurredAt)).toBeGreaterThan(ms(v.visits[i - 1].occurredAt));
    /* Derived counts add up. */
    const c = counts(v);
    expect(c.paid + c.organic).toBe(c.total);
    expect(c.total).toBe(v.visits.length);
    expect(firstSeen(v)).toBe(v.visits[0].occurredAt);
    expect(lastSeen(v)).toBe(v.visits[v.visits.length - 1].occurredAt);
    /* Only paid visits carry a platform, a campaign or a cost. */
    for (const x of v.visits) {
      if (x.source !== 'paid') {
        expect(x.platform).toBeUndefined();
        expect(x.cpc).toBeUndefined();
        expect(x.campaign).toBeUndefined();
      } else {
        expect(x.platform).toBeDefined();
      }
      expect(x.engagement.scrollDepth).toBeGreaterThanOrEqual(0);
      expect(x.engagement.scrollDepth).toBeLessThanOrEqual(1);
      expect(x.botProbability).toBeGreaterThanOrEqual(0);
      expect(x.botProbability).toBeLessThanOrEqual(1);
    }
    /* Status agrees with what is attached. */
    expect(v.decision !== undefined).toBe(v.status === 'blocked');
    expect(v.monitoring !== undefined).toBe(v.status === 'monitoring');
    if (v.status === 'not-evaluated') expect(v.visits.length).toBeLessThan(2);
    if (v.manualOverride) expect(v.decision).toBeDefined();
    if (v.decision) {
      /* The decision references a real visit and carries its time. */
      const after = v.visits.find((x) => x.id === v.decision!.afterVisitId);
      expect(after).toBeDefined();
      expect(v.decision.madeAt).toBe(after!.occurredAt);
      expect(v.visits.indexOf(after!)).toBeGreaterThanOrEqual(1);
      expect(['high', 'moderate', 'conflicting']).toContain(v.decision.confidence);
      /* Plain language leads; no score on the page. */
      expect(v.decision.summary).not.toMatch(/score|threshold|probability/i);
      expect(v.decision.summary).toMatch(/\.$/);
      expect(v.decision.evidence.length).toBeGreaterThan(0);
      expect(v.decision.evidence[0].kind).toBe('primary');
      expect(v.decision.confidence === 'conflicting').toBe(v.decision.evidence.some((e) => e.kind === 'contradictory'));
      for (const e of v.decision.evidence) for (const id of e.visitIds) expect(v.visits.some((x) => x.id === id)).toBe(true);
      /* Exclusion events follow the decision, one platform chain each, in order, starting pending. */
      expect(v.exclusionEvents.length).toBeGreaterThan(0);
      for (const platform of new Set(v.exclusionEvents.map((e) => e.platform))) {
        const chain = v.exclusionEvents.filter((e) => e.platform === platform);
        expect(chain[0].state).toBe('pending');
        expect(ms(chain[0].at)).toBeGreaterThan(ms(v.decision.madeAt));
        for (let i = 1; i < chain.length; i++) expect(ms(chain[i].at)).toBeGreaterThan(ms(chain[i - 1].at));
        expect(['active', 'failed', 'delayed', 'pending']).toContain(chain[chain.length - 1].state);
        expect(chain.filter((e) => e.state === 'active').length).toBeLessThanOrEqual(1);
      }
      /* Once an exclusion is active on a platform, no paid click from it reaches the site. */
      expect(paidClicksSinceActive(v)).toBe(0);
      for (const x of v.visits) {
        if (x.source === 'paid' && ms(x.occurredAt) > ms(v.decision.madeAt)) {
          expect(exclusionActiveAt(v, x.platform!, x.occurredAt)).toBe(false);
        }
      }
    } else {
      expect(v.exclusionEvents).toEqual([]);
    }
    if (v.monitoring) {
      expect(v.monitoring.note).toMatch(/^Monitoring: .+\. Not blocked because .+\.$/);
      expect(v.monitoring.note).not.toMatch(/more (paid )?clicks? (would|will)/i);
      expect(v.monitoring.confidence).toBe(v.monitoring.evidence.some((e) => e.kind === 'contradictory') ? 'conflicting' : 'insufficient');
    }
    /* Exposure is a visible sum, or absent when a cost is missing (D6). */
    const x = exposure(v);
    expect(x.paidBefore + x.paidAfter).toBe(c.paid);
    if (x.spendBefore !== null) {
      const paid = v.visits.filter((y) => y.source === 'paid' && (!v.decision || ms(y.occurredAt) <= ms(v.decision.madeAt)));
      expect(x.spendBefore).toBe(Math.round(paid.reduce((s, y) => s + (y.cpc ?? 0), 0) * 100) / 100);
    }
  });
});

describe('key signals read the way the brief describes each visitor type', () => {
  it('blocked: velocity, interaction, automation, network', () => {
    expect(keySignals(golden(1)).map((s) => s.label)).toEqual(['4 paid clicks / 41 min', 'No interaction', 'Bot: 95%', 'Datacenter']);
  });
  it('ambiguous: mitigating signals stay visible next to the suspicious ones', () => {
    const labels = keySignals(golden(3)).map((s) => s.label);
    expect(labels).toContain('VPN detected');
    expect(labels).toContain('Email: Valid');
    expect(labels).toContain('High interaction');
  });
  it('legitimate: deliverability, conversion and interaction appear as evidence too', () => {
    const labels = keySignals(golden(2)).map((s) => s.label);
    expect(labels).toEqual(expect.arrayContaining(['Email: Valid', 'Converted', 'High interaction']));
  });
  it('inconsistent identity: devices and locations lead; the form signals wait in the detail', () => {
    const labels = keySignals(golden(7)).map((s) => s.label);
    expect(labels).toEqual(expect.arrayContaining(['3 devices', 'Location changed']));
    const all = evidenceFor(golden(7)).map((e) => e.label);
    expect(all).toContain('Email: Invalid');
    expect(all).toContain('No conversion');
  });
  it('never exceeds four labels', () => {
    for (const v of visitors) expect(keySignals(v).length).toBeLessThanOrEqual(4);
  });
});

describe('the golden cases hold their contract', () => {
  it('1 clearly malicious: datacenter, paid clicks minutes apart, no engagement, automation, high confidence', () => {
    const v = golden(1);
    expect(v.status).toBe('blocked');
    expect(v.networkType).toBe('datacenter');
    expect(v.decision!.confidence).toBe('high');
    expect(v.decision!.afterVisitId).toBe('c1-v4');
    expect(v.decision!.evidence.map((e) => e.statement)).toContain('4 paid clicks in 41 minutes');
    expect(v.visits.slice(0, 4).every((x) => x.botProbability > 0.9 && !x.engagement.pointerMoved)).toBe(true);
    expect(v.exclusionEvents.map((e) => e.state)).toEqual(['pending', 'active']);
  });
  it('2 clearly legitimate: residential, real engagement, valid form, conversion', () => {
    const v = golden(2);
    expect(v.status).toBe('not-blocked');
    expect(v.visits.some((x) => x.formResult === 'valid' && x.converted)).toBe(true);
    expect(v.visits.every((x) => x.engagement.durationSec > 60)).toBe(true);
  });
  it('3 ambiguous VPN: monitoring with conflicting evidence', () => {
    const v = golden(3);
    expect(v.status).toBe('monitoring');
    expect(v.vpnOrProxy).toBe(true);
    expect(v.monitoring!.confidence).toBe('conflicting');
    expect(v.monitoring!.evidence.some((e) => e.kind === 'contradictory')).toBe(true);
    expect(v.monitoring!.note).toBe('Monitoring: 3 paid visits in 2 days and a connection that hides its location. Not blocked because engagement is real on every visit and a valid form was submitted.');
  });
  it('4 monitoring: velocity, too little history, no tipping count', () => {
    const v = golden(4);
    expect(v.status).toBe('monitoring');
    expect(v.monitoring!.confidence).toBe('insufficient');
    expect(v.monitoring!.note).toBe('Monitoring: 3 paid visits in 12 minutes with shallow engagement. Not blocked because there is no automation signal and the history is three visits long.');
  });
  it('5 post-block organic return that converts: conflicting, not a false positive', () => {
    const v = golden(5);
    expect(v.status).toBe('blocked');
    expect(v.decision!.confidence).toBe('conflicting');
    const last = v.visits[v.visits.length - 1];
    expect(last.source).toBe('organic');
    expect(last.converted).toBe(true);
    expect(ms(last.occurredAt)).toBeGreaterThan(ms(v.decision!.madeAt));
    expect(v.decision!.summary).toMatch(/not by itself proof/);
    expect(v.decision!.summary).not.toMatch(/false positive|wrongly|mistake/i);
  });
  it('6 sync delay: a paid click after the decision, before the exclusion became active', () => {
    const v = golden(6);
    const decidedAt = ms(v.decision!.madeAt);
    const active = v.exclusionEvents.find((e) => e.state === 'active')!;
    const gapClick = v.visits.find((x) => x.source === 'paid' && ms(x.occurredAt) > decidedAt)!;
    expect(gapClick).toBeDefined();
    expect(ms(gapClick.occurredAt)).toBeLessThan(ms(active.at));
    expect(v.exclusionEvents.map((e) => e.state)).toEqual(['pending', 'delayed', 'active']);
    expect(exposure(v).paidAfter).toBe(1);
    expect(exposure(v).spendAfter).toBe(5.6);
  });
  it('7 location and device inconsistency with weak engagement', () => {
    const v = golden(7);
    expect(v.status).toBe('blocked');
    expect(new Set(v.visits.map((x) => x.location.city)).size).toBe(3);
    expect(new Set(v.visits.map((x) => x.device.id)).size).toBe(3);
    expect(v.decision!.evidence.map((e) => e.statement)).toEqual(expect.arrayContaining([expect.stringMatching(/device identities/), expect.stringMatching(/location changed/)]));
    expect(v.decision!.evidence.some((e) => e.statement.includes('undefined'))).toBe(false);
    expect(v.exclusionEvents[v.exclusionEvents.length - 1].state).toBe('failed');
  });
  it('8 single visit: not evaluated', () => {
    const v = golden(8);
    expect(v.status).toBe('not-evaluated');
    expect(v.visits.length).toBe(1);
  });
  it('are judged the same way by the engine that generates the filler', () => {
    for (const g of GOLDEN_CASES) {
      const ev = evaluate(g.visits, { networkType: g.networkType, vpnOrProxy: g.vpnOrProxy });
      expect(ev.status, `golden case ${g.goldenCase}`).toBe(g.status);
      if (g.decision && g.goldenCase !== 5) expect(ev.decision!.confidence, `golden case ${g.goldenCase}`).toBe(g.decision.confidence);
    }
  });
});

describe('the generated filler shows the mechanics', () => {
  it('includes a failed sync and a delayed sync, and no manual override', () => {
    const states = visitors.flatMap((v) => v.exclusionEvents.map((e) => e.state));
    expect(states).toContain('failed');
    expect(states).toContain('delayed');
    expect(visitors.filter((v) => v.manualOverride).length).toBe(0);
  });
  it('gives every evidence item a plain sentence and most of them a scannable label', () => {
    for (const v of visitors) {
      for (const e of v.decision?.evidence ?? v.monitoring?.evidence ?? []) {
        expect(e.statement.length).toBeGreaterThan(10);
        if (e.label) expect(e.label.length).toBeLessThanOrEqual(32);
      }
    }
  });
  it('never puts a score or a tipping count on any visitor', () => {
    const text = JSON.stringify(visitors.map((v) => [v.decision?.summary, v.monitoring?.note]));
    expect(text).not.toMatch(/score/i);
    expect(text).not.toMatch(/would block/i);
  });
  it('has organic returns after a block', () => {
    expect(visitors.some((v) => v.decision && v.visits.some((x) => x.source !== 'paid' && ms(x.occurredAt) > ms(v.decision!.madeAt)))).toBe(true);
  });
});
