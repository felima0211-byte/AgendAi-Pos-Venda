'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Sparkles, RefreshCw } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { useAssistant } from '@/features/assistente/hooks/use-assistant'

const SUGGESTIONS = [
  'Quem devo chamar hoje?',
  'Quem está há mais de 60 dias sem comprar?',
  'Quem ainda não respondeu meu pós-venda?',
  'Quem costuma comprar mais?',
]

export default function AssistentePage() {
  const router = useRouter()
  const { messages, loading, send, reset } = useAssistant()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    if (!input.trim()) return
    send(input)
    setInput('')
  }

  const empty = messages.length === 0

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center gap-2">
        <button onClick={() => router.back()} aria-label="Voltar" className="w-9 h-9 -ml-2 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h1 className="font-bold text-gray-900">Assistente</h1>
        </div>
        {!empty && (
          <button onClick={reset} className="text-xs text-gray-400 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Nova
          </button>
        )}
      </header>

      {/* Mensagens */}
      <main className="flex-1 px-4 py-4 pb-40 overflow-y-auto space-y-4">
        {empty && (
          <div className="pt-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-violet-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Pergunte sobre suas clientes</h2>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              Respondo apenas com base nos seus dados reais. Nada é inventado.
            </p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-white border border-gray-100 text-sm text-gray-700 active:scale-[0.99]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] bg-violet-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm'
                  : 'max-w-[90%] bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-800'
              }
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.citations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/clientes/${c.id}`)}
                      className="text-[11px] bg-violet-50 text-violet-600 px-2 py-1 rounded-full font-medium"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </main>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            rows={1}
            placeholder="Pergunte sobre suas clientes..."
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 max-h-28"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center disabled:opacity-40 shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
