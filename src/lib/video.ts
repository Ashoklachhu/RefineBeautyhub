/** Hard cap on how many reels the homepage gallery holds. */
export const MAX_GALLERY_VIDEOS = 10

const VIDEO_EXT = /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i

/**
 * Poster frame for a reel.
 *
 * Cloudinary renders a still from any video by asking for the frame at 0s
 * (`so_0`) and a `.jpg` extension, so a poster comes for free from the video
 * URL alone — no second upload, nothing extra for the admin to paste.
 * Falls back to `null` for non-Cloudinary URLs so the card can show its own
 * placeholder instead of a broken image.
 */
export function videoPosterUrl(
  videoUrl: string,
  posterUrl?: string | null
): string | null {
  if (posterUrl) return posterUrl
  if (!videoUrl.includes('/video/upload/')) return null

  return videoUrl
    .replace('/video/upload/', '/video/upload/so_0,c_fill,g_auto,w_540,h_960,q_auto/')
    .replace(VIDEO_EXT, '.jpg')
}

/** True for URLs a <video> tag can actually play. */
export function isPlayableVideoUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false
  const path = url.split('?')[0]
  return VIDEO_EXT.test(path) || url.includes('/video/upload/')
}
