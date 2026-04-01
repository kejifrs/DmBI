export type DataCategory = 'MALE_CP' | 'FEMALE_CP' | 'MALE_BLIND_BOX'

export interface DateRange {
  startDate: string
  endDate: string
}

export interface StatCardData {
  title: string
  value: string | number
  unit?: string
  color?: string
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface PieDataItem {
  name: string
  value: number
}

export interface PrivateAnalyticsData {
  totalDispatch: number
  totalConversion: number
  conversionRate: number
  totalAmount: number
  hostStats: Array<{
    host: string
    totalDispatch: number
    totalConversion: number
    conversionRate: number
    totalAmount: number
  }>
  anchorStats: Array<{
    anchor: string
    totalOrder: number
    totalReport: number
    conversionRate: number
    totalAmount: number
  }>
  hallStats: Array<{
    hall: string
    totalOrder: number
    totalReport: number
    conversionRate: number
    totalAmount: number
  }>
  trendData: Array<{
    date: string
    dispatch: number
    conversion: number
    amount: number
  }>
}

export interface PublicAnalyticsData {
  totalCount: number
  totalAmount: number
  hallStats: Array<{
    hall: string
    count: number
    amount: number
  }>
  trendData: Array<{
    date: string
    count: number
    amount: number
  }>
}
