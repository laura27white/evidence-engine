import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Timestamp } from './Timestamp';
const meta = {
    title: 'Components/Timestamp',
    component: Timestamp,
    tags: ['autodocs'],
    args: { at: new Date(Date.now() - 45_000).toISOString(), mode: 'relative' },
    argTypes: {
        mode: { control: { type: 'select' }, options: ['relative', 'absolute', 'both'] },
    },
};
export default meta;
export const Relative = {};
export const Absolute = { args: { mode: 'absolute' } };
export const Both = { args: { mode: 'both' } };
export const Variants = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: [_jsx(Timestamp, { at: new Date(Date.now() - 5_000).toISOString() }), _jsx(Timestamp, { at: new Date(Date.now() - 90_000).toISOString() }), _jsx(Timestamp, { at: new Date(Date.now() - 60 * 60 * 1000).toISOString() }), _jsx(Timestamp, { at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }), _jsx(Timestamp, { at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() })] })),
};
//# sourceMappingURL=Timestamp.stories.js.map