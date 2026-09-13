import { Link, useParams } from 'react-router';
import { EmptyState } from '@clickguard/ui';
import { Page, PageHeader, Panel } from './Page';

/* P1 placeholder. P4 composes DecisionSummary, VisitTimeline and EvidenceList here. */
export function VisitorRoute() {
  const { visitorId } = useParams();
  return (
    <>
      <PageHeader title={`Visitor ${visitorId ?? ''}`} breadcrumb={<Link to="/threat-monitoring">Threat monitoring</Link>} />
      <Page>
        <Panel>
          <EmptyState
            variant="unavailable"
            title="Visitor detail not built yet"
            description="The decision summary, journey and evidence arrive in a later phase."
          />
        </Panel>
      </Page>
    </>
  );
}
