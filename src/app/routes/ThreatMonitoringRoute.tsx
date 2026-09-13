import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ActiveFilterBar, ActiveFilterChip, Checkbox, FilterChip, FilterGroup, FilterMenu, Pagination, SearchField, Select, SignalTags, StatusBadge, SyncFlag, ThreatTable, type TableSort, type ThreatTableColumn } from '@clickguard/ui';
import { CONFIDENCE_LABEL_MAP, DATE_RANGES, NOW, countryOptions, filterRows, formatRelative, formatShortTimestamp, paginate, sortRows, toRow, type AdPlatform, type Confidence, type DateRange, type DisplayStatus, type SortKey, type TrafficFilter, type VisitorRow } from '@/data';
import { VISITORS } from '../data';
import { CONFIDENCE_OPTIONS, CONVERTED_LABEL, DATE_RANGE_OPTIONS, INVALID_EMAIL_LABEL, PLATFORM_OPTIONS, STATUS_FILTERS, TRAFFIC_OPTIONS, activeFilterChips, syncException, toStatusKind, type SecondaryFilters, type SecondaryKey } from '../present';
import { Page, PageHeader, ToolbarRow } from './Page';

const CONFIDENCE_RANK: Record<Confidence, number> = { high: 4, moderate: 3, conflicting: 2, insufficient: 1 };
const DEFAULT_SORT: TableSort = { key: 'lastSeenAt', direction: 'desc' };
const SORT_LABEL: Record<string, string> = { lastSeenAt: 'last seen', status: 'status, then most recent decision', totalVisits: 'visits', paidVisits: 'paid clicks', confidence: 'decision confidence' };
const STATUS_ORDER: DisplayStatus[] = ['blocked', 'monitoring', 'allowed', 'not-blocked', 'not-evaluated'];
/* Column keys mapped onto the data layer's sorts, so the page slice sees the same order the headers show. */
const COLUMN_SORT: Record<string, SortKey> = { lastSeenAt: 'recency', status: 'status', totalVisits: 'visits', paidVisits: 'paid-clicks', confidence: 'confidence' };

/* One row per visitor (D1), in the customer's investigation sequence (D14): who, what was
   decided, how much behaviour accumulated, why, how certain, how recent. Sort by header (D7);
   undecided rows sink in either direction. */
const COLUMNS: ThreatTableColumn<VisitorRow>[] = [
  {
    key: 'ip',
    header: 'Visitor',
    width: '17%',
    mono: true,
    render: (r) => (
      <>
        <span>{r.ip}</span>
        <span>{r.location}</span>
      </>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '15%',
    /* Verdict first; within a verdict, the most recent decision first. */
    sortValue: (r) => -(STATUS_ORDER.indexOf(r.status) * 1e13 - (r.decidedAt ? new Date(r.decidedAt).getTime() : 0)),
    render: (r) => {
      const exception = syncException(r);
      return (
        <>
          <span>
            <StatusBadge status={toStatusKind(r.status)} size="sm" />
          </span>
          {r.decidedAt ? <span>{formatShortTimestamp(r.decidedAt)}</span> : null}
          {exception ? (
            <span>
              <SyncFlag state={exception.state} platform={exception.platform} />
            </span>
          ) : null}
        </>
      );
    },
  },
  { key: 'totalVisits', header: 'Visits', width: '7%', align: 'right', render: (r) => `${r.totalVisits}` },
  { key: 'paidVisits', header: 'Paid', width: '7%', align: 'right', render: (r) => `${r.paidVisits}` },
  /* Concise signals, comparable across rows. The full sentence lives in the visitor detail. */
  { key: 'signals', header: 'Key evidence', sortable: false, render: (r) => <SignalTags signals={r.signals} /> },
  {
    key: 'confidence',
    header: 'Decision confidence',
    width: '13%',
    sortValue: (r) => (r.confidence ? CONFIDENCE_RANK[r.confidence] : null),
    render: (r) => (r.confidence ? CONFIDENCE_LABEL_MAP[r.confidence] : ''),
  },
  {
    key: 'lastSeenAt',
    header: 'Last seen',
    width: '13%',
    sortValue: (r) => new Date(r.lastSeenAt).getTime(),
    render: (r) => (
      <>
        <span>{formatRelative(r.lastSeenAt, NOW)}</span>
        <span>{formatShortTimestamp(r.lastSeenAt)}</span>
      </>
    ),
  },
];

const ALL_ROWS: VisitorRow[] = VISITORS.map(toRow);
const COUNTRIES = countryOptions(ALL_ROWS);
const COUNTRY_OPTIONS = [{ value: '', label: 'Any country' }, ...COUNTRIES.map((c) => ({ value: c.code, label: c.name }))];
const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code;

/* URL parameter per secondary filter (D16), so a chip's remove and the menu's controls edit the same state. */
const SECONDARY_PARAM: Record<SecondaryKey, string> = { traffic: 'traffic', platform: 'platform', country: 'country', confidence: 'confidence', email: 'email', converted: 'converted' };
const CLEAR_SECONDARY = Object.fromEntries(Object.values(SECONDARY_PARAM).map((k) => [k, undefined])) as Record<string, undefined>;

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export function ThreatMonitoringRoute() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const query = params.get('q') ?? '';
  const status = oneOf(params.get('status'), STATUS_FILTERS.map((f) => f.value));
  const range: DateRange = oneOf(params.get('range'), DATE_RANGES) ?? 'all';
  const secondary: SecondaryFilters = {
    traffic: oneOf(params.get('traffic'), ['paid', 'unpaid'] as const satisfies readonly TrafficFilter[]) ?? 'any',
    platform: oneOf(params.get('platform'), ['google-ads', 'meta-ads'] as const satisfies readonly AdPlatform[]),
    countryCode: oneOf(params.get('country'), COUNTRIES.map((c) => c.code)),
    confidence: oneOf(params.get('confidence'), ['high', 'moderate', 'conflicting', 'insufficient'] as const satisfies readonly Confidence[]),
    invalidEmail: params.get('email') === 'invalid',
    converted: params.get('converted') === '1',
  };
  const sort: TableSort = params.get('sort') ? { key: params.get('sort')!, direction: params.get('dir') === 'asc' ? 'asc' : 'desc' } : DEFAULT_SORT;

  const page = Math.max(1, Number(params.get('page')) || 1);

  /* Any change to what is listed or how it is ordered returns to page one. */
  const update = (patch: Record<string, string | undefined>, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, v);
    }
    if (!keepPage) next.delete('page');
    setParams(next, { replace: true });
  };

  const secondaryKey = JSON.stringify(secondary);
  const rows = useMemo(() => filterRows(ALL_ROWS, { query, status, range, now: NOW, ...secondary }), [query, status, range, secondaryKey]);
  /* Sorting happens here, before the page slice, so a page is a window onto the whole ordered list. */
  const ordered = useMemo(() => sortRows(rows, COLUMN_SORT[sort.key] ?? 'recency', sort.direction), [rows, sort.key, sort.direction]);
  const paged = paginate(ordered, page);
  /* Status counts are scoped by everything except status, so each chip says what choosing it would show. */
  const statusCounts = useMemo(() => {
    const scoped = filterRows(ALL_ROWS, { query, range, now: NOW, ...secondary });
    const counts = Object.fromEntries(STATUS_FILTERS.map((s) => [s.value, scoped.filter((r) => r.status === s.value).length])) as Record<DisplayStatus, number>;
    return { all: scoped.length, ...counts };
  }, [query, range, secondaryKey]);

  const chips = activeFilterChips(secondary, countryName);
  const activeFilters = (query ? 1 : 0) + (status ? 1 : 0) + (range !== 'all' ? 1 : 0) + chips.length;
  const clearFilters = () => update({ q: undefined, status: undefined, range: undefined, ...CLEAR_SECONDARY });
  const clearSecondary = () => update(CLEAR_SECONDARY);

  return (
    <>
      <PageHeader
        title="Threat monitoring"
        description="Every visitor ClickGuard has observed, with the decision it reached and the key evidence behind it. Blocked means a decision was made; the advertising platform confirms the exclusion separately."
        toolbar={
          <>
            <ToolbarRow>
              <SearchField label="Search visitors" placeholder="IP address or location" value={query} onChange={(v) => update({ q: v })} />
              <Select label="Date range" showLabel={false} icon="calendar" options={DATE_RANGE_OPTIONS} value={range} onChange={(v) => update({ range: v === 'all' ? undefined : v })} />
              <FilterMenu activeCount={chips.length} onClear={clearSecondary}>
                <Select label="Paid traffic" size="sm" options={TRAFFIC_OPTIONS} value={secondary.traffic} onChange={(v) => update({ traffic: v === 'any' ? undefined : v })} />
                <Select label="Advertising platform" size="sm" options={PLATFORM_OPTIONS} value={secondary.platform ?? ''} onChange={(v) => update({ platform: v })} />
                <Select label="Country" size="sm" options={COUNTRY_OPTIONS} value={secondary.countryCode ?? ''} onChange={(v) => update({ country: v })} />
                <Select label="Decision confidence" size="sm" options={CONFIDENCE_OPTIONS} value={secondary.confidence ?? ''} onChange={(v) => update({ confidence: v })} />
                <Checkbox label={INVALID_EMAIL_LABEL} checked={secondary.invalidEmail} onChange={(on) => update({ email: on ? 'invalid' : undefined })} />
                <Checkbox label={CONVERTED_LABEL} checked={secondary.converted} onChange={(on) => update({ converted: on ? '1' : undefined })} />
              </FilterMenu>
            </ToolbarRow>
            <ToolbarRow>
              {/* One status at a time (D16). All is a real option so the whole list is one click away. */}
              <FilterGroup label="Status">
                <FilterChip pressed={!status} onToggle={() => update({ status: undefined })} count={statusCounts.all}>
                  All
                </FilterChip>
                {STATUS_FILTERS.map((s) => (
                  <FilterChip key={s.value} pressed={status === s.value} onToggle={() => update({ status: s.value })} count={statusCounts[s.value]}>
                    {s.label}
                  </FilterChip>
                ))}
              </FilterGroup>
            </ToolbarRow>
            {chips.length ? (
              <ActiveFilterBar onClearAll={clearSecondary}>
                {chips.map((c) => (
                  <ActiveFilterChip key={c.key} label={c.label} onRemove={() => update({ [SECONDARY_PARAM[c.key]]: undefined })} />
                ))}
              </ActiveFilterBar>
            ) : null}
          </>
        }
      />
      <Page>
        <ThreatTable
          columns={COLUMNS}
          rows={paged.rows}
          state={rows.length ? 'ready' : 'empty'}
          sort={sort}
          onSortChange={(s) => update({ sort: s.key === DEFAULT_SORT.key && s.direction === DEFAULT_SORT.direction ? undefined : s.key, dir: s.key === DEFAULT_SORT.key && s.direction === DEFAULT_SORT.direction ? undefined : s.direction })}
          caption={`${rows.length === ALL_ROWS.length ? `${rows.length} visitors` : `${rows.length} of ${ALL_ROWS.length} visitors`}, sorted by ${SORT_LABEL[sort.key] ?? sort.key}, ${sort.direction === 'desc' ? 'newest or highest first' : 'oldest or lowest first'}`}
          getRowId={(r) => r.id}
          rowActionLabel="View visitor"
          onRowActivate={(r) => navigate(`/threat-monitoring/${r.id}`, { state: { from: `?${params.toString()}` } })}
          emptyState={{
            variant: 'no-matches',
            title: 'No visitors match these filters',
            description: `${activeFilters} filter${activeFilters === 1 ? ' is' : 's are'} active. Clearing ${activeFilters === 1 ? 'it' : 'them'} would show all ${ALL_ROWS.length} visitors. An empty list here does not mean the account is clean.`,
            actionLabel: 'Clear filters',
            onAction: clearFilters,
          }}
        />
        {rows.length ? (
          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            onPageChange={(p) => update({ page: p === 1 ? undefined : String(p) }, true)}
            summary={`${paged.from} to ${paged.to} of ${paged.total} visitors`}
          />
        ) : null}
      </Page>
    </>
  );
}
