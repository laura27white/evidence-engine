import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { ProjectRibbon } from '../../components/dashboard/ProjectRibbon';
import { DEMO_PROJECT_CODE, DEMO_PROJECT_LABEL } from '../../lib/data/constants';

import type { ReactNode } from 'react';

export const revalidate = 300;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      ribbon={<ProjectRibbon projectCode={DEMO_PROJECT_CODE} projectName={DEMO_PROJECT_LABEL} />}
    >
      {children}
    </DashboardShell>
  );
}
