import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { DecisionSummary, EmptyState, EvidenceList, VisitTimeline } from '@clickguard/ui';
import { formatTimestamp } from '@/data';
import { findVisitor } from '../data';
import { displayStatus, evidenceFootnote, explanation, exposureLine, headline, journeyCaption, syncSummary, toEvidenceItems, toStatusKind, toTimelineItems, visitorDescription } from '../present';
import { Columns, Page, PageHeader, Panel } from './Page';

/* The visitor route (D2). The decision summary leads, the journey sits directly under it (success criteria). */
export function VisitorRoute() {
  const { visitorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = `/threat-monitoring${(location.state as { from?: string } | null)?.from ?? ''}`;
  const visitor = findVisitor(visitorId);

  if (!visitor) {
    return (
      <>
        <PageHeader title="Visitor not found" breadcrumb={<Link to={backTo}>Threat monitoring</Link>} />
        <Page>
          <Panel>
            <EmptyState
              variant="unavailable"
              title="No visitor with this address"
              description={`Nothing has been recorded for ${visitorId ?? 'this address'} in this range. Absence here is not a verdict; it means no visits were seen.`}
              actionLabel="Back to Threat monitoring"
              onAction={() => navigate(backTo)}
            />
          </Panel>
        </Page>
      </>
    );
  }

  const status = displayStatus(visitor);
  const sync = syncSummary(visitor);
  const evidence = visitor.decision?.evidence ?? visitor.monitoring?.evidence ?? [];
  const evidenceTitle = visitor.decision ? 'Evidence behind the decision' : visitor.monitoring ? 'What the system is watching' : 'Evidence';
  const confidence = visitor.decision?.confidence ?? visitor.monitoring?.confidence;

  return (
    <>
      <PageHeader title={visitor.ip} description={visitorDescription(visitor)} breadcrumb={<Link to={backTo}>Threat monitoring</Link>} />
      <Page>
        <DecisionSummary
          status={toStatusKind(status)}
          confidence={visitor.manualOverride ? 'none' : (confidence ?? 'none')}
          headline={headline(visitor)}
          explanation={explanation(visitor)}
          decisionTime={visitor.decision ? formatTimestamp(visitor.decision.madeAt) : undefined}
          monitoringNote={visitor.monitoring ? formatTimestamp(visitor.monitoring.since) : undefined}
          syncState={sync?.state}
          syncNote={sync?.note}
          exposure={exposureLine(visitor)}
          evidenceHref="#evidence"
          evidenceCount={evidence.length || undefined}
        />
        <Columns>
          <Panel padded>
            <VisitTimeline items={toTimelineItems(visitor)} caption={journeyCaption(visitor)} />
          </Panel>
          <Panel padded>
            <EvidenceList
              id="evidence"
              title={evidenceTitle}
              items={toEvidenceItems(visitor, evidence)}
              footnote={evidenceFootnote(visitor)}
            />
          </Panel>
        </Columns>
      </Page>
    </>
  );
}
