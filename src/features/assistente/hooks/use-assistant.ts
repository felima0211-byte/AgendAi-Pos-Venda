'use client'

import { useState, useCallback } from 'react'

export interface Citation {
  id: string
  name: string
  reason: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, conversationId }),
      })
      const json = await res.json()
      const data = json.ok ? json.data : { conversationId, answer: 'Não consegui responder agora. Tente de novo.', citations: [] }
      setConversationId(data.conversationId ?? conversationId)
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: data.answer, citations: data.citations },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: 'Não consegui responder agora. Tente de novo.' },
      ])
    } finally {
      setLoading(false)
    }
  }, [conversationId, loading])

  const reset = useCallback(() => {
    setMessages([])
    setConversationId(null)
  }, [])

  return { messages, loading, send, reset }
}
