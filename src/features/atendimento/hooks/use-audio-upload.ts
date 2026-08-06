'use client'

import { useState, useCallback } from 'react'
import type { UploadState, UploadResult } from '../types'

interface UploadOptions {
  clientId?: string
  saleId?: string
  notes?: string
  valorTotal?: number | null
}

interface UseAudioUploadReturn {
  uploadState: UploadState
  uploadProgress: number
  result: UploadResult | null
  error: string | null
  upload: (blob: Blob, mimeType: string, options?: UploadOptions) => Promise<void>
  reset: () => void
}

export function useAudioUpload(): UseAudioUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (blob: Blob, mimeType: string, options?: UploadOptions) => {
      setUploadState('uploading')
      setUploadProgress(10)
      setError(null)
      setResult(null)

      try {
        const formData = new FormData()
        const ext = mimeType.includes('mp4') ? 'mp4'
          : mimeType.includes('ogg') ? 'ogg'
          : 'webm'
        formData.append('audio', blob, `audio.${ext}`)
        if (options?.clientId) formData.append('clientId', options.clientId)
        if (options?.saleId) formData.append('saleId', options.saleId)
        if (options?.notes) formData.append('notes', options.notes)
        if (options?.valorTotal != null && options.valorTotal > 0) formData.append('valorTotal', String(options.valorTotal))

        setUploadProgress(30)

        const res = await fetch('/api/audio/upload', {
          method: 'POST',
          body: formData,
        })

        setUploadProgress(80)

        // Blindagem: resposta pode não ser JSON (redirect de sessão/proteção, HTML de erro, 413).
        // Evita o erro cru do Safari ("The string did not match the expected pattern").
        if (res.status === 413) {
          throw new Error('Áudio muito grande para envio. Grave um trecho mais curto.')
        }
        const contentType = res.headers.get('content-type') ?? ''
        if (!contentType.includes('application/json')) {
          if (res.status === 401 || res.status === 403 || (res.status >= 300 && res.status < 400)) {
            throw new Error('Sessão expirada ou acesso protegido. Recarregue a página e entre novamente.')
          }
          throw new Error(`Falha no envio (${res.status || 'sem resposta'}). Verifique a conexão e tente novamente.`)
        }

        const data = await res.json().catch(() => null)
        if (!res.ok || !data || data.error) {
          throw new Error(data?.error ?? `Erro ${res.status}`)
        }

        setResult(data as UploadResult)
        setUploadState('success')
        setUploadProgress(100)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao enviar áudio'
        setError(msg)
        setUploadState('error')
        setUploadProgress(0)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setUploadState('idle')
    setUploadProgress(0)
    setResult(null)
    setError(null)
  }, [])

  return { uploadState, uploadProgress, result, error, upload, reset }
}
