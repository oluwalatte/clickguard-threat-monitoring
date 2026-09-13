import { useNavigate } from 'react-router';
import { EmptyState } from '@clickguard/ui';
import { Page, PageHeader, Panel } from './Page';

export function NotFoundRoute() {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Page not found" />
      <Page>
        <Panel>
          <EmptyState
            variant="unavailable"
            title="This page does not exist"
            description="The prototype covers Threat monitoring and the visitor detail view."
            actionLabel="Go to Threat monitoring"
            onAction={() => navigate('/threat-monitoring')}
          />
        </Panel>
      </Page>
    </>
  );
}
