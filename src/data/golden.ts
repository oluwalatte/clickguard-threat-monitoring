/**
 * The eight golden cases from docs/decisions.md, hand-authored before any generated rows.
 * The outcome of each (status, the visit a decision followed, confidence, the summary
 * sentence, the sync events) is written here as the contract. The evidence lists are
 * produced by the shared evidence writer from the authored visits, so they cannot drift
 * from the data they describe.
 */
import { DEVICES, LOCATIONS, SHALLOW, SHALLOW_HUMAN, visit } from './builders';
import { collectEvidence } from './engine';
import type { Visit, Visitor } from './types';

const paidGoogle = (keyword: string, cpc: number) => ({ source: 'paid' as const, platform: 'google-ads' as const, campaign: 'Non-brand Search', keyword, cpc });
const paidMeta = (campaign: string, cpc: number) => ({ source: 'paid' as const, platform: 'meta-ads' as const, campaign, cpc });

function decided(visits: Visit[], afterIndex: number, ctx: { networkType: Visitor['networkType']; vpnOrProxy: boolean }, upTo = afterIndex) {
  return { madeAt: visits[afterIndex].occurredAt, afterVisitId: visits[afterIndex].id, evidence: collectEvidence(visits, upTo, ctx) };
}

/* 1. Clearly malicious: datacenter IP, repeated paid clicks minutes apart, no engagement, high automation. */
const c1Visits: Visit[] = [
  visit({ id: 'c1-v1', occurredAt: '2026-09-11T14:12:08Z', ...paidGoogle('ppc fraud', 9.6), landingPage: '/pricing', location: LOCATIONS.frankfurt, device: DEVICES.headlessLinux, networkType: 'datacenter', engagement: { ...SHALLOW, jsEnabled: false }, botProbability: 0.93 }),
  visit({ id: 'c1-v2', occurredAt: '2026-09-11T14:26:31Z', ...paidGoogle('ppc fraud', 9.6), landingPage: '/pricing', location: LOCATIONS.frankfurt, device: DEVICES.headlessLinux, networkType: 'datacenter', engagement: { ...SHALLOW, durationSec: 2, jsEnabled: false }, botProbability: 0.95 }),
  visit({ id: 'c1-v3', occurredAt: '2026-09-11T14:41:02Z', ...paidGoogle('ppc fraud', 9.6), landingPage: '/pricing', location: LOCATIONS.frankfurt, device: DEVICES.headlessLinux, networkType: 'datacenter', engagement: { ...SHALLOW, durationSec: 4, jsEnabled: false }, botProbability: 0.96 }),
  visit({ id: 'c1-v4', occurredAt: '2026-09-11T14:53:20Z', ...paidGoogle('ppc fraud', 9.6), landingPage: '/pricing', location: LOCATIONS.frankfurt, device: DEVICES.headlessLinux, networkType: 'datacenter', engagement: { ...SHALLOW, durationSec: 2, jsEnabled: false }, botProbability: 0.94 }),
  visit({ id: 'c1-v5', occurredAt: '2026-09-12T09:10:00Z', source: 'direct', landingPage: '/pricing', location: LOCATIONS.frankfurt, device: DEVICES.headlessLinux, networkType: 'datacenter', engagement: { ...SHALLOW, durationSec: 3, jsEnabled: false }, botProbability: 0.92 }),
];
const c1ctx = { networkType: 'datacenter' as const, vpnOrProxy: false };
export const CASE_1_CLEARLY_MALICIOUS: Visitor = {
  id: '185.220.101.34',
  ip: '185.220.101.34',
  location: LOCATIONS.frankfurt,
  ...c1ctx,
  visits: c1Visits,
  status: 'blocked',
  decision: {
    ...decided(c1Visits, 3, c1ctx),
    confidence: 'high',
    summary: 'Returned through four paid ads in 41 minutes and showed no scroll or mouse movement on any visit, from a datacenter network.',
  },
  exclusionEvents: [
    { id: 'c1-s1', platform: 'google-ads', state: 'pending', at: '2026-09-11T14:53:22Z', note: 'Google Ads exclusion queued. Blocking begins when the platform confirms it.' },
    { id: 'c1-s2', platform: 'google-ads', state: 'active', at: '2026-09-11T15:02:10Z', note: 'Google Ads confirmed the exclusion.' },
  ],
  goldenCase: 1,
};

/* 2. Clearly legitimate: residential, real engagement, valid form, conversion. */
const c2Visits: Visit[] = [
  visit({ id: 'c2-v1', occurredAt: '2026-09-08T16:04:10Z', ...paidGoogle('click fraud protection', 4.8), landingPage: '/features/threat-monitoring', location: LOCATIONS.austin, device: DEVICES.chromeMac, engagement: { durationSec: 184, scrollDepth: 0.85, clicks: 6, pointerMoved: true, jsEnabled: true }, botProbability: 0.04 }),
  visit({ id: 'c2-v2', occurredAt: '2026-09-09T10:22:45Z', source: 'organic', landingPage: '/pricing', location: LOCATIONS.austin, device: DEVICES.chromeMac, engagement: { durationSec: 412, scrollDepth: 1, clicks: 11, pointerMoved: true, jsEnabled: true }, botProbability: 0.03, formResult: 'valid', converted: true }),
];
export const CASE_2_CLEARLY_LEGITIMATE: Visitor = {
  id: '98.42.17.203',
  ip: '98.42.17.203',
  location: LOCATIONS.austin,
  networkType: 'residential',
  vpnOrProxy: false,
  visits: c2Visits,
  status: 'not-blocked',
  exclusionEvents: [],
  goldenCase: 2,
};

/* 3. Ambiguous VPN: location hidden, but strong engagement and a valid form. Monitoring, conflicting. */
const c3Visits: Visit[] = [
  visit({ id: 'c3-v1', occurredAt: '2026-09-10T08:15:30Z', ...paidMeta('Retargeting Display', 2.7), landingPage: '/', location: LOCATIONS.amsterdam, device: DEVICES.firefoxLinux, vpnOrProxy: true, engagement: { durationSec: 72, scrollDepth: 0.6, clicks: 3, pointerMoved: true, jsEnabled: true }, botProbability: 0.31 }),
  visit({ id: 'c3-v2', occurredAt: '2026-09-11T19:48:02Z', ...paidGoogle('ad fraud software', 4.4), landingPage: '/compare', location: LOCATIONS.amsterdam, device: DEVICES.firefoxLinux, vpnOrProxy: true, engagement: { durationSec: 236, scrollDepth: 0.9, clicks: 7, pointerMoved: true, jsEnabled: true }, botProbability: 0.28, formResult: 'valid' }),
  visit({ id: 'c3-v3', occurredAt: '2026-09-12T07:30:44Z', ...paidGoogle('ad fraud software', 4.4), landingPage: '/pricing', location: LOCATIONS.amsterdam, device: DEVICES.firefoxLinux, vpnOrProxy: true, engagement: { durationSec: 121, scrollDepth: 0.75, clicks: 4, pointerMoved: true, jsEnabled: true }, botProbability: 0.34 }),
];
const c3ctx = { networkType: 'residential' as const, vpnOrProxy: true };
export const CASE_3_AMBIGUOUS_VPN: Visitor = {
  id: '146.70.113.58',
  ip: '146.70.113.58',
  location: LOCATIONS.amsterdam,
  ...c3ctx,
  visits: c3Visits,
  status: 'monitoring',
  monitoring: {
    since: c3Visits[2].occurredAt,
    note: 'Monitoring: 3 paid visits in 2 days and a connection that hides its location. Not blocked because engagement is real on every visit and a valid form was submitted.',
    confidence: 'conflicting',
    evidence: collectEvidence(c3Visits, 2, c3ctx),
  },
  exclusionEvents: [],
  goldenCase: 3,
};

/* 4. Monitoring: suspicious velocity, too little history to block. */
const c4Visits: Visit[] = [
  visit({ id: 'c4-v1', occurredAt: '2026-09-13T09:56:40Z', ...paidGoogle('ppc fraud', 3.9), landingPage: '/pricing', location: LOCATIONS.atlanta, device: DEVICES.chromeWindows, engagement: SHALLOW_HUMAN, botProbability: 0.3 }),
  visit({ id: 'c4-v2', occurredAt: '2026-09-13T10:01:12Z', ...paidGoogle('ppc fraud', 3.9), landingPage: '/pricing', location: LOCATIONS.atlanta, device: DEVICES.chromeWindows, engagement: { ...SHALLOW_HUMAN, durationSec: 21, scrollDepth: 0.2 }, botProbability: 0.27 }),
  visit({ id: 'c4-v3', occurredAt: '2026-09-13T10:08:57Z', ...paidGoogle('ppc fraud', 3.9), landingPage: '/pricing', location: LOCATIONS.atlanta, device: DEVICES.chromeWindows, engagement: SHALLOW_HUMAN, botProbability: 0.33 }),
];
const c4ctx = { networkType: 'residential' as const, vpnOrProxy: false };
export const CASE_4_MONITORING_VELOCITY: Visitor = {
  id: '72.14.201.88',
  ip: '72.14.201.88',
  location: LOCATIONS.atlanta,
  ...c4ctx,
  visits: c4Visits,
  status: 'monitoring',
  monitoring: {
    since: c4Visits[2].occurredAt,
    note: 'Monitoring: 3 paid visits in 12 minutes with shallow engagement. Not blocked because there is no automation signal and the history is three visits long.',
    confidence: 'insufficient',
    evidence: collectEvidence(c4Visits, 2, c4ctx),
  },
  exclusionEvents: [],
  goldenCase: 4,
};

/* 5. Post-block organic return that converts: conflicting evidence, not proof of a false positive. */
const c5Base = { landingPage: '/pricing', location: LOCATIONS.lagos, device: DEVICES.chromeAndroid, networkType: 'mobile' as const };
const c5Visits: Visit[] = [
  visit({ id: 'c5-v1', occurredAt: '2026-09-04T11:02:15Z', ...paidGoogle('competitor clicking my ads', 6.2), ...c5Base, engagement: SHALLOW_HUMAN, botProbability: 0.36 }),
  visit({ id: 'c5-v2', occurredAt: '2026-09-04T18:40:51Z', ...paidGoogle('competitor clicking my ads', 6.2), ...c5Base, engagement: { ...SHALLOW_HUMAN, pointerMoved: false }, botProbability: 0.4 }),
  visit({ id: 'c5-v3', occurredAt: '2026-09-05T12:11:09Z', ...paidGoogle('competitor clicking my ads', 6.2), ...c5Base, engagement: SHALLOW_HUMAN, botProbability: 0.38 }),
  visit({ id: 'c5-v4', occurredAt: '2026-09-05T20:03:33Z', ...paidGoogle('competitor clicking my ads', 6.2), ...c5Base, engagement: { ...SHALLOW_HUMAN, pointerMoved: false }, botProbability: 0.42 }),
  visit({ id: 'c5-v5', occurredAt: '2026-09-06T10:27:48Z', ...paidGoogle('competitor clicking my ads', 6.2), ...c5Base, engagement: SHALLOW_HUMAN, botProbability: 0.39 }),
  visit({ id: 'c5-v6', occurredAt: '2026-09-06T19:55:02Z', ...paidGoogle('competitor clicking my ads', 6.2), ...c5Base, engagement: { ...SHALLOW_HUMAN, pointerMoved: false }, botProbability: 0.41 }),
  visit({ id: 'c5-v7', occurredAt: '2026-09-08T15:20:19Z', source: 'organic', ...c5Base, landingPage: '/features/threat-monitoring', engagement: { durationSec: 251, scrollDepth: 0.95, clicks: 9, pointerMoved: true, jsEnabled: true }, botProbability: 0.06, formResult: 'valid', converted: true }),
];
const c5ctx = { networkType: 'mobile' as const, vpnOrProxy: false };
export const CASE_5_ORGANIC_RETURN_CONVERTS: Visitor = {
  id: '41.190.3.77',
  ip: '41.190.3.77',
  location: LOCATIONS.lagos,
  ...c5ctx,
  visits: c5Visits,
  status: 'blocked',
  decision: {
    ...decided(c5Visits, 5, c5ctx, 6),
    confidence: 'conflicting',
    summary: 'Returned through 6 paid ads in 2 days on one keyword and left within seconds each time. Two days after the block, an organic visit converted; that conflicts with the earlier evidence and is not by itself proof the block was wrong.',
  },
  exclusionEvents: [
    { id: 'c5-s1', platform: 'google-ads', state: 'pending', at: '2026-09-06T19:55:04Z', note: 'Google Ads exclusion queued. Blocking begins when the platform confirms it.' },
    { id: 'c5-s2', platform: 'google-ads', state: 'active', at: '2026-09-06T20:06:40Z', note: 'Google Ads confirmed the exclusion.' },
  ],
  goldenCase: 5,
};

/* 6. Sync delay: a paid click after the decision, before the exclusion became active. */
const c6Base = { landingPage: '/pricing', location: LOCATIONS.amsterdam, device: DEVICES.headlessLinux, networkType: 'datacenter' as const };
const c6Visits: Visit[] = [
  visit({ id: 'c6-v1', occurredAt: '2026-09-12T08:00:00Z', ...paidGoogle('invalid traffic google ads', 5.6), ...c6Base, engagement: SHALLOW, botProbability: 0.9 }),
  visit({ id: 'c6-v2', occurredAt: '2026-09-12T08:07:30Z', ...paidGoogle('invalid traffic google ads', 5.6), ...c6Base, engagement: SHALLOW, botProbability: 0.92 }),
  visit({ id: 'c6-v3', occurredAt: '2026-09-12T08:15:10Z', ...paidGoogle('invalid traffic google ads', 5.6), ...c6Base, engagement: SHALLOW, botProbability: 0.91 }),
  visit({ id: 'c6-v4', occurredAt: '2026-09-12T08:33:40Z', ...paidGoogle('invalid traffic google ads', 5.6), ...c6Base, engagement: SHALLOW, botProbability: 0.93 }),
];
const c6ctx = { networkType: 'datacenter' as const, vpnOrProxy: false };
export const CASE_6_SYNC_DELAY: Visitor = {
  id: '45.155.204.12',
  ip: '45.155.204.12',
  location: LOCATIONS.amsterdam,
  ...c6ctx,
  visits: c6Visits,
  status: 'blocked',
  decision: {
    ...decided(c6Visits, 2, c6ctx),
    confidence: 'high',
    summary: 'Returned through 3 paid ads in 15 minutes and showed no scroll or mouse movement on any visit, from a datacenter network.',
  },
  exclusionEvents: [
    { id: 'c6-s1', platform: 'google-ads', state: 'pending', at: '2026-09-12T08:15:12Z', note: 'Google Ads exclusion queued. Blocking begins when the platform confirms it.' },
    { id: 'c6-s2', platform: 'google-ads', state: 'delayed', at: '2026-09-12T08:30:12Z', note: 'Google Ads had not confirmed the exclusion after 15 minutes. Paid clicks can still reach the site.' },
    { id: 'c6-s3', platform: 'google-ads', state: 'active', at: '2026-09-12T08:41:05Z', note: 'Google Ads confirmed the exclusion, 26 minutes after the decision.' },
  ],
  goldenCase: 6,
};

/* 7. Location and device inconsistency with weak engagement. */
const c7Visits: Visit[] = [
  visit({ id: 'c7-v1', occurredAt: '2026-09-09T02:14:00Z', ...paidMeta('Prospecting LATAM', 1.9), landingPage: '/', location: LOCATIONS.buenosAires, device: DEVICES.chromeAndroid, networkType: 'mobile', engagement: { ...SHALLOW_HUMAN, durationSec: 5 }, botProbability: 0.44 }),
  visit({ id: 'c7-v2', occurredAt: '2026-09-09T13:50:26Z', ...paidMeta('Prospecting LATAM', 1.9), landingPage: '/', location: LOCATIONS.montevideo, device: DEVICES.safariIos, networkType: 'mobile', engagement: SHALLOW_HUMAN, botProbability: 0.47 }),
  visit({ id: 'c7-v3', occurredAt: '2026-09-10T00:31:12Z', source: 'direct', landingPage: '/pricing', location: LOCATIONS.buenosAires, device: DEVICES.chromeWindows, networkType: 'mobile', engagement: { ...SHALLOW_HUMAN, durationSec: 3 }, botProbability: 0.41 }),
  visit({ id: 'c7-v4', occurredAt: '2026-09-10T11:08:55Z', ...paidMeta('Prospecting LATAM', 1.9), landingPage: '/', location: LOCATIONS.santiago, device: DEVICES.chromeAndroid, networkType: 'mobile', engagement: SHALLOW_HUMAN, botProbability: 0.49 }),
  visit({ id: 'c7-v5', occurredAt: '2026-09-10T22:47:03Z', ...paidMeta('Prospecting LATAM', 1.9), landingPage: '/', location: LOCATIONS.montevideo, device: DEVICES.safariIos, networkType: 'mobile', engagement: { ...SHALLOW_HUMAN, durationSec: 2 }, botProbability: 0.52, formResult: 'invalid' }),
];
const c7ctx = { networkType: 'mobile' as const, vpnOrProxy: false };
export const CASE_7_LOCATION_DEVICE_INCONSISTENCY: Visitor = {
  id: '190.2.145.19',
  ip: '190.2.145.19',
  location: LOCATIONS.buenosAires,
  ...c7ctx,
  visits: c7Visits,
  status: 'blocked',
  decision: {
    ...decided(c7Visits, 4, c7ctx),
    confidence: 'moderate',
    summary: 'Made 5 visits in 2 days from three reported locations and three device identities, and left within seconds each time.',
  },
  exclusionEvents: [
    { id: 'c7-s1', platform: 'meta-ads', state: 'pending', at: '2026-09-10T22:47:05Z', note: 'Meta Ads exclusion queued. Blocking begins when the platform confirms it.' },
    { id: 'c7-s2', platform: 'meta-ads', state: 'failed', at: '2026-09-10T22:52:30Z', note: 'Meta Ads rejected the exclusion request twice. This visitor can still reach the site through Meta ads.' },
  ],
  goldenCase: 7,
};

/* 8. Single visit: insufficient history, no strong signal. */
const c8Visits: Visit[] = [
  visit({ id: 'c8-v1', occurredAt: '2026-09-12T23:14:55Z', ...paidGoogle('clickguard', 1.4), campaign: 'Brand Search', landingPage: '/', location: LOCATIONS.kualaLumpur, device: DEVICES.safariIos, networkType: 'mobile', engagement: { durationSec: 48, scrollDepth: 0.3, clicks: 1, pointerMoved: true, jsEnabled: true }, botProbability: 0.12 }),
];
export const CASE_8_SINGLE_VISIT: Visitor = {
  id: '103.77.19.6',
  ip: '103.77.19.6',
  location: LOCATIONS.kualaLumpur,
  networkType: 'mobile',
  vpnOrProxy: false,
  visits: c8Visits,
  status: 'not-evaluated',
  exclusionEvents: [],
  goldenCase: 8,
};

export const GOLDEN_CASES: Visitor[] = [
  CASE_1_CLEARLY_MALICIOUS,
  CASE_2_CLEARLY_LEGITIMATE,
  CASE_3_AMBIGUOUS_VPN,
  CASE_4_MONITORING_VELOCITY,
  CASE_5_ORGANIC_RETURN_CONVERTS,
  CASE_6_SYNC_DELAY,
  CASE_7_LOCATION_DEVICE_INCONSISTENCY,
  CASE_8_SINGLE_VISIT,
];
