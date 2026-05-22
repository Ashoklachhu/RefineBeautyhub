'use client'

import { useState, useTransition } from 'react'
import { Send, CheckCircle, Loader2 } from 'lucide-react'
import { submitContactAction } from '@/app/actions/contact'

const SUBJECTS = [
  'General Enquiry',
  'Book an Appointment',
  'Bridal Package',
  'Academy / Courses',
  'Group Booking',
  'Partnership',
  'Other',
]

export function ContactForm() {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: SUBJECTS[0], message: '',
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await submitContactAction(form)
      if (res.success) {
        setSubmitted(true)
      } else {
        setError(res.message)
      }
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-8 h-full min-h-[400px]">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: '#f0ebe4', border: '2px solid #b8976b' }}>
          <CheckCircle className="w-8 h-8" style={{ color: '#b8976b' }} />
        </div>
        <h3 className="text-2xl font-light mb-3" style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
          Message Sent
        </h3>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#7a6a5e' }}>
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name:'', email:'', phone:'', subject: SUBJECTS[0], message:'' }) }}
          className="mt-8 text-xs font-semibold tracking-[0.15em] uppercase underline underline-offset-4 transition-opacity hover:opacity-60"
          style={{ color: '#b8976b' }}>
          Send another message
        </button>
      </div>
    )
  }

  const inputClass = `w-full px-4 py-3 text-sm border rounded-sm outline-none transition-all`
  const inputStyle = { borderColor: '#e8ddd4', background: '#fdfaf7', color: '#1a1410' }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#9a8070' }}>
            Full Name <span style={{ color: '#b8976b' }}>*</span>
          </label>
          <input
            value={form.name} onChange={set('name')} required
            placeholder="Your name"
            className={inputClass} style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
            onBlur={e  => (e.currentTarget.style.borderColor = '#e8ddd4')}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#9a8070' }}>
            Email <span style={{ color: '#b8976b' }}>*</span>
          </label>
          <input
            type="email" value={form.email} onChange={set('email')} required
            placeholder="hello@email.com"
            className={inputClass} style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
            onBlur={e  => (e.currentTarget.style.borderColor = '#e8ddd4')}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#9a8070' }}>
            Phone <span className="text-[10px] font-normal" style={{ color: '#b0a090' }}>(optional)</span>
          </label>
          <input
            type="tel" value={form.phone} onChange={set('phone')}
            placeholder="+977 98XXXXXXXX"
            className={inputClass} style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
            onBlur={e  => (e.currentTarget.style.borderColor = '#e8ddd4')}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#9a8070' }}>
            Subject <span style={{ color: '#b8976b' }}>*</span>
          </label>
          <select
            value={form.subject} onChange={set('subject')}
            className={inputClass} style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
            onBlur={e  => (e.currentTarget.style.borderColor = '#e8ddd4')}
          >
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#9a8070' }}>
          Message <span style={{ color: '#b8976b' }}>*</span>
        </label>
        <textarea
          rows={5} value={form.message} onChange={set('message')} required
          placeholder="Tell us how we can help you…"
          className={`${inputClass} resize-none`} style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = '#b8976b')}
          onBlur={e  => (e.currentTarget.style.borderColor = '#e8ddd4')}
        />
      </div>

      {error && (
        <p className="text-xs py-2 px-3 rounded-sm" style={{ background: '#fff0f0', color: '#c0392b' }}>
          {error}
        </p>
      )}

      <button
        type="submit" disabled={isPending}
        className="inline-flex items-center gap-2.5 px-8 py-4 text-xs font-semibold tracking-[0.15em] uppercase rounded-sm transition-all w-full justify-center"
        style={{ background: '#1a1410', color: '#fff' }}
        onMouseEnter={e => { if (!isPending) e.currentTarget.style.background = '#2d2419' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#1a1410' }}
      >
        {isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
          : <><Send className="w-3.5 h-3.5" /> Send Message</>}
      </button>
    </form>
  )
}
