import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AppShell } from './AppShell';
import { PageHeader } from './PageHeader';
import { Text } from './Text';
const meta = {
    title: 'Components/AppShell',
    component: AppShell,
    parameters: { layout: 'fullscreen' },
    tags: ['autodocs'],
    args: {
        navItems: [
            { label: 'Horizon', href: '/horizon' },
            { label: 'Cascade', href: '/cascade' },
            { label: 'Trace', href: '/trace' },
            { label: 'Brief', href: '/brief' },
        ],
        activePath: '/horizon',
        children: (_jsxs(_Fragment, { children: [_jsx(PageHeader, { kicker: "MPA Challenge 5", title: "Project Trueplan: horizon view", subtitle: "Forty-seven assumptions, ranked by projected breach date." }), _jsx(Text, { children: "Body content goes here." })] })),
    },
};
export default meta;
export const HorizonActive = {};
export const BriefActive = { args: { activePath: '/brief' } };
//# sourceMappingURL=AppShell.stories.js.map