import { createBrowserClient } from '@supabase/ssr'

// We type service return values explicitly rather than using the Database generic,
// which avoids Supabase's complex inference collapsing to `never` on complex schemas.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
