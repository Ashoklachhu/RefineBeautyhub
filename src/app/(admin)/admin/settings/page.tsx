import { getSettings, getAnnouncementBar } from '@/app/actions/admin'
import { SettingsClient } from '@/components/admin/SettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const [settings, announcement] = await Promise.all([
    getSettings(),
    getAnnouncementBar(),
  ])

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">Configure your announcement bar, business information and opening hours.</p>
      </div>
      <SettingsClient initialSettings={settings} initialAnnouncement={announcement} />
    </div>
  )
}
