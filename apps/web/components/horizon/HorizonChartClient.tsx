'use client';

import { HorizonChart, type HorizonDatum } from '@tp/design-system';
import { useRouter } from 'next/navigation';

export function HorizonChartClient({ data }: { data: HorizonDatum[] }) {
  const router = useRouter();
  return (
    <HorizonChart
      data={data}
      onSelect={(id) => {
        const row = data.find((d) => d.assumptionId === id);
        if (row) router.push(`/trace/${row.code}`);
      }}
    />
  );
}
