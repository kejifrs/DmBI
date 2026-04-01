import * as XLSX from 'xlsx'

export interface ParsedRow {
  [key: string]: string | number | Date | null
}

export function parseFile(buffer: Buffer, fileName: string): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json<ParsedRow>(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' })
  return data
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
