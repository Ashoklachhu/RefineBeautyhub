import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllCourses } from '@/services/academy.service'
import { Clock, Users, Award, CheckCircle, ArrowRight, GraduationCap, Sparkles } from 'lucide-react'
import type { AcademyCourse, CourseLevel } from '@/types/database'

export const metadata: Metadata = {
  title: 'Beauty Academy — Refined Beauty Hub',
  description: 'Professional beauty courses and certifications at Refined Beauty Hub Academy, Kathmandu. Hair, makeup, skincare, and nail art training.',
}

export const revalidate = 3600

const levelLabel: Record<CourseLevel, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
  professional: 'Professional',
}

const levelColor: Record<CourseLevel, string> = {
  beginner:     'bg-green-50 text-green-700 border-green-200',
  intermediate: 'bg-blue-50 text-blue-700 border-blue-200',
  advanced:     'bg-purple-50 text-purple-700 border-purple-200',
  professional: 'bg-gold-50 text-gold-700 border-gold-200',
}

export default async function AcademyPage() {
  const result = await getAllCourses()
  const courses: AcademyCourse[] = result.data ?? []

  const stats = [
    { label: 'Students Trained', value: '1,200+' },
    { label: 'Certified Graduates', value: '950+' },
    { label: 'Expert Instructors', value: '8' },
    { label: 'Years of Excellence', value: '10+' },
  ]

  const whyUs = [
    'Industry-recognized certifications',
    'Hands-on practical training',
    'Small batch sizes (max 10)',
    'Modern, fully-equipped studio',
    'Job placement assistance',
    'Flexible payment options',
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-gold-500/6 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gold-400/4 blur-3xl" />

        <div className="luxury-container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
              <GraduationCap className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-xs font-medium tracking-[0.2em] text-gold-400 uppercase">Beauty Academy</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-[1.05]"
              style={{ fontFamily: 'var(--font-cormorant)' }}>
              Launch Your Career<br />
              <em className="not-italic font-medium" style={{ color: 'oklch(0.83 0.12 72)' }}>
                in Beauty
              </em>
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-xl mb-10">
              Professional beauty training designed for the real world. Learn from masters, earn certifications that matter, and build a career you love.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#courses"
                className="inline-flex items-center gap-2 px-7 py-3.5 gold-gradient text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                View Courses
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-colors">
                Talk to an Advisor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-nude-50/40 border-b border-border/50">
        <div className="luxury-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-light text-gold-600 mb-1"
                  style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="section-py">
        <div className="luxury-container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Professional Programs</span>
            </div>
            <h2 className="text-4xl font-light mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
              Our Courses
            </h2>
            <p className="text-muted-foreground text-sm">
              Structured programs for every level — from complete beginners to working professionals upgrading their skills.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Courses coming soon. Contact us to be notified.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link key={course.id} href={`/academy/${course.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="aspect-video bg-nude-100 relative overflow-hidden">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <GraduationCap className="w-10 h-10 text-nude-300" />
                        </div>
                      )}
                      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full border text-xs font-semibold ${levelColor[course.level]}`}>
                        {levelLabel[course.level]}
                      </div>
                      {course.has_certificate && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-500 text-white text-xs font-semibold">
                          <Award className="w-3 h-3" />
                          Certificate
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{course.category}</p>
                      <h3 className="text-xl font-medium mb-2 group-hover:text-gold-600 transition-colors"
                        style={{ fontFamily: 'var(--font-cormorant)' }}>
                        {course.title}
                      </h3>
                      {course.short_description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {course.short_description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration_text}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Max {course.max_students}</span>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div>
                          {course.discounted_price ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-baseline gap-1.5">
                                <p className="text-lg font-semibold">NPR {course.discounted_price.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground line-through">NPR {course.price.toLocaleString()}</p>
                              </div>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                                {Math.round((1 - course.discounted_price / course.price) * 100)}% OFF
                              </span>
                            </div>
                          ) : (
                            <p className="text-lg font-semibold">NPR {course.price.toLocaleString()}</p>
                          )}
                          {course.next_start_date && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Starts {new Date(course.next_start_date).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gold-600 text-sm font-medium group-hover:gap-2 transition-all">
                          <span>Enroll</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-py bg-charcoal-950 text-white">
        <div className="luxury-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium mb-6">
                <Award className="w-3.5 h-3.5" />
                Why Our Academy
              </div>
              <h2 className="text-4xl md:text-5xl font-light mb-6 leading-[1.1]"
                style={{ fontFamily: 'var(--font-cormorant)' }}>
                Training That Opens<br />
                <em className="not-italic font-medium" style={{ color: 'oklch(0.83 0.12 72)' }}>Doors</em>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                We don&apos;t just teach techniques — we build professionals. Our curriculum is designed with industry partners to ensure every graduate is salon-ready from day one.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {whyUs.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-square rounded-3xl bg-charcoal-800 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <GraduationCap className="w-24 h-24 text-gold-500/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-py">
        <div className="luxury-container text-center">
          <h2 className="text-4xl font-light mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Ready to Begin Your Journey?
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            Seats are limited. Secure your spot in our next batch today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#courses"
              className="inline-flex items-center gap-2 px-7 py-3.5 gold-gradient text-white rounded-full font-medium hover:opacity-90 transition-opacity">
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border text-foreground font-medium hover:bg-nude-50 transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
