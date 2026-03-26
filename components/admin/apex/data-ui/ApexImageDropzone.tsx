'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

export function ApexImageDropzone({
  previewUrl,
  onFileSelect,
  label = 'Profile Image',
}: {
  previewUrl?: string
  onFileSelect: (file: File) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function acceptFile(file: File | null | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    onFileSelect(file)
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium apx-muted">{label}</label>
      <div
        role="button"
        tabIndex={0}
        className="group flex cursor-pointer items-center gap-3 rounded-xl border p-3 outline-none"
        style={{
          borderColor: dragOver ? 'var(--apx-primary)' : 'var(--apx-border)',
          backgroundColor: 'var(--apx-surface-alt)',
        }}
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
          acceptFile(event.dataTransfer.files?.[0])
        }}
      >
        <div className="h-18 w-18 overflow-hidden rounded-full border" style={{ borderColor: 'var(--apx-border)' }}>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs apx-muted">No image</div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium apx-text">Drag and drop image</p>
          <p className="text-xs apx-muted">or click to select</p>
        </div>
        <div className="ms-auto rounded-lg border p-2" style={{ borderColor: 'var(--apx-border)' }}>
          <Upload className="h-4 w-4 apx-muted" />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />
    </div>
  )
}
