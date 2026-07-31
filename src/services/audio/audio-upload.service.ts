import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const BUCKET = 'audios'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface UploadAudioResult {
  url: string
  path: string
  bucket: string
  fileSizeBytes: number
  mimeType: string
}

export async function uploadAudioToStorage(
  fileBuffer: Buffer,
  mimeType: string,
  userId: string,
  clientId?: string
): Promise<UploadAudioResult> {
  const supabase = getSupabaseAdmin()

  const ext = mimeType.includes('mp4') ? 'mp4'
    : mimeType.includes('ogg') ? 'ogg'
    : 'webm'

  const folder = clientId ? `${userId}/${clientId}` : `${userId}/avulso`
  const filename = `${randomUUID()}.${ext}`
  const path = `${folder}/${filename}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) throw new Error(`Supabase upload failed: ${error.message}`)

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return {
    url: urlData.publicUrl,
    path,
    bucket: BUCKET,
    fileSizeBytes: fileBuffer.byteLength,
    mimeType,
  }
}
