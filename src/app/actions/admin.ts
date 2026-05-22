'use server'

import { createServiceClient } from '@/lib/supabase/server'
import {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingCompleted,
} from '@/services/whatsapp.service'
import { BRANCHES } from '@/constants'
import type {
  Booking, BookingStatus, BookingSource, Service, AcademyCourse,
  Staff, GalleryItem, Testimonial, Profile, Category,
  Enrollment, EnrollmentStatus, SiteSettings, AnnouncementBar,
  ContactInquiry, InquiryNote, InquiryStatus, InquiryPriority, NoteType,
} from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────
function db() { return createServiceClient() }

// ── Dashboard Stats ───────────────────────────────────────────

export async function getAdminStats() {
  const supabase = db()
  const now = new Date()

  // Run all queries — use allSettled so one failure doesn't crash the dashboard
  const [bookingsRes, usersRes, inquiriesRes, revenueRes, recentRes, enrollmentsRes] = await Promise.allSettled([
    supabase.from('bookings').select('id, status, total_amount, booking_date, created_at', { count: 'exact' }),
    supabase.from('profiles').select('id, created_at', { count: 'exact' }),
    supabase.from('contact_inquiries').select('id, status', { count: 'exact' }),
    supabase.from('bookings').select('total_amount, created_at').eq('status', 'completed'),
    supabase
      .from('bookings')
      .select('id, reference, guest_name, booking_date, total_amount, status, service:services!service_id(name), staff:staff!staff_id(name), profile:profiles!user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('enrollments').select('id, status', { count: 'exact' }),
  ])

  const allBookings      = bookingsRes.status    === 'fulfilled' ? (bookingsRes.value.data    ?? []) : []
  const bookingsCount    = bookingsRes.status    === 'fulfilled' ? (bookingsRes.value.count   ?? 0) : 0
  const usersCount       = usersRes.status       === 'fulfilled' ? (usersRes.value.count      ?? 0) : 0
  const inquiryData      = inquiriesRes.status   === 'fulfilled' ? (inquiriesRes.value.data   ?? []) : []
  const completedRev     = revenueRes.status     === 'fulfilled' ? (revenueRes.value.data     ?? []) : []
  const recentBookings   = recentRes.status      === 'fulfilled' ? (recentRes.value.data      ?? []) : []
  const enrollmentCount  = enrollmentsRes.status === 'fulfilled' ? (enrollmentsRes.value.count ?? 0) : 0
  const pendingEnroll    = enrollmentsRes.status === 'fulfilled'
    ? (enrollmentsRes.value.data ?? []).filter((e: { status: string }) => e.status === 'pending').length
    : 0

  const totalRevenue  = completedRev.reduce((s, b) => s + (Number(b.total_amount) ?? 0), 0)
  const pendingCount  = allBookings.filter((b: { status: string }) => b.status === 'pending').length
  const confirmedCount = allBookings.filter((b: { status: string }) => b.status === 'confirmed').length
  const newInquiries  = (inquiryData as { status: string }[]).filter(i => i.status === 'new').length

  const statusCounts = {
    pending:   pendingCount,
    confirmed: confirmedCount,
    completed: allBookings.filter((b: { status: string }) => b.status === 'completed').length,
    cancelled: allBookings.filter((b: { status: string }) => b.status === 'cancelled').length,
  }

  // Revenue last 6 months
  const monthlyRevenue: { month: string; revenue: number; bookings: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    const monthBookings = allBookings.filter((b: { created_at?: string }) => b.created_at?.startsWith(key))
    const rev = completedRev.filter((b: { created_at?: string }) => b.created_at?.startsWith(key))
      .reduce((s: number, b: { total_amount: number }) => s + (Number(b.total_amount) || 0), 0)
    monthlyRevenue.push({ month: label, revenue: rev, bookings: monthBookings.length })
  }

  return {
    totalBookings:    bookingsCount,
    totalRevenue,
    totalUsers:       usersCount,
    newInquiries,
    pendingBookings:  pendingCount,
    totalEnrollments: enrollmentCount,
    pendingEnrollments: pendingEnroll,
    statusCounts,
    monthlyRevenue,
    recentBookings,
  }
}

// ── Bookings ──────────────────────────────────────────────────

export async function adminGetBookings(filters: {
  status?: string; search?: string; page?: number; pageSize?: number; branch?: string
} = {}) {
  const supabase = db()
  const page = filters.page ?? 1
  const size = filters.pageSize ?? 20
  const from = (page - 1) * size

  let q = supabase
    .from('bookings')
    .select('*, service:services!service_id(name, duration_minutes), staff:staff!staff_id(name), profile:profiles!user_id(full_name, email, phone, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + size - 1)

  if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status)
  if (filters.branch) q = q.eq('branch', filters.branch)

  const { data, count, error } = await q
  return { bookings: (data ?? []) as Booking[], count: count ?? 0, error }
}

export async function adminUpdateBookingStatus(
  id: string, status: BookingStatus
): Promise<{ error?: string }> {
  // 1. Apply the status update
  const updates: Record<string, unknown> = { status }
  if (status === 'confirmed') updates.confirmed_at = new Date().toISOString()
  if (status === 'completed') updates.completed_at = new Date().toISOString()
  if (status === 'cancelled') updates.cancelled_at = new Date().toISOString()

  const { error } = await db().from('bookings').update(updates).eq('id', id)
  if (error) return { error: error.message }

  // 2. Fire WhatsApp notification for statuses the client cares about.
  //    Fetch full booking details (fire-and-forget — never blocks the response).
  if (status === 'confirmed' || status === 'cancelled' || status === 'completed') {
    ;(async () => {
      try {
        const { data: booking } = await db()
          .from('bookings')
          .select(`
            *,
            service:services!service_id(name, duration_minutes),
            staff:staff!staff_id(name),
            profile:profiles!user_id(full_name, phone)
          `)
          .eq('id', id)
          .single()

        if (!booking) return

        // Resolve phone — prefer guest_phone, fall back to profile phone
        const phone = (booking.guest_phone ?? (booking as { profile?: { phone?: string | null } }).profile?.phone) ?? null
        if (!phone) return

        const clientName  = (booking as { profile?: { full_name?: string } }).profile?.full_name ?? booking.guest_name ?? 'Valued Client'
        const svc         = (booking as { service?: { name: string; duration_minutes: number } }).service
        const staffMember = (booking as { staff?: { name: string } }).staff
        const branch      = BRANCHES.find(b => b.id === booking.branch)

        if (status === 'confirmed' && svc) {
          sendBookingConfirmation({
            clientName,
            phone,
            reference:       booking.reference,
            serviceName:     svc.name,
            durationMinutes: svc.duration_minutes,
            staffName:       staffMember?.name,
            bookingDate:     booking.booking_date,
            startTime:       booking.start_time,
            endTime:         booking.end_time,
            totalAmount:     Number(booking.total_amount),
            status:          'confirmed',
            branchName:      branch?.name,
            branchAddress:   branch?.address,
          }).catch(err => console.error('[WhatsApp] Confirmation error:', err))
        }

        if (status === 'cancelled' && svc) {
          sendBookingCancellation({
            clientName,
            phone,
            reference:   booking.reference,
            serviceName: svc.name,
            bookingDate: booking.booking_date,
            startTime:   booking.start_time,
          }).catch(err => console.error('[WhatsApp] Cancellation error:', err))
        }

        if (status === 'completed' && svc) {
          sendBookingCompleted({
            clientName,
            phone,
            reference:   booking.reference,
            serviceName: svc.name,
          }).catch(err => console.error('[WhatsApp] Completed error:', err))
        }
      } catch (err) {
        console.error('[WhatsApp] Failed to fetch booking for notification:', err)
      }
    })()
  }

  return {}
}

// ── Services ──────────────────────────────────────────────────

export async function adminGetServices() {
  const { data, error } = await db()
    .from('services')
    .select('*, category:categories(name)')
    .order('display_order')
  return { services: (data ?? []) as Service[], error }
}

export async function adminGetCategories() {
  const { data } = await db().from('categories').select('*').order('display_order')
  return (data ?? []) as Category[]
}

export async function adminCreateService(values: {
  category_id: string; name: string; slug: string; description?: string
  short_description?: string; duration_minutes: number; price: number
  price_max?: number; image_url?: string; is_featured?: boolean
  is_popular?: boolean; display_order?: number; benefits?: string[]
}): Promise<{ id?: string; error?: string }> {
  const { data, error } = await db()
    .from('services')
    .insert({ ...values, is_active: true, benefits: values.benefits ?? [] })
    .select('id').single()
  return { id: data?.id, error: error?.message }
}

export async function adminUpdateService(
  id: string,
  values: Partial<Service>
): Promise<{ error?: string }> {
  const { error } = await db().from('services').update(values).eq('id', id)
  return { error: error?.message }
}

export async function adminDeleteService(id: string): Promise<{ error?: string }> {
  const { error } = await db().from('services').update({ is_active: false }).eq('id', id)
  return { error: error?.message }
}

export async function adminGetServiceById(id: string) {
  const { data } = await db().from('services').select('*').eq('id', id).single()
  return data as Service | null
}

// ── Courses ───────────────────────────────────────────────────

export async function adminGetCourses() {
  const { data, error } = await db()
    .from('academy_courses')
    .select('*')
    .order('display_order')
  return { courses: (data ?? []) as AcademyCourse[], error }
}

export async function adminCreateCourse(values: {
  title: string; slug: string; category: string; level: string; format: string
  description?: string; short_description?: string; duration_text: string
  price: number; max_students: number; image_url?: string
  instructor_name?: string; has_certificate?: boolean; is_featured?: boolean
  next_start_date?: string; display_order?: number; includes?: string[]
}): Promise<{ id?: string; error?: string }> {
  const { data, error } = await db()
    .from('academy_courses')
    .insert({ ...values, is_active: true, current_students: 0, syllabus: [], includes: values.includes ?? [] })
    .select('id').single()
  return { id: data?.id, error: error?.message }
}

export async function adminUpdateCourse(
  id: string,
  values: Partial<AcademyCourse>
): Promise<{ error?: string }> {
  const { error } = await db().from('academy_courses').update(values).eq('id', id)
  return { error: error?.message }
}

export async function adminDeleteCourse(id: string): Promise<{ error?: string }> {
  const { error } = await db().from('academy_courses').update({ is_active: false }).eq('id', id)
  return { error: error?.message }
}

export async function adminGetCourseById(id: string) {
  const { data } = await db().from('academy_courses').select('*').eq('id', id).single()
  return data as AcademyCourse | null
}

// ── Staff ─────────────────────────────────────────────────────

export async function adminGetStaff() {
  const { data, error } = await db().from('staff').select('*').order('display_order')
  return { staff: (data ?? []) as Staff[], error }
}

export async function adminCreateStaff(values: {
  name: string; slug: string; role: string; bio?: string; avatar_url?: string
  experience_years?: number; specialties?: string[]; is_featured?: boolean; display_order?: number
}): Promise<{ id?: string; error?: string }> {
  const { data, error } = await db()
    .from('staff')
    .insert({ ...values, is_active: true, specialties: values.specialties ?? [], experience_years: values.experience_years ?? 0 })
    .select('id').single()
  return { id: data?.id, error: error?.message }
}

export async function adminUpdateStaff(
  id: string,
  values: Partial<Staff>
): Promise<{ error?: string }> {
  const { error } = await db().from('staff').update(values).eq('id', id)
  return { error: error?.message }
}

export async function adminDeleteStaff(id: string): Promise<{ error?: string }> {
  const { error } = await db().from('staff').update({ is_active: false }).eq('id', id)
  return { error: error?.message }
}

export async function adminGetStaffById(id: string) {
  const { data } = await db().from('staff').select('*').eq('id', id).single()
  return data as Staff | null
}

// ── Gallery ───────────────────────────────────────────────────

export async function adminGetGallery() {
  const { data } = await db()
    .from('gallery')
    .select('*')
    .order('display_order')
  return (data ?? []) as GalleryItem[]
}

export async function adminAddGalleryItem(values: {
  image_url: string; title?: string; alt_text?: string; is_featured?: boolean
}): Promise<{ error?: string }> {
  const { error } = await db()
    .from('gallery')
    .insert({ ...values, is_published: true, display_order: 999 })
  return { error: error?.message }
}

export async function adminDeleteGalleryItem(id: string): Promise<{ error?: string }> {
  const { error } = await db().from('gallery').delete().eq('id', id)
  return { error: error?.message }
}

export async function adminToggleGalleryFeatured(id: string, featured: boolean): Promise<{ error?: string }> {
  const { error } = await db().from('gallery').update({ is_featured: featured }).eq('id', id)
  return { error: error?.message }
}

// ── Testimonials ──────────────────────────────────────────────

export async function adminGetTestimonials() {
  const { data } = await db()
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Testimonial[]
}

export async function adminUpdateTestimonial(
  id: string,
  values: { is_published?: boolean; is_featured?: boolean }
): Promise<{ error?: string }> {
  const { error } = await db().from('testimonials').update(values).eq('id', id)
  return { error: error?.message }
}

export async function adminCreateTestimonial(values: {
  client_name: string; rating: number; review: string; service_label: string
  client_image_url?: string; is_verified?: boolean
}): Promise<{ error?: string }> {
  const { error } = await db()
    .from('testimonials')
    .insert({ ...values, is_published: false, is_featured: false })
  return { error: error?.message }
}

export async function adminDeleteTestimonial(id: string): Promise<{ error?: string }> {
  const { error } = await db().from('testimonials').delete().eq('id', id)
  return { error: error?.message }
}

// ── Users ─────────────────────────────────────────────────────

export async function adminGetUsers(page = 1, size = 20) {
  const from = (page - 1) * size
  const { data, count } = await db()
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + size - 1)
  return { users: (data ?? []) as Profile[], count: count ?? 0 }
}

export async function adminUpdateUserRole(
  id: string,
  role: 'client' | 'staff' | 'admin'
): Promise<{ error?: string }> {
  const { error } = await db().from('profiles').update({ role }).eq('id', id)
  return { error: error?.message }
}

export async function adminToggleUserActive(
  id: string,
  is_active: boolean
): Promise<{ error?: string }> {
  const { error } = await db().from('profiles').update({ is_active }).eq('id', id)
  return { error: error?.message }
}

export async function adminCreateUser(values: {
  full_name: string
  email:     string
  password:  string
  phone?:    string
  role?:     'client' | 'staff' | 'admin'
  notes?:    string
}): Promise<{ id?: string; error?: string }> {
  const supabase = db()

  // 1. Create the auth user — trigger auto-creates the profile row
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email:            values.email,
    password:         values.password,
    email_confirm:    true,          // skip verification, admin is creating this
    user_metadata:    { full_name: values.full_name },
  })

  if (authError) return { error: authError.message }
  const userId = authData.user.id

  // 2. Patch profile with extra fields the trigger can't set
  const patch: Record<string, unknown> = {}
  if (values.role  && values.role !== 'client') patch.role  = values.role
  if (values.phone) patch.phone = values.phone
  if (values.notes) patch.notes = values.notes

  if (Object.keys(patch).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
    if (profileError) return { id: userId, error: `User created but profile patch failed: ${profileError.message}` }
  }

  return { id: userId }
}

// ── Enrollments ───────────────────────────────────────────────

export async function adminGetEnrollments(filters: {
  status?: string; page?: number; pageSize?: number
} = {}) {
  const page = filters.page ?? 1
  const size = filters.pageSize ?? 20
  const from = (page - 1) * size

  let q = db()
    .from('enrollments')
    .select(
      '*, course:academy_courses!course_id(title, category, price, level, format, duration_text, image_url), profile:profiles!user_id(full_name, email, phone, avatar_url)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + size - 1)

  if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status)

  const { data, count, error } = await q
  return { enrollments: (data ?? []) as (Enrollment & {
    course: { title: string; category: string; price: number; level: string; format: string; duration_text: string; image_url: string | null } | null
    profile: { full_name: string; email: string; phone: string | null; avatar_url: string | null } | null
  })[], count: count ?? 0, error }
}

export async function adminUpdateEnrollmentStatus(
  id: string,
  status: EnrollmentStatus
): Promise<{ error?: string }> {
  const updates: Record<string, unknown> = { status }
  if (status === 'confirmed') updates.confirmed_at = new Date().toISOString()
  if (status === 'completed') updates.completed_at = new Date().toISOString()

  const { error } = await db().from('enrollments').update(updates).eq('id', id)
  return { error: error?.message }
}

export async function adminUpdateEnrollmentNotes(
  id: string,
  values: { notes?: string }
): Promise<{ error?: string }> {
  const { error } = await db().from('enrollments').update(values).eq('id', id)
  return { error: error?.message }
}

// ── Inquiries (mini-CRM) ──────────────────────────────────────

export async function adminGetInquiries(opts: {
  status?: string; priority?: string; page?: number; pageSize?: number
} = {}): Promise<{ inquiries: ContactInquiry[]; count: number }> {
  const { status = 'all', priority = 'all', page = 1, pageSize = 20 } = opts
  const from = (page - 1) * pageSize
  let q = db().from('contact_inquiries').select('*', { count: 'exact' })
  if (status !== 'all')   q = q.eq('status',   status)
  if (priority !== 'all') q = q.eq('priority', priority)
  const { data, count } = await q.order('created_at', { ascending: false }).range(from, from + pageSize - 1)
  return { inquiries: (data ?? []) as ContactInquiry[], count: count ?? 0 }
}

export async function adminGetInquiryDetail(id: string): Promise<{
  inquiry: ContactInquiry | null
  notes:   InquiryNote[]
}> {
  const [{ data: inquiry }, { data: notes }] = await Promise.all([
    db().from('contact_inquiries').select('*').eq('id', id).single(),
    db().from('inquiry_notes').select('*').eq('inquiry_id', id).order('created_at', { ascending: true }),
  ])
  return {
    inquiry: inquiry as ContactInquiry | null,
    notes:   (notes ?? []) as InquiryNote[],
  }
}

export async function adminUpdateInquiryStatus(
  id: string,
  status: InquiryStatus,
  priority?: InquiryPriority,
): Promise<{ error?: string }> {
  const update: Record<string, unknown> = { status }
  if (priority) update.priority = priority
  if (status === 'resolved') update.replied_at = new Date().toISOString()
  const { error } = await db().from('contact_inquiries').update(update).eq('id', id)
  return { error: error?.message }
}

export async function adminAddInquiryNote(
  inquiry_id: string,
  note: string,
  note_type: NoteType,
  admin_id: string,
): Promise<{ error?: string }> {
  const { error } = await db().from('inquiry_notes').insert({
    inquiry_id, note, note_type, created_by: admin_id,
  })
  // Auto-move to in_progress when first note is added on a 'new' inquiry
  await db()
    .from('contact_inquiries')
    .update({ status: 'in_progress' })
    .eq('id', inquiry_id)
    .eq('status', 'new')
  return { error: error?.message }
}

export async function adminDeleteInquiry(id: string): Promise<{ error?: string }> {
  const { error } = await db().from('contact_inquiries').delete().eq('id', id)
  return { error: error?.message }
}

// ── Announcement Bar ──────────────────────────────────────────

export async function getAnnouncementBar(): Promise<AnnouncementBar | null> {
  const { data } = await db()
    .from('announcement_bar')
    .select('*')
    .eq('id', 'main')
    .single()
  return data as AnnouncementBar | null
}

export async function upsertAnnouncementBar(
  values: Partial<Omit<AnnouncementBar, 'id' | 'updated_at'>>
): Promise<{ error?: string }> {
  const { error } = await db()
    .from('announcement_bar')
    .upsert({
      id: 'main',
      ...values,
      updated_at: new Date().toISOString(),
    })
  return { error: error?.message }
}

// ── Site Settings ─────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings | null> {
  const { data } = await db()
    .from('site_settings')
    .select('*')
    .eq('id', 'main')
    .single()
  return data as SiteSettings | null
}

export async function upsertSettings(
  values: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>
): Promise<{ error?: string }> {
  const { error } = await db()
    .from('site_settings')
    .upsert({
      id: 'main',
      ...values,
      updated_at: new Date().toISOString(),
    })
  return { error: error?.message }
}

// ── User profile editing ───────────────────────────────────────

export async function adminUpdateUserProfile(
  id: string,
  values: { full_name?: string; phone?: string; notes?: string }
): Promise<{ error?: string }> {
  const { error } = await db().from('profiles').update(values).eq('id', id)
  return { error: error?.message }
}

export async function adminGetUserWithBookings(userId: string) {
  const [profileRes, bookingsRes] = await Promise.all([
    db().from('profiles').select('*').eq('id', userId).single(),
    db()
      .from('bookings')
      .select('id, reference, booking_date, total_amount, status, service:services!service_id(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])
  return {
    profile:  profileRes.data  as Profile | null,
    bookings: (bookingsRes.data ?? []) as unknown as (Pick<Booking, 'id'|'reference'|'booking_date'|'total_amount'|'status'> & { service: { name: string } | null })[],
  }
}

// ── Booking notes ─────────────────────────────────────────────

// ── Admin Notifications ───────────────────────────────────────

export async function getAdminNotifications() {
  const supabase = db()
  const [pendingBookings, pendingEnrollments, newInquiries, pendingShopOrders] = await Promise.allSettled([
    supabase
      .from('bookings')
      .select('id, reference, guest_name, booking_date, start_time, created_at, service:services!service_id(name), profile:profiles!user_id(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('enrollments')
      .select('id, reference, guest_name, created_at, course:academy_courses!course_id(title), profile:profiles!user_id(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('contact_inquiries')
      .select('id, name, email, subject, created_at')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('shop_orders')
      .select('id, reference, customer_name, customer_email, item_count, total_amount, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const bookings    = pendingBookings.status    === 'fulfilled' ? (pendingBookings.value.data    ?? []) : []
  const enrollments = pendingEnrollments.status === 'fulfilled' ? (pendingEnrollments.value.data ?? []) : []
  const inquiries   = newInquiries.status       === 'fulfilled' ? (newInquiries.value.data       ?? []) : []
  const shopOrders  = pendingShopOrders.status  === 'fulfilled' ? (pendingShopOrders.value.data  ?? []) : []

  return {
    bookings:    bookings    as unknown as Array<{ id: string; reference: string; guest_name: string | null; booking_date: string; start_time: string; created_at: string; service: { name: string } | null; profile: { full_name: string } | null }>,
    enrollments: enrollments as unknown as Array<{ id: string; reference: string; guest_name: string | null; created_at: string; course: { title: string } | null; profile: { full_name: string } | null }>,
    inquiries:   inquiries   as unknown as Array<{ id: string; name: string; email: string; subject: string; created_at: string }>,
    shopOrders:  shopOrders  as unknown as Array<{ id: string; reference: string; customer_name: string; customer_email: string; item_count: number; total_amount: number; created_at: string }>,
    total: bookings.length + enrollments.length + inquiries.length + shopOrders.length,
  }
}

// ── Booking notes ─────────────────────────────────────────────

export async function adminUpdateBookingNotes(
  id: string,
  values: { staff_notes?: string; notes?: string; cancellation_reason?: string }
): Promise<{ error?: string }> {
  const { error } = await db().from('bookings').update(values).eq('id', id)
  return { error: error?.message }
}

// ── Manual Booking Creation & Editing ─────────────────────────

export async function adminSearchUsers(query: string): Promise<Profile[]> {
  if (!query || query.length < 2) return []
  const { data } = await db()
    .from('profiles')
    .select('id, full_name, email, phone, avatar_url, role, is_active, date_of_birth, notes, created_at, updated_at')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(10)
  return (data ?? []) as Profile[]
}

export async function adminGetActiveServices(): Promise<Service[]> {
  const { data } = await db()
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []) as Service[]
}

export async function adminGetActiveStaff(): Promise<Staff[]> {
  const { data } = await db()
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []) as Staff[]
}

export async function adminGetActiveCourses(): Promise<AcademyCourse[]> {
  const { data } = await db()
    .from('academy_courses')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []) as AcademyCourse[]
}

export async function adminCreateBooking(
  values: {
    user_id?:     string | null
    guest_name?:  string | null
    guest_email?: string | null
    guest_phone?: string | null
    branch:       string
    service_id:   string
    staff_id?:    string | null
    booking_date: string
    start_time:   string
    end_time:     string
    total_amount: number
    source:       BookingSource
    notes?:       string | null
    staff_notes?: string | null
  }
): Promise<{ id?: string; reference?: string; error?: string }> {
  // Created as 'pending' — WhatsApp is sent only when admin explicitly confirms.
  const { data, error } = await db()
    .from('bookings')
    .insert({ ...values, status: 'pending' })
    .select('id, reference')
    .single()

  if (error || !data) return { error: error?.message }
  return { id: data.id, reference: data.reference }
}

export async function adminUpdateBooking(
  id: string,
  values: {
    branch?:       string
    service_id?:   string
    staff_id?:     string | null
    booking_date?: string
    start_time?:   string
    end_time?:     string
    total_amount?: number
    source?:       BookingSource
    notes?:        string | null
    staff_notes?:  string | null
    status?:       BookingStatus
  }
): Promise<{ error?: string }> {
  const updates: Record<string, unknown> = { ...values }
  if (values.status === 'confirmed' && !updates.confirmed_at) updates.confirmed_at = new Date().toISOString()
  if (values.status === 'completed') updates.completed_at = new Date().toISOString()
  if (values.status === 'cancelled') updates.cancelled_at = new Date().toISOString()

  const { error } = await db().from('bookings').update(updates).eq('id', id)
  return { error: error?.message }
}

// ── Manual Enrollment Creation & Editing ──────────────────────

export async function adminCreateEnrollment(values: {
  user_id?:     string | null
  guest_name?:  string | null
  guest_email?: string | null
  guest_phone?: string | null
  course_id:    string
  amount_paid:  number
  source:       BookingSource
  notes?:       string | null
}): Promise<{ id?: string; reference?: string; error?: string }> {
  const { data, error } = await db()
    .from('enrollments')
    .insert({
      ...values,
      status:       'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .select('id, reference')
    .single()
  return { id: data?.id, reference: data?.reference, error: error?.message }
}

export async function adminUpdateEnrollment(
  id: string,
  values: {
    course_id?:   string
    amount_paid?: number
    source?:      BookingSource
    notes?:       string | null
    status?:      EnrollmentStatus
  }
): Promise<{ error?: string }> {
  const updates: Record<string, unknown> = { ...values }
  if (values.status === 'confirmed') updates.confirmed_at = new Date().toISOString()
  if (values.status === 'completed') updates.completed_at = new Date().toISOString()

  const { error } = await db().from('enrollments').update(updates).eq('id', id)
  return { error: error?.message }
}

// ── Products ───────────────────────────────────────────────────

import type { Product, ProductCategory, ProductOrderStatus } from '@/types/database'

export async function adminGetProducts() {
  const { data } = await db()
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  return (data ?? []) as Product[]
}

export async function adminGetProductById(id: string) {
  const { data } = await db().from('products').select('*').eq('id', id).single()
  return data as Product | null
}

export async function adminCreateProduct(values: {
  name:               string
  slug:               string
  short_description?: string
  description?:       string
  expert_note?:       string
  price:              number
  compare_at_price?:  number | null
  image_url?:         string
  gallery_urls?:      string[]
  category:           ProductCategory
  tags?:              string[]
  suitable_for?:      string[]
  ingredients?:       string
  how_to_use?:        string
  is_featured?:       boolean
  is_active?:         boolean
  in_stock?:          boolean
  stock_count?:       number | null
  sort_order?:        number
}): Promise<{ id?: string; error?: string }> {
  const { data, error } = await db()
    .from('products')
    .insert({
      ...values,
      gallery_urls: values.gallery_urls ?? [],
      tags:         values.tags ?? [],
      suitable_for: values.suitable_for ?? [],
    })
    .select('id')
    .single()
  return { id: data?.id, error: error?.message }
}

export async function adminUpdateProduct(
  id: string,
  values: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ error?: string }> {
  const { error } = await db().from('products').update(values).eq('id', id)
  return { error: error?.message }
}

export async function adminDeleteProduct(id: string): Promise<{ error?: string }> {
  const { error } = await db().from('products').delete().eq('id', id)
  return { error: error?.message }
}

// ── Product Orders ─────────────────────────────────────────────

export async function adminGetProductOrders(status?: ProductOrderStatus) {
  let query = db()
    .from('product_orders')
    .select('*, product:products(name, image_url, category)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data } = await query
  return (data ?? []) as (import('@/types/database').ProductOrder & {
    product: Pick<Product, 'name' | 'image_url' | 'category'> | null
  })[]
}

export async function adminUpdateProductOrderStatus(
  id: string,
  status: ProductOrderStatus
): Promise<{ error?: string }> {
  const { error } = await db().from('product_orders').update({ status }).eq('id', id)
  return { error: error?.message }
}

// ── Shop Orders (multi-item cart orders) ──────────────────────

import type { ShopOrderWithItems, ShopOrderSource, ShopPaymentMethod } from '@/types/database'

export async function adminGetShopOrders(status?: ProductOrderStatus) {
  let query = db()
    .from('shop_orders')
    .select('*, items:shop_order_items(*)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data } = await query
  return (data ?? []) as ShopOrderWithItems[]
}

export async function adminUpdateShopOrderStatus(
  id: string,
  status: ProductOrderStatus
): Promise<{ error?: string }> {
  const { error } = await db().from('shop_orders').update({ status }).eq('id', id)
  return { error: error?.message }
}

export async function adminCreateManualOrder(input: {
  customer_name:   string
  customer_email?: string
  customer_phone?: string
  notes?:          string
  source:          ShopOrderSource
  payment_method?: ShopPaymentMethod
  status?:         ProductOrderStatus
  items: Array<{
    product_id:   string | null
    product_name: string
    image_url?:   string | null
    unit_price:   number
    quantity:     number
  }>
}): Promise<{ id?: string; reference?: string; error?: string }> {
  const supabase = db()

  // Generate reference
  const reference = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()

  const item_count    = input.items.reduce((s, i) => s + i.quantity, 0)
  const total_amount  = input.items.reduce((s, i) => s + i.unit_price * i.quantity, 0)

  const { data: order, error: orderErr } = await supabase
    .from('shop_orders')
    .insert({
      reference,
      customer_name:  input.customer_name,
      customer_email: input.customer_email ?? '',
      customer_phone: input.customer_phone ?? null,
      notes:          input.notes ?? null,
      source:         input.source,
      payment_method: input.payment_method ?? null,
      status:         input.status ?? 'confirmed',
      item_count,
      total_amount,
    })
    .select('id, reference')
    .single()

  if (orderErr || !order) return { error: orderErr?.message ?? 'Failed to create order' }

  const { error: itemsErr } = await supabase
    .from('shop_order_items')
    .insert(
      input.items.map(item => ({
        order_id:     order.id,
        product_id:   item.product_id,
        product_name: item.product_name,
        image_url:    item.image_url ?? null,
        unit_price:   item.unit_price,
        quantity:     item.quantity,
      }))
    )

  if (itemsErr) {
    // Rollback: delete the order header
    await supabase.from('shop_orders').delete().eq('id', order.id)
    return { error: itemsErr.message }
  }

  return { id: order.id, reference: order.reference }
}

// ── Analytics Report ──────────────────────────────────────────

export interface DailyDataPoint {
  date:            string  // YYYY-MM-DD
  label:           string  // "Jan 5"
  bookingRevenue:  number
  shopRevenue:     number
  bookingCount:    number
  shopCount:       number
  enrollmentCount: number
  newUsers:        number
}

export interface TopService {
  name:    string
  count:   number
  revenue: number
}

export interface AnalyticsReport {
  period: { from: string; to: string; days: number }

  // Current period KPIs
  totalRevenue:       number
  totalBookingRevenue: number
  totalShopRevenue:   number
  totalBookings:      number
  totalShopOrders:    number
  totalEnrollments:   number
  totalNewUsers:      number
  totalInquiries:     number

  // Previous period (for % change)
  prevRevenue:        number
  prevBookingRevenue: number
  prevShopRevenue:    number
  prevBookings:       number
  prevShopOrders:     number
  prevEnrollments:    number
  prevNewUsers:       number

  // Trend data (daily, weekly, or monthly depending on range)
  chartData: DailyDataPoint[]

  // Breakdowns
  bookingStatuses:    Record<string, number>
  shopStatuses:       Record<string, number>
  enrollmentStatuses: Record<string, number>
  inquiryStatuses:    Record<string, number>

  // Top services
  topServices: TopService[]
}

export async function getAnalyticsReport(from: string, to: string): Promise<AnalyticsReport> {
  const supabase = db()

  const fromDate = new Date(from + 'T00:00:00')
  const toDate   = new Date(to   + 'T23:59:59')
  const days = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Previous period (same duration)
  const prevToDate   = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000)
  const prevFromDate = new Date(prevToDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  const prevFrom = prevFromDate.toISOString().slice(0, 10)
  const prevTo   = prevToDate.toISOString().slice(0, 10)

  const fromISO = from + 'T00:00:00'
  const toISO   = to   + 'T23:59:59'
  const pFromISO = prevFrom + 'T00:00:00'
  const pToISO   = prevTo   + 'T23:59:59'

  const [
    bkRes, pbkRes,
    soRes, psoRes,
    enRes, penRes,
    usRes, pusRes,
    iqRes,
    svcRes,
  ] = await Promise.allSettled([
    supabase.from('bookings').select('id,status,total_amount,created_at').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('bookings').select('id,status,total_amount,created_at').gte('created_at', pFromISO).lte('created_at', pToISO),
    supabase.from('shop_orders').select('id,status,total_amount,created_at').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('shop_orders').select('id,status,total_amount,created_at').gte('created_at', pFromISO).lte('created_at', pToISO),
    supabase.from('enrollments').select('id,status,created_at').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('enrollments').select('id,status,created_at').gte('created_at', pFromISO).lte('created_at', pToISO),
    supabase.from('profiles').select('id,created_at').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('profiles').select('id,created_at').gte('created_at', pFromISO).lte('created_at', pToISO),
    supabase.from('contact_inquiries').select('id,status').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('bookings').select('total_amount, service:services!service_id(name)').eq('status', 'completed').gte('created_at', fromISO).lte('created_at', toISO),
  ])

  const bk   = bkRes.status  === 'fulfilled' ? (bkRes.value.data  ?? []) : []
  const pbk  = pbkRes.status === 'fulfilled' ? (pbkRes.value.data ?? []) : []
  const so   = soRes.status  === 'fulfilled' ? (soRes.value.data  ?? []) : []
  const pso  = psoRes.status === 'fulfilled' ? (psoRes.value.data ?? []) : []
  const en   = enRes.status  === 'fulfilled' ? (enRes.value.data  ?? []) : []
  const pen  = penRes.status === 'fulfilled' ? (penRes.value.data ?? []) : []
  const us   = usRes.status  === 'fulfilled' ? (usRes.value.data  ?? []) : []
  const pus  = pusRes.status === 'fulfilled' ? (pusRes.value.data ?? []) : []
  const iq   = iqRes.status  === 'fulfilled' ? (iqRes.value.data  ?? []) : []
  const svcs = svcRes.status === 'fulfilled' ? (svcRes.value.data ?? []) : []

  type Row = { status: string; total_amount?: number; created_at?: string }
  const revenue = (rows: Row[], ...statuses: string[]) =>
    rows.filter(r => statuses.length === 0 || statuses.includes(r.status))
        .reduce((s, r) => s + Number(r.total_amount || 0), 0)

  const totalBookingRevenue = revenue(bk as Row[], 'completed')
  const prevBookingRevenue  = revenue(pbk as Row[], 'completed')
  const totalShopRevenue    = revenue(so as Row[], 'confirmed', 'ready', 'completed')
  const prevShopRevenue     = revenue(pso as Row[], 'confirmed', 'ready', 'completed')

  // Status breakdowns
  const buildStatuses = (rows: { status: string }[]) =>
    rows.reduce<Record<string, number>>((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})

  // Top services
  const serviceMap: Record<string, { count: number; revenue: number }> = {}
  for (const b of (svcs as unknown) as { total_amount: number; service: { name: string } | null }[]) {
    const name = b.service?.name ?? 'Unknown'
    if (!serviceMap[name]) serviceMap[name] = { count: 0, revenue: 0 }
    serviceMap[name].count++
    serviceMap[name].revenue += Number(b.total_amount || 0)
  }
  const topServices: TopService[] = Object.entries(serviceMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)

  // Build daily data array
  const rawDaily: DailyDataPoint[] = []
  const cursor = new Date(fromDate)
  while (cursor <= toDate) {
    const d = cursor.toISOString().slice(0, 10)
    const lbl = cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayBk = (bk as Row[]).filter(r => r.created_at?.startsWith(d))
    const daySo = (so as Row[]).filter(r => r.created_at?.startsWith(d))
    const dayEn = (en as { status: string; created_at?: string }[]).filter(r => r.created_at?.startsWith(d))
    const dayUs = (us as { created_at?: string }[]).filter(r => r.created_at?.startsWith(d))
    rawDaily.push({
      date:            d,
      label:           lbl,
      bookingRevenue:  revenue(dayBk, 'completed'),
      shopRevenue:     revenue(daySo, 'confirmed', 'ready', 'completed'),
      bookingCount:    dayBk.length,
      shopCount:       daySo.length,
      enrollmentCount: dayEn.length,
      newUsers:        dayUs.length,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Bucket into weeks (>60 days) or months (>180 days)
  function bucketWeek(data: DailyDataPoint[]): DailyDataPoint[] {
    const map: Record<string, DailyDataPoint> = {}
    for (const d of data) {
      const dt = new Date(d.date)
      const diff = (dt.getDay() + 6) % 7  // days since Monday
      dt.setDate(dt.getDate() - diff)
      const key = dt.toISOString().slice(0, 10)
      const lbl = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!map[key]) map[key] = { date: key, label: lbl, bookingRevenue: 0, shopRevenue: 0, bookingCount: 0, shopCount: 0, enrollmentCount: 0, newUsers: 0 }
      const w = map[key]
      w.bookingRevenue  += d.bookingRevenue
      w.shopRevenue     += d.shopRevenue
      w.bookingCount    += d.bookingCount
      w.shopCount       += d.shopCount
      w.enrollmentCount += d.enrollmentCount
      w.newUsers        += d.newUsers
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }

  function bucketMonth(data: DailyDataPoint[]): DailyDataPoint[] {
    const map: Record<string, DailyDataPoint> = {}
    for (const d of data) {
      const key = d.date.slice(0, 7)
      const dt  = new Date(d.date)
      const lbl = dt.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      if (!map[key]) map[key] = { date: key, label: lbl, bookingRevenue: 0, shopRevenue: 0, bookingCount: 0, shopCount: 0, enrollmentCount: 0, newUsers: 0 }
      const m = map[key]
      m.bookingRevenue  += d.bookingRevenue
      m.shopRevenue     += d.shopRevenue
      m.bookingCount    += d.bookingCount
      m.shopCount       += d.shopCount
      m.enrollmentCount += d.enrollmentCount
      m.newUsers        += d.newUsers
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }

  const chartData = days > 180 ? bucketMonth(rawDaily) : days > 60 ? bucketWeek(rawDaily) : rawDaily

  return {
    period:              { from, to, days },
    totalRevenue:        totalBookingRevenue + totalShopRevenue,
    totalBookingRevenue,
    totalShopRevenue,
    totalBookings:       bk.length,
    totalShopOrders:     so.length,
    totalEnrollments:    en.length,
    totalNewUsers:       us.length,
    totalInquiries:      iq.length,
    prevRevenue:         prevBookingRevenue + prevShopRevenue,
    prevBookingRevenue,
    prevShopRevenue,
    prevBookings:        pbk.length,
    prevShopOrders:      pso.length,
    prevEnrollments:     pen.length,
    prevNewUsers:        pus.length,
    chartData,
    bookingStatuses:     buildStatuses(bk as { status: string }[]),
    shopStatuses:        buildStatuses(so as { status: string }[]),
    enrollmentStatuses:  buildStatuses(en as { status: string }[]),
    inquiryStatuses:     buildStatuses(iq as { status: string }[]),
    topServices,
  }
}
