import { createClient } from '@/lib/supabase/server'
import { ok, fail, fromSupabaseError, type ServiceResult } from '@/lib/errors'
import type { GalleryItem, Testimonial } from '@/types/database'

export async function getGalleryItems(
  categoryId?: string,
  limit = 20
): Promise<ServiceResult<GalleryItem[]>> {
  const supabase = await createClient()

  let query = supabase
    .from('gallery')
    .select('*')
    .eq('is_published', true)
    .order('display_order')
    .limit(limit)

  if (categoryId) query = query.eq('category_id', categoryId)

  const { data, error } = await query
  if (error) return fail(fromSupabaseError(error))
  return ok((data ?? []) as GalleryItem[])
}

export async function getFeaturedGallery(limit = 6): Promise<ServiceResult<GalleryItem[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('display_order')
    .limit(limit)

  if (error) return fail(fromSupabaseError(error))
  return ok((data ?? []) as GalleryItem[])
}

export async function getPublishedTestimonials(
  featured = false,
  limit = 6
): Promise<ServiceResult<Testimonial[]>> {
  const supabase = await createClient()

  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (featured) query = query.eq('is_featured', true)

  const { data, error } = await query
  if (error) return fail(fromSupabaseError(error))
  return ok((data ?? []) as Testimonial[])
}
