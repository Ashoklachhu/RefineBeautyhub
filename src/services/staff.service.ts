import { createClient } from '@/lib/supabase/server'
import { ok, fail, fromSupabaseError, type ServiceResult } from '@/lib/errors'
import type { Staff } from '@/types/database'

export async function getAllStaff(): Promise<ServiceResult<Staff[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) return fail(fromSupabaseError(error))
  return ok(data as Staff[])
}

export async function getStaffByBranch(branch: string): Promise<ServiceResult<Staff[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .eq('branch', branch)
    .order('display_order')

  if (error) return fail(fromSupabaseError(error))
  return ok(data as Staff[])
}

export async function getFeaturedStaff(): Promise<ServiceResult<Staff[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order')

  if (error) return fail(fromSupabaseError(error))
  return ok(data as Staff[])
}

export async function getStaffForService(
  serviceId: string
): Promise<ServiceResult<Staff[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('staff_services')
    .select('staff:staff(*)')
    .eq('service_id', serviceId)

  if (error) return fail(fromSupabaseError(error))
  const staffList = (data ?? []).map((r: Record<string, unknown>) => r.staff).filter(Boolean)
  return ok(staffList as Staff[])
}
