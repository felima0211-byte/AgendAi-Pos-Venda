'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { EstudoDoDia, TaticaRapida, CasoGrandeMarca, EstatisticaVenda } from '../content'
import { X, BookOpen, Zap, TrendingUp, BarChart2 } from 'lucide-react'

/* ─── Paletas por seção ─────────────────────────────────────── */
const PALETTES = {
  estudo: [
    { from: '#3D1FA3', to: '#6C4CF0', accent: '#A78BFA' },
    { from: '#1E1480', to: '#4527D6', accent: '#818CF8' },
    { from: '#2D1580', to: '#5B3FE8', accent: '#C4B5FD' },
    { from: '#1A0F6B', to: '#4C35C8', accent: '#A5B4FC' },
  ],
  tatica: [
    { from: '#7C2D12', to: '#C2410C', accent: '#FCA27B' },
    { from: '#92400E', to: '#D97706', accent: '#FCD34D' },
    { from: '#78350F', to: '#B45309', accent: '#FBB041' },
  ],
  caso: [
    { from: '#064E3B', to: '#059669', accent: '#6EE7B7' },
    { from: '#065F46', to: '#10B981', accent: '#A7F3D0' },
    { from: '#047857', to: '#34D399', accent: '#D1FAE5' },
  ],
  stat: [
    { from: '#1E3A8A', to: '#2563EB', accent: '#93C5FD' },
    { from: '#1E40AF', to: '#3B82F6', accent: '#BFDBFE' },
    { from: '#1D4ED8', to: '#60A5FA', accent: '#BAE6FD' },
    { from: '#1E3A8A', to: '#4F46E5', accent: '#A5B4FC' },
  ],
}

/* ─── Card imersivo — estudo ────────────────────────────────── */
function EstudoCard({ estudo, index, onClick }: { estudo: EstudoDoDia; index: number; onClick: () => void }) {
  const p = PALETTES.estudo[index % PALETTES.estudo.length]
  const words = estudo.titulo.split(' ')
  const hero = words.slice(0, 2).join(' ')
  const fonte = estudo.fonte.split('—')[0].trim()

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4CF0]"
      style={{ aspectRatio: '3/4', background: `linear-gradient(145deg, ${p.from} 0%, ${p.to} 100%)` }}
    >
      {/* Decoração geométrica */}
      <div
        className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20"
        style={{ background: p.accent }}
      />
      <div
        className="absolute top-10 -right-12 w-24 h-24 rounded-full opacity-10"
        style={{ background: p.accent }}
      />
      <div
        className="absolute -bottom-4 -left-6 w-28 h-28 rounded-full opacity-15"
        style={{ background: p.accent }}
      />

      {/* Hero word */}
      <div className="absolute top-5 left-5 right-5">
        <span
          className="text-4xl font-black leading-none tracking-tight opacity-25 select-none"
          style={{ color: p.accent }}
        >
          {hero}
        </span>
      </div>

      {/* Overlay gradiente na base */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to top, ${p.from}F5 0%, ${p.from}80 45%, transparent 70%)` }}
      />

      {/* Conteúdo */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-semibold text-sm leading-snug line-clamp-3 mb-2">
          {estudo.titulo}
        </p>
        <p className="text-white/50 text-[10px] font-medium tracking-wide uppercase truncate">
          {fonte}
        </p>
      </div>

      {/* Hover shine */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
    </button>
  )
}

/* ─── Card imersivo — tática ────────────────────────────────── */
function TaticaCard({ tatica, index, onClick }: { tatica: TaticaRapida; index: number; onClick: () => void }) {
  const p = PALETTES.tatica[index % PALETTES.tatica.length]
  const preview = tatica.texto.split('.')[0]

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
      style={{ aspectRatio: '3/4', background: `linear-gradient(145deg, ${p.from} 0%, ${p.to} 100%)` }}
    >
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20" style={{ background: p.accent }} />
      <div className="absolute bottom-16 -left-8 w-20 h-20 rounded-full opacity-15" style={{ background: p.accent }} />

      <div className="absolute top-5 left-5">
        <span className="text-5xl opacity-30">{tatica.emoji}</span>
      </div>

      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to top, ${p.from}F5 0%, ${p.from}70 40%, transparent 65%)` }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-semibold text-sm leading-snug line-clamp-3 mb-2">
          {preview}
        </p>
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: `${p.accent}30`, color: p.accent }}
        >
          Estratégia
        </span>
      </div>

      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
    </button>
  )
}

/* ─── Card imersivo — caso de marca ────────────────────────── */
function CasoCard({ caso, index, onClick }: { caso: CasoGrandeMarca; index: number; onClick: () => void }) {
  const p = PALETTES.caso[index % PALETTES.caso.length]
  const inicial = caso.marca.charAt(0)

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
      style={{ aspectRatio: '3/4', background: `linear-gradient(145deg, ${p.from} 0%, ${p.to} 100%)` }}
    >
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20" style={{ background: p.accent }} />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15" style={{ background: p.accent }} />

      {/* Inicial da marca como elemento visual */}
      <div className="absolute top-4 left-5">
        <span
          className="text-7xl font-black opacity-20 leading-none select-none"
          style={{ color: p.accent }}
        >
          {inicial}
        </span>
      </div>

      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to top, ${p.from}F5 0%, ${p.from}75 40%, transparent 65%)` }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">
          {caso.segmento}
        </p>
        <p className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-2">
          {caso.marca} — {caso.titulo}
        </p>
      </div>

      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
    </button>
  )
}

/* ─── Card imersivo — estatística ───────────────────────────── */
function StatCard({ stat, index, onClick }: { stat: EstatisticaVenda; index: number; onClick: () => void }) {
  const p = PALETTES.stat[index % PALETTES.stat.length]

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-2xl overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
      style={{ aspectRatio: '3/4', background: `linear-gradient(145deg, ${p.from} 0%, ${p.to} 100%)` }}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-15" style={{ background: p.accent }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ background: p.accent }} />

      {/* Número como herói absoluto */}
      <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center px-4 gap-1">
        <span
          className="text-3xl font-black text-center leading-none"
          style={{ color: p.accent }}
        >
          {stat.numero}
        </span>
      </div>

      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to top, ${p.from}F5 0%, ${p.from}60 35%, transparent 60%)` }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white text-xs leading-snug line-clamp-3 font-medium">
          {stat.descricao}
        </p>
      </div>

      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
    </button>
  )
}

/* ─── Section label ─────────────────────────────────────────── */
function SectionLabel({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-7 first:mt-0">
      <div style={{ color }}>{icon}</div>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
        {label}
      </span>
    </div>
  )
}

/* ─── Modal ─────────────────────────────────────────────────── */
interface ModalData {
  titulo: string
  subtitulo: string
  bullets: string[]
  destaque: string
  fonte: string
}

function Modal({ data, onClose }: { data: ModalData; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={cn(
          'bg-[var(--color-surface)] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl',
          'max-h-[90dvh] overflow-y-auto animate-slide-up',
        )}
      >
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--color-border-strong)]" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] leading-snug flex-1">
              {data.titulo}
            </h2>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background)] hover:bg-[var(--color-border)] transition-colors"
            >
              <X size={16} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>

          {data.subtitulo && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
              {data.subtitulo}
            </p>
          )}

          {data.bullets.length > 0 && (
            <ul className="space-y-3 mb-5">
              {data.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-[var(--color-text-body)]">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-primary)] text-white font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          {data.destaque && (
            <div className="rounded-xl p-4 mb-5 text-sm leading-relaxed text-white font-medium" style={{ background: 'linear-gradient(135deg, #4527A0, #6C4CF0)' }}>
              {data.destaque}
            </div>
          )}

          {data.fonte && (
            <p className="text-[11px] text-[var(--color-text-subtle)] border-t border-[var(--color-border)] pt-4">
              Fonte: {data.fonte}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main ──────────────────────────────────────────────────── */
interface VendaMaisCardGridProps {
  estudos: EstudoDoDia[]
  taticas: TaticaRapida[]
  casos: CasoGrandeMarca[]
  stats: EstatisticaVenda[]
}

export function VendaMaisCardGrid({ estudos, taticas, casos, stats }: VendaMaisCardGridProps) {
  const [modal, setModal] = useState<ModalData | null>(null)

  return (
    <>
      {/* APRENDIZADO */}
      <section>
        <SectionLabel icon={<BookOpen size={13} />} label="Aprendizado do momento" color="#6C4CF0" />
        <div className="grid grid-cols-2 gap-2.5">
          {estudos.slice(0, 4).map((e, i) => (
            <EstudoCard
              key={i}
              estudo={e}
              index={i}
              onClick={() => setModal({ titulo: e.titulo, subtitulo: e.subtitulo, bullets: e.bullets, destaque: e.destaque, fonte: e.fonte })}
            />
          ))}
        </div>
      </section>

      {/* ESTRATÉGIAS */}
      <section>
        <SectionLabel icon={<Zap size={13} />} label="Estratégias práticas" color="#D97706" />
        <div className="grid grid-cols-2 gap-2.5">
          {taticas.slice(0, 4).map((t, i) => (
            <TaticaCard
              key={i}
              tatica={t}
              index={i}
              onClick={() => setModal({ titulo: t.texto, subtitulo: 'Estratégia prática para aplicar hoje', bullets: [t.texto], destaque: t.texto, fonte: 'AgendAI — Estratégias de Vendas 2026' })}
            />
          ))}
        </div>
      </section>

      {/* GRANDES MARCAS */}
      <section>
        <SectionLabel icon={<TrendingUp size={13} />} label="Como as grandes marcas fazem" color="#10B981" />
        <div className="grid grid-cols-2 gap-2.5">
          {casos.slice(0, 4).map((c, i) => (
            <CasoCard
              key={i}
              caso={c}
              index={i}
              onClick={() => setModal({ titulo: `${c.marca}: ${c.titulo}`, subtitulo: c.descricao, bullets: [c.licao], destaque: c.licao, fonte: c.fonte })}
            />
          ))}
        </div>
      </section>

      {/* DADOS */}
      <section>
        <SectionLabel icon={<BarChart2 size={13} />} label="Dados para afiar seu conhecimento" color="#3B82F6" />
        <div className="grid grid-cols-2 gap-2.5">
          {stats.slice(0, 4).map((s, i) => (
            <StatCard
              key={i}
              stat={s}
              index={i}
              onClick={() => setModal({ titulo: s.numero, subtitulo: s.descricao, bullets: [s.descricao], destaque: `Use este dado como argumento: "${s.numero} — ${s.descricao}"`, fonte: s.fonte })}
            />
          ))}
        </div>
      </section>

      {modal && <Modal data={modal} onClose={() => setModal(null)} />}
    </>
  )
}
