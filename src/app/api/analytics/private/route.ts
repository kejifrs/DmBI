import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateConversionRate } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()
    const category = searchParams.get('category') as 'MALE_CP' | 'FEMALE_CP' | 'MALE_BLIND_BOX' | null

    const dateFilter = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }

    const categoryFilter = category ? { category } : {}

    const [orderData, conversionData] = await Promise.all([
      prisma.orderData.findMany({
        where: { dispatch_date: dateFilter, ...categoryFilter },
        orderBy: { dispatch_date: 'asc' },
      }),
      prisma.conversionData.findMany({
        where: { sold_date: dateFilter, ...categoryFilter },
        orderBy: { sold_date: 'asc' },
      }),
    ])

    // Host stats
    const hostOrderMap = new Map<string, number>()
    const hostConversionMap = new Map<string, number>()
    const hostAmountMap = new Map<string, number>()

    orderData.forEach((o) => {
      const h = o.host || '未知'
      hostOrderMap.set(h, (hostOrderMap.get(h) || 0) + 1)
    })

    conversionData.forEach((c) => {
      const h = c.host || '未知'
      hostConversionMap.set(h, (hostConversionMap.get(h) || 0) + 1)
      hostAmountMap.set(h, (hostAmountMap.get(h) || 0) + Number(c.amount || 0))
    })

    const allHosts = new Set([...hostOrderMap.keys(), ...hostConversionMap.keys()])
    const hostStats = Array.from(allHosts).map((host) => ({
      host,
      totalDispatch: hostOrderMap.get(host) || 0,
      totalConversion: hostConversionMap.get(host) || 0,
      conversionRate: calculateConversionRate(hostConversionMap.get(host) || 0, hostOrderMap.get(host) || 0),
      totalAmount: Math.round((hostAmountMap.get(host) || 0) * 100) / 100,
    }))

    // Anchor stats
    const anchorOrderMap = new Map<string, number>()
    const anchorConversionMap = new Map<string, number>()
    const anchorAmountMap = new Map<string, number>()

    orderData.forEach((o) => {
      const a = o.anchor || '未知'
      anchorOrderMap.set(a, (anchorOrderMap.get(a) || 0) + 1)
    })

    conversionData.forEach((c) => {
      const a = c.anchor || '未知'
      anchorConversionMap.set(a, (anchorConversionMap.get(a) || 0) + 1)
      anchorAmountMap.set(a, (anchorAmountMap.get(a) || 0) + Number(c.amount || 0))
    })

    const allAnchors = new Set([...anchorOrderMap.keys(), ...anchorConversionMap.keys()])
    const anchorStats = Array.from(allAnchors).map((anchor) => ({
      anchor,
      totalOrder: anchorOrderMap.get(anchor) || 0,
      totalReport: anchorConversionMap.get(anchor) || 0,
      conversionRate: calculateConversionRate(anchorConversionMap.get(anchor) || 0, anchorOrderMap.get(anchor) || 0),
      totalAmount: Math.round((anchorAmountMap.get(anchor) || 0) * 100) / 100,
    }))

    // Hall stats
    const hallOrderMap = new Map<string, number>()
    const hallConversionMap = new Map<string, number>()
    const hallAmountMap = new Map<string, number>()

    orderData.forEach((o) => {
      const h = o.reception_hall || '未知'
      hallOrderMap.set(h, (hallOrderMap.get(h) || 0) + 1)
    })

    conversionData.forEach((c) => {
      const h = c.hall_number || '未知'
      hallConversionMap.set(h, (hallConversionMap.get(h) || 0) + 1)
      hallAmountMap.set(h, (hallAmountMap.get(h) || 0) + Number(c.amount || 0))
    })

    const allHalls = new Set([...hallOrderMap.keys(), ...hallConversionMap.keys()])
    const hallStats = Array.from(allHalls).map((hall) => ({
      hall,
      totalOrder: hallOrderMap.get(hall) || 0,
      totalReport: hallConversionMap.get(hall) || 0,
      conversionRate: calculateConversionRate(hallConversionMap.get(hall) || 0, hallOrderMap.get(hall) || 0),
      totalAmount: Math.round((hallAmountMap.get(hall) || 0) * 100) / 100,
    }))

    // Trend data
    const trendMap = new Map<string, { dispatch: number; conversion: number; amount: number }>()

    orderData.forEach((o) => {
      const date = o.dispatch_date.toISOString().split('T')[0]
      const existing = trendMap.get(date) || { dispatch: 0, conversion: 0, amount: 0 }
      existing.dispatch++
      trendMap.set(date, existing)
    })

    conversionData.forEach((c) => {
      const date = c.sold_date.toISOString().split('T')[0]
      const existing = trendMap.get(date) || { dispatch: 0, conversion: 0, amount: 0 }
      existing.conversion++
      existing.amount += Number(c.amount || 0)
      trendMap.set(date, existing)
    })

    const trendData = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v, amount: Math.round(v.amount * 100) / 100 }))

    const totalAmount = conversionData.reduce((sum, c) => sum + Number(c.amount || 0), 0)

    return NextResponse.json({
      totalDispatch: orderData.length,
      totalConversion: conversionData.length,
      conversionRate: calculateConversionRate(conversionData.length, orderData.length),
      totalAmount: Math.round(totalAmount * 100) / 100,
      hostStats,
      anchorStats,
      hallStats,
      trendData,
    })
  } catch (error) {
    console.error('Analytics private error:', error)
    return NextResponse.json({ error: '查询失败' }, { status: 500 })
  }
}
