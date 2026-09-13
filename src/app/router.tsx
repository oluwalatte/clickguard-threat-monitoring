import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from './AppShell';
import { ThreatMonitoringRoute } from './routes/ThreatMonitoringRoute';
import { VisitorRoute } from './routes/VisitorRoute';
import { NotFoundRoute } from './routes/NotFoundRoute';

/* Routes per decisions.md D2: the table and a dedicated visitor route. */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/threat-monitoring" replace /> },
      { path: 'threat-monitoring', element: <ThreatMonitoringRoute /> },
      { path: 'threat-monitoring/:visitorId', element: <VisitorRoute /> },
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
]);
