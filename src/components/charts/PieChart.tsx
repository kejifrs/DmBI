'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface PieDataItem {
  name: string
  value: number
}

interface PieChartProps {
  title?: string
  data: PieDataItem[]
  height?: number
}

export default function PieChart({ title, data, height = 300 }: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.dispose()
    }

    const chart = echarts.init(chartRef.current, 'dark')
    chartInstance.current = chart

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: title ? { text: title, textStyle: { color: '#e2e8f0', fontSize: 14 }, left: 'center' } : undefined,
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#475569',
        textStyle: { color: '#e2e8f0' },
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#94a3b8', fontSize: 12 },
      },
      color: colors,
      series: [
        {
          name: title || '占比',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#0f172a',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              color: '#fff',
            },
          },
          data: data,
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [title, data])

  return <div ref={chartRef} style={{ height: `${height}px`, width: '100%' }} />
}
