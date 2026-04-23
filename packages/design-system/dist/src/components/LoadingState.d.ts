/**
 * LoadingState: skeleton shimmer.
 *
 * Not a spinner; skeleton blocks stand in for expected content so the page does not
 * jump when data arrives. Respects `prefers-reduced-motion`: the shimmer collapses to
 * a static tint when the user has asked not to be animated.
 */
import { type HTMLAttributes } from 'react';
export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
    /** Number of skeleton rows. Defaults to 3. */
    rows?: number;
    /** Row height; CSS length. Defaults to 14px. */
    rowHeight?: string;
    /** Accessible label read when content is loading. */
    label?: string;
}
export declare const LoadingState: import("react").ForwardRefExoticComponent<LoadingStateProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=LoadingState.d.ts.map