'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS: Record<string, string> = {
  desktop: '#1e3a8a',
  mobile: '#3b82f6',
  tablet: '#93c5fd',
}
const FALLBACK_COLORS = ['#1e3a8a', '#3b82f6', '#93c5fd', '#bfdbfe']

const LABELS: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet',
  unknown: 'Unknown',
}

export default function StatsDonutChart({ devices }: { devices: Record<string, number> }) {
  const total = Object.values(devices).reduce((a, b) => a + b, 0)
  const data = Object.entries(devices)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      key,
      name: LABELS[key] ?? key,
      value,
      pct: Math.round((value / total) * 100),
      color: COLORS[key] ?? FALLBACK_COLORS[0],
    }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.key}
                fill={entry.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | string | undefined, name: string | number | undefined) => [`${value ?? 0} views`, String(name ?? '')]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-4 mt-2 justify-center">
        {data.map(item => (
          <div key={item.key} className="flex items-center gap-1.5 text-sm text-gray-600">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span>{item.name}: <span className="font-medium">{item.value.toLocaleString()}</span> ({item.pct}%)</span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">Total: {total.toLocaleString()} views</p>
    </div>
  )
}
