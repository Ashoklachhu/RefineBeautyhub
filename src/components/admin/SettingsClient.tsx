'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Save, Clock, MapPin, Globe, Camera, PlayCircle, Loader2, Megaphone, Link as LinkIcon, ToggleLeft, ToggleRight } from 'lucide-react'
import { upsertSettings, upsertAnnouncementBar } from '@/app/actions/admin'
import type { SiteSettings, OpeningHourEntry, AnnouncementBar } from '@/types/database'

// ── Constants ─────────────────────────────────────────────────

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DEFAULT_HOURS: OpeningHourEntry[] = DAYS.map(day => ({
  day,
  open:   day === 'Saturday' || day === 'Friday' ? '09:00' : '10:00',
  close:  day === 'Saturday' || day === 'Friday' ? '20:00' : '19:00',
  closed: false,
}))

const DEFAULT_SETTINGS: Omit<SiteSettings, 'id' | 'updated_at'> = {
  name:             'Refined Beauty Hub',
  tagline:          'Where Beauty Meets Excellence',
  email:            'hello@refinedbeautyhub.com',
  phone:            '+977-1-4123456',
  address:          'Lazimpat, Kathmandu, Nepal 44600',
  map_url:          'https://maps.google.com/?q=Lazimpat,Kathmandu,Nepal',
  instagram:        'https://instagram.com/refinedbeautyhub',
  facebook:         'https://facebook.com/refinedbeautyhub',
  youtube:          'https://youtube.com/@refinedbeautyhub',
  tiktok:           'https://tiktok.com/@refinedbeautyhub',
  opening_hours:    DEFAULT_HOURS,
  meta_title:       'Refined Beauty Hub — Luxury Salon & Academy, Kathmandu',
  meta_description: "Kathmandu's premier luxury beauty salon and academy. Expert services in hair, skin, nails, makeup, and professional beauty training.",
  og_image:         '',
}

// ── Helpers ───────────────────────────────────────────────────

function hoursToMap(hours: OpeningHourEntry[]): Record<string, OpeningHourEntry> {
  return Object.fromEntries(hours.map(h => [h.day, h]))
}

function mapToHours(map: Record<string, OpeningHourEntry>): OpeningHourEntry[] {
  return DAYS.map(d => map[d]).filter(Boolean)
}

// ── Component ─────────────────────────────────────────────────

interface SettingsClientProps {
  initialSettings:     SiteSettings | null
  initialAnnouncement: AnnouncementBar | null
}

export function SettingsClient({ initialSettings, initialAnnouncement }: SettingsClientProps) {
  const merged = { ...DEFAULT_SETTINGS, ...initialSettings }

  const [activeTab, setActiveTab] = useState<'announcement' | 'business' | 'hours' | 'social' | 'seo'>('announcement')
  const [isPending, startTransition] = useTransition()

  // ── Announcement state ──────────────────────────────────────
  const [announcement, setAnnouncement] = useState({
    is_active: initialAnnouncement?.is_active ?? false,
    message:   initialAnnouncement?.message   ?? '',
    link_text: initialAnnouncement?.link_text  ?? '',
    link_url:  initialAnnouncement?.link_url   ?? '',
  })

  function handleSaveAnnouncement() {
    startTransition(async () => {
      const { error } = await upsertAnnouncementBar({
        is_active: announcement.is_active,
        message:   announcement.message,
        link_text: announcement.link_text || null,
        link_url:  announcement.link_url  || null,
      })
      if (error) toast.error(`Failed to save: ${error}`)
      else toast.success('Announcement saved!')
    })
  }

  const [business, setBusiness] = useState({
    name:    merged.name,
    tagline: merged.tagline,
    email:   merged.email,
    phone:   merged.phone,
    address: merged.address,
    map_url: merged.map_url,
  })

  const [hours, setHours] = useState<Record<string, OpeningHourEntry>>(
    () => hoursToMap(merged.opening_hours?.length ? merged.opening_hours : DEFAULT_HOURS)
  )

  const [social, setSocial] = useState({
    instagram: merged.instagram,
    facebook:  merged.facebook,
    youtube:   merged.youtube,
    tiktok:    merged.tiktok,
  })

  const [seo, setSeo] = useState({
    meta_title:       merged.meta_title,
    meta_description: merged.meta_description,
    og_image:         merged.og_image,
  })

  function handleSave() {
    startTransition(async () => {
      const { error } = await upsertSettings({
        ...business,
        ...social,
        ...seo,
        opening_hours: mapToHours(hours),
      })
      if (error) {
        toast.error(`Failed to save: ${error}`)
      } else {
        toast.success('Settings saved successfully')
      }
    })
  }

  const tabs = [
    { id: 'announcement', label: 'Announcement' },
    { id: 'business',     label: 'Business Info' },
    { id: 'hours',        label: 'Opening Hours' },
    { id: 'social',       label: 'Social Media' },
    { id: 'seo',          label: 'SEO' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
              ${activeTab === t.id ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl p-6 space-y-5">

        {/* ── Announcement Bar ── */}
        {activeTab === 'announcement' && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-gold-400" /> Announcement Bar
            </h3>

            {/* Live preview */}
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
              <div className="text-center py-2.5 px-4 text-[11px] font-medium tracking-wide"
                style={{ background: '#000', color: announcement.is_active ? '#fff' : '#666' }}>
                {announcement.message || 'Your announcement will appear here…'}
                {announcement.link_text && (
                  <span className="ml-2 underline font-semibold" style={{ color: '#c9a87a' }}>
                    {announcement.link_text} →
                  </span>
                )}
              </div>
              <p className="text-[10px] text-center text-gray-400 dark:text-neutral-600 py-1.5 bg-gray-100 dark:bg-neutral-800/50">
                Live preview — this is how it appears on your website
              </p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-white/5">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Show announcement bar</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">Turn on to make it visible to all visitors</p>
              </div>
              <button
                onClick={() => setAnnouncement(p => ({ ...p, is_active: !p.is_active }))}
                className="transition-opacity hover:opacity-80 flex-shrink-0"
              >
                {announcement.is_active
                  ? <ToggleRight className="w-9 h-9 text-gold-400" />
                  : <ToggleLeft  className="w-9 h-9 text-gray-300 dark:text-neutral-600" />}
              </button>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs text-gray-600 dark:text-neutral-300 flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /> Message
              </label>
              <textarea
                rows={2}
                value={announcement.message}
                onChange={e => setAnnouncement(p => ({ ...p, message: e.target.value }))}
                placeholder="✨ Free consultation this weekend — limited slots!"
                className="admin-input w-full resize-none"
                maxLength={200}
              />
              <p className="text-[10px] text-gray-300 dark:text-neutral-600">{announcement.message.length}/200 characters</p>
            </div>

            {/* Optional CTA */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /> Button label <span className="text-gray-300 dark:text-neutral-600">(optional)</span>
                </label>
                <input
                  value={announcement.link_text}
                  onChange={e => setAnnouncement(p => ({ ...p, link_text: e.target.value }))}
                  placeholder="Book Now"
                  className="admin-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" /> Button URL <span className="text-gray-300 dark:text-neutral-600">(optional)</span>
                </label>
                <input
                  type="url"
                  value={announcement.link_url}
                  onChange={e => setAnnouncement(p => ({ ...p, link_url: e.target.value }))}
                  placeholder="/booking"
                  className="admin-input w-full"
                />
              </div>
            </div>

            <button onClick={handleSaveAnnouncement} disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors disabled:opacity-50">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending ? 'Saving…' : 'Save Announcement'}
            </button>
          </>
        )}

        {/* ── Business Info ── */}
        {activeTab === 'business' && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-400" /> Business Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">Business Name</label>
                <input value={business.name}
                  onChange={e => setBusiness(p => ({ ...p, name: e.target.value }))}
                  className="admin-input w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">Tagline</label>
                <input value={business.tagline}
                  onChange={e => setBusiness(p => ({ ...p, tagline: e.target.value }))}
                  className="admin-input w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">Email</label>
                <input type="email" value={business.email}
                  onChange={e => setBusiness(p => ({ ...p, email: e.target.value }))}
                  className="admin-input w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">Phone</label>
                <input value={business.phone}
                  onChange={e => setBusiness(p => ({ ...p, phone: e.target.value }))}
                  className="admin-input w-full" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">Address</label>
                <input value={business.address}
                  onChange={e => setBusiness(p => ({ ...p, address: e.target.value }))}
                  className="admin-input w-full" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">Google Maps Link</label>
                <input type="url" value={business.map_url}
                  onChange={e => setBusiness(p => ({ ...p, map_url: e.target.value }))}
                  className="admin-input w-full"
                  placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </>
        )}

        {/* ── Opening Hours ── */}
        {activeTab === 'hours' && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" /> Opening Hours
            </h3>
            <div className="space-y-3">
              {DAYS.map(day => {
                const entry = hours[day] ?? { day, open: '10:00', close: '19:00', closed: false }
                return (
                  <div key={day} className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 dark:text-neutral-300 w-24 flex-shrink-0">{day}</span>
                    <label className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
                      <input type="checkbox" checked={!entry.closed}
                        onChange={e => setHours(p => ({
                          ...p,
                          [day]: { ...p[day], closed: !e.target.checked },
                        }))}
                        className="w-4 h-4 rounded accent-gold-500" />
                      <span className="text-[10px] text-gray-400 dark:text-neutral-500">Open</span>
                    </label>
                    {!entry.closed ? (
                      <div className="flex items-center gap-2">
                        <input type="time" value={entry.open}
                          onChange={e => setHours(p => ({
                            ...p,
                            [day]: { ...p[day], open: e.target.value },
                          }))}
                          className="admin-input w-28 text-xs" />
                        <span className="text-gray-400 dark:text-neutral-500 text-xs">–</span>
                        <input type="time" value={entry.close}
                          onChange={e => setHours(p => ({
                            ...p,
                            [day]: { ...p[day], close: e.target.value },
                          }))}
                          className="admin-input w-28 text-xs" />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-neutral-600 italic">Closed</span>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── Social Media ── */}
        {activeTab === 'social' && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-gold-400" /> Social Media Links
            </h3>
            <div className="space-y-3">
              {[
                { key: 'instagram', label: 'Instagram', icon: Camera,     placeholder: 'https://instagram.com/...' },
                { key: 'facebook',  label: 'Facebook',  icon: Globe,      placeholder: 'https://facebook.com/...' },
                { key: 'youtube',   label: 'YouTube',   icon: PlayCircle, placeholder: 'https://youtube.com/...' },
                { key: 'tiktok',    label: 'TikTok',    icon: Globe,      placeholder: 'https://tiktok.com/...' },
              ].map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-400 dark:text-neutral-400" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[10px] text-gray-400 dark:text-neutral-500">{label}</label>
                    <input type="url"
                      value={social[key as keyof typeof social]}
                      onChange={e => setSocial(p => ({ ...p, [key]: e.target.value }))}
                      className="admin-input w-full"
                      placeholder={placeholder} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SEO ── */}
        {activeTab === 'seo' && (
          <>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-gold-400" /> SEO Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">Meta Title</label>
                <input value={seo.meta_title}
                  onChange={e => setSeo(p => ({ ...p, meta_title: e.target.value }))}
                  className="admin-input w-full" maxLength={70} />
                <p className="text-[10px] text-gray-300 dark:text-neutral-600">{seo.meta_title.length}/70 characters</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">Meta Description</label>
                <textarea rows={3} value={seo.meta_description}
                  onChange={e => setSeo(p => ({ ...p, meta_description: e.target.value }))}
                  className="admin-input w-full resize-none" maxLength={160} />
                <p className="text-[10px] text-gray-300 dark:text-neutral-600">{seo.meta_description.length}/160 characters</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-600 dark:text-neutral-300">OG Image URL</label>
                <input type="url" value={seo.og_image}
                  onChange={e => setSeo(p => ({ ...p, og_image: e.target.value }))}
                  className="admin-input w-full" placeholder="https://..." />
              </div>
              {/* Preview */}
              <div className="rounded-xl bg-gray-100 dark:bg-neutral-800/50 p-4 border border-gray-200 dark:border-white/5">
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Google Preview</p>
                <p className="text-blue-400 text-sm">{seo.meta_title}</p>
                <p className="text-green-600 text-[10px]">https://refinedbeautyhub.com</p>
                <p className="text-gray-600 dark:text-neutral-300 text-xs mt-1 leading-relaxed">{seo.meta_description}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <button onClick={handleSave} disabled={isPending}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20 text-sm font-medium transition-colors disabled:opacity-50">
        {isPending
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Save className="w-4 h-4" />
        }
        {isPending ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
