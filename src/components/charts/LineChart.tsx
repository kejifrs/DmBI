'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface Series {
  name: string
  data: number[]
  color?: string
}

interface LineChartProps {
  title?: string
  xData: string[]
  series: Series[]
  height?: number
}

export default function LineChart({ title, xData, series, height = 300 }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.dispose()
    }

    const chart = echarts.init(chartRef.current, 'dark')
    chartInstance.current = chart

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: title ? { text: title, textStyle: { color: '#e2e8f0', fontSize: 14 } } : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#475569',
        textStyle: { color: '#e2e8f0' },
      },
      legend: {
        textStyle: { color: '#94a3b8' },
        top: title ? 30 : 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: title ? 60 : 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#1e293b' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8', fontSize: 11 },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#1e293b' } },
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: true,
        lineStyle: { width: 2 },
        itemStyle: s.color ? { color: s.color } : undefined,
        areaStyle: { opacity: 0.1 },
      })),
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [title, xData, series])

  return <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
}
