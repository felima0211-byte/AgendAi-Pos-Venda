'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error'

export interface AudioRecorderReturn {
  state: RecorderState
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
  mimeType: string
  fileExtension: string
  error: string | null
  isSupported: boolean
  start: () => Promise<void>
  stop: () => void
  reset: () => void
}

// Priority order: webm/opus → webm → mp4 (iOS) → ogg → fallback
const MIME_CANDIDATES = [
  { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
  { mimeType: 'audio/webm', extension: 'webm' },
  { mimeType: 'audio/mp4', extension: 'mp4' },
  { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
  { mimeType: 'audio/ogg', extension: 'ogg' },
]

function detectMime(): { mimeType: string; extension: string } {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return { mimeType: 'audio/webm', extension: 'webm' }
  }
  for (const c of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(c.mimeType)) return c
  }
  // Browser will choose — retrieve after recording starts
  return { mimeType: '', extension: 'webm' }
}

function humanizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/NotAllowed|Permission|denied/i.test(msg)) {
    return 'Permissão de microfone negada. Habilite nas configurações do dispositivo.'
  }
  if (/NotFound|DevicesNotFound/i.test(msg)) {
    return 'Nenhum microfone encontrado.'
  }
  if (/NotReadable|TrackStart/i.test(msg)) {
    return 'Microfone em uso por outro app. Feche-o e tente novamente.'
  }
  if (/OverConstrained/i.test(msg)) {
    return 'Configuração de áudio não suportada.'
  }
  return 'Não foi possível iniciar a gravação.'
}

export function useAudioRecorder(): AudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mimeRef = useRef(detectMime())

  const MAX_DURATION_SECONDS = 300 // 5 minutos

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      stopStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = useCallback(async () => {
    if (!isSupported) {
      setError('Gravação de áudio não suportada neste navegador.')
      setState('error')
      return
    }

    setState('requesting')
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // iOS ignores sampleRate but it's fine to set
          sampleRate: { ideal: 44100 },
          channelCount: { ideal: 1 },
        },
      })

      streamRef.current = stream
      chunksRef.current = []

      const { mimeType, extension } = mimeRef.current
      const options: MediaRecorderOptions = {}
      if (mimeType) options.mimeType = mimeType

      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        // Use actual recorder mimeType as fallback (browser chose it)
        const actualMime = mimeType || recorder.mimeType || 'audio/webm'
        const actualExt = actualMime.includes('mp4') ? 'mp4'
          : actualMime.includes('ogg') ? 'ogg'
          : 'webm'
        mimeRef.current = { mimeType: actualMime, extension: actualExt }

        const blob = new Blob(chunksRef.current, { type: actualMime })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setState('stopped')
        stopStream()
      }

      recorder.onerror = (e) => {
        console.error('[AudioRecorder] MediaRecorder error', e)
        setError('Erro durante a gravação.')
        setState('error')
        stopStream()
      }

      // timeslice 250ms: critical for iOS — flushes data frequently
      recorder.start(250)
      setState('recording')

      setDuration(0)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)

      // Auto-stop após 5 minutos
      maxTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
        }
      }, MAX_DURATION_SECONDS * 1000)
    } catch (err) {
      setError(humanizeError(err))
      setState('error')
      stopStream()
    }
  }, [isSupported, stopStream])

  const stop = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (maxTimerRef.current) { clearTimeout(maxTimerRef.current); maxTimerRef.current = null }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setError(null)
    setState('idle')
    chunksRef.current = []
    mimeRef.current = detectMime()
  }, [stop, audioUrl])

  return {
    state,
    duration,
    audioBlob,
    audioUrl,
    mimeType: mimeRef.current.mimeType,
    fileExtension: mimeRef.current.extension,
    error,
    isSupported,
    start,
    stop,
    reset,
  }
}
