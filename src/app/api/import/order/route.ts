import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseFile, mapOrderData } from '@/lib/parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string

    if (!file || !category) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const rows = parseFile(buffer, file.name)

    const mappedData = rows.map((row) => mapOrderData(row, category))

    const result = await prisma.orderData.createMany({
      data: mappedData,
      skipDuplicates: false,
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `成功导入 ${result.count} 条接单数据`,
    })
  } catch (error) {
    console.error('Import order error:', error)
    return NextResponse.json({ error: '导入失败，请检查文件格式' }, { status: 500 })
  }
}
