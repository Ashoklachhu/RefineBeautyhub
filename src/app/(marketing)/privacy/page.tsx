import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/constants'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How Refined Beauty Hub collects, uses, and protects your personal information.`,
}

const LAST_UPDATED = 'January 1, 2025'

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: [
      'We collect information you provide directly — such as your name, email address, phone number, and any preferences shared when booking an appointment, enrolling in a course, or contacting us.',
      'When you use our website, we may automatically collect certain technical data including your IP address, browser type, pages visited, and the date and time of your visit through cookies and similar technologies.',
      'If you create an account, we store your profile information including your booking history and any preferences you save.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    body: [
      'To confirm and manage your appointments, enrollments, and shop orders.',
      'To send you appointment reminders, booking confirmations, and relevant service updates.',
      'To respond to your inquiries and provide customer support.',
      'To improve our website, services, and overall client experience.',
      'To send promotional communications — only with your consent, and you can opt out at any time.',
      'To comply with legal obligations where required.',
    ],
  },
  {
    title: '3. Sharing of Information',
    body: [
      'We do not sell, rent, or trade your personal information to third parties.',
      'We may share your information with trusted service providers who assist in operating our website and services (e.g., appointment management tools, email platforms) — always under strict confidentiality agreements.',
      'We may disclose information if required by law or to protect the rights, safety, or property of Refined Beauty Hub or our clients.',
    ],
  },
  {
    title: '4. Cookies',
    body: [
      'Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic.',
      'You can control or disable cookies through your browser settings. Note that disabling cookies may affect some functionality of the site.',
    ],
  },
  {
    title: '5. Data Security',
    body: [
      'We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.',
      'While we strive to protect your information, no method of internet transmission is 100% secure. We cannot guarantee absolute security but take every reasonable precaution.',
    ],
  },
  {
    title: '6. Data Retention',
    body: [
      'We retain your personal information for as long as necessary to provide our services and comply with legal obligations.',
      'You may request deletion of your account and associated data at any time by contacting us at the address below.',
    ],
  },
  {
    title: '7. Your Rights',
    body: [
      'You have the right to access the personal information we hold about you.',
      'You may request correction of inaccurate data or deletion of your information.',
      'You may withdraw consent for marketing communications at any time.',
      'To exercise any of these rights, please contact us at ' + SITE.email + '.',
    ],
  },
  {
    title: '8. Third-Party Links',
    body: [
      'Our website may contain links to third-party sites. We are not responsible for the privacy practices of those sites and encourage you to review their policies.',
    ],
  },
  {
    title: '9. Children\'s Privacy',
    body: [
      'Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.',
    ],
  },
  {
    title: '10. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.',
    ],
  },
  {
    title: '11. Contact Us',
    body: [
      `If you have any questions or concerns about this Privacy Policy, please contact us:`,
    ],
    contact: true,
  },
]

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mb-4">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-white/50 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Thin gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6">

          {/* Intro */}
          <div className="mb-12 p-6 rounded-2xl bg-amber-50 border border-amber-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              At <strong>Refined Beauty Hub</strong>, your privacy matters deeply to us. This policy explains how we collect,
              use, and protect your personal information when you use our website, book appointments, purchase products,
              or enroll in our academy programs.
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
                  {section.body.map((para, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
                      {para}
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
            <Link href="/terms"   className="hover:text-amber-600 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link href="/sitemap" className="hover:text-amber-600 transition-colors">Sitemap</Link>
            <span>·</span>
            <Link href="/"        className="hover:text-amber-600 transition-colors">← Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
