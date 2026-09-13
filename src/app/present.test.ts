import { describe, expect, it } from 'vitest';
import { GOLDEN_CASES, NOW, generateVisitors, syncByPlatform, toRow } from '@/data';
import { CONVERTED_LABEL, INVALID_EMAIL_LABEL, activeFilterChips, evidenceFootnote, explanation, exposureLine, headline, syncException, syncSummary, toEvidenceItems, toStatusKind, toTimelineItems, visitorDescription } from './present';

const golden = (n: number) => GOLDEN_CASES.find((g) => g.goldenCase === n)!;
const visitors = generateVisitors();

describe('the decision summary leads with plain language', () => {
  it('names the visit the decision followed', () => {
    expect(headline(golden(1))).toBe('Blocked after visit 4 of 5');
    expect(headline(golden(3))).toBe('Monitoring, not blocked');
    expect(headline(golden(2))).toBe('Not blocked');
    expect(headline(golden(8))).toBe('Not evaluated');
  });
  it('would explain an override without erasing the decision', () => {
    const o = { ...golden(1), manualOverride: { kind: 'allowed' as const, by: 'Ada O.', at: '2026-09-12T10:00:00Z', note: 'QA traffic.' } };
    expect(headline(o)).toBe('Blocked after visit 4 of 5, then manually allowed');
    expect(explanation(o)).toMatch(/Ada O\. allowed this visitor/);
    expect(explanation(o)).toMatch(/remain on record/);
  });
  it('maps the data vocabulary onto badge tones with red for blocked only', () => {
    expect(toStatusKind('blocked')).toBe('blocked');
    expect(toStatusKind('monitoring')).toBe('monitoring');
    expect(toStatusKind('not-blocked')).toBe('safe');
    expect(toStatusKind('allowed')).toBe('allowed');
    expect(toStatusKind('not-evaluated')).toBe('neutral');
  });
});

describe('exposure is a visible sum (D6)', () => {
  it('states the clicks and the money, before and after the decision', () => {
    expect(exposureLine(golden(1))).toBe('$38.40 across 4 paid clicks before the decision');
    expect(exposureLine(golden(6))).toBe('$16.80 across 3 paid clicks before the decision, plus $5.60 for 1 after it');
    expect(exposureLine(golden(2))).toBe('$4.80 across 1 paid click');
  });
  it('shows the calculation in the footnote and never estimates', () => {
    const note = evidenceFootnote(golden(1));
    expect(note).toContain('$9.60 + $9.60 + $9.60 + $9.60 = $38.40');
    expect(note).toContain('Nothing is estimated.');
    expect(note).not.toMatch(/saved|prevented|protected/i);
  });
  it('refuses to total when a cost is missing', () => {
    const v = visitors.find((x) => x.visits.some((y) => y.source === 'paid' && y.cpc === undefined))!;
    expect(exposureLine(v)).toMatch(/cost not reported for every click/);
  });
});

describe('the decision and the sync are separate facts (D11)', () => {
  it('summarises the worst platform state and lists each platform on its own row', () => {
    const active = syncSummary(golden(1))!;
    expect(active.state).toBe('active');
    expect(active.note).toBe('The exclusion is active on every platform this visitor used. No paid clicks since.');
    expect(active.platforms).toEqual([{ name: 'Google Ads', state: 'active', detail: 'since 11 Sep 2026, 15:02:10 UTC, 9 minutes after the decision' }]);
    expect(syncSummary(golden(7))!.state).toBe('failed');
    expect(syncSummary(golden(7))!.platforms[0]).toMatchObject({ name: 'Meta Ads', state: 'failed' });
    expect(syncSummary(golden(2))).toBeUndefined();
  });
  it('flags enforcement in the table only when it needs attention', () => {
    expect(syncException(toRow(golden(1)))).toBeUndefined();
    expect(syncException(toRow(golden(7)))).toEqual({ state: 'failed', platform: undefined });
    expect(syncException({ sync: { 'google-ads': 'active', 'meta-ads': 'pending' } })).toEqual({ state: 'pending', platform: 'Meta Ads' });
  });
  it('puts the decision after its visit and the sync events after the decision', () => {
    const items = toTimelineItems(golden(6));
    expect(items.map((i) => i.type)).toEqual(['paid', 'paid', 'paid', 'block', 'sync-pending', 'sync-pending', 'paid', 'sync-active']);
    expect(items[3].description).toBe('Blocked after visit 3 of 4. High confidence.');
    expect(items[5].label).toBe('Google Ads exclusion delayed');
    expect(items[0].relativeTime).toBe('start of journey');
    expect(items[1].relativeTime).toBe('8 minutes later');
    expect(items[0].id).toBe('visit-1');
    expect(items[0].timestamp).toBe('12 Sep, 08:00');
  });
  it('names and opens the decision visit, and attaches what each visit added', () => {
    const items = toTimelineItems(golden(1));
    expect(items[3].decisionVisit).toBe(true);
    expect(items[3].defaultExpanded).toBe(true);
    expect(items[0].decisionVisit).toBeUndefined();
    expect(items[3].contributed).toEqual(expect.arrayContaining(['4 paid clicks in 41 minutes']));
    const list = toEvidenceItems(golden(5), golden(5).decision!.evidence);
    const conversion = list.find((e) => e.statement.startsWith('Completed a purchase'))!;
    expect(conversion.sourceHref).toBe('#visit-7');
    expect(conversion.sourceVisit).toBe('From visit 7, 15:20:19');
  });
});

describe('a collapsed visit shows only what a person needs to place it in the story', () => {
  const items = toTimelineItems(golden(7)).filter((i) => !i.type.startsWith('sync') && i.type !== 'block');
  const get = (item: (typeof items)[number], label: string) => item.record!.find((m) => m.label === label)?.value;
  it('has a source line, one engagement line, and only changes as tags', () => {
    expect(items[0].description).toBe('Meta Ads · Prospecting LATAM');
    expect(items[0].summary).toEqual(['5 seconds', '5% scroll', 'No conversion']);
    expect(items[0].changes).toEqual([]);
    expect(items[1].changes!.map((c) => c.label)).toEqual(['Location changed to Montevideo', 'New device identity']);
    expect(items[4].changes!.map((c) => c.label)).toEqual(['Email undeliverable', 'Location changed to Montevideo']);
    expect(items[4].changes![0].kind).toBe('primary');
  });
  it('keeps the complete record behind the disclosure, never blank', () => {
    expect(get(items[0], 'Time')).toBe('9 Sep 2026, 02:14:00 UTC');
    expect(get(items[0], 'Form')).toBe('Not submitted');
    expect(get(items[0], 'Conversion')).toBe('No');
    expect(get(items[0], 'Bot probability')).toBe('44%');
    expect(get(items[0], 'Network')).toBe('Mobile carrier, no VPN or proxy');
    expect(get(items[4], 'Form')).toBe('Submitted, email deliverability Invalid');
    expect(get(items[4], 'Location')).toBe('Montevideo, Uruguay (changed from Santiago)');
    expect(get(items[4], 'Device')).toBe('Safari 17, iOS 17, first seen on visit 2');
  });
  it('uses the mitigating tone for conversions and valid emails', () => {
    const last = toTimelineItems(golden(5)).filter((i) => i.type === 'organic').pop()!;
    expect(last.summary).toEqual(['4 minutes 11 seconds', '95% scroll', 'Converted']);
    expect(last.changes!.map((c) => [c.label, c.kind])).toEqual(expect.arrayContaining([['Converted', 'contradictory'], ['Email: Valid', 'contradictory']]));
  });
});

describe('the header line', () => {
  it('reads as a sentence with complete facts', () => {
    expect(visitorDescription(golden(1))).toBe('Frankfurt, Hesse, Germany. Datacenter network. 5 visits, 4 paid. first seen 11 Sep 2026, last seen 27 hours ago.');
  });
});

describe('the secondary filters show as chips (D16)', () => {
  const name = (code: string) => ({ DE: 'Germany', US: 'United States' })[code] ?? code;
  it('shows nothing when nothing is applied', () => {
    expect(activeFilterChips({ traffic: 'any', invalidEmail: false, converted: false }, name)).toEqual([]);
  });
  it('names each applied filter in the menu order with the exact labels', () => {
    const chips = activeFilterChips({ traffic: 'paid', platform: 'google-ads', countryCode: 'DE', confidence: 'conflicting', invalidEmail: true, converted: true }, name);
    expect(chips.map((c) => c.key)).toEqual(['traffic', 'platform', 'country', 'confidence', 'email', 'converted']);
    expect(chips.map((c) => c.label)).toEqual(['Has paid clicks', 'Google Ads', 'Country: Germany', 'Conflicting evidence', INVALID_EMAIL_LABEL, CONVERTED_LABEL]);
  });
  it('never describes conversion as proof of anything', () => {
    expect(CONVERTED_LABEL).toBe('Converted at least once');
    expect(INVALID_EMAIL_LABEL).toBe('Submitted an invalid email at least once');
    expect(`${CONVERTED_LABEL} ${INVALID_EMAIL_LABEL}`).not.toMatch(/legitimate|false positive|wrong|safe/i);
  });
});

describe('a visitor caught mid-sync reads its age from the queue', () => {
  const latest = (v: (typeof visitors)[number]) => Object.values(syncByPlatform(v)).map((e) => e.state);
  it('names the delay from when the exclusion was queued', () => {
    const v = visitors.find((x) => latest(x).includes('delayed'))!;
    const row = syncSummary(v)!.platforms.find((p) => p.state === 'delayed')!;
    const queued = v.exclusionEvents.find((e) => e.state === 'pending')!.at;
    const minutes = Math.round((new Date(NOW).getTime() - new Date(queued).getTime()) / 60000);
    expect(minutes).toBeGreaterThanOrEqual(22);
    expect(row.detail).toBe(`not confirmed ${minutes} minutes after it was queued`);
  });
  it('says how long ago a pending exclusion was queued', () => {
    const v = visitors.find((x) => latest(x).includes('pending'))!;
    expect(syncSummary(v)!.platforms[0].detail).toMatch(/^queued \d+ minutes ago$/);
  });
});
