import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SeverityIndicator } from './SeverityIndicator';
const meta = {
    title: 'Components/SeverityIndicator',
    component: SeverityIndicator,
    tags: ['autodocs'],
    args: { level: 'safe', value: '+0.2pp' },
    argTypes: {
        level: { control: { type: 'select' }, options: ['safe', 'warning', 'critical'] },
    },
};
export default meta;
export const Safe = {};
export const Warning = { args: { level: 'warning', value: '+0.8pp' } };
export const Critical = { args: { level: 'critical', value: '-1.4pp' } };
export const AllLevels = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap' }, children: [_jsx(SeverityIndicator, { level: "safe", value: "+0.2pp" }), _jsx(SeverityIndicator, { level: "warning", value: "+0.8pp" }), _jsx(SeverityIndicator, { level: "critical", value: "-1.4pp" })] })),
};
//# sourceMappingURL=SeverityIndicator.stories.js.map