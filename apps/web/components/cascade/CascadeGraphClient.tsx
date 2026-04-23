'use client';

import { CascadeGraph, type GraphEdgeInput, type GraphNodeInput } from '@tp/design-system';
import { useRouter } from 'next/navigation';

export function CascadeGraphClient({
  nodes,
  edges,
  highlightedSourceId,
  codeById,
}: {
  nodes: GraphNodeInput[];
  edges: GraphEdgeInput[];
  highlightedSourceId?: string;
  codeById: Record<string, string>;
}) {
  const router = useRouter();
  return (
    <CascadeGraph
      nodes={nodes}
      edges={edges}
      highlightedSourceId={highlightedSourceId}
      onSelectNode={(id) => {
        const code = codeById[id];
        if (code) router.push(`/cascade/${code}`);
      }}
    />
  );
}
