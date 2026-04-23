import { jsx as _jsx } from "react/jsx-runtime";
import { Inbox } from 'lucide-react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
const meta = {
    title: 'Components/EmptyState',
    component: EmptyState,
    tags: ['autodocs'],
    args: {
        title: 'No assumptions in breach',
        description: 'Every assumption sits within its tolerance band today. The Trace view will surface the first mover the moment drift approaches a breach.',
        action: _jsx(Button, { variant: "secondary", children: "Open Trace" }),
        icon: _jsx(Inbox, { size: 32, "aria-hidden": true }),
    },
};
export default meta;
export const Default = {};
export const WithoutAction = { args: { action: undefined } };
//# sourceMappingURL=EmptyState.stories.js.map