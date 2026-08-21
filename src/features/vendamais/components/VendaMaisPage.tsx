'use client'

import { useState, useEffect } from 'react'
import { Zap, BookOpen, Award, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react'
import { ESTUDOS, TATICAS, CASOS, ESTATISTICAS } from '../content'

function getHourSeed() {
  const now = new Date()
  return now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
}

function pick3Taticas(): typeof TATICAS {
  const seed = getHourSeed()
  return [
    TATICAS[seed % TATICAS.length],
    TATICAS[(seed + 7) % TATICAS.length],
    TATICAS[(seed + 13) % TATICAS.length],
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

const STAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  shopping:    { bg: '#F0F7FF', text: '#1D5FA6', border: '#BFD9F5' },
  recompra:    { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  'pos-venda': { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  digital:     { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
}

export function VendaMaisPage() {
  const [estudo]  = useState(() => ESTUDOS[getHourSeed() % ESTUDOS.length])
  const [taticas] = useState(() => pick3Taticas())
  const [stats]   = useState(() => pick4Stats())
  const [casoIdx, setCasoIdx] = useState(() => getHourSeed() % CASOS.length)
  const caso = CASOS[casoIdx]

  useEffect(() => {
    const now = new Date()
    const ms = (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1000
    const t = setTimeout(() => window.location.reload(), ms)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="pb-28 pt-4 px-4 space-y-5">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <Zap size={17} style={{ color: '#6C4CF0' }} />
          <h1 className="text-lg font-bold" style={{ color: '#1A1830' }}>Venda+</h1>
        </div>
        <p className="text-[11px]" style={{ color: '#9CA3AF' }}>Atualiza a cada hora</p>
      </div>

      {/* ── ESTUDO DA HORA ─────────────────────────────── */}
      <div>
        <SectionLabel icon={<BookOpen size={13} />} label="Aprendizado do momento" color="#6C4CF0" />
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#EDE9FD', border: '1px solid #D4CCFA' }}>
          <p className="text-sm font-bold mb-3" style={{ color: '#1A1830' }}>{estudo.titulo}</p>
          <div className="space-y-2 mb-3">
            {estudo.bullets.map((b, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#6C4CF0' }}>
                  {i + 1}
                </span>
                <p className="text-[12px] leading-relaxed flex-1" style={{ color: '#2D2B4E' }}>{b}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#6C4CF0' }}>
            <p className="text-[12px] font-semibold text-white leading-snug">💡 {estudo.destaque}</p>
          </div>
        </div>
      </div>

      {/* ── TÁTICAS RÁPIDAS ────────────────────────────── */}
      <div>
        <SectionLabel icon={<Zap size={13} />} label="Táticas rápidas" color="#E07B1A" />
        <div className="space-y-2">
          {taticas.map((t, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#FFF7ED', border: '1px solid #FDE8C8' }}>
              <span className="text-base leading-none mt-0.5">{t.emoji}</span>
              <p className="text-[12px] leading-relaxed flex-1" style={{ color: '#1A1830' }}>{t.texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── GRANDES MARCAS ─────────────────────────────── */}
      <div>
        <SectionLabel icon={<Award size={13} />} label="Como as grandes fazem" color="#0F766E" />
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold" style={{ color: '#0F766E' }}>{caso.marca}</span>
              <span className="text-[10px]" style={{ color: '#9CA3AF' }}>· {caso.segmento}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setCasoIdx((i) => (i - 1 + CASOS.length) % CASOS.length)}
                className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <ChevronLeft size={13} style={{ color: '#0F766E' }} />
              </button>
              <span className="text-[10px] w-8 text-center" style={{ color: '#9CA3AF' }}>{casoIdx + 1}/{CASOS.length}</span>
              <button onClick={() => setCasoIdx((i) => (i + 1) % CASOS.length)}
                className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                <ChevronRight size={13} style={{ color: '#0F766E' }} />
              </button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm font-bold mb-2" style={{ color: '#1A1830' }}>{caso.titulo}</p>
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: '#374151' }}>{caso.descricao}</p>
            <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: '#0F766E' }}>Aplique hoje</p>
              <p className="text-[12px] leading-relaxed" style={{ color: '#1A1830' }}>{caso.licao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ESTATÍSTICAS ───────────────────────────────── */}
      <div>
        <SectionLabel icon={<BarChart2 size={13} />} label="Números do mercado" color="#1D5FA6" />
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s, i) => {
            const c = STAT_COLORS[s.categoria]
            return (
              <div key={i} className="rounded-2xl p-3 flex flex-col gap-1"
                style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                <span className="text-2xl font-black leading-none" style={{ color: c.text }}>{s.numero}</span>
                <p className="text-[11px] leading-snug" style={{ color: '#374151' }}>{s.descricao}</p>
                <p className="text-[9px] mt-0.5" style={{ color: '#9CA3AF' }}>{s.fonte}</p>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

function SectionLabel({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 px-0.5">
      <span style={{ color }}>{icon}</span>
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
    </div>
  )
}
