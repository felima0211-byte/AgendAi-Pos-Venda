import { RecordAtendimentoPage } from '@/features/atendimento/components/RecordAtendimentoPage'

export default function AtendimentoPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; saleId?: string }>
}) {
  return <RecordAtendimentoPageWrapper searchParams={searchParams} />
}

async function RecordAtendimentoPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; saleId?: string }>
}) {
  const params = await searchParams
  return <RecordAtendimentoPage clientId={params.clientId} saleId={params.saleId} />
}
