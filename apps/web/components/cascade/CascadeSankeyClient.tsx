'use client';

import { CascadeSankey, type SankeyLinkInput, type SankeyNodeInput } from '@tp/design-system';

export function CascadeSankeyClient({
  nodes,
  links,
}: {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
}) {
  return <CascadeSankey nodes={nodes} links={links} height={480} />;
}
