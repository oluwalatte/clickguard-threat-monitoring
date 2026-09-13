import { describe, expect, it } from 'vitest';
import { formatDate, formatDuration, formatLater, formatMoney, formatRelative, formatShortTimestamp, formatTime, formatTimestamp } from './format';

describe('timestamps are complete where auditability matters', () => {
  it('writes the full, zoned form', () => {
    expect(formatTimestamp('2026-09-11T14:53:20Z')).toBe('11 Sep 2026, 14:53:20 UTC');
    expect(formatDate('2026-09-11T14:53:20Z')).toBe('11 Sep 2026');
    expect(formatTime('2026-09-11T04:03:02Z')).toBe('04:03:02');
    expect(formatShortTimestamp('2026-09-11T14:53:20Z')).toBe('11 Sep, 14:53');
  });
});

describe('relative time reads the way a person would say it', () => {
  it('picks the largest natural unit', () => {
    expect(formatDuration(41 * 60 * 1000 + 12000)).toBe('41 minutes');
    expect(formatDuration(2 * 3600 * 1000)).toBe('2 hours');
    expect(formatDuration(47 * 3600 * 1000)).toBe('2 days');
    expect(formatDuration(7 * 86400 * 1000)).toBe('7 days');
    expect(formatDuration(1000)).toBe('1 second');
  });
  it('is measured from a fixed reference', () => {
    expect(formatRelative('2026-09-13T10:00:00Z', '2026-09-13T12:00:00Z')).toBe('2 hours ago');
    expect(formatRelative('2026-09-13T11:59:50Z', '2026-09-13T12:00:00Z')).toBe('just now');
    expect(formatLater('2026-09-11T14:12:08Z', '2026-09-11T14:53:20Z')).toBe('41 minutes later');
    expect(formatLater('2026-09-11T14:53:20Z', '2026-09-11T14:53:20Z')).toBe('at the same time');
  });
});

describe('money', () => {
  it('shows two decimals', () => {
    expect(formatMoney(38.4)).toBe('$38.40');
  });
});
