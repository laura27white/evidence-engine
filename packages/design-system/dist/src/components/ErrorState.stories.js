import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from './Button';
import { ErrorState } from './ErrorState';
const meta = {
    title: 'Components/ErrorState',
    component: ErrorState,
    tags: ['autodocs'],
    args: {
        title: 'Ingestion stalled',
        description: 'The ONS timeseries endpoint returned HTTP 503 on the last three attempts. Project Trueplan is retrying in the background; data shown below is from the most recent successful fetch.',
        action: _jsx(Button, { variant: "secondary", children: "Retry now" }),
        technicalDetail: 'GET https://api.beta.ons.gov.uk/v1/timeseries/d7g7/dataset/mm23/data → 503 Service Unavailable',
    },
};
export default meta;
export const Default = {};
export const WithoutDetail = { args: { technicalDetail: undefined } };
//# sourceMappingURL=ErrorState.stories.js.map