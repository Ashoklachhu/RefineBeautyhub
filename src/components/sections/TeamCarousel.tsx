'use client'

import { useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Camera, Star, Award, Sparkles, User } from 'lucide-react'
import type { Staff } from '@/types/database'

// ── Modal ─────────────────────────────────────────────────────

function TeamModal({ member, onClose }: { member: Staff; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 bg-[#111] border border-white/10 rounded-3xl overflow-hidden
                   w-full max-w-2xl max-h-[90vh] flex flex-col sm:flex-row shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                     flex items-center justify-center text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Photo side */}
        <div className="sm:w-56 flex-shrink-0 relative">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="w-full h-64 sm:h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-64 sm:h-full bg-neutral-800 flex items-center justify-center">
              <User className="w-16 h-16 text-neutral-600" />
            </div>
          )}
          {/* Experience badge */}
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-black/60 backdrop-blur-md border border-white/10
                             text-white text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              {member.experience_years > 0
                ? `${member.experience_years}+ years experience`
                : 'Professional stylist'}
            </span>
          </div>
        </div>

        {/* Content side */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {member.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                 bg-gold-500/15 border border-gold-500/30 text-gold-400 text-[10px] font-medium">
                  <Star className="w-2.5 h-2.5" /> Featured
                </span>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {member.name}
            </h2>
            <p className="text-gold-400 text-sm mt-0.5">{member.role}</p>
          </div>

          {/* Bio */}
          {member.bio && (
            <p className="text-neutral-300 text-sm leading-relaxed">{member.bio}</p>
          )}

          {/* Experience */}
          {member.experience_years > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-gold-500/15 flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{member.experience_years}+ Years</p>
                <p className="text-neutral-500 text-xs">Professional Experience</p>
              </div>
            </div>
          )}

          {/* Specialties */}
          {member.specialties.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Specialties</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.specialties.map((s, i) => (
                  <span key={i}
                    className="px-3 py-1 rounded-full bg-neutral-800 border border-white/5
                               text-neutral-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instagram */}
          {member.instagram_url && (
            <a
              href={member.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-gradient-to-r from-purple-500/15 to-pink-500/15
                         border border-purple-500/20 text-purple-300 hover:text-white
                         text-xs font-medium transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              Follow on Instagram
            </a>
          )}

          {/* Book CTA */}
          <a
            href="/booking"
            className="block w-full text-center py-2.5 rounded-xl
                       bg-gold-500/15 border border-gold-500/30 text-gold-400
                       hover:bg-gold-500/20 text-sm font-medium transition-colors"
          >
            Book with {member.name.split(' ')[0]} →
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────

function TeamCard({ member, onClick }: { member: Staff; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[220px] sm:w-[240px] text-left group cursor-pointer focus:outline-none"
    >
      {/* Portrait photo */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-800 mb-4
                      ring-0 group-hover:ring-2 group-hover:ring-gold-400/50 transition-all duration-300">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name}
            className="w-full h-full object-cover object-top transition-transform duration-500
                       group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <User className="w-14 h-14 text-neutral-600" />
          </div>
        )}

        {/* Experience overlay badge */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <span className="inline-block w-full text-center px-3 py-2 rounded-xl
                           bg-black/55 backdrop-blur-md text-white text-[11px] font-medium
                           border border-white/10">
            {member.experience_years > 0
              ? `Experience of more than ${member.experience_years} years`
              : 'Professional specialist'}
          </span>
        </div>

        {/* Featured star */}
        {member.is_featured && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gold-500/90
                          flex items-center justify-center shadow-lg">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Name + role */}
      <p className="text-neutral-900 dark:text-white font-semibold text-base leading-tight
                    group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
        {member.name}
      </p>
      <p className="text-neutral-500 text-sm mt-0.5 line-clamp-1">{member.role}</p>
    </button>
  )
}

// ── Carousel ──────────────────────────────────────────────────

interface TeamCarouselProps {
  staff: Staff[]
}

export function TeamCarousel({ staff }: TeamCarouselProps) {
  const scrollRef  = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Staff | null>(null)

  const scroll = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 260
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }, [])

  if (staff.length === 0) return null

  return (
    <>
      {/* Nav arrows row */}
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-3xl sm:text-4xl font-light text-neutral-900 dark:text-white"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Our team
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous"
            className="w-10 h-10 rounded-full bg-[#7c2020] hover:bg-[#9a2828] text-white
                       flex items-center justify-center transition-colors shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Next"
            className="w-10 h-10 rounded-full bg-[#7c2020] hover:bg-[#9a2828] text-white
                       flex items-center justify-center transition-colors shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 scroll-smooth
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {staff.map(member => (
          <TeamCard
            key={member.id}
            member={member}
            onClick={() => setSelected(member)}
          />
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <TeamModal member={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
