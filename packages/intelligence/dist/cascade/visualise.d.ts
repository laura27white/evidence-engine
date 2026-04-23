/**
 * Pure data transformers for UI consumers. These functions do not import any
 * visualisation library; Prompt 8 renders the returned shapes.
 */
import { type CascadeGraph, type SingleSourcePropagation } from './types';
export interface SankeyNodeData {
    id: string;
    label: string;
    level: number;
}
export interface SankeyLinkData {
    source: string;
    target: string;
    value: number;
}
export interface CytoscapeNode {
    data: {
        id: string;
        label: string;
        category: string;
        highlighted: boolean;
    };
}
export interface CytoscapeEdge {
    data: {
        id: string;
        source: string;
        target: string;
        weight: number;
        highlighted: boolean;
    };
}
export interface CytoscapeElements {
    elements: Array<CytoscapeNode | CytoscapeEdge>;
}
export declare function toSankeyData(propagation: SingleSourcePropagation, graph: CascadeGraph): {
    nodes: SankeyNodeData[];
    links: SankeyLinkData[];
};
export declare function toCytoscapeData(graph: CascadeGraph, highlight?: {
    sourceId: string;
    reachable: Set<string>;
}): CytoscapeElements;
//# sourceMappingURL=visualise.d.ts.map