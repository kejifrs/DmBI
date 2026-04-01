'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: '数据概览',
    icon: '📊',
    href: '/',
  },
  {
    label: '数据导入',
    icon: '📥',
    children: [
      { label: '私域数据导入', href: '/import/private', icon: '📋' },
      { label: '公域数据导入', href: '/import/public', icon: '📋' },
    ],
  },
  {
    label: '数据分析',
    icon: '📈',
    children: [
      { label: '私域数据看板', href: '/dashboard/private', icon: '📉' },
      { label: '公域数据看板', href: '/dashboard/public', icon: '📉' },
      { label: '总数据看板', href: '/dashboard/total', icon: '📉' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎯</span>
          <span>DmBI</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">数据分析看板系统</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-slate-400 text-sm font-medium mt-2 mb-1">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <ul className="space-y-1 ml-2">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            <span>{child.icon}</span>
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs text-center">DmBI v1.0.0</p>
      </div>
    </aside>
  )
}
