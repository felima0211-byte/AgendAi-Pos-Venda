'use client'

import { useState } from 'react'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'
import { useAudioUpload } from '../hooks/use-audio-upload'
import { AudioRecorder } from './AudioRecorder'
import { AudioPreview } from './AudioPreview'
import { ValorVendaPopup } from './ValorVendaPopup'
import { emitRefresh } from '@/lib/refresh-bus'

interface RecordAtendimentoPageProps {
  clientId?: string
  saleId?: string
}

export function RecordAtendimentoPage({ clientId, saleId }: RecordAtendimentoPageProps) {
  const router = useRouter()
  const recorder = useAudioRecorder()
  const uploader = useAudioUpload()
  const [showValorPopup, setShowValorPopup] = useState(false)

  const hasStopped = recorder.state === 'stopped' && !!recorder.audioBlob

  const handleSend = () => {
    if (!recorder.audioBlob) return
    setShowValorPopup(true)
  }

  const handleValorConfirm = async (valor: number | null) => {
    setShowValorPopup(false)
    if (!recorder.audioBlob) return
    await uploader.upload(recorder.audioBlob, recorder.mimeType, { clientId, saleId, valorTotal: valor })
    emitRefresh()
  }

  const handleDelete = () => {
    recorder.reset()
    uploader.reset()
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 h-14 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="w-9 h-9 -ml-2 flex items-center justify-center rounded-full active:bg-black/5"
        >
          <ArrowLeft size={20} className="text-[var(--color-text-primary)]" />
        </button>
        <h1 className="font-bold text-[var(--color-text-primary)]">Registrar atendimento</h1>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-6">
        {/* Instruction card */}
        {recorder.state === 'idle' && (
          <div className="bg-violet-50 rounded-[var(--radius-2xl)] p-4 animate-fade-in">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">Como usar</h3>
            <ul className="text-sm text-[var(--color-text-secondary)] space-y-1 list-disc list-inside">
              <li>Pressione o botão para iniciar</li>
              <li>Relate o atendimento em voz natural</li>
              <li>Pressione novamente para parar</li>
              <li>Revise e envie — a IA transcreve automaticamente</li>
            </ul>
          </div>
        )}

        {/* Recorder */}
        {!hasStopped && (
          <div className="flex flex-col items-center">
            <AudioRecorder
              state={recorder.state}
              duration={recorder.duration}
              error={recorder.error}
              isSupported={recorder.isSupported}
              onStart={recorder.start}
              onStop={recorder.stop}
            />
          </div>
        )}

        {/* Preview + Upload */}
        {hasStopped && recorder.audioUrl && (
          <AudioPreview
            audioUrl={recorder.audioUrl}
            duration={recorder.duration}
            uploadState={uploader.uploadState}
            uploadProgress={uploader.uploadProgress}
            uploadError={uploader.error}
            transcription={uploader.result?.transcription ?? null}
            onDelete={handleDelete}
            onSend={handleSend}
          />
        )}

        {showValorPopup && <ValorVendaPopup onConfirm={handleValorConfirm} />}

        {/* Success state */}
        {uploader.uploadState === 'success' && (
          <div className="flex flex-col items-center gap-2 py-4 animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-[var(--color-success)]" />
            </div>
            <p className="font-semibold text-[var(--color-text-primary)]">Atendimento salvo!</p>
            <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-xs">
              Áudio salvo no Supabase e transcrito pelo Groq Whisper.
            </p>

            {/* Navegação de saída — não deixar o usuário preso */}
            <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
              <button
                onClick={() => router.push(clientId ? `/clientes/${clientId}` : '/clientes')}
                className="w-full py-3 rounded-[var(--radius-full)] bg-[var(--color-primary)] text-white font-medium text-sm active:scale-[0.98]"
              >
                {clientId ? 'Ver cliente' : 'Ver clientes'}
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-3 rounded-[var(--radius-full)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium text-sm active:scale-[0.98]"
              >
                Gravar outro
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-2 text-sm text-[var(--color-text-secondary)]"
              >
                Voltar ao início
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
