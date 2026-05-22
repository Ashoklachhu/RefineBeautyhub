import { adminGetGallery } from '@/app/actions/admin'
import { GalleryManager } from '@/components/admin/GalleryManager'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const items = await adminGetGallery()
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Gallery</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{items.length} images</p>
      </div>
      <GalleryManager items={items} />
    </div>
  )
}
