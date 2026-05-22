import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export async function AnnouncementBar() {
  // Opt out of caching — always fetch the latest value
  noStore()

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('announcement_bar')
      .select('*')
      .eq('id', 'main')
      .single()

    if (error || !data?.is_active || !data.message?.trim()) return null

    return (
      <div className="w-full text-center py-2.5 px-4" style={{ background: '#000', color: '#fff' }}>
        <p className="text-[11px] font-medium tracking-[0.08em] leading-snug inline-flex flex-wrap items-center justify-center gap-2">
          <span>{data.message}</span>
          {data.link_text && data.link_url && (
            <Link
              href={data.link_url}
              className="underline underline-offset-2 font-semibold transition-opacity hover:opacity-75 whitespace-nowrap"
              style={{ color: '#c9a87a' }}
            >
              {data.link_text} →
            </Link>
          )}
        </p>
      </div>
    )
  } catch {
    return null
  }
}
