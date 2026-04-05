'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/components/ui/button'
import { FileText, Image as ImageIcon, Download, Trash2, Loader2, Eye, File } from 'lucide-react'
import { toast } from 'sonner'

interface FilePreviewProps {
  filePath: string | null
  fileName: string
  fileSize?: string
  uploadDate?: string
  onRemove?: () => void
}

function getFileExtension(path: string): string {
  const parts = path.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

function isImageFile(path: string): boolean {
  const ext = getFileExtension(path)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
}

function isPdfFile(path: string): boolean {
  const ext = getFileExtension(path)
  return ext === 'pdf'
}

function constructFileUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return path
  }
  return `/${path}`
}

export default function FilePreview({
  filePath,
  fileName,
  fileSize,
  uploadDate,
  onRemove,
}: FilePreviewProps) {
  const { t, isRTL } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [filePath])

  const handleDownload = async () => {
    if (!filePath) return
    setIsLoading(true)
    try {
      const url = constructFileUrl(filePath)
      const response = await fetch(url)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      toast.success(t('common.success'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = () => {
    if (!filePath) return
    const url = constructFileUrl(filePath)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // No file placeholder
  if (!filePath) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <File className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">
          {isRTL ? 'لم يتم رفع ملف' : 'No file uploaded'}
        </p>
      </div>
    )
  }

  const isImage = isImageFile(filePath)
  const isPdf = isPdfFile(filePath)
  const fileUrl = constructFileUrl(filePath)

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Preview Area */}
      <div className="relative bg-gray-50">
        {isImage && !imageError ? (
          <div className="flex items-center justify-center p-4">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-40 w-auto rounded object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        ) : isPdf ? (
          <div className="flex flex-col items-center justify-center gap-2 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <FileText className="h-6 w-6 text-red-500" />
            </div>
            <span className="text-xs text-gray-500">PDF</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <File className="h-6 w-6 text-gray-400" />
            </div>
            <span className="text-xs uppercase text-gray-500">
              {getFileExtension(filePath)}
            </span>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="border-t p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isImage ? (
                <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
              ) : isPdf ? (
                <FileText className="h-4 w-4 shrink-0 text-red-500" />
              ) : (
                <File className="h-4 w-4 shrink-0 text-gray-400" />
              )}
              <p className="truncate text-sm font-medium text-gray-800">{fileName}</p>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {fileSize && <span>{fileSize}</span>}
              {fileSize && uploadDate && <span>•</span>}
              {uploadDate && <span>{uploadDate}</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          {(isPdf || isImage) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Eye className="me-1.5 h-3.5 w-3.5" />
              {isRTL ? 'عرض' : 'View'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="me-1.5 h-3.5 w-3.5" />
            )}
            {isRTL ? 'تحميل' : 'Download'}
          </Button>
          {onRemove && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="border-red-200 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
