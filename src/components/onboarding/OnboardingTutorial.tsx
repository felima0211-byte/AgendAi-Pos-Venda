'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const KEY = 'agendai_onboarding_visto'

const STEPS = [
  {
    icon: '👋',
    titulo: 'Bem-vinda ao AgendAI!',
    descricao: 'Seu assistente de pós-venda. Gerencie clientes, vendas e atendimentos em um só lugar — de forma simples e rápida.',
  },
  {
    icon: '🏠',
    titulo: 'Início',
    descricao: 'No dashboard você vê lembretes, atendimentos recentes, oportunidades de retorno e o desempenho das suas vendas.',
  },
  {
    icon: '👥',
    titulo: 'Clientes',
    descricao: 'Cadastre suas clientes, veja o histórico de compras e registre novas vendas diretamente pelo perfil de cada uma.',
  },
  {
    icon: '🎙️',
    titulo: 'Registrar atendimento',
    descricao: 'Toque no botão central para gravar um áudio ou escrever um atendimento. A IA transcreve e organiza tudo para você.',
  },
  {
    icon: '🔔',
    titulo: 'Pós-Venda',
    descricao: 'Acompanhe seus lembretes pendentes, conclua ou adie com um toque e gere mensagens de WhatsApp com IA.',
  },
  {
    icon: '⚡',
    titulo: 'Venda+',
    descricao: 'Dicas, táticas e cases de grandes marcas que se renovam a cada hora para você vender mais todo dia.',
  },
]

export function OnboardingTutorial() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function fechar() {
    localStorage.setItem(KEY, '1')
    setVisible(false)
  }

  function avancar() {
    if (isLast) fechar()
    else setStep((s) => s + 1)
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl px-6 pt-6 pb-10"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Fechar */}
        <button
          onClick={fechar}
          className="absolute top-4 right-4 p-1.5 rounded-full"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <X size={14} style={{ color: '#6B7280' }} />
        </button>

        {/* Conteúdo */}
        <div className="flex flex-col items-center text-center pt-2 pb-6">
          <span className="text-5xl mb-4">{current.icon}</span>
          <h2 className="text-base font-bold mb-2" style={{ color: '#1A1830' }}>{current.titulo}</h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#6B7280' }}>{current.descricao}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                backgroundColor: i === step ? '#6C4CF0' : '#E5E7EB',
              }}
            />
          ))}
        </div>

        {/* Botão */}
        <button
          onClick={avancar}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
          style={{ backgroundColor: '#6C4CF0' }}
        >
          {isLast ? 'Começar agora' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}
