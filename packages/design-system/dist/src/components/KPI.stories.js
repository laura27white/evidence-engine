import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { KPI } from './KPI';
const meta = {
    title: 'Components/KPI',
    component: KPI,
    tags: ['autodocs'],
    args: { label: 'Lead time', value: '47', unit: 'days', trend: 'flat' },
    argTypes: {
        trend: { control: { type: 'select' }, options: ['up', 'down', 'flat'] },
        size: { control: { type: 'select' }, options: ['md', 'lg'] },
    },
};
export default meta;
export const LeadTime = {};
export const WithTrend = {
    args: { trend: 'down', trendTone: 'negative', value: '12', unit: 'days' },
};
export const WithConfidence = {
    args: {
        label: 'CPI forecast, 90 day',
        value: '2.9',
        unit: '% YoY',
        trend: 'up',
        trendTone: 'negative',
        confidenceInterval: 'CI 90 percent: 2.5 to 3.3',
    },
};
export const Portfolio = {
    render: () => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }, children: [_jsx(KPI, { label: "Assumptions", value: "47", unit: "total" }), _jsx(KPI, { label: "At warning", value: "6", trend: "up", trendTone: "negative" }), _jsx(KPI, { label: "Lead time median", value: "39", unit: "days", trend: "down", trendTone: "negative" })] })),
};
//# sourceMappingURL=KPI.stories.js.map