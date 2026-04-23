import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from './Badge';
const meta = {
    title: 'Components/Badge',
    component: Badge,
    tags: ['autodocs'],
    args: { variant: 'safe', size: 'md', children: 'Safe' },
    argTypes: {
        variant: { control: { type: 'select' }, options: ['safe', 'warning', 'critical', 'neutral'] },
        size: { control: { type: 'select' }, options: ['sm', 'md'] },
    },
};
export default meta;
export const Safe = {};
export const Warning = { args: { variant: 'warning', children: 'Warning' } };
export const Critical = { args: { variant: 'critical', children: 'Critical' } };
export const Neutral = { args: { variant: 'neutral', children: '47 total' } };
export const Severities = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 12 }, children: [_jsx(Badge, { variant: "safe", children: "Safe" }), _jsx(Badge, { variant: "warning", children: "Warning" }), _jsx(Badge, { variant: "critical", children: "Critical" }), _jsx(Badge, { variant: "neutral", children: "Tier 1" })] })),
};
//# sourceMappingURL=Badge.stories.js.map