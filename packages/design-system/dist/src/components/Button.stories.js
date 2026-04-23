import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
const meta = {
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
    args: { children: 'Run forecast', variant: 'primary', size: 'md' },
    argTypes: {
        variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'ghost'] },
        size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
        loading: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
};
export default meta;
export const Primary = {};
export const Secondary = { args: { variant: 'secondary' } };
export const Ghost = { args: { variant: 'ghost' } };
export const Variants = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [_jsx(Button, { variant: "primary", children: "Primary" }), _jsx(Button, { variant: "secondary", children: "Secondary" }), _jsx(Button, { variant: "ghost", children: "Ghost" })] })),
};
export const Sizes = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [_jsx(Button, { size: "sm", children: "Small" }), _jsx(Button, { size: "md", children: "Medium" }), _jsx(Button, { size: "lg", children: "Large" })] })),
};
export const Loading = { args: { loading: true } };
export const Disabled = { args: { disabled: true } };
export const WithTrailingIcon = {
    args: { trailingIcon: _jsx(ArrowRight, { size: 16, "aria-hidden": true }) },
};
//# sourceMappingURL=Button.stories.js.map