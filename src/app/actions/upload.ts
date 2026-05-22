'use server'

import { cloudinary } from '@/lib/cloudinary'

export interface UploadResult {
  url:       string   // secure HTTPS Cloudinary URL
  publicId:  string   // e.g. "gallery/abc123"
  width:     number
  height:    number
  format:    string
  bytes:     number
}

/**
 * Uploads a single image file to Cloudinary under the "gallery" folder.
 * Accepts a File from FormData, converts it to a buffer, then uses the
 * Cloudinary Node SDK upload_stream so nothing touches the local disk.
 */
export async function uploadImageAction(
  formData: FormData
): Promise<{ data?: UploadResult; error?: string }> {
  const file = formData.get('file') as File | null
  if (!file) return { error: 'No file provided' }

  // Validate type
  if (!file.type.startsWith('image/')) {
    return { error: 'Only image files are allowed' }
  }

  // Validate size — 10 MB max
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'File size must be under 10 MB' }
  }

  // Optional folder override passed by ImageUploadInput
  const folderOverride = (formData.get('folder') as string | null) ?? 'gallery'

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:         folderOverride,
          resource_type:  'image',
          // Auto-quality + auto-format for best compression
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            reject(new Error(error?.message ?? 'Cloudinary upload failed'))
            return
          }
          resolve({
            url:      result.secure_url,
            publicId: result.public_id,
            width:    result.width,
            height:   result.height,
            format:   result.format,
            bytes:    result.bytes,
          })
        }
      )
      stream.end(buffer)
    })

    return { data: result }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    console.error('[Cloudinary] Upload error:', msg)
    return { error: msg }
  }
}

/**
 * Deletes an image from Cloudinary by its public_id.
 * Called when an admin deletes a gallery item.
 */
export async function deleteCloudinaryImage(
  publicId: string
): Promise<{ error?: string }> {
  if (!publicId) return {}
  try {
    await cloudinary.uploader.destroy(publicId)
    return {}
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delete failed'
    console.error('[Cloudinary] Delete error:', msg)
    return { error: msg }
  }
}
