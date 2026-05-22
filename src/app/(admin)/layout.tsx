import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth/get-server-user'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()
  if (!user) redirect('/login?redirectTo=/admin')

  // Use service client to bypass RLS when reading the admin's own profile
  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <AdminThemeProvider>
      {/* h-screen + overflow-hidden locks the viewport so only <main> scrolls — header never overlaps content */}
      <div className="h-screen overflow-hidden bg-slate-50 dark:bg-neutral-950 text-gray-900 dark:text-white flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 overflow-hidden">
          <AdminTopbar user={{ name: profile?.full_name ?? user.email ?? 'Admin', avatar: profile?.avatar_url }} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  )
}
