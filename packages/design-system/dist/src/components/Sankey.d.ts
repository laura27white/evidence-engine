/**
 * Sankey primitives: SankeyNode and SankeyEdge.
 *
 * The full Sankey composition belongs to Prompt 8. This module exposes the two SVG
 * primitives the Cascade view will combine: a labelled node rectangle and a curved
 * edge whose thickness encodes the propagation weight. Each primitive accepts raw
 * coordinates; the layout algorithm is deferred to Prompt 8.
 */
import { type SVGAttributes } from 'react';
export interface SankeyNodeProps extends SVGAttributes<SVGGElement> {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    tone?: 'default' | 'accent' | 'warning' | 'critical' | 'safe';
}
export declare const SankeyNode: import("react").ForwardRefExoticComponent<SankeyNodeProps & import("react").RefAttributes<SVGGElement>>;
export interface SankeyEdgeProps extends Omit<SVGAttributes<SVGPathElement>, 'source' | 'target'> {
    /** Source point {x, y} in SVG space. */
    source: {
        x: number;
        y: number;
    };
    /** Target point {x, y} in SVG space. */
    target: {
        x: number;
        y: number;
    };
    /** Thickness at the source and target. Typically derived from propagation weight. */
    strokeWidth?: number;
    /** Visual tone of the edge; usually mirrors the downstream node's severity. */
    tone?: 'default' | 'warning' | 'critical';
}
export declare const SankeyEdge: import("react").ForwardRefExoticComponent<SankeyEdgeProps & import("react").RefAttributes<SVGPathElement>>;
//# sourceMappingURL=Sankey.d.ts.map