import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from './Badge';
import { Button } from './Button';
import { PageHeader } from './PageHeader';
const meta = {
    title: 'Components/PageHeader',
    component: PageHeader,
    parameters: { layout: 'padded' },
    tags: ['autodocs'],
    args: {
        kicker: 'MPA Challenge 5',
        title: 'Horizon',
        subtitle: 'Forty-seven assumptions, ranked by projected breach date.',
        size: 'lg',
    },
};
export default meta;
export const Default = {};
export const WithMeta = {
    args: {
        meta: (_jsxs(_Fragment, { children: [_jsx(Badge, { variant: "neutral", children: "Updated 14m ago" }), _jsx(Badge, { variant: "neutral", children: "HPO24A01-DEMO" }), _jsx(Badge, { variant: "neutral", children: "ONS, BoE, gov.uk" })] })),
    },
};
export const WithActions = {
    args: {
        actions: _jsx(Button, { variant: "secondary", children: "Export" }),
    },
};
//# sourceMappingURL=PageHeader.stories.js.map