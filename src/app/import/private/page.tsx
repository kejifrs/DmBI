'use client'

import { useState } from 'react'
import FileUploader from '@/components/upload/FileUploader'
import DataTable from '@/components/dashboard/DataTable'

type Category = 'MALE_CP' | 'FEMALE_CP' | 'MALE_BLIND_BOX'
type DataType = 'order' | 'conversion'

const categoryLabels: Record<Category, string> = {
  MALE_CP: '男厅CP',
  FEMALE_CP: '女厅CP',
  MALE_BLIND_BOX: '男厅盲盒',
}

const orderColumns = [
  { key: '派单日期', label: '派单日期' },
  { key: '工作室', label: '工作室' },
  { key: '主持', label: '主持' },
  { key: '接单厅', label: '接单厅' },
  { key: '主播', label: '主播' },
  { key: '排档ID', label: '排档ID' },
  { key: '运营', label: '运营' },
  { key: '派单群', label: '派单群' },
]

const conversionColumns = [
  { key: '渠道', label: '渠道' },
  { key: '拍走日期', label: '拍走日期' },
  { key: '主持', label: '主持' },
  { key: '厅号', label: '厅号' },
  { key: '主播', label: '主播' },
  { key: '排档ID', label: '排档ID' },
  { key: '靓号', label: '靓号' },
  { key: '金额', label: '金额' },
  { key: '接单群', label: '接单群' },
]

interface UploadState {
  data: Record<string, string | number | null>[]
  file: File | null
  status: 'idle' | 'preview' | 'uploading' | 'success' | 'error'
  message: string
  count: number
}

const defaultState: UploadState = { data: [], file: null, status: 'idle', message: '', count: 0 }

export default function ImportPrivatePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('MALE_CP')
  const [orderState, setOrderState] = useState<UploadState>(defaultState)
  const [conversionState, setConversionState] = useState<UploadState>(defaultState)

  const handleDataParsed = (type: DataType) => (data: Record<string, string | number | null>[], file: File) => {
    if (type === 'order') {
      setOrderState({ data, file, status: 'preview', message: '', count: 0 })
    } else {
      setConversionState({ data, file, status: 'preview', message: '', count: 0 })
    }
  }

  const handleImport = async (type: DataType) => {
    const state = type === 'order' ? orderState : conversionState
    const setState = type === 'order' ? setOrderState : setConversionState

    if (!state.file) return

    setState((prev) => ({ ...prev, status: 'uploading' }))

    const formData = new FormData()
    formData.append('file', state.file)
    formData.append('category', activeCategory)

    const endpoint = type === 'order' ? '/api/import/order' : '/api/import/conversion'

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData })
      const result = await res.json()

      if (res.ok) {
        setState((prev) => ({ ...prev, status: 'success', message: result.message, count: result.count }))
      } else {
        setState((prev) => ({ ...prev, status: 'error', message: result.error || '导入失败' }))
      }
    } catch {
      setState((prev) => ({ ...prev, status: 'error', message: '网络错误，请重试' }))
    }
  }

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat)
    setOrderState(defaultState)
    setConversionState(defaultState)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">私域数据导入</h1>
        <p className="text-slate-400">支持 .xlsx 和 .csv 格式，上传后预览数据，确认后导入</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(categoryLabels) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Order Data */}
        <div className="space-y-4">
          <FileUploader
            title={`${categoryLabels[activeCategory]} - 接单数据`}
            description="字段：派单日期、工作室、主持、接单厅、主播、排档ID、运营、派单群"
            onDataParsed={handleDataParsed('order')}
          />

          {orderState.status === 'preview' && orderState.data.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">数据预览（共 {orderState.data.length} 条）</h4>
                <button
                  onClick={() => handleImport('order')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  确认导入
                </button>
              </div>
              <DataTable columns={orderColumns} data={orderState.data} maxRows={5} />
            </div>
          )}

          {orderState.status === 'uploading' && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
              <span className="text-slate-300">正在导入...</span>
            </div>
          )}

          {orderState.status === 'success' && (
            <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
              <p className="text-green-400 font-medium">✅ {orderState.message}</p>
            </div>
          )}

          {orderState.status === 'error' && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
              <p className="text-red-400 font-medium">❌ {orderState.message}</p>
            </div>
          )}
        </div>

        {/* Conversion Data */}
        <div className="space-y-4">
          <FileUploader
            title={`${categoryLabels[activeCategory]} - 转化数据`}
            description="字段：渠道、拍走日期、主持、厅号、主播、排档ID、靓号、金额、接单群"
            onDataParsed={handleDataParsed('conversion')}
          />

          {conversionState.status === 'preview' && conversionState.data.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">数据预览（共 {conversionState.data.length} 条）</h4>
                <button
                  onClick={() => handleImport('conversion')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  确认导入
                </button>
              </div>
              <DataTable columns={conversionColumns} data={conversionState.data} maxRows={5} />
            </div>
          )}

          {conversionState.status === 'uploading' && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
              <span className="text-slate-300">正在导入...</span>
            </div>
          )}

          {conversionState.status === 'success' && (
            <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
              <p className="text-green-400 font-medium">✅ {conversionState.message}</p>
            </div>
          )}

          {conversionState.status === 'error' && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
              <p className="text-red-400 font-medium">❌ {conversionState.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Format guide */}
      <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">📋 数据格式说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-slate-300 font-medium mb-2">接单数据字段</h4>
            <div className="space-y-1 text-sm text-slate-400">
              <p>• 派单日期（必填，格式：YYYY-MM-DD）</p>
              <p>• 工作室</p>
              <p>• 主持</p>
              <p>• 接单厅</p>
              <p>• 主播</p>
              <p>• 排档ID</p>
              <p>• 运营</p>
              <p>• 派单群</p>
            </div>
          </div>
          <div>
            <h4 className="text-slate-300 font-medium mb-2">转化数据字段</h4>
            <div className="space-y-1 text-sm text-slate-400">
              <p>• 渠道</p>
              <p>• 拍走日期（必填，格式：YYYY-MM-DD）</p>
              <p>• 主持</p>
              <p>• 厅号</p>
              <p>• 主播</p>
              <p>• 排档ID</p>
              <p>• 靓号</p>
              <p>• 金额（数字）</p>
              <p>• 接单群</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
