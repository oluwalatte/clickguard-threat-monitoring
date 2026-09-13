import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, FilterChip, FilterGroup, SearchField, SignalTags, StatusBadge, SyncFlag, ThreatTable, type TableSort, type ThreatTableColumn } from '@clickguard/ui';
import { CONFIDENCE_LABEL_MAP, NOW, filterRows, formatRelative, formatShortTimestamp, toRow, type Confidence, type DisplayStatus, type TrafficFilter, type VisitorRow } from '@/data';
import { VISITORS } from '../data';
import { STATUS_FILTERS, syncException, toStatusKind } from '../present';
import { Page, PageHeader, ToolbarRow } from './Page';

const CONFIDENCE_RANK: Record<Confidence, number> = { high: 4, moderate: 3, conflicting: 2, insufficient: 1 };
const DEFAULT_SORT: TableSort = { key: 'lastSeenAt', direction: 'desc' };
const SORT_LABEL: Record<string, string> = { lastSeenAt: 'last seen', status: 'status, then most recent decision', totalVisits: 'visits', paidVisits: 'paid clicks', confidence: 'decision confidence' };
const STATUS_ORDER: DisplayStatus[] = ['blocked', 'monitoring', 'allowed', 'not-blocked', 'not-evaluated'];

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
    sortValue: (r) => STATUS_ORDER.indexOf(r.status) * 1e13 - (r.decidedAt ? new Date(r.decidedAt).getTime() : 0),
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

export function ThreatMonitoringRoute() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const query = params.get('q') ?? '';
  const statuses = (params.get('status')?.split(',').filter(Boolean) ?? []) as DisplayStatus[];
  const traffic = (params.get('traffic') as TrafficFilter | null) ?? 'any';
  const sort: TableSort = params.get('sort') ? { key: params.get('sort')!, direction: params.get('dir') === 'asc' ? 'asc' : 'desc' } : DEFAULT_SORT;

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => filterRows(ALL_ROWS, { query, statuses, traffic }), [query, statuses.join(','), traffic]);
  const countsByStatus = useMemo(() => {
    const scoped = filterRows(ALL_ROWS, { query, traffic });
    return Object.fromEntries(STATUS_FILTERS.map((s) => [s.value, scoped.filter((r) => r.status === s.value).length])) as Record<DisplayStatus, number>;
  }, [query, traffic]);

  const activeFilters = (query ? 1 : 0) + (statuses.length ? 1 : 0) + (traffic !== 'any' ? 1 : 0);
  const clearFilters = () => update({ q: undefined, status: undefined, traffic: undefined });
  const toggleStatus = (s: DisplayStatus) => {
    const next = statuses.includes(s) ? statuses.filter((x) => x !== s) : [...statuses, s];
    update({ status: next.join(',') });
  };

  return (
    <>
      <PageHeader
        title="Threat monitoring"
        description="Every visitor ClickGuard has observed, with the decision it reached and the key evidence behind it. Blocked means a decision was made; the advertising platform confirms the exclusion separately."
        toolbar={
          <>
            <ToolbarRow>
              <SearchField label="Search visitors" placeholder="IP address or location" value={query} onChange={(v) => update({ q: v })} />
              {activeFilters ? (
                <Button variant="quiet" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null}
            </ToolbarRow>
            <ToolbarRow>
              <FilterGroup label="Status">
                {STATUS_FILTERS.map((s) => (
                  <FilterChip key={s.value} pressed={statuses.includes(s.value)} onToggle={() => toggleStatus(s.value)} count={countsByStatus[s.value]}>
                    {s.label}
                  </FilterChip>
                ))}
              </FilterGroup>
              <FilterGroup label="Traffic">
                <FilterChip pressed={traffic === 'paid'} onToggle={() => update({ traffic: traffic === 'paid' ? undefined : 'paid' })}>
                  Has paid clicks
                </FilterChip>
                <FilterChip pressed={traffic === 'unpaid'} onToggle={() => update({ traffic: traffic === 'unpaid' ? undefined : 'unpaid' })}>
                  No paid clicks
                </FilterChip>
              </FilterGroup>
            </ToolbarRow>
          </>
        }
      />
      <Page>
        <ThreatTable
          columns={COLUMNS}
          rows={rows}
          state={rows.length ? 'ready' : 'empty'}
          sort={sort}
          onSortChange={(s) => update({ sort: s.key === DEFAULT_SORT.key && s.direction === DEFAULT_SORT.direction ? undefined : s.key, dir: s.key === DEFAULT_SORT.key && s.direction === DEFAULT_SORT.direction ? undefined : s.direction })}
          caption={`${rows.length} of ${ALL_ROWS.length} visitors, sorted by ${SORT_LABEL[sort.key] ?? sort.key}, ${sort.direction === 'desc' ? 'newest or highest first' : 'oldest or lowest first'}`}
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
      </Page>
    </>
  );
}
