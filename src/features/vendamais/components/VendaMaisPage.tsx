'use client'

import { useState, useEffect } from 'react'
import { Zap, X } from 'lucide-react'
import { ESTUDOS, TATICAS, CASOS, ESTATISTICAS } from '../content'
import { VendaMaisCardGrid } from './VendaMaisCardGrid'

const TUTORIAL_KEY = 'vendamais_tutorial_visto'

const TUTORIAL_STEPS = [
  {
    icon: '⚡',
    titulo: 'Tudo aqui se renova a cada hora',
    descricao: 'Novos aprendizados, estratégias e dados aparecem automaticamente. Volte sempre que puder.',
  },
  {
    icon: '📖',
    titulo: 'Aprendizado do momento',
    descricao: 'Um estudo aprofundado com pontos práticos baseados em dados reais de mercado.',
  },
  {
    icon: '🎯',
    titulo: 'Estratégias práticas',
    descricao: 'Três ações que você pode aplicar agora mesmo para vender mais hoje.',
  },
  {
    icon: '🏆',
    titulo: 'Como as grandes marcas fazem',
    descricao: 'Cases reais de Natura, Farm, Arezzo e outras — adaptados para você usar no seu negócio.',
  },
  {
    icon: '📊',
    titulo: 'Dados para afiar seu conhecimento',
    descricao: 'Estatísticas atualizadas sobre vendas, recompra e comportamento do consumidor no Brasil.',
  },
]

function TutorialPopup({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const isLast = step === TUTORIAL_STEPS.length - 1
  const current = TUTORIAL_STEPS[step]

  function avancar() {
    if (isLast) {
      localStorage.setItem(TUTORIAL_KEY, '1')
      onClose()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-t-3xl px-6 pt-6 pb-10 animate-slide-up">
        {/* Fechar */}
        <button
          onClick={() => {
            localStorage.setItem(TUTORIAL_KEY, '1')
            onClose()
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F3F4F6]"
        >
          <X size={14} color="#6B7280" />
        </button>

        {/* Ícone + conteúdo */}
        <div className="flex flex-col items-center text-center pt-2 pb-6">
          <span className="text-4xl mb-4">{current.icon}</span>
          <h2 className="text-base font-bold mb-2 text-[var(--color-text-primary)]">
            {current.titulo}
          </h2>
          <p className="text-sm leading-relaxed text-[#6B7280]">
            {current.descricao}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {TUTORIAL_STEPS.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                backgroundColor:
                  i === step ? 'var(--color-primary)' : '#E5E7EB',
              }}
            />
          ))}
        </div>

        {/* Botão */}
        <button
          onClick={avancar}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-[var(--color-primary)]"
        >
          {isLast ? 'Começar' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}

function getHourSeed() {
  const now = new Date()
  return (
    now.getFullYear() * 1000000 +
    (now.getMonth() + 1) * 10000 +
    now.getDate() * 100 +
    now.getHours()
  )
}

function pickEstudos(): typeof ESTUDOS {
  const seed = getHourSeed()
  const result: typeof ESTUDOS = []
  const used = new Set<number>()
  for (let i = 0; i < Math.min(4, ESTUDOS.length); i++) {
    let idx = (seed + i * 3) % ESTUDOS.length
    while (used.has(idx)) idx = (idx + 1) % ESTUDOS.length
    used.add(idx)
    result.push(ESTUDOS[idx])
  }
  return result
}

function pick3Taticas(): typeof TATICAS {
  const seed = getHourSeed()
  return [
    TATICAS[seed % TATICAS.length],
    TATICAS[(seed + 7) % TATICAS.length],
    TATICAS[(seed + 13) % TATICAS.length],
  ]
}

function pick3Casos(): typeof CASOS {
  const seed = getHourSeed()
  return [
    CASOS[seed % CASOS.length],
    CASOS[(seed + 5) % CASOS.length],
    CASOS[(seed + 11) % CASOS.length],
  ]
}

function pick4Stats(): typeof ESTATISTICAS {
  const seed = getHourSeed()
  const used = new Set<number>()
  const result: typeof ESTATISTICAS = []
  for (const o of [0, 5, 9, 13]) {
    let idx = (seed + o) % ESTATISTICAS.length
    while (used.has(idx)) idx = (idx + 1) % ESTATISTICAS.length
    used.add(idx)
    result.push(ESTATISTICAS[idx])
  }
  return result
}

export function VendaMaisPage() {
  const [estudos] = useState(() => pickEstudos())
  const [taticas] = useState(() => pick3Taticas())
  const [casos] = useState(() => pick3Casos())
  const [stats] = useState(() => pick4Stats())
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_KEY)) setShowTutorial(true)
  }, [])

  useEffect(() => {
    const now = new Date()
    const ms = (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1000
    const t = setTimeout(() => window.location.reload(), ms)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {showTutorial && (
        <TutorialPopup onClose={() => setShowTutorial(false)} />
      )}

      <div className="pb-28 pt-4 px-4 space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Zap size={17} color="var(--color-primary)" />
            <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
              Venda+
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Atualiza a cada hora
          </p>
        </div>

        {/* Grid de Cards */}
        <VendaMaisCardGrid
          estudos={estudos}
          taticas={taticas}
          casos={casos}
          stats={stats}
        />
      </div>
    </>
  )
}
