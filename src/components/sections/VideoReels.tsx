'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Volume2, VolumeX, X, ChevronLeft, ChevronRight, Film,
} from 'lucide-react'
import { videoPosterUrl } from '@/lib/video'
import type { VideoGalleryItem } from '@/types/database'

const GOLD  = '#b8976b'
const LGOLD = '#c9a87a'

// ─────────────────────────────────────────────────────────────
// Full-screen reel player
// ─────────────────────────────────────────────────────────────

function ReelViewer({
  videos, index, onNavigate, onClose,
}: {
  videos:     VideoGalleryItem[]
  index:      number
  onNavigate: (delta: number) => void
  onClose:    () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted,    setMuted]    = useState(false)
  const [playing,  setPlaying]  = useState(true)
  const [progress, setProgress] = useState(0)

  const video = videos[index]

  const togglePlay = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }, [])

  // Autoplay each reel as it opens. Browsers block sound on autoplay unless
  // they trust the gesture that got us here — fall back to muted rather than
  // leaving the viewer staring at a frozen first frame.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    setProgress(0)
    el.play().catch(() => {
      el.muted = true
      setMuted(true)
      el.play().catch(() => {})
    })
  }, [index])

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted
  }, [muted])

  // Lock background scroll while the viewer owns the screen
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':     onClose(); break
        case 'ArrowRight':
        case 'ArrowDown':  onNavigate(1); break
        case 'ArrowLeft':
        case 'ArrowUp':    onNavigate(-1); break
        case ' ':          e.preventDefault(); togglePlay(); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNavigate, togglePlay])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,7,5,0.94)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-20">
        <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: LGOLD }}>
          {index + 1} / {videos.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); setMuted(m => !m) }}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Previous / next */}
      {videos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onNavigate(-1) }}
            aria-label="Previous video"
            className="absolute left-2 sm:left-6 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onNavigate(1) }}
            aria-label="Next video"
            className="absolute right-2 sm:right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Player */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: '9 / 16', height: 'min(82vh, 780px)', maxWidth: '92vw', background: '#000' }}
        onClick={e => { e.stopPropagation(); togglePlay() }}
      >
        <video
          key={video.id}
          ref={videoRef}
          src={video.video_url}
          poster={videoPosterUrl(video.video_url, video.poster_url) ?? undefined}
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={e => {
            const el = e.currentTarget
            if (el.duration) setProgress((el.currentTime / el.duration) * 100)
          }}
        />

        {/* Paused overlay */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.9)' }}>
              <Play className="w-6 h-6 ml-0.5" style={{ color: '#1a1410' }} fill="#1a1410" />
            </div>
          </div>
        )}

        {/* Caption */}
        {(video.title || video.caption) && (
          <div className="absolute left-0 right-0 bottom-0 px-5 pt-12 pb-6 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
            {video.title && (
              <p className="text-white text-lg font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
                {video.title}
              </p>
            )}
            {video.caption && (
              <p className="text-white/70 text-xs mt-1">{video.caption}</p>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="absolute left-0 right-0 bottom-0 h-0.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div className="h-full transition-[width] duration-150" style={{ width: `${progress}%`, background: LGOLD }} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────

function ReelCard({
  video, position, onOpen,
}: {
  video:    VideoGalleryItem
  position: number
  onOpen:   () => void
}) {
  const poster = videoPosterUrl(video.video_url, video.poster_url)

  return (
    <motion.button
      data-reel-card
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: Math.min(position, 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex-none snap-start rounded-sm overflow-hidden text-left
                 w-[72%] sm:w-[45%] md:w-[31%] lg:w-[calc((100%-3rem)/4)]"
      style={{ aspectRatio: '9 / 16', background: '#2d2419' }}
      aria-label={`Play ${video.title || 'video'}`}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={video.title ?? ''}
          // The first row sits just under the hero — waiting for a lazy load
          // there would show empty cards on first paint.
          loading={position < 4 ? 'eager' : 'lazy'}
          onError={e => { e.currentTarget.style.display = 'none' }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <Film className="absolute inset-0 m-auto w-8 h-8" style={{ color: GOLD, opacity: 0.4 }} />
      )}

      {/* Legibility wash */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(15,11,8,0.85) 0%, rgba(15,11,8,0.1) 45%, rgba(15,11,8,0.15) 100%)' }} />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="w-14 h-14 rounded-full border flex items-center justify-center
                     transition-all duration-300 group-hover:scale-110"
          style={{
            borderColor: 'rgba(255,255,255,0.6)',
            background:  'rgba(26,20,16,0.35)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Play className="w-5 h-5 ml-0.5 text-white" fill="white" />
        </span>
      </div>

      {/* Title */}
      <div className="absolute left-0 right-0 bottom-0 p-4">
        {video.title && (
          <p className="text-white text-sm font-light leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem' }}>
            {video.title}
          </p>
        )}
        {video.caption && (
          <p className="text-[11px] mt-1 line-clamp-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {video.caption}
          </p>
        )}
      </div>

      {/* Gold hairline on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${GOLD}` }} />
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────

export function VideoReels({ videos }: { videos: VideoGalleryItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const syncArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  // Arrows appear only when the track actually overflows. Watch the element
  // (catches layout shifts with no window resize — fonts, zoom, mount) and
  // the window (catches resizes in browsers that batch observer callbacks).
  useEffect(() => {
    syncArrows()
    window.addEventListener('resize', syncArrows)

    const el = trackRef.current
    const observer = el ? new ResizeObserver(syncArrows) : null
    if (el && observer) observer.observe(el)

    return () => {
      window.removeEventListener('resize', syncArrows)
      observer?.disconnect()
    }
  }, [syncArrows, videos.length])

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-reel-card]')
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  const navigate = useCallback((delta: number) => {
    setOpenIndex(current => {
      if (current === null) return current
      return (current + delta + videos.length) % videos.length
    })
  }, [videos.length])

  const hasOverflow = canScrollLeft || canScrollRight

  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: '#1a1410' }}>
      {/* Texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <div className="w-full h-full"
          style={{ backgroundImage: `radial-gradient(${GOLD} 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
      </div>

      <div className="luxury-container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10"
        >
          <div>
            <p className="flex items-center gap-3 text-[10px] font-semibold tracking-[0.3em] uppercase mb-4"
              style={{ color: GOLD }}>
              <span className="w-8 h-px" style={{ background: GOLD }} />
              Watch Our Work
            </p>
            <h2 className="text-4xl lg:text-5xl font-light leading-[1.12] text-white"
              style={{ fontFamily: 'var(--font-cormorant)' }}>
              Beauty in <em style={{ color: LGOLD }}>Motion</em>
            </h2>
            <p className="text-sm leading-relaxed mt-4 max-w-sm" style={{ color: '#b0a090' }}>
              Real transformations from our studio and academy — tap any reel to play.
            </p>
          </div>

          {/* Arrows */}
          {hasOverflow && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => scrollByCard(-1)}
                disabled={!canScrollLeft}
                aria-label="Previous videos"
                className="w-11 h-11 rounded-full border flex items-center justify-center transition-all disabled:opacity-25"
                style={{ borderColor: '#b8976b55', color: LGOLD }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollByCard(1)}
                disabled={!canScrollRight}
                aria-label="More videos"
                className="w-11 h-11 rounded-full border flex items-center justify-center transition-all disabled:opacity-25"
                style={{ borderColor: '#b8976b55', color: LGOLD }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Reel track */}
        <div
          ref={trackRef}
          onScroll={syncArrows}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {videos.map((video, i) => (
            <ReelCard
              key={video.id}
              video={video}
              position={i}
              onOpen={() => setOpenIndex(i)}
            />
          ))}
        </div>

        {/* Count hint */}
        {videos.length > 4 && (
          <p className="text-[11px] tracking-[0.2em] uppercase mt-6 text-center sm:text-left"
            style={{ color: '#8a7a6a' }}>
            {videos.length} reels — slide for more
          </p>
        )}
      </div>

      {openIndex !== null && (
        <ReelViewer
          videos={videos}
          index={openIndex}
          onNavigate={navigate}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  )
}
