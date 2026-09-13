import { EmptyState } from '@/ui';
import { Page, PageHeader, Panel } from './Page';

/* P1 placeholder. P4 replaces the panel with the visitor table, search, filters and sort. */
export function ThreatMonitoringRoute() {
  return (
    <>
      <PageHeader
        title="Threat monitoring"
        description="Every visitor ClickGuard has evaluated, with the decision it reached and why."
      />
      <Page>
        <Panel>
          <EmptyState
            variant="no-data"
            title="No visitor data yet"
            description="The visitor table arrives in a later phase. This shell proves routing, tokens and deployment."
          />
        </Panel>
      </Page>
    </>
  );
}
