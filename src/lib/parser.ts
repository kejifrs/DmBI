import ExcelJS from 'exceljs'
import { Readable } from 'stream'

export interface ParsedRow {
  [key: string]: string | number | Date | null
}

export async function parseFile(buffer: Buffer, fileName: string): Promise<ParsedRow[]> {
  const workbook = new ExcelJS.Workbook()
  const isCsv = fileName.toLowerCase().endsWith('.csv')

  if (isCsv) {
    const stream = new Readable({
      read() {
        this.push(buffer)
        this.push(null)
      },
    })
    await workbook.csv.read(stream)
  } else {
    // exceljs typings predate Node.js generic Buffer — suppress the type mismatch
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await workbook.xlsx.load(buffer)
  }

  const worksheet = workbook.worksheets[0]
  if (!worksheet) return []

  const headers: string[] = []
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
    headers.push(cell.value?.toString().trim() ?? '')
  })

  const rows: ParsedRow[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const rowData: ParsedRow = {}
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1]
      if (!header) return
      const val = cell.value
      if (val instanceof Date) {
        rowData[header] = formatDate(val)
      } else if (val !== null && typeof val === 'object' && 'richText' in val) {
        rowData[header] = (val as ExcelJS.CellRichTextValue).richText.map((r) => r.text).join('')
      } else if (val !== null && typeof val === 'object' && 'result' in val) {
        rowData[header] = String((val as ExcelJS.CellFormulaValue).result ?? '')
      } else {
        rowData[header] = val as string | number | null
      }
    })
    rows.push(rowData)
  })

  return rows
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function mapOrderData(row: ParsedRow, category: string) {
  return {
    category: category as 'MALE_CP' | 'FEMALE_CP' | 'MALE_BLIND_BOX',
    dispatch_date: parseDate(row['派单日期'] as string) || new Date(),
    studio: (row['工作室'] as string) || null,
    host: (row['主持'] as string) || null,
    reception_hall: (row['接单厅'] as string) || null,
    anchor: (row['主播'] as string) || null,
    schedule_id: (row['排档ID'] as string) || null,
    operator: (row['运营'] as string) || null,
    dispatch_group: (row['派单群'] as string) || null,
  }
}

export function mapConversionData(row: ParsedRow, category: string) {
  const amount = row['金额'] ? parseFloat(String(row['金额']).replace(/[^\d.-]/g, '')) : null
  return {
    category: category as 'MALE_CP' | 'FEMALE_CP' | 'MALE_BLIND_BOX',
    channel: (row['渠道'] as string) || null,
    sold_date: parseDate(row['拍走日期'] as string) || new Date(),
    host: (row['主持'] as string) || null,
    hall_number: (row['厅号'] as string) || null,
    anchor: (row['主播'] as string) || null,
    schedule_id: (row['排档ID'] as string) || null,
    vip_number: (row['靓号'] as string) || null,
    amount: isNaN(amount ?? NaN) ? null : amount,
    order_group: (row['接单群'] as string) || null,
  }
}

export function mapFirstChargeData(row: ParsedRow) {
  const amount = row['首充金额'] ? parseFloat(String(row['首充金额']).replace(/[^\d.-]/g, '')) : null
  return {
    date: parseDate(row['日期'] as string) || new Date(),
    hall_number: (row['厅号'] as string) || null,
    count: parseInt(String(row['首充数量'] || row['数量'] || '0'), 10) || 0,
    amount: isNaN(amount ?? NaN) ? null : amount,
  }
}

export function mapRegistrationData(row: ParsedRow) {
  return {
    date: parseDate(row['日期'] as string) || new Date(),
    hall_number: (row['厅号'] as string) || null,
    count: parseInt(String(row['注册数量'] || row['数量'] || '0'), 10) || 0,
  }
}

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return d
}
