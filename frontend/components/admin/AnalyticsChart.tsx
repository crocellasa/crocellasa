'use client'

import { useEffect, useState } from 'react'

interface ChartData {
  date: string
  bookings: number
  doorOpens: number
}

export default function AnalyticsChart() {
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookings: Math.floor(Math.random() * 10) + 2,
        doorOpens: Math.floor(Math.random() * 25) + 5,
      }
    })
    setData(last7Days)
  }, [])

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.bookings, d.doorOpens))
  )

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-mono-900 rounded-full"></div>
          <span className="text-mono-600 font-light">Bookings Created</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-mono-300 rounded-full"></div>
          <span className="text-mono-600 font-light">Doors Opened</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-64">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
            {/* Bars */}
            <div className="w-full flex gap-1.5 items-end h-full px-1">
              {/* Bookings Bar */}
              <div
                className="flex-1 bg-mono-900 rounded-t-sm transition-all duration-300 group-hover:bg-mono-800"
                style={{
                  height: `${(item.bookings / maxValue) * 100}%`,
                  minHeight: item.bookings > 0 ? '4px' : '0',
                }}
                title={`${item.bookings} bookings`}
              />
              {/* Door Opens Bar */}
              <div
                className="flex-1 bg-mono-200 rounded-t-sm transition-all duration-300 group-hover:bg-mono-300"
                style={{
                  height: `${(item.doorOpens / maxValue) * 100}%`,
                  minHeight: item.doorOpens > 0 ? '4px' : '0',
                }}
                title={`${item.doorOpens} door opens`}
              />
            </div>
            {/* Date Label */}
            <p className="text-[10px] text-mono-400 font-medium uppercase tracking-wider whitespace-nowrap">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
