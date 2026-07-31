export interface AiExtractedData {
  cliente: string | null
  comprador: string | null
  telefone: string | null
  instagram: string | null
  idadeCrianca: string | null
  produtos: string[]
  quantidades: string[]
  valorTotal: number | null
  categorias: string[]
  ocasiao: string | null
  observacoes: string | null
  produtosDesejados: string[]
  itensParaFuturaVenda: string[]
  possivelOportunidade: string | null
  resumo: string | null
}
