import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Monogram, Wordmark } from './Wordmark';
const meta = {
    title: 'Foundations/Brand',
    component: Wordmark,
    parameters: { layout: 'padded' },
    tags: ['autodocs'],
};
export default meta;
export const Ink = { args: { variant: 'ink', height: 24 } };
export const Accent = { args: { variant: 'accent', height: 24 } };
export const Inverse = {
    args: { variant: 'inverse', height: 24 },
    decorators: [
        (Story) => (_jsx("div", { style: { background: '#1A1A1A', padding: 24, borderRadius: 4 }, children: _jsx(Story, {}) })),
    ],
};
export const Scale = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }, children: [_jsx(Wordmark, { height: 16 }), _jsx(Wordmark, { height: 24 }), _jsx(Wordmark, { height: 40 }), _jsx(Wordmark, { height: 64 })] })),
};
export const MonogramVariants = {
    render: () => (_jsxs("div", { style: { display: 'flex', gap: 20, alignItems: 'center' }, children: [_jsx(Monogram, { size: 32, variant: "ink" }), _jsx(Monogram, { size: 48, variant: "accent" }), _jsx(Monogram, { size: 64, variant: "inverse" })] })),
};
//# sourceMappingURL=Wordmark.stories.js.map