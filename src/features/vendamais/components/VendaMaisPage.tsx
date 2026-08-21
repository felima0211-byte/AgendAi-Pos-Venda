'use client'

import { useState, useEffect } from 'react'
import { Zap, BookOpen, Award, BarChart2, ChevronLeft, ChevronRight, TrendingUp, Star } from 'lucide-react'
import { ESTUDOS, TATICAS, CASOS, ESTATISTICAS } from '../content'

// Rotação por hora: índice baseado em data + hora
function getHourSeed() {
  const now = new Date()
  return now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
}

function pickByHour<T>(arr: T[], offset = 0): T {
  return arr[(getHourSeed() + offset) % arr.length]
}

function pick3Taticas(): typeof TATICAS {
  const seed = getHourSeed()
  const i0 = seed % TATICAS.length
  const i1 = (seed + 7) % TATICAS.length
  const i2 = (seed + 13) % TATICAS.length
  return [TATICAS[i0], TATICAS[i1], TATICAS[i2]]
}

function pick4Stats(): typeof ESTATISTICAS {
  const seed = getHourSeed()
  const picked: typeof ESTATISTICAS = []
  const used = new Set<number>()
  const offsets = [0, 5, 9, 13]
  for (const o of offsets) {
    let idx = (seed + o) % ESTATISTICAS.length
    while (used.has(idx)) idx = (idx + 1) % ESTATISTICAS.length
    used.add(idx)
    picked.push(ESTATISTICAS[idx])
  }
  return picked
}

const STAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  shopping:  { bg: '#F0F7FF', text: '#1D5FA6', border: '#BFD9F5' },
  recompra:  { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  'pos-venda': { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  digital:   { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
}

export function VendaMaisPage() {
  const [estudo] = useState(() => pickByHour(ESTUDOS))
  const [taticas] = useState(() => pick3Taticas())
  const [caso, setCaso] = useState(() => pickByHour(CASOS))
  const [casoIdx, setCasoIdx] = useState(() => (getHourSeed()) % CASOS.length)
  const [stats] = useState(() => pick4Stats())
  const [estudoExpandido, setEstudoExpandido] = useState(false)

  function proximoCaso() {
    const next = (casoIdx + 1) % CASOS.length
    setCasoIdx(next)
    setCaso(CASOS[next])
  }

  function anteriorCaso() {
    const prev = (casoIdx - 1 + CASOS.length) % CASOS.length
    setCasoIdx(prev)
    setCaso(CASOS[prev])
  }

  // Atualiza a cada hora
  useEffect(() => {
    const now = new Date()
    const msUntilNextHour =
      (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1000 - now.getMilliseconds()
    const timer = setTimeout(() => window.location.reload(), msUntilNextHour)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="pb-28 pt-2">

      {/* Header */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <Zap size={18} style={{ color: '#6C4CF0' }} />
          <h1 className="text-xl font-bold" style={{ color: '#1A1830' }}>Venda+</h1>
        </div>
        <p className="text-xs" style={{ color: '#8B8FA8' }}>
          Conteúdo atualizado a cada hora · Fontes: ABRASCE, Sebrae, McKinsey, Euromonitor
        </p>
      </div>

      {/* ── ESTUDO DO DIA ─────────────────────────────────────────── */}
      <div className="mx-4 mb-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <BookOpen size={14} style={{ color: '#6C4CF0' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6C4CF0' }}>
            Estudo da hora
          </span>
        </div>

        <div className="rounded-2xl p-4" style={{ backgroundColor: '#EDE9FD', border: '1px solid #D4CCFA' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#9B8FD4' }}>
            {estudo.fonte}
          </p>
          <h2 className="text-base font-bold mb-0.5" style={{ color: '#1A1830' }}>{estudo.titulo}</h2>
          <p className="text-xs mb-3" style={{ color: '#5B4EA8' }}>{estudo.subtitulo}</p>

          <div className="flex flex-col gap-2 mb-3">
            {estudo.bullets.slice(0, estudoExpandido ? estudo.bullets.length : 2).map((b, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ backgroundColor: '#6C4CF0' }}>
                  {i + 1}
                </span>
                <p className="text-xs leading-relaxed flex-1" style={{ color: '#1A1830' }}>{b}</p>
              </div>
            ))}
          </div>

          {!estudoExpandido && (
            <button
              onClick={() => setEstudoExpandido(true)}
              className="text-[11px] font-semibold mb-3"
              style={{ color: '#6C4CF0' }}
            >
              Ver mais {estudo.bullets.length - 2} pontos →
            </button>
          )}

          <div className="rounded-xl p-3" style={{ backgroundColor: '#6C4CF0' }}>
            <p className="text-xs font-semibold leading-relaxed text-white">
              💡 {estudo.destaque}
            </p>
          </div>
        </div>
      </div>

      {/* ── TÁTICAS RÁPIDAS ───────────────────────────────────────── */}
      <div className="mx-4 mb-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Zap size={14} style={{ color: '#E07B1A' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#E07B1A' }}>
            Táticas rápidas
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {taticas.map((t, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#FFF7ED', border: '1px solid #FDE8C8' }}
            >
              <span className="text-lg leading-none mt-0.5">{t.emoji}</span>
              <p className="text-sm leading-relaxed flex-1" style={{ color: '#1A1830' }}>{t.texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMO AS GRANDES FAZEM ─────────────────────────────────── */}
      <div className="mx-4 mb-5">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Award size={14} style={{ color: '#0F766E' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#0F766E' }}>
            Como as grandes marcas fazem
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          {/* Navegação */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#0F766E' }}>
                {caso.marca}
              </span>
              <span className="text-[10px] ml-2" style={{ color: '#6EE7B7' }}>·</span>
              <span className="text-[10px] ml-2" style={{ color: '#6B7280' }}>{caso.segmento}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={anteriorCaso} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <ChevronLeft size={13} style={{ color: '#0F766E' }} />
              </button>
              <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{casoIdx + 1}/{CASOS.length}</span>
              <button onClick={proximoCaso} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <ChevronRight size={13} style={{ color: '#0F766E' }} />
              </button>
            </div>
          </div>

          <div className="px-4 pb-4">
            <h3 className="text-sm font-bold mb-2" style={{ color: '#1A1830' }}>{caso.titulo}</h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#374151' }}>{caso.descricao}</p>

            <div className="rounded-xl p-3" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#0F766E' }}>
                O que você pode aplicar hoje
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#1A1830' }}>{caso.licao}</p>
            </div>

            <p className="text-[9px] mt-2" style={{ color: '#9CA3AF' }}>Fonte: {caso.fonte}</p>
          </div>
        </div>
      </div>

      {/* ── ESTATÍSTICAS 2026 ─────────────────────────────────────── */}
      <div className="mx-4 mb-2">
        <div className="flex items-center gap-2 mb-2 px-1">
          <BarChart2 size={14} style={{ color: '#1D5FA6' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#1D5FA6' }}>
            Números do mercado 2025–2026
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {stats.map((s, i) => {
            const colors = STAT_COLORS[s.categoria]
            return (
              <div
                key={i}
                className="rounded-2xl p-3 flex flex-col gap-1"
                style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
              >
                <span className="text-xl font-black leading-none" style={{ color: colors.text }}>
                  {s.numero}
                </span>
                <p className="text-[11px] leading-snug flex-1" style={{ color: '#374151' }}>{s.descricao}</p>
                <p className="text-[9px] mt-1" style={{ color: '#9CA3AF' }}>{s.fonte}</p>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
