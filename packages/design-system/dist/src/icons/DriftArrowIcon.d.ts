/**
 * DriftArrowIcon: a double-stroke arrow indicating drift direction.
 *
 * Unlike Lucide's plain ArrowUp / ArrowDown, the drift arrow is stroked twice so it
 * survives as a recognisable mark when rendered small next to a numeric value. Uses
 * semantic props; pair with an accessible label.
 */
import { type SVGAttributes } from 'react';
export interface DriftArrowIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'direction'> {
    direction: 'up' | 'down' | 'flat';
    size?: number;
}
export declare const DriftArrowIcon: import("react").ForwardRefExoticComponent<DriftArrowIconProps & import("react").RefAttributes<SVGSVGElement>>;
//# sourceMappingURL=DriftArrowIcon.d.ts.map