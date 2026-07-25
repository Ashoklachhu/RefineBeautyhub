import { adminGetVideos } from '@/app/actions/admin'
import { VideoGalleryManager } from '@/components/admin/VideoGalleryManager'

export const dynamic = 'force-dynamic'

export default async function AdminVideosPage() {
  const videos = await adminGetVideos()
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Video Gallery</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
          Reels shown on the homepage
        </p>
      </div>
      <VideoGalleryManager videos={videos} />
    </div>
  )
}
