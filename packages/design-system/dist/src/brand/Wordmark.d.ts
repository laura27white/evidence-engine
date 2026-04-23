/**
 * Wordmark: "PROJECT TRUEPLAN" typographic mark as SVG.
 *
 * Rendered as SVG so the identity does not depend on font loading timing and so the
 * wordmark looks identical across browsers. Colour variants follow ARCHITECTURE.md
 * section 6.2.
 */
import { type SVGAttributes } from 'react';
export type WordmarkVariant = 'ink' | 'inverse' | 'accent';
export interface WordmarkProps extends Omit<SVGAttributes<SVGSVGElement>, 'fill' | 'height' | 'width'> {
    variant?: WordmarkVariant;
    /** Rendered height in px. Aspect ratio is preserved. */
    height?: number;
    /** Alternative text for the mark. Defaults to "Project Trueplan". */
    title?: string;
}
export declare const Wordmark: import("react").ForwardRefExoticComponent<WordmarkProps & import("react").RefAttributes<SVGSVGElement>>;
export interface MonogramProps extends Omit<SVGAttributes<SVGSVGElement>, 'fill' | 'height' | 'width'> {
    variant?: WordmarkVariant;
    size?: number;
    title?: string;
}
export declare const Monogram: import("react").ForwardRefExoticComponent<MonogramProps & import("react").RefAttributes<SVGSVGElement>>;
//# sourceMappingURL=Wordmark.d.ts.map