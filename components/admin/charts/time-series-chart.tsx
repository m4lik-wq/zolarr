'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DayCount } from '@/lib/utils/date-series';

const BRAND = '#5DD62C';

interface Props {
  data: DayCount[];
  color?: string;
}

export function TimeSeriesChart({ data, color = BRAND }: Props) {
  // Format date for X axis (MM-DD)
  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formatted} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="label" stroke="#888" fontSize={11} tickLine={false} />
        <YAxis stroke="#888" fontSize={11} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: '#141414',
            border: '1px solid #262626',
            borderRadius: 12,
            color: '#e7e7e7',
          }}
          labelStyle={{ color: '#888' }}
          formatter={(value) => [String(value), 'Adet']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
