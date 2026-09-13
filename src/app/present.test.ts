import { describe, expect, it } from 'vitest';
import { GOLDEN_CASES, generateVisitors } from '@/data';
import { evidenceFootnote, explanation, exposureLine, headline, syncSummary, toEvidenceItems, toStatusKind, toTimelineItems, visitorDescription } from './present';

const golden = (n: number) => GOLDEN_CASES.find((g) => g.goldenCase === n)!;
const visitors = generateVisitors();

describe('the decision summary leads with plain language', () => {
  it('names the visit the decision followed', () => {
    expect(headline(golden(1))).toBe('Blocked after visit 4 of 5');
    expect(headline(golden(3))).toBe('Monitoring, not blocked');
    expect(headline(golden(2))).toBe('Not blocked');
    expect(headline(golden(8))).toBe('Not evaluated');
    const o = visitors.find((v) => v.manualOverride)!;
    expect(headline(o)).toMatch(/^Blocked after visit \d+ of \d+, then manually allowed$/);
  });
  it('explains an override without erasing the decision', () => {
    const o = visitors.find((v) => v.manualOverride)!;
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
  it('summarises the worst platform state and says whether paid clicks got through', () => {
    expect(syncSummary(golden(1))).toEqual({ state: 'active', note: expect.stringMatching(/exclusion active since 11 Sep 2026, 15:02:10 UTC, 9 minutes after the decision\. No paid clicks since\./) });
    expect(syncSummary(golden(7))!.state).toBe('failed');
    expect(syncSummary(golden(2))).toBeUndefined();
  });
  it('puts the decision after its visit and the sync events after the decision', () => {
    const items = toTimelineItems(golden(6));
    expect(items.map((i) => i.type)).toEqual(['paid', 'paid', 'paid', 'block', 'sync-pending', 'sync-pending', 'paid', 'sync-active']);
    expect(items[3].description).toBe('Blocked after visit 3 of 4. High confidence.');
    expect(items[5].label).toBe('Google Ads exclusion delayed');
    expect(items[0].relativeTime).toBe('start of journey');
    expect(items[1].relativeTime).toBe('8 minutes later');
    expect(items[0].id).toBe('visit-1');
  });
  it('attaches each visit its own signals, and links list items back to visits', () => {
    const items = toTimelineItems(golden(1));
    expect(items[0].evidence!.length).toBeGreaterThan(0);
    const list = toEvidenceItems(golden(5), golden(5).decision!.evidence);
    const conversion = list.find((e) => e.statement.startsWith('Completed a purchase'))!;
    expect(conversion.sourceHref).toBe('#visit-7');
    expect(conversion.sourceVisit).toBe('From visit 7, 15:20:19');
  });
});

describe('the header line', () => {
  it('reads as a sentence with complete facts', () => {
    expect(visitorDescription(golden(1))).toBe('Frankfurt, Hesse, Germany. Datacenter network. 5 visits, 4 paid. first seen 11 Sep 2026, last seen 27 hours ago.');
  });
});
