import { createClient } from '@/lib/supabase/server'
import { ok, fail, fromSupabaseError, type ServiceResult } from '@/lib/errors'
import { MAX_GALLERY_VIDEOS } from '@/lib/video'
import type { VideoGalleryItem } from '@/types/database'

export async function getPublishedVideos(): Promise<ServiceResult<VideoGalleryItem[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('video_gallery')
    .select('*')
    .eq('is_published', true)
    .order('display_order')
    .limit(MAX_GALLERY_VIDEOS)

  if (error) return fail(fromSupabaseError(error))
  return ok(data as VideoGalleryItem[])
}
