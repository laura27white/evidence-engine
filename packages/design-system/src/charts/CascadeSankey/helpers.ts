/**
 * CascadeSankey layout helpers.
 *
 * Positions nodes by level (horizontal) and value (vertical). Each link is a cubic
 * Bezier from source right-edge to target left-edge, width proportional to value.
 * All pure, no external dependencies.
 */

export interface SankeyNodeInput {
  id: string;
  code: string;
  level: number;
  totalDrift: number;
}

export interface SankeyLinkInput {
  sourceId: string;
  targetId: string;
  value: number;
  pathDescription: string;
}

export interface LaidOutNode extends SankeyNodeInput {
  x: number;
  yTop: number;
  yBottom: number;
}

export interface LaidOutLink extends SankeyLinkInput {
  path: string;
  sourceY: number;
  targetY: number;
  width: number;
}

export interface LayoutOptions {
  width: number;
  height: number;
  nodeWidth?: number;
  paddingX?: number;
  paddingY?: number;
  rowGap?: number;
}

export function layoutSankey(
  nodes: SankeyNodeInput[],
  links: SankeyLinkInput[],
  options: LayoutOptions,
): { nodes: LaidOutNode[]; links: LaidOutLink[] } {
  const nodeWidth = options.nodeWidth ?? 14;
  const paddingX = options.paddingX ?? 120;
  const paddingY = options.paddingY ?? 24;
  const rowGap = options.rowGap ?? 4;
  const innerWidth = Math.max(40, options.width - paddingX * 2 - nodeWidth);
  const innerHeight = Math.max(40, options.height - paddingY * 2);

  const levels = new Map<number, SankeyNodeInput[]>();
  for (const n of nodes) {
    const bucket = levels.get(n.level) ?? [];
    bucket.push(n);
    levels.set(n.level, bucket);
  }
  const levelKeys = [...levels.keys()].sort((a, b) => a - b);
  const maxLevel = levelKeys[levelKeys.length - 1] ?? 0;

  const laidOut = new Map<string, LaidOutNode>();
  for (const level of levelKeys) {
    const column = levels.get(level)!;
    const totalDrift = column.reduce((acc, n) => acc + Math.max(0.001, n.totalDrift), 0);
    const availableHeight = innerHeight - rowGap * (column.length - 1);
    const x = maxLevel === 0 ? paddingX : paddingX + (level / Math.max(1, maxLevel)) * innerWidth;
    let cursorY = paddingY;
    for (const node of column) {
      const fraction = Math.max(0.001, node.totalDrift) / totalDrift;
      const boxHeight = Math.max(10, availableHeight * fraction);
      laidOut.set(node.id, {
        ...node,
        x,
        yTop: cursorY,
        yBottom: cursorY + boxHeight,
      });
      cursorY += boxHeight + rowGap;
    }
  }

  const maxValue = links.reduce((acc, l) => Math.max(acc, l.value), 0.0001);
  const laidLinks: LaidOutLink[] = [];
  for (const link of links) {
    const source = laidOut.get(link.sourceId);
    const target = laidOut.get(link.targetId);
    if (!source || !target) continue;
    const width = Math.max(1.5, (link.value / maxValue) * 24);
    const sourceX = source.x + nodeWidth;
    const targetX = target.x;
    const sourceY = (source.yTop + source.yBottom) / 2;
    const targetY = (target.yTop + target.yBottom) / 2;
    const mx = (sourceX + targetX) / 2;
    const path = `M ${sourceX.toFixed(1)} ${sourceY.toFixed(1)} C ${mx.toFixed(1)} ${sourceY.toFixed(1)}, ${mx.toFixed(1)} ${targetY.toFixed(1)}, ${targetX.toFixed(1)} ${targetY.toFixed(1)}`;
    laidLinks.push({ ...link, path, sourceY, targetY, width });
  }
  laidLinks.sort((a, b) => b.value - a.value);
  return { nodes: [...laidOut.values()], links: laidLinks };
}
