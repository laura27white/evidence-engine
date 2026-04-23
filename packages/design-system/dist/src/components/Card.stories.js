import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from './Card';
import { Text } from './Text';
const meta = {
    title: 'Components/Card',
    component: Card,
    tags: ['autodocs'],
    args: { variant: 'default', padding: 'md' },
    argTypes: {
        variant: { control: { type: 'select' }, options: ['default', 'elevated', 'outlined', 'flush'] },
        padding: { control: { type: 'select' }, options: ['none', 'sm', 'md', 'lg'] },
    },
};
export default meta;
export const Default = {
    args: {
        children: (_jsxs("div", { children: [_jsx(Text, { variant: "label", tone: "accent", children: "Assumption A046" }), _jsx(Text, { variant: "displaySmall", as: "h3", children: "Inflation within forecast band" }), _jsx(Text, { variant: "body", children: "Current CPI 2.6 percent, tolerance 40 percent, drift score 0.05." })] })),
    },
};
export const Elevated = {
    args: {
        variant: 'elevated',
        children: _jsx(Text, { children: "Elevated cards carry a soft shadow; used on hover or to draw focus." }),
    },
};
export const Outlined = {
    args: {
        variant: 'outlined',
        children: (_jsx(Text, { children: "Outlined cards remove the paper tint; used when the surface sits on a white page." })),
    },
};
export const Grid = {
    render: () => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }, children: [_jsx(Card, { variant: "default", children: _jsx(Text, { children: "Default" }) }), _jsx(Card, { variant: "elevated", children: _jsx(Text, { children: "Elevated" }) }), _jsx(Card, { variant: "outlined", children: _jsx(Text, { children: "Outlined" }) })] })),
};
//# sourceMappingURL=Card.stories.js.map