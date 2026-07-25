import { createServiceClient } from '@/lib/supabase/server'
import type { SiteSettings } from '@/types/database'

/**
 * The single site_settings row. Returns null rather than throwing so a
 * database hiccup degrades to the constants in `@/constants` instead of
 * taking down every page that renders the header or footer.
 */
export async function loadSiteSettings(): Promise<SiteSettings | null> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single()
    return data as SiteSettings | null
  } catch {
    return null
  }
}
