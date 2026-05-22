import { createClient } from '@/lib/supabase/client'
import { ok, fail, Errors, type ServiceResult } from '@/lib/errors'

type StorageBucket = 'gallery' | 'services' | 'staff' | 'courses' | 'avatars'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_MB   = 5

export interface UploadResult {
  path:        string
  publicUrl:   string
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Use JPEG, PNG, WebP, or AVIF.'
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`
  }
  return null
}

function buildPath(bucket: StorageBucket, userId: string, file: File): string {
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  // avatars must be prefixed with userId for RLS
  if (bucket === 'avatars') return `${userId}/${name}`
  return name
}

export async function uploadFile(
  bucket: StorageBucket,
  file:   File,
  userId: string
): Promise<ServiceResult<UploadResult>> {
  const validationError = validateFile(file)
  if (validationError) return fail(Errors.validation(validationError))

  const supabase = createClient()
  const path     = buildPath(bucket, userId, file)

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert:       false,
      contentType:  file.type,
    })

  if (error) {
    return fail(Errors.unknown(error.message))
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return ok({ path, publicUrl })
}

export async function deleteFile(
  bucket: StorageBucket,
  path:   string
): Promise<ServiceResult<null>> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) return fail(Errors.unknown(error.message))
  return ok(null)
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}
