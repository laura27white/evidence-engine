import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SourceLink } from './SourceLink';
const meta = {
    title: 'Components/SourceLink',
    component: SourceLink,
    tags: ['autodocs'],
    args: {
        href: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
        label: 'ONS:D7G7',
    },
    argTypes: {
        tone: { control: { type: 'select' }, options: ['default', 'muted'] },
        size: { control: { type: 'select' }, options: ['sm', 'md'] },
    },
};
export default meta;
export const Default = {};
export const Muted = { args: { tone: 'muted' } };
export const List = {
    render: () => (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: [_jsx(SourceLink, { href: "https://www.ons.gov.uk/economy", label: "ONS:D7G7" }), _jsx(SourceLink, { href: "https://www.bankofengland.co.uk", label: "BOE:IUDSOIA" }), _jsx(SourceLink, { href: "https://www.gov.uk/api/search.json", label: "GOVUK:hmrc-tax-policy-announcements" })] })),
};
//# sourceMappingURL=SourceLink.stories.js.map