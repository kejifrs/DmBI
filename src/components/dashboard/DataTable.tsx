interface DataTableProps {
  columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[]
  data: Record<string, string | number | null>[]
  maxRows?: number
}

export default function DataTable({ columns, data, maxRows }: DataTableProps) {
  const displayData = maxRows ? data.slice(0, maxRows) : data

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`pb-3 pt-1 font-semibold text-slate-400 ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-slate-500 py-8">
                暂无数据
              </td>
            </tr>
          ) : (
            displayData.map((row, i) => (
              <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 text-slate-300 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {maxRows && data.length > maxRows && (
        <p className="text-slate-500 text-xs text-center mt-3">
          显示前 {maxRows} 条，共 {data.length} 条数据
        </p>
      )}
    </div>
  )
}
