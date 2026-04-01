import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseFile, mapRegistrationData } from '@/lib/parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '缺少文件' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const rows = parseFile(buffer, file.name)

    const mappedData = rows.map(mapRegistrationData)

    const result = await prisma.registrationData.createMany({
      data: mappedData,
      skipDuplicates: false,
    })

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `成功导入 ${result.count} 条注册数据`,
    })
  } catch (error) {
    console.error('Import registration error:', error)
    return NextResponse.json({ error: '导入失败，请检查文件格式' }, { status: 500 })
  }
}
