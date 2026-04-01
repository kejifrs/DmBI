'use client'

import { useState, useEffect, useCallback } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import DateRangePicker from '@/components/dashboard/DateRangePicker'
import LineChart from '@/components/charts/LineChart'
import PieChart from '@/components/charts/PieChart'
import DataTable from '@/components/dashboard/DataTable'

type PublicType = 'firstcharge' | 'registration'

function getDefaultDateRange() {
  const end = new Date()
  const start = new Date(end.getFullYear(), end.getMonth(), 1)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

interface PublicData {
  totalCount: number
  totalAmount: number
  hallStats: Array<{ hall: string; count: number; amount: number }>
  trendData: Array<{ date: string; count: number; amount: number }>
}

export default function DashboardPublicPage() {
  const [activeType, setActiveType] = useState<PublicType>('firstcharge')
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [data, setData] = useState<PublicData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: activeType,
      })
      const res = await fetch(`/api/analytics/public?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeType, dateRange])

  useEffect(() => { fetchData() }, [fetchData])

  const hallPieData = data?.hallStats.filter((h) => h.count > 0).map((h) => ({ name: h.hall, value: h.count })) || []

  const isFirstCharge = activeType === 'firstcharge'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">公域数据看板</h1>
        <p className="text-slate-400">分析女厅首充和注册数据</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveType('firstcharge')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeType === 'firstcharge' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          女厅首充
        </button>
        <button
          onClick={() => setActiveType('registration')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeType === 'registration' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          女厅注册
        </button>
      </div>

      <div className="mb-6">
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={(s, e) => setDateRange({ startDate: s, endDate: e })}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard title={isFirstCharge ? '总首充数' : '总注册数'} value={data?.totalCount || 0} unit="个" icon={isFirstCharge ? '💳' : '👤'} color="blue" />
            {isFirstCharge && <StatCard title="总首充金额" value={data?.totalAmount?.toLocaleString() || 0} unit="元" icon="💰" color="green" />}
            <StatCard title="厅数量" value={data?.hallStats.length || 0} unit="个" icon="🏠" color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">{isFirstCharge ? '首充趋势' : '注册趋势'}</h3>
              <LineChart
                xData={data?.trendData.map((d) => d.date) || []}
                series={[
                  { name: isFirstCharge ? '首充数' : '注册数', data: data?.trendData.map((d) => d.count) || [], color: '#3b82f6' },
                  ...(isFirstCharge ? [{ name: '首充金额', data: data?.trendData.map((d) => d.amount) || [], color: '#f59e0b' }] : []),
                ]}
              />
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">各厅{isFirstCharge ? '首充' : '注册'}占比</h3>
              <PieChart data={hallPieData} />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">各厅数据明细</h3>
            <DataTable
              columns={[
                { key: 'hall', label: '厅号' },
                { key: 'count', label: isFirstCharge ? '首充数' : '注册数', align: 'right' },
                ...(isFirstCharge ? [{ key: 'amount', label: '首充金额', align: 'right' as const }] : []),
              ]}
              data={(data?.hallStats || []).map((h) => ({ ...h }))}
            />
          </div>
        </>
      )}
    </div>
  )
}
