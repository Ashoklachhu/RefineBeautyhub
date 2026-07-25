import { getPublishedVideos } from '@/services/video.service'
import { VideoReels } from './VideoReels'

export async function VideoGallery() {
  const { data: videos } = await getPublishedVideos()

  // No videos yet (or the table isn't migrated) — render nothing rather than
  // leaving an empty band on the homepage.
  if (!videos || videos.length === 0) return null

  return <VideoReels videos={videos} />
}
