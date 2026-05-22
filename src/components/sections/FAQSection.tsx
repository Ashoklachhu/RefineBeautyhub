'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Plus, Minus, ArrowRight } from 'lucide-react'

const FAQS = [
  {
    question: 'How do I book an appointment at Refined Beauty Hub?',
    answer: 'You can book online through our website 24/7, call us directly at our salon number, or message us on WhatsApp. We recommend booking at least 3–5 days in advance for popular services, and 2–4 weeks ahead for bridal packages.',
  },
  {
    question: 'Do I need a consultation before my first visit?',
    answer: 'We offer complimentary consultations for all new clients. This allows our specialists to understand your hair type, skin concerns, or desired look before recommending the most suitable treatment.',
  },
  {
    question: 'What products do you use in your treatments?',
    answer: 'We partner exclusively with premium international brands — including Olaplex, Redken, Dermalogica, OPI, and MAC Cosmetics. All products are dermatologically tested and safe for all skin and hair types.',
  },
  {
    question: 'What is your cancellation and rescheduling policy?',
    answer: "We request at least 24 hours' notice for cancellations or rescheduling. Cancellations within 24 hours may incur a 20% service fee. We understand life happens — please contact us as early as possible.",
  },
  {
    question: 'How do I enrol in the Beauty Academy?',
    answer: 'Visit our Academy page to explore available courses and intake dates. You can apply online or visit the salon to speak with our academy coordinator. A registration deposit is required to secure your seat.',
  },
  {
    question: 'Do you offer bridal packages and group bookings?',
    answer: 'Yes! We offer complete bridal packages including pre-wedding trials, day-of bridal makeup and hair, and full bridal party services. Contact us directly to discuss your bridal requirements.',
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-20 lg:py-28" style={{ background: '#F9F5F0' }}>
      <div className="luxury-container">
        <div className="grid lg:grid-cols-[340px_1fr] gap-16 items-start">

          {/* Left — sticky header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7 }}
            className="lg:sticky lg:top-32"
          >
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#b8976b' }}>
              FAQ
            </p>
            <h2 className="text-4xl lg:text-5xl font-light leading-[1.1] mb-5"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#1a1410' }}>
              Questions &amp;<br />
              <em style={{ color: '#b8976b' }}>Answers</em>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#7a6a5e' }}>
              Everything you need to know about our salon, academy, and services.
              Can&apos;t find your answer? Contact us directly.
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-xs font-semibold
                         tracking-[0.15em] uppercase border rounded-sm transition-all group"
              style={{ borderColor: '#1a1410', color: '#1a1410' }}>
              Contact Us
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Right — accordion */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-0 divide-y"
            style={{ borderColor: '#e8ddd4' }}
          >
            {FAQS.map((faq, i) => (
              <div key={i} className="border-y" style={{ borderColor: '#e8ddd4' }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-5 text-left transition-colors"
                  style={{ color: open === i ? '#b8976b' : '#1a1410' }}
                >
                  <span className="text-sm font-medium leading-snug pr-4">{faq.question}</span>
                  <span className="flex-shrink-0 mt-0.5">
                    {open === i
                      ? <Minus className="w-4 h-4" style={{ color: '#b8976b' }} />
                      : <Plus className="w-4 h-4" style={{ color: '#9a8070' }} />}
                  </span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm leading-relaxed pb-5" style={{ color: '#7a6a5e' }}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
