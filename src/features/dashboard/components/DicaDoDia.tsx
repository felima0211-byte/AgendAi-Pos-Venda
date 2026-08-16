'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'

const DICAS = [
  'Clientes que recebem um contato personalizado após a compra têm 60% mais chance de voltar. Manda uma mensagem hoje para quem comprou na semana passada.',
  'Não entre em contato só para vender. Pergunte como está sendo a experiência com o produto — isso gera confiança e abre espaço para a próxima venda.',
  'O melhor momento para pedir indicação é logo após o cliente demonstrar satisfação. Se alguém elogiou hoje, peça um contato de amiga.',
  'Clientes inativos não sumiram — estão esperando um motivo para voltar. Um "oi, lembrei de você" já faz diferença.',
  'Anote o que cada cliente comprou e quando. Esse histórico vale ouro na hora de sugerir o produto certo na hora certa.',
  'Agradecer a compra com uma mensagem curta e sincera custa zero e fideliza mais do que qualquer desconto.',
  'Se uma cliente não responde, tente mudar o horário do contato. Muitas vezes o problema não é o interesse, é o momento errado.',
  'Crie o hábito de registrar cada atendimento logo após ele acontecer. A memória falha — o histórico não.',
  'Uma cliente satisfeita indica em média 3 pessoas. Invista no pós-venda como se fosse sua melhor propaganda.',
  'Antes de oferecer algo novo, pergunte: "Como você está se sentindo com o que levou?" — essa pergunta abre portas que o desconto não abre.',
  'Programe um contato para 30 dias após cada venda. Esse é o momento ideal para o cliente estar com saudade e pronta para uma nova compra.',
  'Personalização é o diferencial da vendedora autônoma. Use o nome, lembre da última compra, mencione o que ela gostou.',
  'Clientes que reclamam e são bem atendidos ficam mais fiéis do que os que nunca reclamaram. Não tenha medo do feedback.',
  'Uma foto nova do produto com uma mensagem "pensei em você" tem mais conversão do que qualquer promoção genérica.',
  'O follow-up mais eficaz acontece entre 2 e 4 dias após a compra. Nesse período o cliente ainda está animado e receptivo.',
  'Nunca encerre um atendimento sem combinar o próximo contato. "Posso te mandar novidades semana que vem?" já garante a abertura.',
  'Datas especiais são oportunidades de ouro: aniversário, dia das mães, natal. Programe uma mensagem para cada cliente.',
  'Quem compra pelo preço vai embora pelo preço. Quem compra pelo relacionamento fica — invista nisso todos os dias.',
  'Uma mensagem de voz é muito mais pessoal do que um texto. Experimente mandar um áudio curto para uma cliente hoje.',
  'Registre o que o cliente disse que não gostou. Esse feedback vale mais do que qualquer pesquisa de mercado.',
  'Clientes que compram com frequência merecem um reconhecimento especial. Um mimo simples fideliza para sempre.',
  'Não espere o cliente pedir — antecipe. "Sua reposição deve estar chegando ao fim, posso separar pra você?" é uma frase que fecha venda.',
  'A confiança é construída em cada interação. Seja honesta quando um produto não for ideal para a cliente.',
  'Grupos de WhatsApp com clientes geram engajamento quando têm conteúdo de valor — dicas, novidades, bastidores.',
]

function getIndiceHora(): number {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  return (seed + now.getHours()) % DICAS.length
}

function formatarDataHora(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DicaDoDia() {
  const [indice, setIndice] = useState(getIndiceHora)
  const [atualizadoEm, setAtualizadoEm] = useState<Date>(new Date())
  const [isNovo, setIsNovo] = useState(true)

  // Troca automática a cada hora
  useEffect(() => {
    const agora = new Date()
    const msAteProximaHora =
      (60 - agora.getMinutes()) * 60_000 - agora.getSeconds() * 1000 - agora.getMilliseconds()

    const timer = setTimeout(() => {
      const novoIndice = getIndiceHora()
      setIndice(novoIndice)
      setAtualizadoEm(new Date())
      setIsNovo(true)
    }, msAteProximaHora)

    return () => clearTimeout(timer)
  }, [indice])

  // Esconde badge "novo" após 5s
  useEffect(() => {
    if (!isNovo) return
    const t = setTimeout(() => setIsNovo(false), 5000)
    return () => clearTimeout(t)
  }, [isNovo])

  function avancar() {
    setIndice((i) => (i + 1) % DICAS.length)
    setAtualizadoEm(new Date())
    setIsNovo(false)
  }

  function retroceder() {
    setIndice((i) => (i - 1 + DICAS.length) % DICAS.length)
    setAtualizadoEm(new Date())
    setIsNovo(false)
  }

  return (
    <div className="mx-4 mb-4 relative">
      {/* Badge novidade */}
      {isNovo && (
        <span
          className="absolute -top-2 -right-1 z-10 px-2 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: '#6C4CF0' }}
        >
          Novo
        </span>
      )}

      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: '#EDE9FD', border: '1px solid #D4CCFA' }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#6C4CF0' }}
          >
            <Lightbulb size={14} stroke="#fff" strokeWidth={2} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6C4CF0' }}>
            Dica da hora
          </span>
          <span className="ml-auto text-[10px]" style={{ color: '#9B8FD4' }}>
            {indice + 1}/{DICAS.length}
          </span>
        </div>

        {/* Texto */}
        <p className="text-sm leading-relaxed mb-3" style={{ color: '#1A1830' }}>
          {DICAS[indice]}
        </p>

        {/* Rodapé: data/hora + navegação */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px]" style={{ color: '#9B8FD4' }}>
            Atualizado em {formatarDataHora(atualizadoEm)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={retroceder}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: '#D4CCFA' }}
              aria-label="Dica anterior"
            >
              <ChevronLeft size={14} style={{ color: '#6C4CF0' }} />
            </button>
            <button
              onClick={avancar}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: '#D4CCFA' }}
              aria-label="Próxima dica"
            >
              <ChevronRight size={14} style={{ color: '#6C4CF0' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
