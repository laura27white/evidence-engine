import { type HTMLAttributes, type ReactNode } from 'react';
export interface StaggerFadeProps extends HTMLAttributes<HTMLDivElement> {
    /** Per-item delay in ms. Defaults to 80. */
    delayMs?: number;
    /** Total animation duration per item in ms. Defaults to 180. */
    durationMs?: number;
    children: ReactNode;
}
export declare function StaggerFade({ delayMs, durationMs, children, ...rest }: StaggerFadeProps): JSX.Element;
//# sourceMappingURL=StaggerFade.d.ts.map