'use client'

import { useRef, useState } from 'react'
import { Paperclip, Upload, X } from 'lucide-react'

type FileEntry = {
  name: string
  size: number
}

export function ApexFileDropzone({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMb = 10,
  label = 'Attachments',
  hint = 'Click or drag and drop files',
}: {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMb?: number
  label?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  function addFiles(next: File[]) {
    const maxBytes = maxSizeMb * 1024 * 1024
    const accepted: File[] = []

    for (const file of next) {
      if (files.length + accepted.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed.`)
        break
      }
      if (file.size > maxBytes) {
        setError(`${file.name} exceeds ${maxSizeMb} MB.`)
        continue
      }
      accepted.push(file)
    }

    if (accepted.length > 0) {
      setError('')
      onFilesChange([...files, ...accepted])
    }
  }

  function removeAt(index: number) {
    onFilesChange(files.filter((_, idx) => idx !== index))
  }

  const preview: FileEntry[] = files.map((file) => ({ name: file.name, size: file.size }))

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium apx-muted">{label}</label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragOver(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          addFiles(Array.from(event.dataTransfer.files))
        }}
        className="rounded-xl border border-dashed p-3 transition-colors"
        style={{ borderColor: dragOver ? 'var(--apx-primary)' : 'var(--apx-border)', backgroundColor: 'var(--apx-surface-alt)' }}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg border p-2" style={{ borderColor: 'var(--apx-border)' }}>
            <Upload className="h-4 w-4 apx-muted" />
          </div>
          <div>
            <p className="text-sm apx-text">{hint}</p>
            <p className="text-xs apx-muted">Up to {maxFiles} files, {maxSizeMb} MB each</p>
          </div>
        </div>

        {preview.length > 0 ? (
          <div className="mt-3 space-y-1">
            {preview.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border px-2 py-1.5" style={{ borderColor: 'var(--apx-border)' }}>
                <Paperclip className="h-3.5 w-3.5 apx-muted" />
                <span className="flex-1 truncate text-xs apx-text">{file.name}</span>
                <span className="text-[11px] apx-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                <button type="button" className="apx-icon-action-danger" onClick={(event) => { event.stopPropagation(); removeAt(index) }}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          const next = Array.from(event.target.files || [])
          addFiles(next)
          event.target.value = ''
        }}
      />

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}
