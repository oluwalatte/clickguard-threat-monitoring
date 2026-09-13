/**
 * Seeded, deterministic filler around the eight golden cases. Archetypes are mixed so
 * search, filters and sorts are meaningful, and every generated journey is judged by the
 * same engine that the tests check against the golden cases.
 *
 * Mechanics encoded: cumulative evaluation per journey; the decision at the first visit
 * over the line; exclusion sync as separate events with their own timings, which may be
 * delayed or fail; no paid visit reaches the site on a platform once its exclusion is
 * active, while organic and direct returns still can (D11).
 */
import { DEVICES, LOCATIONS, NOW, visit } from './builders';
import { evaluate } from './engine';
import { GOLDEN_CASES } from './golden';
import type { AdPlatform, Device, Engagement, ExclusionEvent, FormResult, Location, NetworkType, Source, Visit, Visitor } from './types';

export const DEFAULT_SEED = 42;
export const DEFAULT_COUNT = 48;

type Archetype = 'shopper' | 'comparison' | 'vpn' | 'clickfarm' | 'competitor' | 'single' | 'corporate';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const pick = <T,>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
const between = (r: Rng, a: number, b: number) => a + r() * (b - a);
const round2 = (n: number) => Math.round(n * 100) / 100;

const ALL_LOCATIONS = Object.values(LOCATIONS) as Location[];
const DATACENTER_LOCATIONS = [LOCATIONS.frankfurt, LOCATIONS.amsterdam, LOCATIONS.singapore, LOCATIONS.sanJose];
const ALL_DEVICES = Object.values(DEVICES) as Device[];
const HUMAN_DEVICES = ALL_DEVICES.filter((d) => d !== DEVICES.headlessLinux);
const KEYWORDS = ['click fraud protection', 'ppc fraud', 'block bot clicks', 'invalid traffic google ads', 'clickguard', 'competitor clicking my ads', 'ad fraud software', 'protect adwords budget'];
const CPC: Record<string, number> = { 'click fraud protection': 4.8, 'ppc fraud': 3.9, 'block bot clicks': 3.1, 'invalid traffic google ads': 5.6, clickguard: 1.4, 'competitor clicking my ads': 6.2, 'ad fraud software': 4.4, 'protect adwords budget': 2.7 };
const PAGES = ['/', '/pricing', '/features/threat-monitoring', '/blog/what-is-click-fraud', '/signup', '/compare'];
const META_CAMPAIGNS = ['Retargeting Display', 'Prospecting LATAM', 'Lookalike US'];

function ipv4(r: Rng, taken: Set<string>): string {
  for (;;) {
    const o1 = Math.floor(between(r, 11, 223));
    const o2 = Math.floor(between(r, 0, 255));
    const o3 = Math.floor(between(r, 0, 255));
    const o4 = Math.floor(between(r, 1, 254));
    if (o1 === 127 || (o1 === 192 && o2 === 168) || (o1 === 172 && o2 >= 16 && o2 <= 31) || o1 === 10) continue;
    const ip = `${o1}.${o2}.${o3}.${o4}`;
    if (!taken.has(ip)) {
      taken.add(ip);
      return ip;
    }
  }
}

interface Shape {
  source: Source;
  engagement: Engagement;
  bot: number;
  form: FormResult;
  convert: boolean;
  keyword?: string;
  gapMin: number;
  device: Device;
}

function engagement(r: Rng, shallow: boolean, pointer = true): Engagement {
  return shallow
    ? { durationSec: Math.round(between(r, 0, 5)), scrollDepth: round2(between(r, 0, 0.08)), clicks: r() < 0.7 ? 0 : 1, pointerMoved: pointer, jsEnabled: true }
    : { durationSec: Math.round(between(r, 45, 340)), scrollDepth: round2(between(r, 0.4, 1)), clicks: Math.round(between(r, 1, 9)), pointerMoved: true, jsEnabled: true };
}

function shapeFor(r: Rng, a: Archetype, i: number, keyword: string, device: Device): Shape {
  switch (a) {
    case 'shopper': {
      const paid = r() < 0.5;
      return { source: paid ? 'paid' : pick(r, ['organic', 'direct', 'referral'] as const), engagement: engagement(r, r() < 0.15), bot: between(r, 0.02, 0.18), form: r() < 0.12 ? 'valid' : 'not-submitted', convert: r() < 0.1, keyword: paid ? pick(r, KEYWORDS) : undefined, gapMin: between(r, 600, 7000), device };
    }
    case 'corporate':
      return { source: i === 0 ? 'paid' : pick(r, ['direct', 'organic'] as const), engagement: engagement(r, false), bot: between(r, 0.05, 0.2), form: i === 2 ? 'valid' : 'not-submitted', convert: false, keyword: pick(r, KEYWORDS), gapMin: between(r, 1200, 4000), device };
    case 'comparison':
      return { source: 'paid', engagement: engagement(r, i % 2 === 1), bot: between(r, 0.18, 0.4), form: 'not-submitted', convert: false, keyword, gapMin: between(r, 400, 2400), device };
    case 'vpn':
      return { source: i === 0 ? 'paid' : pick(r, ['paid', 'organic'] as const), engagement: engagement(r, r() < 0.3), bot: between(r, 0.25, 0.45), form: 'not-submitted', convert: false, keyword, gapMin: between(r, 120, 1500), device };
    case 'clickfarm':
      return { source: 'paid', engagement: { ...engagement(r, true, false), jsEnabled: r() < 0.5 }, bot: between(r, 0.86, 0.99), form: r() < 0.15 ? 'invalid' : 'not-submitted', convert: false, keyword: pick(r, KEYWORDS), gapMin: between(r, 3, 14), device: DEVICES.headlessLinux };
    case 'competitor':
      return { source: 'paid', engagement: engagement(r, r() < 0.85, r() < 0.6), bot: between(r, 0.2, 0.42), form: 'not-submitted', convert: false, keyword, gapMin: between(r, 900, 1800), device };
    case 'single':
      return { source: r() < 0.6 ? 'paid' : 'organic', engagement: engagement(r, r() < 0.4), bot: between(r, 0.05, 0.3), form: 'not-submitted', convert: false, keyword: pick(r, KEYWORDS), gapMin: 0, device };
  }
}

function syncEventsFor(r: Rng, platforms: AdPlatform[], decidedAtMs: number, id: string): ExclusionEvent[] {
  const out: ExclusionEvent[] = [];
  platforms.forEach((platform, k) => {
    const name = platform === 'google-ads' ? 'Google Ads' : 'Meta Ads';
    const queued = decidedAtMs + 2000 + k * 1000;
    out.push({ id: `${id}-s${k}-p`, platform, state: 'pending', at: new Date(queued).toISOString(), note: `${name} exclusion queued. Blocking begins when the platform confirms it.` });
    const roll = r();
    if (platform === 'meta-ads' && roll < 0.3) {
      out.push({ id: `${id}-s${k}-f`, platform, state: 'failed', at: new Date(queued + between(r, 2, 6) * 60000).toISOString(), note: `${name} rejected the exclusion request twice. This visitor can still reach the site through ${name}.` });
      return;
    }
    let activeAt = queued + between(r, 4, 20) * 60000;
    if (roll > 0.85) {
      const delayedAt = queued + 15 * 60000;
      out.push({ id: `${id}-s${k}-d`, platform, state: 'delayed', at: new Date(delayedAt).toISOString(), note: `${name} had not confirmed the exclusion after 15 minutes. Paid clicks can still reach the site.` });
      activeAt = delayedAt + between(r, 5, 30) * 60000;
    }
    out.push({ id: `${id}-s${k}-a`, platform, state: 'active', at: new Date(activeAt).toISOString(), note: `${name} confirmed the exclusion.` });
  });
  return out;
}

function generateOne(r: Rng, a: Archetype, taken: Set<string>): Visitor {
  const isDc = a === 'clickfarm' && r() < 0.85;
  const location = isDc ? pick(r, DATACENTER_LOCATIONS) : pick(r, ALL_LOCATIONS);
  const networkType: NetworkType = isDc ? 'datacenter' : a === 'corporate' ? 'corporate' : r() < 0.3 ? 'mobile' : 'residential';
  const vpnOrProxy = a === 'vpn' || (a === 'clickfarm' && r() < 0.5) || (a === 'shopper' && r() < 0.04);
  const keyword = pick(r, KEYWORDS);
  const platform: AdPlatform = r() < 0.75 ? 'google-ads' : 'meta-ads';
  const device = a === 'clickfarm' ? DEVICES.headlessLinux : pick(r, HUMAN_DEVICES);
  const n =
    a === 'single' ? 1 : a === 'shopper' ? Math.floor(between(r, 2, 5)) : a === 'corporate' ? Math.floor(between(r, 3, 6)) : a === 'comparison' ? Math.floor(between(r, 4, 8)) : a === 'vpn' ? Math.floor(between(r, 3, 6)) : a === 'clickfarm' ? Math.floor(between(r, 6, 13)) : Math.floor(between(r, 6, 11));
  const ip = ipv4(r, taken);
  const id = ip;

  let t = new Date(NOW).getTime() - between(r, 1, 26) * 86400000;
  const visits: Visit[] = [];
  const ctx = { networkType, vpnOrProxy };
  let decisionIndex = -1;
  let exclusionEvents: ExclusionEvent[] = [];

  for (let i = 0; i < n; i++) {
    const sh = shapeFor(r, a, i, keyword, device);
    if (i > 0) t += sh.gapMin * 60000;
    if (t > new Date(NOW).getTime()) break;
    const afterDecision = decisionIndex >= 0;
    /* After a decision the ads are hidden once the exclusion is active, so only organic
       and direct returns remain. A platform whose sync failed can still deliver paid clicks. */
    let source: Source = sh.source;
    if (afterDecision) {
      const failedPlatform = exclusionEvents.find((e) => e.state === 'failed')?.platform;
      source = failedPlatform && r() < 0.4 ? 'paid' : r() < 0.6 ? 'organic' : 'direct';
    }
    const paidPlatform = source === 'paid' ? (afterDecision ? (exclusionEvents.find((e) => e.state === 'failed')?.platform ?? platform) : platform) : undefined;
    const kw = source === 'paid' ? (sh.keyword ?? keyword) : undefined;
    const v = visit({
      id: `${id}-v${i + 1}`,
      occurredAt: new Date(t).toISOString(),
      source,
      platform: paidPlatform,
      campaign: paidPlatform === 'google-ads' ? (kw === 'clickguard' ? 'Brand Search' : kw === 'competitor clicking my ads' ? 'Competitor Search' : 'Non-brand Search') : paidPlatform === 'meta-ads' ? pick(r, META_CAMPAIGNS) : undefined,
      keyword: paidPlatform === 'google-ads' ? kw : undefined,
      cpc: paidPlatform ? (r() < 0.06 ? undefined : round2((paidPlatform === 'meta-ads' ? 1.9 : CPC[kw ?? keyword]) * between(r, 0.8, 1.25))) : undefined,
      landingPage: pick(r, PAGES),
      location,
      device: afterDecision ? pick(r, HUMAN_DEVICES) : sh.device,
      networkType,
      vpnOrProxy,
      engagement: afterDecision ? engagement(r, r() < 0.2) : sh.engagement,
      botProbability: round2(afterDecision ? between(r, 0.05, 0.2) : sh.bot),
      formResult: afterDecision ? 'not-submitted' : sh.form,
      converted: afterDecision ? false : sh.convert,
    });
    visits.push(v);

    if (!afterDecision && a !== 'shopper' && a !== 'single' && a !== 'corporate') {
      const ev = evaluate(visits, ctx);
      if (ev.status === 'blocked') {
        decisionIndex = i;
        exclusionEvents = syncEventsFor(r, [...new Set(visits.flatMap((x) => (x.platform ? [x.platform] : [])))], t, id);
        /* Skip ahead so only a few post-decision returns are emitted. */
        const after = Math.floor(between(r, 0, 3.5));
        i = Math.max(i, n - 1 - after);
        /* Returns, if any, come after the last sync event; the next iteration adds its own gap on top. */
        const lastEvent = exclusionEvents[exclusionEvents.length - 1];
        t = Math.max(t, lastEvent ? new Date(lastEvent.at).getTime() : t) + between(r, 60, 2000) * 60000;
      }
    }
  }

  const evaluation = evaluate(visits, ctx);
  const visitor: Visitor = {
    id,
    ip,
    location,
    networkType,
    vpnOrProxy,
    visits,
    status: evaluation.status,
    decision: evaluation.decision,
    monitoring: evaluation.monitoring,
    exclusionEvents: evaluation.decision ? exclusionEvents : [],
  };
  return visitor;
}

/** Golden cases first, then seeded filler up to `count`. Deterministic for a seed. */
export function generateVisitors(seed = DEFAULT_SEED, count = DEFAULT_COUNT): Visitor[] {
  const r = mulberry32(seed);
  const taken = new Set(GOLDEN_CASES.map((g) => g.ip));
  const fillerCount = Math.max(0, count - GOLDEN_CASES.length);
  const plan: [Archetype, number][] = [['shopper', 0.42], ['comparison', 0.12], ['vpn', 0.05], ['clickfarm', 0.15], ['competitor', 0.1], ['single', 0.1], ['corporate', 0.06]];
  const mix: Archetype[] = [];
  for (const [a, share] of plan) for (let k = 0; k < Math.round(fillerCount * share); k++) mix.push(a);
  while (mix.length < fillerCount) mix.push('shopper');
  mix.length = fillerCount;

  const filler = mix.map((a) => generateOne(r, a, taken));

  /* One override, so the vocabulary in D3 is complete on screen. The data keeps room for it (D9). */
  const overridden = filler.find((v) => v.status === 'blocked' && v.decision?.confidence === 'moderate' && v.exclusionEvents.every((e) => e.state !== 'failed'));
  if (overridden) {
    overridden.manualOverride = {
      kind: 'allowed',
      by: 'Ada O.',
      at: new Date(new Date(overridden.decision!.madeAt).getTime() + 26 * 3600000).toISOString(),
      note: 'Internal QA traffic from the agency office. Real people, not a competitor.',
    };
  }

  return [...GOLDEN_CASES, ...filler];
}
