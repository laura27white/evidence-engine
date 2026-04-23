/**
 * Minimal deterministic graph layout helper.
 *
 * The spec calls for Cytoscape with cose-bilkent. To keep the design-system bundle
 * small and CI fast for the hackathon milestone, we ship a deterministic radial /
 * Sugiyama-lite layout that works well for the HPO scale (~50 nodes). Swap for
 * Cytoscape later if larger graphs materialise.
 */

export interface GraphNodeInput {
  id: string;
  code: string;
  category: string;
  highlighted: boolean;
}

export interface GraphEdgeInput {
  source: string;
  target: string;
  weight: number;
  highlighted: boolean;
}

export interface LaidOutGraphNode extends GraphNodeInput {
  x: number;
  y: number;
  degree: number;
}

export interface LaidOutGraphEdge extends GraphEdgeInput {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export interface LayoutOptions {
  width: number;
  height: number;
  padding?: number;
}

/**
 * Layout by category column then stack within column. Deterministic by input order.
 */
export function layoutCascadeGraph(
  nodes: GraphNodeInput[],
  edges: GraphEdgeInput[],
  options: LayoutOptions,
): { nodes: LaidOutGraphNode[]; edges: LaidOutGraphEdge[] } {
  const padding = options.padding ?? 32;
  const innerWidth = Math.max(40, options.width - padding * 2);
  const innerHeight = Math.max(40, options.height - padding * 2);

  const categories = Array.from(new Set(nodes.map((n) => n.category))).sort();
  const categoryToColumn = new Map<string, number>();
  categories.forEach((c, i) => categoryToColumn.set(c, i));

  const byCategory = new Map<string, GraphNodeInput[]>();
  for (const n of nodes) {
    const list = byCategory.get(n.category) ?? [];
    list.push(n);
    byCategory.set(n.category, list);
  }

  const degree = new Map<string, number>();
  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }

  const laidOut = new Map<string, LaidOutGraphNode>();
  for (const [cat, column] of byCategory) {
    const col = categoryToColumn.get(cat) ?? 0;
    const x =
      categories.length <= 1
        ? options.width / 2
        : padding + (col / (categories.length - 1)) * innerWidth;
    const orderedColumn = [...column].sort(
      (a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0),
    );
    const rowCount = orderedColumn.length;
    for (let i = 0; i < rowCount; i += 1) {
      const node = orderedColumn[i]!;
      const y = rowCount <= 1 ? options.height / 2 : padding + (i / (rowCount - 1)) * innerHeight;
      laidOut.set(node.id, { ...node, x, y, degree: degree.get(node.id) ?? 0 });
    }
  }

  const laidEdges: LaidOutGraphEdge[] = [];
  for (const e of edges) {
    const source = laidOut.get(e.source);
    const target = laidOut.get(e.target);
    if (!source || !target) continue;
    laidEdges.push({
      ...e,
      sourceX: source.x,
      sourceY: source.y,
      targetX: target.x,
      targetY: target.y,
    });
  }

  return { nodes: [...laidOut.values()], edges: laidEdges };
}
