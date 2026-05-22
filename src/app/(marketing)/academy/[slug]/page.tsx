import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCourseBySlug, getAllCourses } from '@/services/academy.service'
import { Clock, Users, Award, CheckCircle, ArrowRight, GraduationCap, BookOpen, Calendar } from 'lucide-react'
import type { CourseLevel, CourseFormat } from '@/types/database'
import { EnrollForm } from '@/components/forms/EnrollForm'

export const revalidate = 3600

export async function generateStaticParams() {
  const { createServiceClient } = await import('@/lib/supabase/server')
  const supabase = createServiceClient()
  const { data } = await supabase.from('academy_courses').select('slug').eq('is_active', true)
  return (data ?? []).map((c: { slug: string }) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = await getCourseBySlug(slug)
  if (!result.data) return { title: 'Course — Refined Beauty Hub Academy' }
  return {
    title: `${result.data.title} — Refined Beauty Hub Academy`,
    description: result.data.short_description ?? result.data.description ?? '',
  }
}

const levelLabel: Record<CourseLevel, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', professional: 'Professional',
}
const formatLabel: Record<CourseFormat, string> = {
  in_person: 'In-Person', online: 'Online', hybrid: 'Hybrid',
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getCourseBySlug(slug)
  if (!result.data) notFound()
  const course = result.data

  const spotsLeft = course.max_students - course.current_students

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-500/8 blur-3xl" />

        <div className="luxury-container relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/40 mb-8">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/academy" className="hover:text-white/70 transition-colors">Academy</Link>
            <span>/</span>
            <span className="text-white/70">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/20 text-gold-400 text-xs font-medium">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium">
                  {levelLabel[course.level]}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium">
                  {formatLabel[course.format]}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-white mb-4 leading-[1.1]"
                style={{ fontFamily: 'var(--font-cormorant)' }}>
                {course.title}
              </h1>
              {course.short_description && (
                <p className="text-white/60 text-sm leading-relaxed mb-6">{course.short_description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-gold-400" />
                    <span className="text-white/50 text-xs">Duration</span>
                  </div>
                  <p className="text-white text-sm font-medium">{course.duration_text}</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 text-gold-400" />
                    <span className="text-white/50 text-xs">Batch Size</span>
                  </div>
                  <p className="text-white text-sm font-medium">Max {course.max_students} students</p>
                </div>
                {course.next_start_date && (
                  <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-gold-400" />
                      <span className="text-white/50 text-xs">Next Batch</span>
                    </div>
                    <p className="text-white text-sm font-medium">
                      {new Date(course.next_start_date).toLocaleDateString('en-NP', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-gold-400" />
                    <span className="text-white/50 text-xs">Spots Left</span>
                  </div>
                  <p className={`text-sm font-medium ${spotsLeft <= 3 ? 'text-red-400' : 'text-white'}`}>
                    {spotsLeft > 0 ? `${spotsLeft} of ${course.max_students}` : 'Fully Booked'}
                  </p>
                </div>
              </div>

              {course.instructor_name && (
                <p className="text-white/50 text-sm">
                  Instructor: <span className="text-white/80 font-medium">{course.instructor_name}</span>
                </p>
              )}
            </div>

            {/* Image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-800">
              {course.image_url ? (
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <GraduationCap className="w-16 h-16 text-gold-500/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content + Enrollment sidebar */}
      <section className="section-py">
        <div className="luxury-container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About */}
              {course.description && (
                <div>
                  <h2 className="text-2xl font-medium mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    About This Course
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{course.description}</p>
                </div>
              )}

              {/* What's Included */}
              {course.includes && course.includes.length > 0 && (
                <div>
                  <h2 className="text-2xl font-medium mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    What&apos;s Included
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {course.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Syllabus */}
              {course.syllabus && course.syllabus.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-gold-500" />
                    <h2 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      Course Curriculum
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {course.syllabus.map((mod) => (
                      <div key={mod.module} className="rounded-xl border border-border p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Module {mod.module}</span>
                            <h3 className="text-base font-medium mt-0.5">{mod.title}</h3>
                          </div>
                          <span className="text-xs text-muted-foreground bg-nude-100 px-2.5 py-1 rounded-full flex-shrink-0 ml-4">
                            {mod.duration}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {mod.topics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-2 flex-shrink-0" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price + CTA card */}
              <div className="rounded-2xl border border-border p-6 bg-card sticky top-28">
                <div className="text-center mb-6">
                  {course.discounted_price ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
                        NPR {course.discounted_price.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-sm text-muted-foreground line-through">
                          NPR {course.price.toLocaleString()}
                        </p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                          {Math.round((1 - course.discounted_price / course.price) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-3xl font-light" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      NPR {course.price.toLocaleString()}
                    </p>
                  )}
                  {course.has_certificate && (
                    <div className="flex items-center justify-center gap-1.5 mt-2 text-gold-600 text-xs font-medium">
                      <Award className="w-3.5 h-3.5" />
                      Certificate included
                    </div>
                  )}
                </div>

                <dl className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Level</dt>
                    <dd className="font-medium">{levelLabel[course.level]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Format</dt>
                    <dd className="font-medium">{formatLabel[course.format]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium">{course.duration_text}</dd>
                  </div>
                  {spotsLeft > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Spots Left</dt>
                      <dd className={`font-medium ${spotsLeft <= 3 ? 'text-red-500' : ''}`}>{spotsLeft}</dd>
                    </div>
                  )}
                </dl>

                <div className="gold-divider mb-6" />

                {spotsLeft > 0 ? (
                  <EnrollForm courseId={course.id} />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">This batch is full</p>
                    <Link href="/contact"
                      className="flex items-center justify-center gap-2 w-full py-3 border border-border rounded-xl text-sm font-medium hover:bg-nude-50 transition-colors">
                      Join Waitlist
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
