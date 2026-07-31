'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Mic, Type, ShieldCheck, CheckCircle2, Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTextAtendimento } from '../hooks/use-text-atendimento'

interface RegistrarAtendimentoSheetProps {
  open: boolean
  onClose: () => void
  clientId?: string
  onRegistered?: () => void
}

type Mode = 'choice' | 'audio-confirm' | 'texto'

export function RegistrarAtendimentoSheet({ open, onClose, clientId, onRegistered }: RegistrarAtendimentoSheetProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('choice')
  const [text, setText] = useState('')
  const { state, result, error, submit, reset } = useTextAtendimento()

  if (!open) return null

  const close = () => {
    setMode('choice')
    setText('')
    reset()
    onClose()
  }

  const goAudio = () => {
    const q = clientId ? `?clientId=${clientId}` : ''
    router.push(`/atendimento${q}`)
  }

  const handleSubmit = async () => {
    if (text.trim().length < 3) return
    const r = await submit(text, clientId)
    if (r) onRegistered?.()
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={close} />
      <div className="relative w-full bg-[var(--color-surface)] rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-tight">Registrar atendimento</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">A IA cria clientes, vendas e lembretes pra você</p>
          </div>
          <button onClick={close} aria-label="Fechar"><X className="w-5 h-5 text-[var(--color-text-tertiary)]" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-10">
          {/* ── Escolha ── */}
          {mode === 'choice' && (
            <div className="flex flex-col gap-3 pt-1">
              <button
                onClick={() => setMode('audio-confirm')}
                className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] active:scale-[0.99] text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[var(--color-text-primary)]">Gravar áudio</span>
                  <span className="block text-xs text-[var(--color-text-secondary)]">Fale sobre o atendimento — o Groq transcreve</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--color-divider)] shrink-0" />
              </button>

              <button
                onClick={() => setMode('texto')}
                className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] active:scale-[0.99] text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-text-body)] flex items-center justify-center shrink-0">
                  <Type className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-[var(--color-text-primary)]">Escrever</span>
                  <span className="block text-xs text-[var(--color-text-secondary)]">Digite o relato do atendimento</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--color-divider)] shrink-0" />
              </button>
            </div>
          )}

          {/* ── Autorização do microfone ── */}
          {mode === 'audio-confirm' && (
            <div className="flex flex-col items-center text-center pt-3 gap-3">
              <span className="w-14 h-14 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary)] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Permitir o microfone</h4>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-xs">
                Vamos pedir acesso ao seu microfone para gravar. O áudio só é usado para transcrever este atendimento.
              </p>
              <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                <button
                  onClick={goAudio}
                  className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold active:scale-[0.98]"
                >
                  Permitir e gravar
                </button>
                <button
                  onClick={() => setMode('choice')}
                  className="w-full py-2.5 rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-text-body)] text-sm font-semibold"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}

          {/* ── Texto ── */}
          {mode === 'texto' && state !== 'success' && (
            <div className="flex flex-col gap-3 pt-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                autoFocus
                placeholder="Ex.: Vendi 2 macacões 18 meses pra Ana, mãe da Sofia. Ela pagou no Pix e disse que volta mês que vem…"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-primary)] leading-relaxed resize-none focus:outline-none focus:border-[var(--color-primary)]"
              />
              {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('choice')}
                  className="py-3 px-4 rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-text-body)] text-sm font-semibold"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={state === 'saving' || text.trim().length < 3}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold disabled:opacity-50 active:scale-[0.98]"
                >
                  {state === 'saving' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processando com IA…</>
                  ) : (
                    'Registrar atendimento'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Sucesso do texto ── */}
          {mode === 'texto' && state === 'success' && (
            <div className="flex flex-col items-center text-center pt-3 gap-2">
              <span className="w-14 h-14 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </span>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Atendimento registrado!</p>
              {result?.extractedData?.resumo && (
                <p className="text-xs text-[var(--color-text-secondary)] max-w-xs">{result.extractedData.resumo}</p>
              )}
              {!!result?.remindersCreated && (
                <p className="text-xs text-[var(--color-primary)] font-medium">
                  {result.remindersCreated} lembrete{result.remindersCreated > 1 ? 's' : ''} de pós-venda criado{result.remindersCreated > 1 ? 's' : ''}.
                </p>
              )}
              <div className="flex flex-col gap-2 w-full max-w-xs mt-3">
                <button
                  onClick={() => { setText(''); reset(); setMode('choice') }}
                  className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold active:scale-[0.98]"
                >
                  Registrar outro
                </button>
                <button
                  onClick={close}
                  className="w-full py-2.5 rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-text-body)] text-sm font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
