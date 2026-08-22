'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  IconAprendizado,
  IconEstrategia,
  IconCasos,
  IconDados,
  IconEstudo1,
  IconEstudo2,
  IconEstudo3,
  IconEstudo4,
  IconTatica1,
  IconTatica2,
  IconTatica3,
  IconMarca1,
  IconMarca2,
  IconMarca3,
  IconStat1,
  IconStat2,
  IconStat3,
  IconStat4,
} from '@/components/ui/icons-venda-mais'
import { EstudoDoDia, TaticaRapida, CasoGrandeMarca, EstatisticaVenda } from '../content'
import { X } from 'lucide-react'

/* ─────────────────────────────────────────────────────────── */
/* CARD GRID                                                   */
/* ─────────────────────────────────────────────────────────── */

interface CardProps {
  icon: React.ReactNode
  title: string
  meta: string
  onClick: () => void
  backgroundColor: string
}

function Card({ icon, title, meta, onClick, backgroundColor }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-[1rem] overflow-hidden border border-[var(--color-border)]',
        'cursor-pointer transition-all duration-200 ease-out',
        'flex flex-col hover:shadow-lg hover:-translate-y-1 hover:border-[#D4CCFA]'
      )}
    >
      <div
        className="w-full h-[120px] flex items-center justify-center"
        style={{ backgroundColor }}
      >
        {icon}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-sm font-semibold leading-snug text-[var(--color-text-primary)] line-clamp-2 flex-1">
          {title}
        </div>
        <div className="text-xs text-[var(--color-text-tertiary)] mt-2">
          {meta}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* MODAL                                                       */
/* ─────────────────────────────────────────────────────────── */

interface ModalProps {
  open: boolean
  onClose: () => void
  titulo: string
  subtitulo: string
  bullets: string[]
  destaque: string
  fonte: string
}

function Modal({ open, onClose, titulo, subtitulo, bullets, destaque, fonte }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] leading-snug flex-1">
            {titulo}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors"
          >
            <X size={18} color="#6B7280" />
          </button>
        </div>

        {/* Subtitulo */}
        {subtitulo && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
            {subtitulo}
          </p>
        )}

        {/* Bullets */}
        {bullets.length > 0 && (
          <ul className="space-y-3 mb-6">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-[#2D2B4E]">
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold text-xs shrink-0 mt-0.5"
                  style={{ backgroundColor: '#6C4CF0' }}
                >
                  {i + 1}
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {/* Destaque */}
        {destaque && (
          <div className="bg-[#6C4CF0] text-white rounded-xl p-4 mb-6 text-sm leading-relaxed">
            {destaque}
          </div>
        )}

        {/* Fonte */}
        {fonte && (
          <p className="text-xs text-[var(--color-text-tertiary)] border-t border-[var(--color-border)] pt-4">
            {fonte}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* SECTION LABEL                                               */
/* ─────────────────────────────────────────────────────────── */

interface SectionLabelProps {
  icon: React.ReactNode
  label: string
  color: string
}

function SectionLabel({ icon, label, color }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-1.5 mb-4 px-0.5 mt-6 first:mt-0">
      <div style={{ color }}>{icon}</div>
      <span
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── */
/* MAIN GRID COMPONENT                                         */
/* ─────────────────────────────────────────────────────────── */

interface VendaMaisCardGridProps {
  estudos: EstudoDoDia[]
  taticas: TaticaRapida[]
  casos: CasoGrandeMarca[]
  stats: EstatisticaVenda[]
  selectedEstudoIndex?: number
}

export function VendaMaisCardGrid({
  estudos,
  taticas,
  casos,
  stats,
  selectedEstudoIndex = 0,
}: VendaMaisCardGridProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<ModalProps | null>(null)

  function openModal(data: Omit<ModalProps, 'open' | 'onClose'>) {
    setModalData(data)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  const estudioIcons = [IconEstudo1, IconEstudo2, IconEstudo3, IconEstudo4]
  const taticaIcons = [IconTatica1, IconTatica2, IconTatica3]
  const marcaIcons = [IconMarca1, IconMarca2, IconMarca3]
  const statIcons = [IconStat1, IconStat2, IconStat3, IconStat4]

  return (
    <>
      {/* APRENDIZADO DO MOMENTO */}
      <section>
        <SectionLabel
          icon={<IconAprendizado size={13} />}
          label="Aprendizado do momento"
          color="#6C4CF0"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {estudos.map((estudo, i) => {
            const IconComponent = estudioIcons[i % estudioIcons.length]
            return (
              <Card
                key={i}
                icon={<IconComponent size={48} />}
                title={estudo.titulo}
                meta={estudo.fonte.split('—')[0].trim()}
                backgroundColor="linear-gradient(135deg, #6C4CF0 0%, #8B5CF6 100%)"
                onClick={() =>
                  openModal({
                    titulo: estudo.titulo,
                    subtitulo: estudo.subtitulo,
                    bullets: estudo.bullets,
                    destaque: estudo.destaque,
                    fonte: estudo.fonte,
                  })
                }
              />
            )
          })}
        </div>
      </section>

      {/* ESTRATÉGIAS PRÁTICAS */}
      <section>
        <SectionLabel
          icon={<IconEstrategia size={13} />}
          label="Estratégias práticas"
          color="#E07B1A"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {taticas.slice(0, 3).map((tatica, i) => {
            const IconComponent = taticaIcons[i % taticaIcons.length]
            // Parse emoji from tatica.texto
            const [emoji, ...textParts] = tatica.texto.split(' ')
            const text = textParts.join(' ')
            return (
              <Card
                key={i}
                icon={<IconComponent size={48} />}
                title={text || tatica.texto}
                meta={`${emoji} Tática`}
                backgroundColor="linear-gradient(135deg, #E07B1A 0%, #F59E0B 100%)"
                onClick={() =>
                  openModal({
                    titulo: text || tatica.texto,
                    subtitulo: 'Estratégia prática para aplicar hoje',
                    bullets: [tatica.texto],
                    destaque: `💡 ${tatica.texto}`,
                    fonte: 'AgendAI — Estratégias Práticas 2026',
                  })
                }
              />
            )
          })}
        </div>
      </section>

      {/* COMO AS GRANDES MARCAS FAZEM */}
      <section>
        <SectionLabel
          icon={<IconCasos size={13} />}
          label="Como as grandes marcas fazem"
          color="#10B981"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {casos.slice(0, 3).map((caso, i) => {
            const IconComponent = marcaIcons[i % marcaIcons.length]
            return (
              <Card
                key={i}
                icon={<IconComponent size={48} />}
                title={caso.marca}
                meta={caso.segmento}
                backgroundColor="linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                onClick={() =>
                  openModal({
                    titulo: `${caso.marca}: ${caso.titulo}`,
                    subtitulo: caso.descricao,
                    bullets: [caso.licao],
                    destaque: `💡 ${caso.licao}`,
                    fonte: caso.fonte,
                  })
                }
              />
            )
          })}
        </div>
      </section>

      {/* DADOS PARA AFIAR SEU CONHECIMENTO */}
      <section>
        <SectionLabel
          icon={<IconDados size={13} />}
          label="Dados para afiar seu conhecimento"
          color="#3B82F6"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {stats.slice(0, 4).map((stat, i) => {
            const IconComponent = statIcons[i % statIcons.length]
            return (
              <Card
                key={i}
                icon={<IconComponent size={48} />}
                title={stat.numero}
                meta={stat.descricao}
                backgroundColor="linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)"
                onClick={() =>
                  openModal({
                    titulo: `${stat.numero} — ${stat.descricao}`,
                    subtitulo: '',
                    bullets: [
                      stat.descricao,
                      `Categoria: ${stat.categoria}`,
                      'Este dado é de fonte confiável do mercado',
                    ],
                    destaque: `💡 Use este número como argumento em suas vendas: "${stat.numero} — ${stat.descricao}"`,
                    fonte: stat.fonte,
                  })
                }
              />
            )
          })}
        </div>
      </section>

      {/* MODAL */}
      {modalData && (
        <Modal
          open={modalOpen}
          onClose={closeModal}
          {...modalData}
        />
      )}
    </>
  )
}
