'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, RefreshCw, Copy, Check, MessageCircle } from 'lucide-react'
import { useMessageGenerator } from '../hooks/use-message-generator'
import { MESSAGE_TYPE_LABEL, type MessageType } from '@/types/message'

interface MessageGeneratorSheetProps {
  open: boolean
  clientId: string
  clientPhone?: string | null
  defaultType?: MessageType
  reminderId?: string
  onClose: () => void
}

const TYPE_ORDER: MessageType[] = [
  'POST_SALE', 'THANK_YOU', 'REPURCHASE', 'NEWS', 'BIRTHDAY', 'WELCOME', 'HOLIDAY', 'REMINDER',
]

export function MessageGeneratorSheet({
  open, clientId, clientPhone, defaultType = 'POST_SALE', reminderId, onClose,
}: MessageGeneratorSheetProps) {
  const { content, setContent, loading, error, generate, reset } = useMessageGenerator(clientId)
  const [type, setType] = useState<MessageType>(defaultType)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setType(defaultType)
      reset()
    }
  }, [open, defaultType, reset])

  if (!open) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const openWhatsApp = () => {
    const phone = clientPhone?.replace(/\D/g, '')
    const text = encodeURIComponent(content)
    window.open(phone ? `https://wa.me/55${phone}?text=${text}` : `https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" /> Gerar mensagem
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {/* Tipos */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPE_ORDER.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                type === t ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {MESSAGE_TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Área da mensagem */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 min-h-[120px] mb-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <RefreshCw className="w-4 h-4 animate-spin" /> Escrevendo com IA...
            </div>
          ) : content ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full bg-transparent text-sm text-gray-800 resize-none focus:outline-none leading-relaxed"
            />
          ) : (
            <p className="text-sm text-gray-400">
              Escolha o tipo e toque em <b>Gerar</b>. A IA usa o histórico real da cliente.
            </p>
          )}
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {/* Ações */}
        <div className="flex gap-2">
          {!content ? (
            <button
              onClick={() => generate(type, reminderId)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Gerar mensagem
            </button>
          ) : (
            <>
              <button
                onClick={() => generate(type, reminderId)}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" /> Regenerar
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={openWhatsApp}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm"
              >
                <MessageCircle className="w-4 h-4" /> Enviar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
