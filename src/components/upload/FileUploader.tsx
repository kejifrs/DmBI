'use client'

import { useState, useCallback } from 'react'

interface ParsedRow {
  [key: string]: string | number | null
}

interface FileUploaderProps {
  title: string
  description?: string
  onDataParsed: (data: ParsedRow[], file: File) => void
  accept?: string
}

export default function FileUploader({ title, description, onDataParsed, accept = '.xlsx,.csv' }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/preview', { method: 'POST', body: formData })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || '解析失败')
      }
      const { rows } = await res.json()
      onDataParsed(rows as ParsedRow[], file)
    } catch (err) {
      setError('文件解析失败，请检查文件格式')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [onDataParsed])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-sm mb-3">{description}</p>}

      <label
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-900/20'
            : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full" />
            <span className="text-slate-400 text-sm">解析中...</span>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">✅</span>
            <span className="text-green-400 text-sm font-medium">{fileName}</span>
            <span className="text-slate-400 text-xs">点击重新选择</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">📁</span>
            <span className="text-slate-300 text-sm">拖拽文件到此处，或点击选择</span>
            <span className="text-slate-500 text-xs">支持 .xlsx 和 .csv 格式</span>
          </div>
        )}
      </label>

      {error && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
