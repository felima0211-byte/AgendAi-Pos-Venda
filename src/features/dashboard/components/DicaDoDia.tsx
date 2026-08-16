'use client'

import { Lightbulb } from 'lucide-react'

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
]

function getDicaDeHoje(): string {
  const dia = new Date().getDate() + new Date().getMonth() * 31
  return DICAS[dia % DICAS.length]
}

export function DicaDoDia() {
  const dica = getDicaDeHoje()

  return (
    <div
      className="mx-4 mb-4 rounded-2xl p-4 flex gap-3 items-start"
      style={{ backgroundColor: '#EDE9FD', border: '1px solid #D4CCFA' }}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
        style={{ backgroundColor: '#6C4CF0' }}
      >
        <Lightbulb size={16} stroke="#fff" strokeWidth={2} />
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6C4CF0' }}>
          Dica do dia
        </span>
        <p className="text-sm leading-relaxed" style={{ color: '#1A1830' }}>
          {dica}
        </p>
      </div>
    </div>
  )
}
