/**
 * The data model, encoding the mechanics in docs/decisions.md rather than describing them.
 *
 *  - A visitor is an IP (D1). Each arrival is a visit with its own source and signals.
 *  - Only paid visits cost money; only they carry a platform and a cost per click (D6).
 *  - Evidence accrues across the journey. At one visit the system may decide to block.
 *  - The decision and the exclusion becoming active at the platform are separate events
 *    with separate timestamps, and a paid click can land between them (D11).
 *  - Confidence is one of three labels, never a number (D5). Plain-language statements
 *    lead; raw values support (D4).
 *  - The model keeps room for a manual override so the status vocabulary is complete (D3, D9).
 *
 * Derived values (totals, first and last seen, exposure) are computed by selectors from
 * `visits`, never stored, so the interface cannot contradict its own data.
 */

export type Source = 'paid' | 'organic' | 'direct' | 'referral';

export type AdPlatform = 'google-ads' | 'meta-ads';

/** Invented signal (D10): where the connection comes from. */
export type NetworkType = 'residential' | 'mobile' | 'corporate' | 'datacenter';

export type FormResult = 'not-submitted' | 'valid' | 'invalid';

/** The system's own finding. A manual override sits on top of it; see `displayStatus`. */
export type VisitorStatus = 'blocked' | 'monitoring' | 'not-blocked' | 'not-evaluated';

/** D5. `conflicting` marks the ambiguous case as a first-class state. */
export type Confidence = 'high' | 'moderate' | 'conflicting';

export type EvidenceKind = 'primary' | 'supporting' | 'contradictory' | 'missing';

/** Invented signal (D10): the exclusion's state at an advertising platform. */
export type SyncState = 'pending' | 'delayed' | 'active' | 'failed';

export interface Location {
  country: string;
  countryCode: string;
  region: string;
  city: string;
}

export interface Device {
  /** Stable per browser install. Rapid changes on one IP are the device-consistency signal. */
  id: string;
  browser: string;
  os: string;
  kind: 'desktop' | 'mobile' | 'tablet';
}

export interface Engagement {
  durationSec: number;
  /** 0 to 1. */
  scrollDepth: number;
  clicks: number;
  pointerMoved: boolean;
  /** False when scripts were blocked, which also makes the device fingerprint unavailable. */
  jsEnabled: boolean;
}

export interface Visit {
  id: string;
  /** ISO 8601, UTC. */
  occurredAt: string;
  source: Source;
  /** Paid only. */
  platform?: AdPlatform;
  campaign?: string;
  keyword?: string;
  /** Paid only, USD. Absent when the platform did not report a cost. */
  cpc?: number;
  landingPage: string;
  /** Per visit, so a journey can show a location change. */
  location: Location;
  device: Device;
  networkType: NetworkType;
  vpnOrProxy: boolean;
  engagement: Engagement;
  /** 0 to 1, the model's estimate that the visit was automated. Supports; never leads. */
  botProbability: number;
  formResult: FormResult;
  converted: boolean;
}

export interface Evidence {
  id: string;
  kind: EvidenceKind;
  /** A sentence a person would retell. */
  statement: string;
  /** The measurement behind the statement, for the disclosure. */
  rawValue?: string;
  /** The visits this evidence points at. Empty for journey-wide observations. */
  visitIds: string[];
}

export interface BlockDecision {
  /** When the system decided. The auditable timestamp. */
  madeAt: string;
  /** The visit the decision followed. */
  afterVisitId: string;
  confidence: Confidence;
  /** One plain-language sentence naming what happened (D4). */
  summary: string;
  /** Ranked strongest first. Contradictory items stay in the list. */
  evidence: Evidence[];
}

export interface MonitoringState {
  since: string;
  /** D8 template: "Monitoring: {signals so far}. Not blocked because {missing or conflicts}." */
  note: string;
  /** Present only when the evidence disagrees with itself. */
  confidence?: 'conflicting';
  evidence: Evidence[];
}

export interface ExclusionEvent {
  id: string;
  platform: AdPlatform;
  state: SyncState;
  at: string;
  note?: string;
}

export interface ManualOverride {
  kind: 'allowed';
  by: string;
  at: string;
  note: string;
}

export interface Visitor {
  /** The IP address; visitors are identified by IP (D1). */
  id: string;
  ip: string;
  /** The location most visits reported. Per-visit locations live on the visits. */
  location: Location;
  networkType: NetworkType;
  vpnOrProxy: boolean;
  /** Chronological, oldest first. */
  visits: Visit[];
  status: VisitorStatus;
  decision?: BlockDecision;
  monitoring?: MonitoringState;
  /** Chronological. Empty unless a decision was made. */
  exclusionEvents: ExclusionEvent[];
  manualOverride?: ManualOverride;
  /** Set on the eight hand-authored cases so tests and stories can find them. */
  goldenCase?: number;
}

/** What a badge shows: the system's finding, or the override on top of it (D3). */
export type DisplayStatus = VisitorStatus | 'allowed';
