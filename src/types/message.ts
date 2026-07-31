export type MessageType =
  | 'POST_SALE'
  | 'THANK_YOU'
  | 'REPURCHASE'
  | 'REMINDER'
  | 'NEWS'
  | 'HOLIDAY'
  | 'BIRTHDAY'
  | 'WELCOME'
  | 'CUSTOM'

export const MESSAGE_TYPE_LABEL: Record<MessageType, string> = {
  POST_SALE: 'Pós-venda',
  THANK_YOU: 'Agradecimento',
  REPURCHASE: 'Recompra',
  REMINDER: 'Lembrete',
  NEWS: 'Novidades',
  HOLIDAY: 'Data comemorativa',
  BIRTHDAY: 'Aniversário',
  WELCOME: 'Boas-vindas',
  CUSTOM: 'Personalizada',
}

// Contexto real do cliente enviado à IA para gerar a mensagem
export interface MessageContext {
  clienteNome: string
  comprador: string | null
  idadeCrianca: string | null
  produtos: string[]
  categorias: string[]
  tamanhoSugerido: string | null
  ultimaCompra: string | null // data legível
  diasSemComprar: number | null
  observacoes: string | null
}
