'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { CityCount } from '@/lib/db/queries/admin/timeseries';

const BRAND = '#5DD62C';

interface Props {
  data: CityCount[];
}

export function CityBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 8, right: 12, left: -8, bottom: 0 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
        <XAxis type="number" stroke="#888" fontSize={11} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="city" type="category" stroke="#888" fontSize={11} tickLine={false} width={80} />
        <Tooltip
          contentStyle={{
            background: '#141414',
            border: '1px solid #262626',
            borderRadius: 12,
            color: '#e7e7e7',
          }}
          formatter={(value) => [String(value), 'Teklif']}
        />
        <Bar dataKey="count" fill={BRAND} radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
