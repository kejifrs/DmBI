'use client'

import { useState, useEffect, useCallback } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import DateRangePicker from '@/components/dashboard/DateRangePicker'
import LineChart from '@/components/charts/LineChart'
import PieChart from '@/components/charts/PieChart'
import DataTable from '@/components/dashboard/DataTable'

type Category = 'MALE_CP' | 'FEMALE_CP' | 'MALE_BLIND_BOX'

const categoryLabels: Record<Category, string> = {
  MALE_CP: '男厅CP',
  FEMALE_CP: '女厅CP',
  MALE_BLIND_BOX: '男厅盲盒',
}

function getDefaultDateRange() {
  const end = new Date()
  const start = new Date(end.getFullYear(), end.getMonth(), 1)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

interface AnalyticsData {
  totalDispatch: number
  totalConversion: number
  conversionRate: number
  totalAmount: number
  hostStats: Array<{ host: string; totalDispatch: number; totalConversion: number; conversionRate: number; totalAmount: number }>
  anchorStats: Array<{ anchor: string; totalOrder: number; totalReport: number; conversionRate: number; totalAmount: number }>
  hallStats: Array<{ hall: string; totalOrder: number; totalReport: number; conversionRate: number; totalAmount: number }>
  trendData: Array<{ date: string; dispatch: number; conversion: number; amount: number }>
}

export default function DashboardPrivatePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('MALE_CP')
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        category: activeCategory,
      })
      const res = await fetch(`/api/analytics/private?${params}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const hostDispatchPieData = data?.hostStats
    .filter((h) => h.totalDispatch > 0)
    .map((h) => ({ name: h.host, value: h.totalDispatch })) || []

  const anchorOrderPieData = data?.anchorStats
    .filter((a) => a.totalOrder > 0)
    .map((a) => ({ name: a.anchor, value: a.totalOrder })) || []

  const hallOrderPieData = data?.hallStats
    .filter((h) => h.totalOrder > 0)
    .map((h) => ({ name: h.hall, value: h.totalOrder })) || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">私域数据看板</h1>
        <p className="text-slate-400">分析派单、转化及金额数据</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(categoryLabels) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Date Range Picker */}
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
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="总派单数" value={data?.totalDispatch || 0} unit="条" icon="📋" color="blue" />
            <StatCard title="总转化数" value={data?.totalConversion || 0} unit="条" icon="✅" color="green" />
            <StatCard title="总转化率" value={data?.conversionRate || 0} unit="%" icon="📊" color="purple" />
            <StatCard title="总金额" value={data?.totalAmount?.toLocaleString() || 0} unit="元" icon="💰" color="orange" />
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">派单/转化趋势</h3>
              <LineChart
                xData={data?.trendData.map((d) => d.date) || []}
                series={[
                  { name: '派单量', data: data?.trendData.map((d) => d.dispatch) || [], color: '#3b82f6' },
                  { name: '转化量', data: data?.trendData.map((d) => d.conversion) || [], color: '#10b981' },
                ]}
              />
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">金额趋势</h3>
              <LineChart
                xData={data?.trendData.map((d) => d.date) || []}
                series={[
                  { name: '金额', data: data?.trendData.map((d) => d.amount) || [], color: '#f59e0b' },
                ]}
              />
            </div>
          </div>

          {/* Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">主持派单占比</h3>
              <PieChart data={hostDispatchPieData} />
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">主播接单占比</h3>
              <PieChart data={anchorOrderPieData} />
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">厅接单占比</h3>
              <PieChart data={hallOrderPieData} />
            </div>
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">主持数据明细</h3>
              <DataTable
                columns={[
                  { key: 'host', label: '主持' },
                  { key: 'totalDispatch', label: '总派单', align: 'right' },
                  { key: 'totalConversion', label: '总转化', align: 'right' },
                  { key: 'conversionRate', label: '转化率%', align: 'right' },
                  { key: 'totalAmount', label: '总金额', align: 'right' },
                ]}
                data={(data?.hostStats || []).map((h) => ({ ...h }))}
              />
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">主播数据明细</h3>
              <DataTable
                columns={[
                  { key: 'anchor', label: '主播' },
                  { key: 'totalOrder', label: '总接单', align: 'right' },
                  { key: 'totalReport', label: '总报备', align: 'right' },
                  { key: 'conversionRate', label: '转化率%', align: 'right' },
                  { key: 'totalAmount', label: '总金额', align: 'right' },
                ]}
                data={(data?.anchorStats || []).map((a) => ({ ...a }))}
              />
            </div>
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">厅数据明细</h3>
              <DataTable
                columns={[
                  { key: 'hall', label: '厅号' },
                  { key: 'totalOrder', label: '总接单', align: 'right' },
                  { key: 'totalReport', label: '总报备', align: 'right' },
                  { key: 'conversionRate', label: '转化率%', align: 'right' },
                  { key: 'totalAmount', label: '总金额', align: 'right' },
                ]}
                data={(data?.hallStats || []).map((h) => ({ ...h }))}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
