import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text } from './Text';
const meta = {
    title: 'Components/Text',
    component: Text,
    tags: ['autodocs'],
    args: {
        children: 'Project Trueplan forecasts assumption drift.',
        variant: 'body',
        tone: 'primary',
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: [
                'displayMax',
                'displayLarge',
                'displayMedium',
                'displaySmall',
                'bodyLarge',
                'body',
                'bodySmall',
                'label',
                'monoLarge',
                'mono',
                'monoSmall',
            ],
        },
        tone: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'tertiary', 'inverse', 'accent'],
        },
        as: { control: { type: 'text' } },
    },
};
export default meta;
export const Body = {};
export const DisplayScale = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsx(Text, { variant: "displayMax", as: "h1", children: "Editorial intelligence" }), _jsx(Text, { variant: "displayLarge", as: "h2", children: "Project Trueplan" }), _jsx(Text, { variant: "displayMedium", as: "h3", children: "Assumption drift forecast" }), _jsx(Text, { variant: "displaySmall", as: "h4", children: "Forty-seven assumptions, live data" })] })),
};
export const BodyScale = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '65ch' }, children: [_jsx(Text, { variant: "bodyLarge", children: "Body large: used for opening paragraphs, page subtitles, and anything the eye should land on first after a display heading." }), _jsx(Text, { variant: "body", children: "Body: the workhorse. Dense, legible at small sizes, right weight and tracking for long-form reading." }), _jsx(Text, { variant: "bodySmall", children: "Body small: secondary copy, captions, helper text." }), _jsx(Text, { variant: "label", children: "Label uppercase" })] })),
};
export const MonoScale = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: [_jsx(Text, { variant: "monoLarge", children: "$ pnpm ingest:backfill" }), _jsx(Text, { variant: "mono", children: "ONS:D7G7 2025-10-01 2.6% YoY" }), _jsx(Text, { variant: "monoSmall", children: "sha256 2cf24dba5fb0a30e..." })] })),
};
export const Tones = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx(Text, { tone: "primary", children: "Primary ink (#1A1A1A)" }), _jsx(Text, { tone: "secondary", children: "Secondary ink (#4A4A4A)" }), _jsx(Text, { tone: "tertiary", children: "Tertiary ink (#7A7A7A)" }), _jsx(Text, { tone: "accent", children: "Accent teal (#0E6B6B)" }), _jsx("div", { style: { background: '#1A1A1A', padding: 12, borderRadius: 4 }, children: _jsx(Text, { tone: "inverse", children: "Inverse on ink" }) })] })),
};
//# sourceMappingURL=Text.stories.js.map