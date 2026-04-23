import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Text } from '../components/Text';
import { ChartTransition } from './ChartTransition';
import { PageTransition } from './PageTransition';
import { StaggerFade } from './StaggerFade';
const meta = {
    title: 'Foundations/Motion',
    tags: ['autodocs'],
};
export default meta;
export const StaggerFadeList = {
    render: () => (_jsx(StaggerFade, { children: ['A046 Inflation', 'A047 Interest Rates', 'A048 Tax Policy'].map((label) => (_jsx(Card, { variant: "default", padding: "md", style: { marginBottom: 12 }, children: _jsx(Text, { variant: "displaySmall", children: label }) }, label))) })),
};
export const ChartTransitionSwap = {
    render: () => {
        function Demo() {
            const [range, setRange] = useState('3m');
            return (_jsxs("div", { children: [_jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 16 }, children: ['1m', '3m', '12m'].map((r) => (_jsx(Button, { variant: r === range ? 'primary' : 'ghost', size: "sm", onClick: () => setRange(r), children: r }, r))) }), _jsx(ChartTransition, { transitionKey: range, children: _jsx(Card, { padding: "lg", children: _jsxs(Text, { variant: "displayMedium", children: [range, " chart placeholder"] }) }) })] }));
        }
        return _jsx(Demo, {});
    },
};
export const PageTransitionSwap = {
    render: () => {
        function Demo() {
            const [path, setPath] = useState('/horizon');
            return (_jsxs("div", { children: [_jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 16 }, children: ['/horizon', '/cascade', '/trace'].map((p) => (_jsx(Button, { variant: p === path ? 'primary' : 'ghost', size: "sm", onClick: () => setPath(p), children: p }, p))) }), _jsx(PageTransition, { pathname: path, children: _jsx(Card, { padding: "lg", children: _jsxs(Text, { variant: "displayMedium", children: ["Page: ", path] }) }) })] }));
        }
        return _jsx(Demo, {});
    },
};
//# sourceMappingURL=Motion.stories.js.map