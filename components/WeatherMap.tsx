'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Overlay = 'radar' | 'satellite'

interface RainViewerData {
  host: string
  radar: { past: { time: number; path: string }[] }
  satellite: { infrared: { time: number; path: string }[] }
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => (
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] ?? c
  ))
}

function isValidRvData(d: unknown): d is RainViewerData {
  if (typeof d !== 'object' || d === null) return false
  const data = d as Record<string, unknown>
  const radar = data.radar as Record<string, unknown> | undefined
  const satellite = data.satellite as Record<string, unknown> | undefined
  return (
    typeof data.host === 'string' &&
    data.host.startsWith('https://') &&
    Array.isArray(radar?.past) &&
    Array.isArray(satellite?.infrared)
  )
}

interface WeatherMapProps {
  lat: number
  lon: number
  city: string
}

export function WeatherMap({ lat, lon, city }: WeatherMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef      = useRef<L.Map | null>(null)
  const markerRef   = useRef<L.CircleMarker | null>(null)
  const tileRef     = useRef<L.TileLayer | null>(null)

  const [overlay, setOverlay]   = useState<Overlay>('radar')
  const [rv, setRv]             = useState<RainViewerData | null>(null)

  // Fetch RainViewer frame index once
  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5_000)
    fetch('https://api.rainviewer.com/public/weather-maps.json', {
      signal: controller.signal,
      credentials: 'omit',
    })
      .then((r) => {
        if (!r.ok) throw new Error(`RainViewer ${r.status}`)
        return r.json()
      })
      .then((d: unknown) => {
        if (isValidRvData(d)) setRv(d)
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeoutId))
    return () => controller.abort()
  }, [])

  // Initialize map (once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 6,
      zoomControl: false,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a> · CartoDB',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.circleMarker([lat, lon], {
      radius: 6,
      fillColor: '#38bdf8',
      color: '#0ea5e9',
      weight: 2,
      opacity: 0.9,
      fillOpacity: 0.85,
    })
      .bindTooltip(escapeHtml(city), { permanent: false, direction: 'top' })
      .addTo(map)

    mapRef.current    = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current    = null
      markerRef.current = null
      tileRef.current   = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recenter when city changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView([lat, lon], 6, { animate: true })
    markerRef.current?.setLatLng([lat, lon]).bindTooltip(escapeHtml(city))
  }, [lat, lon, city])

  // Swap overlay tile layer
  useEffect(() => {
    const map = mapRef.current
    if (!map || !rv) return

    if (tileRef.current) {
      map.removeLayer(tileRef.current)
      tileRef.current = null
    }

    const frames =
      overlay === 'radar' ? rv.radar.past : rv.satellite.infrared
    const frame = frames.at(-1)
    if (!frame) return

    // RainViewer tile URL — colorScheme 4 = vivid for radar, 0 = IR for satellite
    const colorScheme = overlay === 'radar' ? '4' : '0'
    const options     = overlay === 'radar' ? '1_0' : '0_0'
    const url = `${rv.host}${frame.path}/256/{z}/{x}/{y}/${colorScheme}/${options}.png`

    const layer = L.tileLayer(url, { opacity: 0.7, maxZoom: 19 })
    layer.addTo(map)
    tileRef.current = layer
  }, [overlay, rv])

  return (
    <div className="w-full rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden lg:flex lg:flex-col lg:h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
          Carte météo
        </p>
        <div className="flex gap-1 rounded-full bg-white/5 p-1">
          {(['radar', 'satellite'] as Overlay[]).map((o) => (
            <button
              key={o}
              onClick={() => setOverlay(o)}
              className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                overlay === o
                  ? 'bg-white/15 text-white/90'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              {o === 'radar' ? 'Précipitations' : 'Couverture'}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        role="application"
        aria-label="Carte météo interactive"
        className="h-[260px] lg:flex-1 lg:min-h-[200px]"
      />
    </div>
  )
}
