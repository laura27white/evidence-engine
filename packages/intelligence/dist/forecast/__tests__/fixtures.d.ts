import type { AssumptionBaseline, Measurement } from '../types';
export declare const FIXED_NOW: Date;
export declare function baseline(value?: number, tolerancePct?: number, unit?: string): AssumptionBaseline;
export declare function linearSeries(options: {
    n: number;
    slope: number;
    intercept: number;
    startDaysAgo: number;
    cadenceDays?: number;
    assumptionId?: string;
}): Measurement[];
export declare function constantSeries(n: number, value: number, assumptionId?: string): Measurement[];
//# sourceMappingURL=fixtures.d.ts.map