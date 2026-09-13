/**
 * The mock decision model. It evaluates a journey cumulatively and writes the evidence in
 * plain language (D4). The internal score exists only to pick the visit a block follows;
 * it is never stored on a visitor or shown on a screen.
 *
 * Both the seeded factory and the tests use it. The eight golden cases are hand-authored,
 * and a test checks that this engine reaches the same status on each of them, which is
 * how the generated filler is kept consistent with the contract.
 */
import { formatDuration } from './format';
import type { BlockDecision, Confidence, Evidence, MonitoringState, NetworkType, Visit, VisitorStatus } from './types';

/** "41 min", "3 hr", "2 days": the label form of a span. */
function shortDuration(msValue: number) {
  const words = formatDuration(msValue);
  return words.replace(/ minutes?$/, ' min').replace(/ hours?$/, ' hr').replace(/ seconds?$/, ' sec');
}

export const BLOCK_THRESHOLD = 0.8;
export const MONITOR_THRESHOLD = 0.3;
/** Fewer visits than this is insufficient history (D3, golden case 8). */
export const MIN_HISTORY = 2;

export interface JourneyContext {
  networkType: NetworkType;
  vpnOrProxy: boolean;
}

export interface Evaluation {
  status: VisitorStatus;
  decision?: BlockDecision;
  monitoring?: MonitoringState;
}

const isShallow = (v: Visit) => v.engagement.scrollDepth < 0.1 && v.engagement.durationSec < 6;
const isEngaged = (v: Visit) => v.engagement.durationSec >= 45 && v.engagement.scrollDepth >= 0.4;

/** Risk a single visit adds, given the journey so far. */
function increment(v: Visit, ctx: JourneyContext, repeatedKeyword: boolean, deviceChanged: boolean, locationChanged: boolean) {
  let raw = 0;
  raw += v.source === 'paid' ? 0.06 : 0.01;
  raw += v.botProbability * 0.25;
  raw += isShallow(v) ? 0.12 : 0;
  raw += v.engagement.pointerMoved ? 0 : 0.08;
  raw += ctx.networkType === 'datacenter' ? 0.1 : 0;
  raw += ctx.vpnOrProxy ? 0.04 : 0;
  raw += repeatedKeyword && v.source === 'paid' ? 0.08 : 0;
  raw += deviceChanged ? 0.06 : 0;
  raw += locationChanged ? 0.06 : 0;
  raw += v.formResult === 'invalid' ? 0.08 : 0;
  raw -= v.converted ? 0.5 : 0;
  raw -= v.formResult === 'valid' ? 0.2 : 0;
  raw -= isEngaged(v) ? 0.1 : 0;
  return raw * 0.45;
}

const ms = (iso: string) => new Date(iso).getTime();

function spanLabel(first: Visit, last: Visit) {
  return formatDuration(ms(last.occurredAt) - ms(first.occurredAt));
}

function listVisits(visits: Visit[], all: Visit[]) {
  const ns = visits.map((v) => all.indexOf(v) + 1);
  if (ns.length === 1) return `visit ${ns[0]}`;
  return `visits ${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}`;
}

/** Everything the system can say about the journey up to and including `upTo`, ranked. */
export function collectEvidence(all: Visit[], upTo: number, ctx: JourneyContext): Evidence[] {
  const window = all.slice(0, upTo + 1);
  const paid = window.filter((v) => v.source === 'paid');
  const out: Array<Evidence & { weight: number }> = [];
  let n = 0;
  const push = (kind: Evidence['kind'], weight: number, statement: string, visitIds: string[], rawValue?: string, label?: string) => {
    n += 1;
    out.push({ id: `e-${n}`, kind, statement, label, rawValue, visitIds, weight });
  };

  if (paid.length >= 3) {
    const span = spanLabel(paid[0], paid[paid.length - 1]);
    const short = ms(paid[paid.length - 1].occurredAt) - ms(paid[0].occurredAt) < 3 * 3600 * 1000;
    const spanMs = ms(paid[paid.length - 1].occurredAt) - ms(paid[0].occurredAt);
    push('primary', short ? 0.35 : 0.2, `${paid.length} paid clicks in ${span}`, paid.map((v) => v.id), `paid=[${paid.map((v) => v.occurredAt.slice(11, 19)).join(', ')}] span=${span}`, `${paid.length} paid clicks / ${shortDuration(spanMs)}`);
  }

  const shallow = window.filter(isShallow);
  const shallowMajority = shallow.length >= 2 && shallow.length / window.length >= 0.6;
  const noPointer = window.filter((v) => !v.engagement.pointerMoved);
  const noPointerAll = noPointer.length >= 2 && noPointer.length === window.length;
  if (shallowMajority) {
    push('primary', 0.25, `No scroll and under 6 seconds on the page across ${shallow.length} of ${window.length} visits`, shallow.map((v) => v.id), `scroll=[${window.map((v) => v.engagement.scrollDepth).join(', ')}] duration_s=[${window.map((v) => v.engagement.durationSec).join(', ')}]`, noPointerAll ? 'No interaction' : 'Low interaction');
  }
  if (noPointerAll) {
    /* Its label is carried by "No interaction" when engagement is already shallow. */
    push('supporting', 0.15, 'No mouse movement on any visit', noPointer.map((v) => v.id), undefined, shallowMajority ? undefined : 'No pointer movement');
  }

  const avgBot = window.reduce((s, v) => s + v.botProbability, 0) / window.length;
  if (avgBot >= 0.6) {
    push('supporting', 0.2, `Automation likelihood ${Math.round(avgBot * 100)}%`, window.filter((v) => v.botProbability >= 0.6).map((v) => v.id), `bot_probability=[${window.map((v) => v.botProbability).join(', ')}]`, `Bot: ${Math.round(avgBot * 100)}%`);
  }

  if (ctx.networkType === 'datacenter') {
    push('supporting', 0.15, 'Datacenter network, not a residential or mobile connection', window.map((v) => v.id), undefined, 'Datacenter');
  }
  if (ctx.vpnOrProxy) {
    push('supporting', 0.08, 'Connection hides its location (VPN or proxy)', window.map((v) => v.id), undefined, 'VPN detected');
  }

  const keywords = new Set(paid.map((v) => v.keyword));
  if (paid.length >= 3 && keywords.size === 1 && paid[0].keyword) {
    push('supporting', 0.12, `Every paid click on the same keyword, "${paid[0].keyword}"`, paid.map((v) => v.id), undefined, 'Same keyword');
  }

  const devices = new Set(window.map((v) => v.device.id));
  if (devices.size >= 3 && window.length >= 3) {
    push('supporting', 0.14, `${devices.size} device identities from one IP in ${spanLabel(window[0], window[window.length - 1])}`, window.map((v) => v.id), `devices=[${[...devices].join(', ')}]`, `${devices.size} devices`);
  }

  const cities = new Set(window.map((v) => v.location.city));
  if (cities.size >= 2) {
    push('supporting', 0.12, `Reported location changed ${cities.size - 1 === 1 ? 'once' : `${cities.size - 1} times`} in ${spanLabel(window[0], window[window.length - 1])}`, window.map((v) => v.id), `cities=[${[...cities].join(', ')}]`, 'Location changed');
  }

  const badForm = window.filter((v) => v.formResult === 'invalid');
  if (badForm.length) {
    push('supporting', 0.1, `Form submitted with an undeliverable email address on ${listVisits(badForm, all)}`, badForm.map((v) => v.id), undefined, 'Email: Invalid');
  }
  /* Conversion is evidence in its own right, like deliverability. A form without a purchase is noted. */
  const submitted = window.filter((v) => v.formResult !== 'not-submitted');
  if (submitted.length && !window.some((v) => v.converted)) {
    push('supporting', 0.06, `Submitted a form on ${listVisits(submitted, all)} but did not convert`, submitted.map((v) => v.id), undefined, 'No conversion');
  }

  /* Contradictory evidence is shown, never hidden. */
  const converted = window.filter((v) => v.converted);
  if (converted.length) {
    push('contradictory', 0.5, `Completed a purchase on ${listVisits(converted, all)}`, converted.map((v) => v.id), undefined, 'Converted');
  }
  const validForm = window.filter((v) => v.formResult === 'valid');
  if (validForm.length) {
    push('contradictory', 0.3, `Submitted a valid form with a deliverable email address on ${listVisits(validForm, all)}`, validForm.map((v) => v.id), undefined, 'Email: Valid');
  }
  const engaged = window.filter(isEngaged);
  if (engaged.length && engaged.length === window.length) {
    push('contradictory', 0.25, 'Real engagement on every visit: scrolled and stayed over 45 seconds each time', engaged.map((v) => v.id), undefined, 'High interaction');
  } else if (engaged.length) {
    push('contradictory', 0.15, `Over 45 seconds on the page with real scrolling on ${listVisits(engaged, all)}`, engaged.map((v) => v.id), undefined, `High interaction (${engaged.length} of ${window.length})`);
  }

  const noJs = window.filter((v) => !v.engagement.jsEnabled);
  if (noJs.length) {
    push('missing', 0.05, `Device fingerprint unavailable because JavaScript was blocked on ${noJs.length === window.length ? 'every visit' : listVisits(noJs, all)}`, noJs.map((v) => v.id), undefined, 'No fingerprint');
  }

  const order: Record<Evidence['kind'], number> = { primary: 0, supporting: 1, contradictory: 2, missing: 3 };
  return out
    .sort((a, b) => order[a.kind] - order[b.kind] || b.weight - a.weight)
    .map(({ weight: _w, ...e }) => e);
}

/** The verdict in one sentence (D4). Velocity is the most legible story, so it leads. */
export function summarize(all: Visit[], upTo: number, ctx: JourneyContext): string {
  const window = all.slice(0, upTo + 1);
  const paid = window.filter((v) => v.source === 'paid');
  const shallow = window.filter(isShallow).length / window.length >= 0.6;
  const noPointer = window.every((v) => !v.engagement.pointerMoved);
  const lead =
    paid.length >= 3
      ? `The visitor returned through ${paid.length} paid ads in ${spanLabel(paid[0], paid[paid.length - 1])}`
      : `The visitor made ${window.length} visits in ${spanLabel(window[0], window[window.length - 1])}`;
  const clauses = [
    shallow && noPointer ? 'showed no scroll or mouse movement' : shallow ? 'left within seconds each time' : undefined,
    ctx.networkType === 'datacenter' ? 'connected through a datacenter network' : ctx.vpnOrProxy ? 'connected behind a VPN' : undefined,
  ].filter((c): c is string => Boolean(c));
  if (clauses.length === 2) return `${lead}, ${clauses[0]}, and ${clauses[1]}.`;
  if (clauses.length === 1) return `${lead} and ${clauses[0]}.`;
  return `${lead}.`;
}

/** D5. Conflicting when the evidence disagrees with itself; high only with an automation
    signal behind the pattern; moderate when the pattern alone crossed the line. */
function confidenceFor(evidence: Evidence[], window: Visit[]): Confidence {
  if (evidence.some((e) => e.kind === 'contradictory')) return 'conflicting';
  const avgBot = window.reduce((s, v) => s + v.botProbability, 0) / window.length;
  return avgBot >= 0.6 ? 'high' : 'moderate';
}

/** D8: what is being watched, then why it has not blocked. */
export function monitoringNote(all: Visit[], ctx: JourneyContext): string {
  const paid = all.filter((v) => v.source === 'paid');
  const shallowCount = all.filter(isShallow).length;
  const signals: string[] = [];
  if (paid.length >= 2) signals.push(`${paid.length} paid visits in ${spanLabel(paid[0], paid[paid.length - 1])}`);
  if (shallowCount >= 2) signals.push(`${shallowCount === all.length ? 'shallow engagement on every visit' : `shallow engagement on ${shallowCount} of ${all.length} visits`}`);
  if (ctx.vpnOrProxy) signals.push('a connection that hides its location');
  if (ctx.networkType === 'datacenter') signals.push('a datacenter network');
  if (!signals.length) signals.push(`${all.length} visits with mixed signals`);

  const reasons: string[] = [];
  const avgBot = all.reduce((s, v) => s + v.botProbability, 0) / all.length;
  if (avgBot < 0.6) reasons.push('there is no automation signal');
  if (all.some((v) => v.converted)) reasons.push('a purchase was completed');
  else if (all.some((v) => v.formResult === 'valid')) reasons.push('a valid form was submitted');
  if (all.every(isEngaged)) reasons.push('engagement is real on every visit');
  if (all.length <= 3) reasons.push(`the history is ${all.length === 2 ? 'two' : 'three'} visits long`);
  if (!reasons.length) reasons.push('the pattern has not repeated enough to be sure');

  const join = (xs: string[]) => (xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
  return `Monitoring: ${join(signals)}. Not blocked because ${join(reasons)}.`;
}

/** Walk the journey; block at the first visit where cumulative evidence crosses the line. */
export function evaluate(all: Visit[], ctx: JourneyContext): Evaluation {
  if (all.length < MIN_HISTORY) return { status: 'not-evaluated' };
  let score = 0;
  for (let i = 0; i < all.length; i++) {
    const v = all[i];
    const before = all.slice(0, i);
    const repeated = before.filter((p) => p.source === 'paid' && p.keyword === v.keyword).length >= 2;
    const deviceChanged = before.length > 0 && !before.some((p) => p.device.id === v.device.id);
    const locationChanged = before.length > 0 && !before.some((p) => p.location.city === v.location.city);
    score = Math.max(0, Math.min(1, score + increment(v, ctx, repeated, deviceChanged, locationChanged)));
    if (i >= MIN_HISTORY - 1 && score >= BLOCK_THRESHOLD) {
      const evidence = collectEvidence(all, i, ctx);
      return {
        status: 'blocked',
        decision: {
          madeAt: v.occurredAt,
          afterVisitId: v.id,
          confidence: confidenceFor(evidence, all.slice(0, i + 1)),
          summary: summarize(all, i, ctx),
          evidence,
        },
      };
    }
  }
  /* A connection that hides its location plus repeated paid clicks stays under evaluation
     until something decisive (a purchase) arrives, whatever the score says. */
  const paidCount = all.filter((v) => v.source === 'paid').length;
  const watchByRule = ctx.vpnOrProxy && paidCount >= 2 && !all.some((v) => v.converted);
  if (score >= MONITOR_THRESHOLD || watchByRule) {
    const evidence = collectEvidence(all, all.length - 1, ctx);
    return {
      status: 'monitoring',
      monitoring: {
        since: all[all.length - 1].occurredAt,
        note: monitoringNote(all, ctx),
        confidence: evidence.some((e) => e.kind === 'contradictory') ? 'conflicting' : 'insufficient',
        evidence,
      },
    };
  }
  return { status: 'not-blocked' };
}
