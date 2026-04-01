import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">数据概览</h1>
        <p className="text-slate-400">欢迎使用 DmBI 数据分析看板系统</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">私域数据</h3>
            <span className="text-blue-200 text-3xl">📊</span>
          </div>
          <p className="text-blue-100 text-sm mb-4">管理男厅CP、女厅CP、男厅盲盒数据</p>
          <div className="flex gap-3">
            <Link href="/import/private" className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              导入数据
            </Link>
            <Link href="/dashboard/private" className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              查看看板
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">公域数据</h3>
            <span className="text-emerald-200 text-3xl">📈</span>
          </div>
          <p className="text-emerald-100 text-sm mb-4">管理女厅首充、女厅注册数据</p>
          <div className="flex gap-3">
            <Link href="/import/public" className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              导入数据
            </Link>
            <Link href="/dashboard/public" className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              查看看板
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">总数据看板</h3>
            <span className="text-purple-200 text-3xl">🎯</span>
          </div>
          <p className="text-purple-100 text-sm mb-4">汇总私域和公域全部数据分析</p>
          <div className="flex gap-3">
            <Link href="/dashboard/total" className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              查看看板
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">📥 快速导入</h3>
          <div className="space-y-3">
            <Link href="/import/private" className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group">
              <span className="text-blue-400 text-xl">📋</span>
              <div>
                <div className="text-white font-medium group-hover:text-blue-300">私域数据导入</div>
                <div className="text-slate-400 text-sm">男厅CP、女厅CP、男厅盲盒</div>
              </div>
            </Link>
            <Link href="/import/public" className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group">
              <span className="text-emerald-400 text-xl">📋</span>
              <div>
                <div className="text-white font-medium group-hover:text-emerald-300">公域数据导入</div>
                <div className="text-slate-400 text-sm">女厅首充、女厅注册</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">📊 数据分析</h3>
          <div className="space-y-3">
            <Link href="/dashboard/private" className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group">
              <span className="text-blue-400 text-xl">📉</span>
              <div>
                <div className="text-white font-medium group-hover:text-blue-300">私域数据看板</div>
                <div className="text-slate-400 text-sm">派单转化分析</div>
              </div>
            </Link>
            <Link href="/dashboard/public" className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group">
              <span className="text-emerald-400 text-xl">📉</span>
              <div>
                <div className="text-white font-medium group-hover:text-emerald-300">公域数据看板</div>
                <div className="text-slate-400 text-sm">首充注册分析</div>
              </div>
            </Link>
            <Link href="/dashboard/total" className="flex items-center gap-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors group">
              <span className="text-purple-400 text-xl">📉</span>
              <div>
                <div className="text-white font-medium group-hover:text-purple-300">总数据看板</div>
                <div className="text-slate-400 text-sm">私域+公域汇总</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
