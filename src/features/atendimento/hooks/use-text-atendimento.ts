'use client'

import { useState, useCallback } from 'react'

interface TextResult {
  interactionId: string
  clientId: string | null
  remindersCreated: number
  extractedData: { cliente?: string | null; resumo?: string | null; produtos?: string[] } | null
}

export function useTextAtendimento() {
  const [state, setState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<TextResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (text: string, clientId?: string, valorTotal?: number | null) => {
    setState('saving')
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/atendimento/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          clientId: clientId ?? undefined,
          ...(valorTotal != null && valorTotal > 0 ? { valorTotal } : {}),
        }),
      })
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        if (res.status === 401 || res.status === 403 || (res.status >= 300 && res.status < 400)) {
          throw new Error('Sessão expirada ou acesso protegido. Recarregue a página e entre novamente.')
        }
        throw new Error(`Falha ao registrar (${res.status || 'sem resposta'}). Tente novamente.`)
      }
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.error?.message ?? 'Erro ao registrar atendimento')
      setResult(json.data as TextResult)
      setState('success')
      return json.data as TextResult
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao registrar')
      setState('error')
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setResult(null)
    setError(null)
  }, [])

  return { state, result, error, submit, reset }
}
