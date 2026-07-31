export type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export interface UploadResult {
  interactionId: string
  audioId: string
  audioUrl: string
  transcription: string | null
  hasTranscription: boolean
  transcriptionError: string | null
  durationSecs: number | null
}
