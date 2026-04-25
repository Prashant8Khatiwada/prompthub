'use client'

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'

interface Props {
  type: 'line' | 'bar'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

export default function AnalyticsChart({ type, data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-sm">
        No data available
      </div>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(str) => {
              const date = new Date(str)
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }}
          />
          <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#09090b' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="title"
          stroke="#71717a"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(str) => str.length > 10 ? str.substring(0, 10) + '...' : str}
        />
        <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
          itemStyle={{ fontSize: '12px' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
        <Bar dataKey="copies" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} name="Prompt Copies" />
        <Bar dataKey="email_captures" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} name="Email Captures" />
      </BarChart>
    </ResponsiveContainer>
  )
}
