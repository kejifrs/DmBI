import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateConversionRate } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()

    const dateFilter = { gte: new Date(startDate), lte: new Date(endDate) }

    const [orderData, conversionData, firstChargeData, registrationData] = await Promise.all([
      prisma.orderData.findMany({ where: { dispatch_date: dateFilter } }),
      prisma.conversionData.findMany({ where: { sold_date: dateFilter } }),
      prisma.firstChargeData.findMany({ where: { date: dateFilter } }),
      prisma.registrationData.findMany({ where: { date: dateFilter } }),
    ])

    const totalConversionAmount = conversionData.reduce((sum, c) => sum + Number(c.amount || 0), 0)
    const totalFirstChargeAmount = firstChargeData.reduce((sum, d) => sum + Number(d.amount || 0), 0)
    const totalFirstChargeCount = firstChargeData.reduce((sum, d) => sum + d.count, 0)
    const totalRegistrationCount = registrationData.reduce((sum, d) => sum + d.count, 0)

    // Trend data - combine all by date
    const trendMap = new Map<string, {
      privateDispatch: number
      privateConversion: number
      privateAmount: number
      firstCharge: number
      firstChargeAmount: number
      registration: number
    }>()

    const getOrCreate = (date: string) => {
      if (!trendMap.has(date)) {
        trendMap.set(date, { privateDispatch: 0, privateConversion: 0, privateAmount: 0, firstCharge: 0, firstChargeAmount: 0, registration: 0 })
      }
      return trendMap.get(date)!
    }

    orderData.forEach((o) => {
      const d = o.dispatch_date.toISOString().split('T')[0]
      getOrCreate(d).privateDispatch++
    })
    conversionData.forEach((c) => {
      const d = c.sold_date.toISOString().split('T')[0]
      const entry = getOrCreate(d)
      entry.privateConversion++
      entry.privateAmount += Number(c.amount || 0)
    })
    firstChargeData.forEach((fc) => {
      const d = fc.date.toISOString().split('T')[0]
      const entry = getOrCreate(d)
      entry.firstCharge += fc.count
      entry.firstChargeAmount += Number(fc.amount || 0)
    })
    registrationData.forEach((r) => {
      const d = r.date.toISOString().split('T')[0]
      getOrCreate(d).registration += r.count
    })

    const trendData = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }))

    return NextResponse.json({
      private: {
        totalDispatch: orderData.length,
        totalConversion: conversionData.length,
        conversionRate: calculateConversionRate(conversionData.length, orderData.length),
        totalAmount: Math.round(totalConversionAmount * 100) / 100,
      },
      public: {
        totalFirstCharge: totalFirstChargeCount,
        totalFirstChargeAmount: Math.round(totalFirstChargeAmount * 100) / 100,
        totalRegistration: totalRegistrationCount,
      },
      trendData,
    })
  } catch (error) {
    console.error('Analytics total error:', error)
    return NextResponse.json({ error: '查询失败' }, { status: 500 })
  }
}
