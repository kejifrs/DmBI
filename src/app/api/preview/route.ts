import { NextRequest, NextResponse } from 'next/server'
import { parseFile } from '@/lib/parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '缺少文件' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const rows = await parseFile(buffer, file.name)

    return NextResponse.json({
      rows: rows.slice(0, 10),
      total: rows.length,
    })
  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json({ error: '文件解析失败，请检查文件格式' }, { status: 500 })
  }
}
