import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()
    const type = searchParams.get('type') || 'firstcharge'

    const dateFilter = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }

    if (type === 'firstcharge') {
      const data = await prisma.firstChargeData.findMany({
        where: { date: dateFilter },
        orderBy: { date: 'asc' },
      })

      const hallMap = new Map<string, { count: number; amount: number }>()
      data.forEach((d) => {
        const h = d.hall_number || '未知'
        const existing = hallMap.get(h) || { count: 0, amount: 0 }
        existing.count += d.count
        existing.amount += Number(d.amount || 0)
        hallMap.set(h, existing)
      })

      const hallStats = Array.from(hallMap.entries()).map(([hall, v]) => ({
        hall,
        count: v.count,
        amount: Math.round(v.amount * 100) / 100,
      }))

      const trendMap = new Map<string, { count: number; amount: number }>()
      data.forEach((d) => {
        const date = d.date.toISOString().split('T')[0]
        const existing = trendMap.get(date) || { count: 0, amount: 0 }
        existing.count += d.count
        existing.amount += Number(d.amount || 0)
        trendMap.set(date, existing)
      })

      const trendData = Array.from(trendMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v, amount: Math.round(v.amount * 100) / 100 }))

      const totalCount = data.reduce((sum, d) => sum + d.count, 0)
      const totalAmount = data.reduce((sum, d) => sum + Number(d.amount || 0), 0)

      return NextResponse.json({
        totalCount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        hallStats,
        trendData,
      })
    } else {
      // registration
      const data = await prisma.registrationData.findMany({
        where: { date: dateFilter },
        orderBy: { date: 'asc' },
      })

      const hallMap = new Map<string, { count: number }>()
      data.forEach((d) => {
        const h = d.hall_number || '未知'
        const existing = hallMap.get(h) || { count: 0 }
        existing.count += d.count
        hallMap.set(h, existing)
      })

      const hallStats = Array.from(hallMap.entries()).map(([hall, v]) => ({
        hall,
        count: v.count,
        amount: 0,
      }))

      const trendMap = new Map<string, { count: number; amount: number }>()
      data.forEach((d) => {
        const date = d.date.toISOString().split('T')[0]
        const existing = trendMap.get(date) || { count: 0, amount: 0 }
        existing.count += d.count
        trendMap.set(date, existing)
      })

      const trendData = Array.from(trendMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v }))

      const totalCount = data.reduce((sum, d) => sum + d.count, 0)

      return NextResponse.json({
        totalCount,
        totalAmount: 0,
        hallStats,
        trendData,
      })
    }
  } catch (error) {
    console.error('Analytics public error:', error)
    return NextResponse.json({ error: '查询失败' }, { status: 500 })
  }
}
