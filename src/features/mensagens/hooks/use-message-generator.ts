'use client'

import { useState, useCallback } from 'react'
import type { MessageType } from '@/types/message'

export function useMessageGenerator(clientId: string) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (type: MessageType, reminderId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/messages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, type, reminderId }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error?.message ?? 'Erro ao gerar mensagem')
      setContent(json.data.content)
      return json.data.content as string
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar')
      return null
    } finally {
      setLoading(false)
    }
  }, [clientId])

  const reset = useCallback(() => {
    setContent('')
    setError(null)
  }, [])

  return { content, setContent, loading, error, generate, reset }
}
