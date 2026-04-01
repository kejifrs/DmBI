export interface AnalyticsFilter {
  startDate: Date
  endDate: Date
  category?: 'MALE_CP' | 'FEMALE_CP' | 'MALE_BLIND_BOX'
}

export interface HostStats {
  host: string
  totalDispatch: number
  totalConversion: number
  conversionRate: number
  totalAmount: number
}

export interface AnchorStats {
  anchor: string
  totalOrder: number
  totalReport: number
  conversionRate: number
  totalAmount: number
}

export interface HallStats {
  hall: string
  totalOrder: number
  totalReport: number
  conversionRate: number
  totalAmount: number
}

export function calculateConversionRate(conversion: number, total: number): number {
  if (total === 0) return 0
  return Math.round((conversion / total) * 10000) / 100
}
