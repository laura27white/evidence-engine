import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SankeyEdge, SankeyNode } from './Sankey';
const meta = {
    title: 'Components/Sankey',
};
export default meta;
export const Primitive = {
    render: () => (_jsxs("svg", { width: 720, height: 280, role: "img", "aria-label": "A046 Inflation cascades into five downstream assumptions.", children: [_jsx(SankeyNode, { x: 40, y: 110, width: 160, height: 60, label: "A046 Inflation", tone: "accent" }), _jsx(SankeyNode, { x: 520, y: 20, width: 160, height: 40, label: "A011 Funding", tone: "warning" }), _jsx(SankeyNode, { x: 520, y: 80, width: 160, height: 40, label: "A025 Resourcing", tone: "warning" }), _jsx(SankeyNode, { x: 520, y: 140, width: 160, height: 40, label: "A028 Budget", tone: "critical" }), _jsx(SankeyNode, { x: 520, y: 200, width: 160, height: 40, label: "A043 Fit-out", tone: "default" }), _jsx(SankeyEdge, { source: { x: 200, y: 140 }, target: { x: 520, y: 40 }, strokeWidth: 5, tone: "warning" }), _jsx(SankeyEdge, { source: { x: 200, y: 140 }, target: { x: 520, y: 100 }, strokeWidth: 4, tone: "warning" }), _jsx(SankeyEdge, { source: { x: 200, y: 140 }, target: { x: 520, y: 160 }, strokeWidth: 6, tone: "critical" }), _jsx(SankeyEdge, { source: { x: 200, y: 140 }, target: { x: 520, y: 220 }, strokeWidth: 3 })] })),
};
//# sourceMappingURL=Sankey.stories.js.map