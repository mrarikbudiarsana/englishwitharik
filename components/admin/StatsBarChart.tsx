'use client'

import { useRouter } from 'next/navigation'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface DataPoint {
  label: string
  date?: string  // ISO date string (YYYY-MM-DD) for navigation
  views: number
  visitors: number
}

interface Props {
  data: DataPoint[]
  granularity?: 'hour' | 'day' | 'month'
}

export default function StatsBarChart({ data, granularity = 'day' }: Props) {
  const router = useRouter()
  const isClickable = granularity !== 'hour'

  // Handle bar click - navigate to that day's stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBarClick = (entry: any) => {
    if (!isClickable || !entry?.date) return

    if (granularity === 'day') {
      // Navigate to single day view
      router.push(`/admin/stats?from=${entry.date}&to=${entry.date}`)
    } else if (granularity === 'month') {
      // Navigate to that month (first to last day)
      const d = new Date(entry.date + '-01')
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const from = `${entry.date}-01`
      const to = lastDay.toISOString().substring(0, 10)
      router.push(`/admin/stats?from=${from}&to=${to}`)
    }
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        className={isClickable ? 'cursor-pointer' : ''}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          cursor={{ fill: '#f3f4f6' }}
        />
        <Bar
          dataKey="views"
          name="Views"
          fill="#3b82f6"
          radius={[3, 3, 0, 0]}
          maxBarSize={40}
          onClick={handleBarClick}
          className={isClickable ? 'cursor-pointer' : ''}
        />
        <Bar
          dataKey="visitors"
          name="Visitors"
          fill="#10b981"
          radius={[3, 3, 0, 0]}
          maxBarSize={40}
          onClick={handleBarClick}
          className={isClickable ? 'cursor-pointer' : ''}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
