'use client'

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

// Pulse variant that matches the glassmorphism cards
const S = ({ className }: { className: string }) => (
  <Skeleton className={`bg-white/10 ${className}`} />
)

export function WeatherSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* ── Main weather card ── */}
      <div className="w-full rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-7">
        {/* Header: city + icon */}
        <div className="flex items-start justify-between mb-7">
          <div className="space-y-2.5 min-w-0 flex-1 pr-4">
            <S className="h-3 w-16 rounded-full" />        {/* country */}
            <S className="h-9 w-3/4 rounded-xl" />         {/* city name */}
          </div>
          <S className="h-12 w-12 shrink-0 rounded-2xl" /> {/* weather icon */}
        </div>

        {/* Temperature */}
        <S className="h-20 w-40 sm:h-24 sm:w-48 mb-3 rounded-2xl" />

        {/* Condition description */}
        <S className="h-5 w-2/3 mb-5 rounded-lg" />

        {/* Pills: feels like + high/low */}
        <div className="flex gap-2 flex-wrap">
          <S className="h-7 w-28 rounded-full" />
          <S className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* ── Weekly chart ── */}
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
        <S className="h-3 w-40 mb-5 rounded-full" />
        <S className="h-36 w-full rounded-2xl" />
        <div className="flex gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <S className="h-px w-5 rounded-full" />
            <S className="h-3 w-6 rounded-full" />
          </div>
          <div className="flex items-center gap-1.5">
            <S className="h-px w-5 rounded-full" />
            <S className="h-3 w-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Hourly forecast ── */}
      <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
        <S className="h-3 w-36 mb-4 rounded-full" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2.5 px-3 py-3.5 min-w-[66px] shrink-0"
            >
              <S className="h-3 w-8 rounded-full" />   {/* time */}
              <S className="h-5 w-5 rounded-full" />   {/* icon */}
              <S className="h-3.5 w-8 rounded-full" /> {/* temp */}
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div>
        <S className="h-3 w-14 mb-3 rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <S className="h-4 w-4 rounded" />
                <S className="h-3 w-20 rounded-full" />
              </div>
              <S className="h-7 w-16 rounded-lg" />
              <S className="h-3 w-3/4 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <S className="h-3 w-20 rounded-full" />
          <S className="h-6 w-36 rounded-full" />
        </div>
        <S className="h-[260px] w-full rounded-none" />
      </div>

      {/* ── Weekly forecast ── */}
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
        <S className="h-3 w-28 mb-4 rounded-full" />
        <div className="flex flex-col divide-y divide-white/5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <S className="h-3 w-20 shrink-0 rounded-full" />  {/* day name */}
              <S className="h-4 w-4 shrink-0 rounded-full" />   {/* icon */}
              <S className="h-2.5 w-6 shrink-0 rounded-full" /> {/* low */}
              <S className="h-1.5 flex-1 rounded-full" />        {/* bar */}
              <S className="h-2.5 w-6 shrink-0 rounded-full" /> {/* high */}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
