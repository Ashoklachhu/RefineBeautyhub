import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Home, Scissors, ShoppingBag, GraduationCap,
  CalendarCheck, User, Lock, Sparkles, ExternalLink,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'A complete overview of all pages on the Refined Beauty Hub website.',
}

interface SitemapLink {
  label: string
  href:  string
  desc:  string
}

function SitemapCard({
  title,
  links,
  cardCls,
  iconContainerCls,
  iconCls,
  icon: Icon,
}: {
  title:            string
  links:            SitemapLink[]
  cardCls:          string
  iconContainerCls: string
  iconCls:          string
  icon:             React.ElementType
}) {
  return (
    <div className={`rounded-2xl border p-6 ${cardCls}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 bg-white ${iconContainerCls}`}>
          <Icon className={`w-4 h-4 ${iconCls}`} />
        </div>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      </div>

      {/* Links */}
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-start gap-2 py-1.5 rounded-lg px-2 -mx-2 hover:bg-white/70 transition-colors"
            >
              <ExternalLink className={`w-3 h-3 mt-0.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity ${iconCls}`} />
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  {link.label}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{link.desc}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SitemapPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-neutral-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gold-400 mb-4">Navigation</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Sitemap</h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            A complete directory of every page on the Refined Beauty Hub website.
          </p>
        </div>
      </section>

      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* Grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Main Pages */}
            <SitemapCard
              title="Main Pages"
              icon={Home}
              cardCls="bg-amber-50 border-amber-200"
              iconContainerCls="border-amber-200"
              iconCls="text-amber-500"
              links={[
                { label: 'Home',     href: '/',         desc: 'Welcome to Refined Beauty Hub'     },
                { label: 'About Us', href: '/about',    desc: 'Our story, team, and values'       },
                { label: 'Services', href: '/services', desc: 'All beauty services we offer'      },
                { label: 'Shop',     href: '/shop',     desc: 'The Refined Edit — curated products' },
                { label: 'Academy',  href: '/academy',  desc: 'Professional beauty education'     },
                { label: 'Contact',  href: '/contact',  desc: 'Get in touch with us'              },
              ]}
            />

            {/* Services */}
            <SitemapCard
              title="Services"
              icon={Scissors}
              cardCls="bg-rose-50 border-rose-200"
              iconContainerCls="border-rose-200"
              iconCls="text-rose-500"
              links={[
                { label: 'Hair Services',   href: '/services#hair',   desc: 'Cuts, colour, treatments'        },
                { label: 'Skin & Facials',  href: '/services#skin',   desc: 'Facials, peels, glow treatments' },
                { label: 'Nails',           href: '/services#nails',  desc: 'Manicure, pedicure, nail art'    },
                { label: 'Makeup',          href: '/services#makeup', desc: 'Glam, editorial, everyday looks' },
                { label: 'Lash Extensions', href: '/services#lashes', desc: 'Classic, hybrid, volume lashes'  },
                { label: 'Brow Styling',    href: '/services#brows',  desc: 'Shaping, tinting, lamination'    },
                { label: 'Body Care',       href: '/services#body',   desc: 'Wraps, scrubs, massage'          },
                { label: 'Bridal Packages', href: '/services#bridal', desc: 'Full bridal beauty packages'     },
              ]}
            />

            {/* Shop */}
            <SitemapCard
              title="Shop"
              icon={ShoppingBag}
              cardCls="bg-violet-50 border-violet-200"
              iconContainerCls="border-violet-200"
              iconCls="text-violet-500"
              links={[
                { label: 'All Products',  href: '/shop',                    desc: 'Browse the full collection'       },
                { label: 'Hair Care',     href: '/shop?category=hair',      desc: 'Shampoos, masks, styling'         },
                { label: 'Skin Care',     href: '/shop?category=skin',      desc: 'Serums, moisturisers, SPF'        },
                { label: 'Body Care',     href: '/shop?category=body',      desc: 'Oils, scrubs, lotions'            },
                { label: 'Nail Products', href: '/shop?category=nails',     desc: 'Polish, top coats, tools'         },
                { label: 'Fragrance',     href: '/shop?category=fragrance', desc: 'Luxury scents'                    },
                { label: 'Tools',         href: '/shop?category=tools',     desc: 'Professional tools & devices'     },
              ]}
            />

            {/* Academy */}
            <SitemapCard
              title="Academy"
              icon={GraduationCap}
              cardCls="bg-blue-50 border-blue-200"
              iconContainerCls="border-blue-200"
              iconCls="text-blue-500"
              links={[
                { label: 'All Courses',           href: '/academy',          desc: 'View all beauty programs'     },
                { label: 'Hair Artistry',         href: '/academy#hair',     desc: 'Cutting, colouring, styling'  },
                { label: 'Makeup Mastery',        href: '/academy#makeup',   desc: 'Pro makeup artistry course'   },
                { label: 'Nail Technician',       href: '/academy#nails',    desc: 'Complete nail tech program'   },
                { label: 'Skincare Professional', href: '/academy#skincare', desc: 'Facials and skin science'     },
                { label: 'Enroll Now',            href: '/academy#enroll',   desc: 'Start your beauty career'     },
              ]}
            />

            {/* Booking & Account */}
            <SitemapCard
              title="Booking & Account"
              icon={CalendarCheck}
              cardCls="bg-emerald-50 border-emerald-200"
              iconContainerCls="border-emerald-200"
              iconCls="text-emerald-500"
              links={[
                { label: 'Book Appointment',  href: '/booking',          desc: 'Reserve your slot online'     },
                { label: 'Sign In',           href: '/login',            desc: 'Log in to your account'       },
                { label: 'Create Account',    href: '/register',         desc: 'Join Refined Beauty Hub'      },
                { label: 'Forgot Password',   href: '/forgot-password',  desc: 'Reset your password'          },
                { label: 'My Profile',        href: '/profile',          desc: 'Your bookings and account'    },
              ]}
            />

            {/* Legal */}
            <SitemapCard
              title="Legal & Info"
              icon={Lock}
              cardCls="bg-gray-50 border-gray-200"
              iconContainerCls="border-gray-200"
              iconCls="text-gray-500"
              links={[
                { label: 'Privacy Policy',   href: '/privacy',  desc: 'How we handle your data'   },
                { label: 'Terms of Service', href: '/terms',    desc: 'Our terms and conditions'  },
                { label: 'Sitemap',          href: '/sitemap',  desc: 'You are here'              },
              ]}
            />

          </div>

          {/* CTA */}
          <div className="mt-16 text-center p-10 rounded-3xl bg-neutral-950 border border-white/5">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready for Your Glow-Up?</h3>
            <p className="text-white/50 text-sm mb-6">Book your appointment or explore our services today.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/booking"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Book Appointment
              </Link>
              <Link
                href="/services"
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl border border-white/10 transition-colors"
              >
                Our Services
              </Link>
            </div>
          </div>

          {/* Bottom links */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-amber-600 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms"   className="hover:text-amber-600 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link href="/"        className="hover:text-amber-600 transition-colors">← Back to Home</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
