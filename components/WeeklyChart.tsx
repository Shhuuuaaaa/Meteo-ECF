'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useUnitStore } from '@/lib/useUnitStore'
import { useWeatherConditionStore } from '@/lib/useWeatherConditionStore'
import { tempRaw } from '@/lib/units'
import type { DailyWeather } from '@/lib/weatherData'

interface WeeklyChartProps {
  weekly: DailyWeather[]
}

interface TooltipEntry {
  dataKey: string
  value: number
  color: string
}

function abbrev(day: string): string {
  if (day === "Aujourd'hui") return 'Auj.'
  return day.slice(0, 3)
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
  highColor,
  lowColor,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  unit?: string
  highColor: string
  lowColor: string
}) {
  if (!active || !payload?.length) return null
  const high = payload.find((p) => p.dataKey === 'high')
  const low  = payload.find((p) => p.dataKey === 'low')
  const sym  = unit === 'imperial' ? '°F' : '°C'

  return (
    <div
      style={{
        background: 'rgba(9,9,11,0.90)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 16px 32px -8px rgba(0,0,0,0.6)',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginBottom: '8px' }}>
        {label}
      </p>
      {high && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ height: '7px', width: '7px', borderRadius: '50%', background: highColor, flexShrink: 0, display: 'block' }} />
          <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 500 }}>{high.value}{sym}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>max</span>
        </div>
      )}
      {low && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ height: '7px', width: '7px', borderRadius: '50%', background: lowColor, flexShrink: 0, display: 'block' }} />
          <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 500 }}>{low.value}{sym}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>min</span>
        </div>
      )}
    </div>
  )
}

export function WeeklyChart({ weekly }: WeeklyChartProps) {
  const { unit } = useUnitStore()
  const { isDay } = useWeatherConditionStore()

  // Jour : orange soleil / jaune ambre — se lisent sur fond lumineux comme sombre
  // Nuit : bleu électrique / violet — contrastes vifs sur fond sombre
  const highColor = isDay ? '#f97316' : '#38bdf8'
  const lowColor  = isDay ? '#eab308' : '#a78bfa'

  const data = weekly.map((d) => ({
    label: abbrev(d.day),
    high:  tempRaw(d.high, unit),
    low:   tempRaw(d.low, unit),
  }))

  return (
    <div className="w-full rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6 lg:flex lg:flex-col lg:h-full">
      <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-5 px-1">
        Courbe de température
      </p>

      <div className="h-[150px] lg:flex-1 lg:min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={highColor} stopOpacity={0.30} />
              <stop offset="100%" stopColor={highColor} stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lowColor} stopOpacity={0.24} />
              <stop offset="100%" stopColor={lowColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="2 6"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />

          <YAxis hide domain={['dataMin - 4', 'dataMax + 4']} />

          <Tooltip
            content={<ChartTooltip unit={unit} highColor={highColor} lowColor={lowColor} />}
            cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '3 4' }}
          />

          <Area
            type="monotone"
            dataKey="high"
            stroke={highColor}
            strokeWidth={2.5}
            fill="url(#highGradient)"
            dot={false}
            activeDot={{ r: 4, fill: highColor, strokeWidth: 0 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke={lowColor}
            strokeWidth={2.5}
            fill="url(#lowGradient)"
            dot={false}
            activeDot={{ r: 4, fill: lowColor, strokeWidth: 0 }}
            animationDuration={900}
            animationEasing="ease-out"
            animationBegin={120}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-5 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="block h-px w-5 rounded-full" style={{ backgroundColor: highColor }} />
          <span className="text-white/30 text-xs">Max</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="block h-px w-5 rounded-full" style={{ backgroundColor: lowColor }} />
          <span className="text-white/30 text-xs">Min</span>
        </div>
      </div>
    </div>
  )
}
