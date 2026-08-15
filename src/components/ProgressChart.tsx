import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { ProgressPoint } from '../hooks/useProgress'

const METRIC_COLOR = {
  maxWeight: '#d7263d',
  volume: '#1e6feb',
  oneRM: '#2e9e4f',
} as const

export type Metric = keyof typeof METRIC_COLOR

export function ProgressChart({ points, metric }: { points: ProgressPoint[]; metric: Metric }) {
  const data = points.map((p) => ({
    date: new Date(p.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
    value: Math.round(p[metric]),
  }))
  const color = METRIC_COLOR[metric]

  if (data.length === 0) {
    return (
      <p className="py-10 text-center font-mono text-sm text-chalk-dim">
        Todavía no hay datos para este ejercicio.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 5" stroke="#292d34" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#9a9c9f"
          fontSize={11}
          fontFamily="IBM Plex Mono"
          tickLine={false}
          axisLine={{ stroke: '#292d34' }}
        />
        <YAxis
          stroke="#9a9c9f"
          fontSize={11}
          fontFamily="IBM Plex Mono"
          tickLine={false}
          axisLine={false}
          width={38}
          tickFormatter={(v) => String(v)}
        />
        <Tooltip
          contentStyle={{
            background: '#16181c',
            border: '1px solid #292d34',
            borderRadius: 10,
            fontFamily: 'IBM Plex Mono',
            fontSize: 12,
          }}
          labelStyle={{ color: '#9a9c9f' }}
          itemStyle={{ color }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color, stroke: '#0b0c0e', strokeWidth: 2 }}
          animationDuration={700}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
