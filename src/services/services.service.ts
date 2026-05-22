import { createClient } from '@/lib/supabase/server'
import { ok, fail, fromSupabaseError, Errors, type ServiceResult } from '@/lib/errors'
import type { Service, ServiceWithCategory, Category } from '@/types/database'

export async function getAllServices(): Promise<ServiceResult<ServiceWithCategory[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('display_order')

  if (error) return fail(fromSupabaseError(error))
  return ok(data as ServiceWithCategory[])
}

export async function getFeaturedServices(): Promise<ServiceResult<ServiceWithCategory[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order')
    .limit(6)

  if (error) return fail(fromSupabaseError(error))
  return ok(data as ServiceWithCategory[])
}

export async function getServiceBySlug(
  slug: string
): Promise<ServiceResult<ServiceWithCategory>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return fail(fromSupabaseError(error))
  if (!data)  return fail(Errors.notFound('Service'))
  return ok(data as ServiceWithCategory)
}

export async function getServicesByCategory(
  categorySlug: string
): Promise<ServiceResult<ServiceWithCategory[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('display_order')

  if (error) return fail(fromSupabaseError(error))

  const filtered = (data as ServiceWithCategory[]).filter(
    (s) => s.category?.slug === categorySlug
  )
  return ok(filtered)
}

export async function getAllCategories(): Promise<ServiceResult<Category[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) return fail(fromSupabaseError(error))
  return ok(data as Category[])
}
