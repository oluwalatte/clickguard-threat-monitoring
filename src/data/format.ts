/* Timestamps are complete where auditability matters and relative where scanning matters
   (CLAUDE.md rule 6). Money is shown only as a visible sum (D6). */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

/** "19 Feb 2026, 14:53:44 UTC" */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

/** "19 Feb, 14:53": the scanning form, for a table cell. The complete form lives in the detail. */
export function formatShortTimestamp(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** "19 Feb 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "14:53:44" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function unit(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** The size of a gap in the largest unit that reads naturally: "41 minutes", "3 days". */
export function formatDuration(ms: number): string {
  const s = Math.round(Math.abs(ms) / 1000);
  if (s < 60) return unit(s, 'second');
  const m = Math.round(s / 60);
  if (m < 60) return unit(m, 'minute');
  const h = Math.round(m / 60);
  if (h < 36) return unit(h, 'hour');
  const d = Math.max(2, Math.round(h / 24));
  return unit(d, 'day');
}

/** "2 hours ago", relative to a fixed reference so the output is deterministic. */
export function formatRelative(iso: string, now: string): string {
  const diff = new Date(now).getTime() - new Date(iso).getTime();
  if (diff < 45 * 1000) return 'just now';
  return `${formatDuration(diff)} ago`;
}

/** "41 minutes later", from an earlier event to a later one. */
export function formatLater(earlierIso: string, laterIso: string): string {
  const diff = new Date(laterIso).getTime() - new Date(earlierIso).getTime();
  if (diff < 1000) return 'at the same time';
  return `${formatDuration(diff)} later`;
}

/** "$38.40" */
export function formatMoney(usd: number): string {
  return `$${usd.toFixed(2)}`;
}
