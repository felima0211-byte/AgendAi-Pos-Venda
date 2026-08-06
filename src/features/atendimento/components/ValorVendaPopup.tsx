'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Delete } from 'lucide-react'

interface ValorVendaPopupProps {
  onConfirm: (valor: number | null) => void
}

function parseDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}

function formatBRL(digits: string): string {
  const padded = digits.padStart(4, '0')
  const cents = padded.slice(-2)
  const reais = padded.slice(0, -2).replace(/^0+(?=\d)/, '') || '0'
  const reaisFormatted = Number(reais).toLocaleString('pt-BR')
  return `R$ ${reaisFormatted},${cents}`
}

function digitsToNumber(digits: string): number {
  if (!digits || digits === '0000' || digits === '') return 0
  const padded = digits.padStart(4, '0')
  const reais = parseInt(padded.slice(0, -2), 10) || 0
  const cents = parseInt(padded.slice(-2), 10) || 0
  return reais + cents / 100
}

export function ValorVendaPopup({ onConfirm }: ValorVendaPopupProps) {
  const [digits, setDigits] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addDigit = (d: string) => {
    setDigits(prev => parseDigits(prev + d))
  }

  const backspace = () => {
    setDigits(prev => prev.slice(0, -1))
  }

  const clear = () => setDigits('')

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') { e.preventDefault(); addDigit(e.key) }
    else if (e.key === 'Backspace') { e.preventDefault(); backspace() }
    else if (e.key === 'Enter') { e.preventDefault(); handleConfirm() }
    else if (e.key === 'Escape') { e.preventDefault(); onConfirm(null) }
  }

  const handleConfirm = () => {
    const valor = digitsToNumber(digits)
    onConfirm(valor > 0 ? valor : null)
  }

  const display = digits.length === 0 ? 'R$ 0,00' : formatBRL(digits)
  const hasValue = digits.length > 0 && digitsToNumber(digits) > 0

  const pad = ['1','2','3','4','5','6','7','8','9','',  '0','⌫'] as const

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={() => onConfirm(null)}
      />
      <div className="relative w-full max-w-sm bg-[var(--color-surface)] rounded-t-3xl pb-8 pt-5 px-5 animate-slide-up shadow-xl">
        {/* Handle */}
        <div className="w-10 h-1 bg-[var(--color-divider)] rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            Registre o valor da venda
          </h3>
          <button
            onClick={() => onConfirm(null)}
            aria-label="Pular"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-tertiary)] active:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-5">
          Opcional — pule se preferir não registrar agora
        </p>

        {/* Display */}
        <div
          className="text-center text-4xl font-bold tracking-tight mb-6 text-[var(--color-text-primary)]"
          aria-live="polite"
        >
          {display}
        </div>

        {/* Input invisível para capturar teclado físico */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value=""
          onChange={() => {}}
          onKeyDown={handleKey}
          className="sr-only"
          aria-label="Valor da venda"
        />

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {pad.map((k, i) => {
            if (k === '') return <div key={i} />
            if (k === '⌫') return (
              <button
                key={i}
                onClick={backspace}
                aria-label="Apagar"
                className="h-14 flex items-center justify-center rounded-2xl bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] active:scale-95 transition-transform"
              >
                <Delete size={20} className="text-[var(--color-text-secondary)]" />
              </button>
            )
            return (
              <button
                key={i}
                onClick={() => addDigit(k)}
                className="h-14 text-xl font-semibold rounded-2xl bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] active:scale-95 transition-transform active:bg-[var(--color-border)]"
              >
                {k}
              </button>
            )
          })}
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={clear}
            className="flex-1 py-3 rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-text-body)] text-sm font-semibold active:scale-[0.98]"
          >
            Apagar tudo
          </button>
          <button
            onClick={handleConfirm}
            className={[
              'flex-1 py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-colors',
              hasValue
                ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-primary)]'
                : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]',
            ].join(' ')}
          >
            {hasValue ? `Confirmar ${display}` : 'Pular'}
          </button>
        </div>
      </div>
    </div>
  )
}
