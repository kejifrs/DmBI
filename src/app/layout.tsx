import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'DmBI - 数据分析看板',
  description: '私域和公域业务数据分析看板系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-900 text-slate-200 min-h-screen">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-slate-900">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
