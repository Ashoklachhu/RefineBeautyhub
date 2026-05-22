import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/constants'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Terms and conditions governing your use of Refined Beauty Hub's services, website, and academy programs.`,
}

const LAST_UPDATED = 'January 1, 2025'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    items: [
      'By accessing our website or using any of our services — including salon appointments, shop purchases, or academy enrollments — you agree to be bound by these Terms of Service.',
      'If you do not agree with any part of these terms, please refrain from using our services.',
    ],
  },
  {
    title: '2. Appointments & Bookings',
    items: [
      'Appointments can be made online, by phone, or in person. A booking confirmation will be sent to your provided contact details.',
      'We require at least 24 hours notice for cancellations or rescheduling. Late cancellations may incur a cancellation fee.',
      'No-shows without prior notice may result in a deposit requirement for future bookings.',
      'We reserve the right to refuse service at our discretion.',
      'Pricing displayed on the website is indicative. Final pricing may vary based on hair length, complexity, and product requirements — always discussed before services begin.',
    ],
  },
  {
    title: '3. Shop & Product Orders',
    items: [
      'All product orders placed through our website or in-store are subject to product availability.',
      'Prices are listed in Nepalese Rupees (NPR) and are inclusive of applicable taxes.',
      'Once an order is confirmed, cancellations are at the discretion of Refined Beauty Hub.',
      'Products are subject to our return and exchange policy, available in-store or upon request.',
      'We are not responsible for any delays caused by third-party delivery services.',
    ],
  },
  {
    title: '4. Academy Enrollments',
    items: [
      'Enrollment in any academy course is confirmed only upon receipt of the required fees or deposit.',
      'Course fees are generally non-refundable after the commencement of the program unless otherwise stated in writing.',
      'Refined Beauty Hub reserves the right to modify course content, schedules, or instructors as necessary.',
      'Students are expected to maintain professional conduct throughout the duration of the course.',
      'Certificates are issued upon successful completion of all required modules and assessments.',
    ],
  },
  {
    title: '5. Intellectual Property',
    items: [
      'All content on this website — including text, images, graphics, logos, and course materials — is the property of Refined Beauty Hub and is protected by copyright law.',
      'You may not reproduce, distribute, or use our content for commercial purposes without prior written consent.',
    ],
  },
  {
    title: '6. User Conduct',
    items: [
      'You agree to use our website and services only for lawful purposes.',
      'You must not post or transmit any content that is unlawful, harmful, threatening, abusive, or otherwise objectionable.',
      'You must not attempt to gain unauthorized access to any part of our website or systems.',
    ],
  },
  {
    title: '7. Limitation of Liability',
    items: [
      'Refined Beauty Hub is not liable for any indirect, incidental, special, or consequential damages arising from the use of our services or website.',
      'We do not guarantee that our website will be error-free or uninterrupted at all times.',
      'Individual results from beauty services may vary. We make no specific claims regarding outcomes.',
    ],
  },
  {
    title: '8. Health & Safety',
    items: [
      'Clients are responsible for disclosing any known allergies, skin conditions, or medical concerns prior to treatment.',
      'Refined Beauty Hub follows strict hygiene and safety protocols. We reserve the right to decline a service if we believe it may be harmful to the client or staff.',
      'Patch tests may be required for certain chemical treatments. Clients who refuse a required patch test do so at their own risk.',
    ],
  },
  {
    title: '9. Photography & Media',
    items: [
      'We may photograph or record services for portfolio and marketing purposes. Clients who do not wish to be photographed must notify staff before their appointment.',
      'By consenting to photography, you grant Refined Beauty Hub a non-exclusive license to use images on our website and social media.',
    ],
  },
  {
    title: '10. Governing Law',
    items: [
      'These Terms of Service are governed by and construed in accordance with the laws of Nepal.',
      'Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal.',
    ],
  },
  {
    title: '11. Changes to These Terms',
    items: [
      'We reserve the right to update these Terms of Service at any time. Changes take effect upon posting to this page.',
      'Your continued use of our services after changes constitutes acceptance of the revised terms.',
    ],
  },
  {
    title: '12. Contact',
    items: ['For any questions about these Terms, please contact us:'],
    contact: true,
  },
]

export default function TermsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mb-4">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-white/50 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Thin gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6">

          {/* Intro */}
          <div className="mb-12 p-6 rounded-2xl bg-neutral-50 border border-neutral-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Please read these Terms of Service carefully before using the <strong>Refined Beauty Hub</strong> website
              or any of our salon, retail, or academy services. These terms outline your rights and responsibilities
              as a client and user of our platform.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                {section.contact && (
                  <div className="mt-4 p-5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5 text-sm text-gray-600">
                    <p><strong className="text-gray-900">Refined Beauty Hub</strong></p>
                    <p>{SITE.address}</p>
                    <p>
                      Email:{' '}
                      <a href={`mailto:${SITE.email}`} className="text-amber-600 hover:text-amber-700">
                        {SITE.email}
                      </a>
                    </p>
                    <p>
                      Phone:{' '}
                      <a href={`tel:${SITE.phone}`} className="text-amber-600 hover:text-amber-700">
                        {SITE.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer nav */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/privacy"  className="hover:text-amber-600 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/sitemap"  className="hover:text-amber-600 transition-colors">Sitemap</Link>
            <span>·</span>
            <Link href="/"         className="hover:text-amber-600 transition-colors">← Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
