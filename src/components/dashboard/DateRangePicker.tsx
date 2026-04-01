'use client'

import { useState } from 'react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
}

function getDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getWeekRange(offset = 0) {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1 + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: getDateStr(monday), end: getDateStr(sunday) }
}

function getMonthRange(offset = 0) {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
  return { start: getDateStr(first), end: getDateStr(last) }
}

function getQuarterRange(offset = 0) {
  const now = new Date()
  const currentQuarter = Math.floor(now.getMonth() / 3)
  const targetQuarter = currentQuarter + offset
  const year = now.getFullYear() + Math.floor(targetQuarter / 4)
  const q = ((targetQuarter % 4) + 4) % 4
  const firstMonth = q * 3
  const first = new Date(year, firstMonth, 1)
  const last = new Date(year, firstMonth + 3, 0)
  return { start: getDateStr(first), end: getDateStr(last) }
}

const shortcuts = [
  { label: '本周', fn: () => getWeekRange(0) },
  { label: '上周', fn: () => getWeekRange(-1) },
  { label: '本月', fn: () => getMonthRange(0) },
  { label: '上月', fn: () => getMonthRange(-1) },
  { label: '本季度', fn: () => getQuarterRange(0) },
  { label: '上季度', fn: () => getQuarterRange(-1) },
]

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [localStart, setLocalStart] = useState(startDate)
  const [localEnd, setLocalEnd] = useState(endDate)

  const handleShortcut = (fn: () => { start: string; end: string }) => {
    const { start, end } = fn()
    setLocalStart(start)
    setLocalEnd(end)
    onChange(start, end)
  }

  const handleApply = () => {
    onChange(localStart, localEnd)
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {shortcuts.map((s) => (
            <button
              key={s.label}
              onClick={() => handleShortcut(s.fn)}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-400">至</span>
          <input
            type="date"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            查询
          </button>
        </div>
      </div>
    </div>
  )
}
