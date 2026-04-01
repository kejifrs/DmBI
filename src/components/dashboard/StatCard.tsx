interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  icon?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  subtext?: string
}

const colorMap = {
  blue: 'from-blue-600 to-blue-800',
  green: 'from-emerald-600 to-emerald-800',
  purple: 'from-purple-600 to-purple-800',
  orange: 'from-orange-600 to-orange-800',
  red: 'from-red-600 to-red-800',
}

export default function StatCard({ title, value, unit, icon, color = 'blue', subtext }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-xl p-5 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-white/70 text-sm">{unit}</span>}
          </div>
          {subtext && <p className="text-white/60 text-xs mt-1">{subtext}</p>}
        </div>
        {icon && <span className="text-3xl opacity-80">{icon}</span>}
      </div>
    </div>
  )
}
