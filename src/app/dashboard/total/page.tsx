'use client'

import { useState, useEffect, useCallback } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import DateRangePicker from '@/components/dashboard/DateRangePicker'
import LineChart from '@/components/charts/LineChart'
import PieChart from '@/components/charts/PieChart'

type SubTab = 'private' | 'public' | 'all'

function getDefaultDateRange() {
  const end = new Date()
  const start = new Date(end.getFullYear(), end.getMonth(), 1)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

interface TotalData {
  private: { totalDispatch: number; totalConversion: number; conversionRate: number; totalAmount: number }
  public: { totalFirstCharge: number; totalFirstChargeAmount: number; totalRegistration: number }
  trendData: Array<{
    date: string
    privateDispatch: number
    privateConversion: number
    privateAmount: number
    firstCharge: number
    firstChargeAmount: number
    registration: number
  }>
}

export default function DashboardTotalPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('all')
  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [data, setData] = useState<TotalData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ startDate: dateRange.startDate, endDate: dateRange.endDate })
      const res = await fetch(`/api/analytics/total?${params}`)
      if (res.ok) setData(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => { fetchData() }, [fetchData])

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'private', label: '私域总览' },
    { key: 'public', label: '公域总览' },
    { key: 'all', label: '总数据（私域+公域）' },
  ]

  const totalPieData = [
    { name: '私域金额', value: data?.private.totalAmount || 0 },
    { name: '公域首充', value: data?.public.totalFirstChargeAmount || 0 },
  ].filter((d) => d.value > 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">总数据看板</h1>
        <p className="text-slate-400">汇总私域和公域全部数据</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {tab.label}
          </button>
        ))}
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
          {(activeTab === 'private' || activeTab === 'all') && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-300 mb-4">私域数据</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="总派单数" value={data?.private.totalDispatch || 0} unit="条" icon="📋" color="blue" />
                <StatCard title="总转化数" value={data?.private.totalConversion || 0} unit="条" icon="✅" color="green" />
                <StatCard title="总转化率" value={data?.private.conversionRate || 0} unit="%" icon="📊" color="purple" />
                <StatCard title="总金额" value={data?.private.totalAmount?.toLocaleString() || 0} unit="元" icon="💰" color="orange" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4">私域派单/转化趋势</h3>
                  <LineChart
                    xData={data?.trendData.map((d) => d.date) || []}
                    series={[
                      { name: '派单量', data: data?.trendData.map((d) => d.privateDispatch) || [], color: '#3b82f6' },
                      { name: '转化量', data: data?.trendData.map((d) => d.privateConversion) || [], color: '#10b981' },
                    ]}
                  />
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4">私域金额趋势</h3>
                  <LineChart
                    xData={data?.trendData.map((d) => d.date) || []}
                    series={[{ name: '金额', data: data?.trendData.map((d) => d.privateAmount) || [], color: '#f59e0b' }]}
                  />
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'public' || activeTab === 'all') && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-300 mb-4">公域数据</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <StatCard title="总首充数" value={data?.public.totalFirstCharge || 0} unit="个" icon="💳" color="blue" />
                <StatCard title="首充总金额" value={data?.public.totalFirstChargeAmount?.toLocaleString() || 0} unit="元" icon="💰" color="green" />
                <StatCard title="总注册数" value={data?.public.totalRegistration || 0} unit="个" icon="👤" color="purple" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4">公域首充趋势</h3>
                  <LineChart
                    xData={data?.trendData.map((d) => d.date) || []}
                    series={[
                      { name: '首充数', data: data?.trendData.map((d) => d.firstCharge) || [], color: '#3b82f6' },
                      { name: '注册数', data: data?.trendData.map((d) => d.registration) || [], color: '#10b981' },
                    ]}
                  />
                </div>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <h3 className="text-white font-semibold mb-4">首充金额趋势</h3>
                  <LineChart
                    xData={data?.trendData.map((d) => d.date) || []}
                    series={[{ name: '首充金额', data: data?.trendData.map((d) => d.firstChargeAmount) || [], color: '#f59e0b' }]}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'all' && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">私域 vs 公域 金额占比</h3>
              <PieChart data={totalPieData} height={250} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
