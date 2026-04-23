import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, CascadeNodeIcon, CheckCircle, DriftArrowIcon, ExternalLink, Info, TrendingDown, TrendingUp, XCircle, } from './index';
function Tile({ label, children }) {
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: 16,
            border: '1px solid #E6E1D8',
            borderRadius: 4,
            background: '#FBF9F4',
            color: '#1A1A1A',
        }, children: [children, _jsx("span", { style: { fontFamily: 'var(--font-mono), monospace', fontSize: 11 }, children: label })] }));
}
function Grid() {
    return (_jsxs("div", { style: {
            padding: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12,
        }, children: [_jsx(Tile, { label: "CheckCircle", children: _jsx(CheckCircle, { size: 20 }) }), _jsx(Tile, { label: "AlertTriangle", children: _jsx(AlertTriangle, { size: 20 }) }), _jsx(Tile, { label: "XCircle", children: _jsx(XCircle, { size: 20 }) }), _jsx(Tile, { label: "Info", children: _jsx(Info, { size: 20 }) }), _jsx(Tile, { label: "ExternalLink", children: _jsx(ExternalLink, { size: 20 }) }), _jsx(Tile, { label: "TrendingUp", children: _jsx(TrendingUp, { size: 20 }) }), _jsx(Tile, { label: "TrendingDown", children: _jsx(TrendingDown, { size: 20 }) }), _jsx(Tile, { label: "DriftArrow up", children: _jsx(DriftArrowIcon, { direction: "up", size: 20 }) }), _jsx(Tile, { label: "DriftArrow down", children: _jsx(DriftArrowIcon, { direction: "down", size: 20 }) }), _jsx(Tile, { label: "DriftArrow flat", children: _jsx(DriftArrowIcon, { direction: "flat", size: 20 }) }), _jsx(Tile, { label: "CascadeNode", children: _jsx(CascadeNodeIcon, { size: 20 }) })] }));
}
const meta = {
    title: 'Foundations/Iconography',
    component: Grid,
    parameters: { layout: 'fullscreen' },
};
export default meta;
export const Catalogue = {};
//# sourceMappingURL=Iconography.stories.js.map