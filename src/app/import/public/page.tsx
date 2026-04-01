'use client'

import { useState } from 'react'
import FileUploader from '@/components/upload/FileUploader'
import DataTable from '@/components/dashboard/DataTable'

type DataType = 'firstcharge' | 'registration'

const firstChargeColumns = [
  { key: '日期', label: '日期' },
  { key: '厅号', label: '厅号' },
  { key: '首充数量', label: '首充数量' },
  { key: '首充金额', label: '首充金额' },
]

const registrationColumns = [
  { key: '日期', label: '日期' },
  { key: '厅号', label: '厅号' },
  { key: '注册数量', label: '注册数量' },
]

interface UploadState {
  data: Record<string, string | number | null>[]
  file: File | null
  status: 'idle' | 'preview' | 'uploading' | 'success' | 'error'
  message: string
}

const defaultState: UploadState = { data: [], file: null, status: 'idle', message: '' }

export default function ImportPublicPage() {
  const [firstChargeState, setFirstChargeState] = useState<UploadState>(defaultState)
  const [registrationState, setRegistrationState] = useState<UploadState>(defaultState)

  const handleDataParsed = (type: DataType) => (data: Record<string, string | number | null>[], file: File) => {
    if (type === 'firstcharge') {
      setFirstChargeState({ data, file, status: 'preview', message: '' })
    } else {
      setRegistrationState({ data, file, status: 'preview', message: '' })
    }
  }

  const handleImport = async (type: DataType) => {
    const state = type === 'firstcharge' ? firstChargeState : registrationState
    const setState = type === 'firstcharge' ? setFirstChargeState : setRegistrationState

    if (!state.file) return

    setState((prev) => ({ ...prev, status: 'uploading' }))

    const formData = new FormData()
    formData.append('file', state.file)

    const endpoint = type === 'firstcharge' ? '/api/import/firstcharge' : '/api/import/registration'

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData })
      const result = await res.json()

      if (res.ok) {
        setState((prev) => ({ ...prev, status: 'success', message: result.message }))
      } else {
        setState((prev) => ({ ...prev, status: 'error', message: result.error || '导入失败' }))
      }
    } catch {
      setState((prev) => ({ ...prev, status: 'error', message: '网络错误，请重试' }))
    }
  }

  const renderSection = (
    type: DataType,
    title: string,
    description: string,
    columns: { key: string; label: string }[],
    state: UploadState
  ) => (
    <div className="space-y-4">
      <FileUploader
        title={title}
        description={description}
        onDataParsed={handleDataParsed(type)}
      />

      {state.status === 'preview' && state.data.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">数据预览（共 {state.data.length} 条）</h4>
            <button
              onClick={() => handleImport(type)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              确认导入
            </button>
          </div>
          <DataTable columns={columns} data={state.data} maxRows={5} />
        </div>
      )}

      {state.status === 'uploading' && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
          <span className="text-slate-300">正在导入...</span>
        </div>
      )}

      {state.status === 'success' && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
          <p className="text-green-400 font-medium">✅ {state.message}</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
          <p className="text-red-400 font-medium">❌ {state.message}</p>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">公域数据导入</h1>
        <p className="text-slate-400">支持 .xlsx 和 .csv 格式，上传后预览数据，确认后导入</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {renderSection(
          'firstcharge',
          '女厅首充数据',
          '字段：日期、厅号、首充数量、首充金额',
          firstChargeColumns,
          firstChargeState
        )}
        {renderSection(
          'registration',
          '女厅注册数据',
          '字段：日期、厅号、注册数量',
          registrationColumns,
          registrationState
        )}
      </div>

      <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">📋 数据格式说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-slate-300 font-medium mb-2">女厅首充数据字段</h4>
            <div className="space-y-1 text-sm text-slate-400">
              <p>• 日期（必填，格式：YYYY-MM-DD）</p>
              <p>• 厅号</p>
              <p>• 首充数量（整数）</p>
              <p>• 首充金额（数字）</p>
            </div>
          </div>
          <div>
            <h4 className="text-slate-300 font-medium mb-2">女厅注册数据字段</h4>
            <div className="space-y-1 text-sm text-slate-400">
              <p>• 日期（必填，格式：YYYY-MM-DD）</p>
              <p>• 厅号</p>
              <p>• 注册数量（整数）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
