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

  const submit = useCallback(async (text: string, clientId?: string) => {
    setState('saving')
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/atendimento/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, clientId: clientId ?? undefined }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error?.message ?? 'Erro ao registrar atendimento')
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
