import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseFile, mapFirstChargeData } from '@/lib/parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '缺少文件' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const rows = await parseFile(buffer, file.name)
    const mappedData = rows.map(mapFirstChargeData)

    const result = await prisma.firstChargeData.createMany({
      data: mappedData,
      skipDuplicates: false,
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `成功导入 ${result.count} 条首充数据`,
    })
  } catch (error) {
    console.error('Import firstcharge error:', error)
    return NextResponse.json({ error: '导入失败，请检查文件格式' }, { status: 500 })
  }
}
