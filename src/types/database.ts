// ============================================================
// REFINED BEAUTY HUB — Supabase Database Types
// Auto-generated structure — mirrors 001_schema.sql exactly
// ============================================================

export type UserRole           = 'client' | 'staff' | 'admin'
export type ProductCategory    = 'hair' | 'skin' | 'body' | 'nails' | 'fragrance' | 'tools' | 'other'
export type ProductOrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'
export type BookingStatus   = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type BookingSource   = 'online' | 'walk_in' | 'phone' | 'admin'
export type CourseLevel     = 'beginner' | 'intermediate' | 'advanced' | 'professional'
export type CourseFormat    = 'in_person' | 'online' | 'hybrid'
export type EnrollmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type InquiryStatus   = 'new' | 'in_progress' | 'resolved' | 'closed'
export type InquiryPriority = 'low' | 'normal' | 'high' | 'urgent'
export type NoteType        = 'internal' | 'reply' | 'call' | 'whatsapp' | 'email'
export type DayOfWeek       = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

// ── Row types (what comes back from SELECT) ───────────────────

export interface Profile {
  id:             string
  email:          string
  full_name:      string
  phone:          string | null
  avatar_url:     string | null
  role:           UserRole
  date_of_birth:  string | null
  notes:          string | null
  is_active:      boolean
  created_at:     string
  updated_at:     string
}

export interface Category {
  id:            string
  name:          string
  slug:          string
  description:   string | null
  icon:          string | null
  display_order: number
  is_active:     boolean
  created_at:    string
}

export interface Staff {
  id:               string
  profile_id:       string | null
  name:             string
  slug:             string
  role:             string
  bio:              string | null
  avatar_url:       string | null
  experience_years: number
  instagram_url:    string | null
  specialties:      string[]
  branch:           string
  is_featured:      boolean
  is_active:        boolean
  display_order:    number
  created_at:       string
  updated_at:       string
}

export interface Service {
  id:                string
  category_id:       string
  name:              string
  slug:              string
  description:       string | null
  short_description: string | null
  duration_minutes:  number
  price:             number
  price_max:         number | null
  discounted_price:  number | null
  image_url:         string | null
  benefits:          string[]
  is_featured:       boolean
  is_popular:        boolean
  is_active:         boolean
  display_order:     number
  created_at:        string
  updated_at:        string
}

export interface AvailabilitySlot {
  id:         string
  staff_id:   string
  day:        DayOfWeek
  start_time: string   // "HH:MM"
  end_time:   string
  is_active:  boolean
}

export interface BlockedDate {
  id:         string
  staff_id:   string | null
  date:       string   // "YYYY-MM-DD"
  reason:     string | null
  created_by: string | null
  created_at: string
}

export interface Booking {
  id:                  string
  reference:           string
  user_id:             string | null
  guest_name:          string | null
  guest_email:         string | null
  guest_phone:         string | null
  branch:              string
  service_id:          string
  staff_id:            string | null
  booking_date:        string   // "YYYY-MM-DD"
  start_time:          string   // "HH:MM"
  end_time:            string
  status:              BookingStatus
  source:              BookingSource
  total_amount:        number
  notes:               string | null
  staff_notes:         string | null
  cancelled_at:        string | null
  cancelled_by:        string | null
  cancellation_reason: string | null
  confirmed_at:        string | null
  completed_at:        string | null
  created_at:          string
  updated_at:          string
}

export interface AcademyCourse {
  id:                string
  title:             string
  slug:              string
  category:          string
  level:             CourseLevel
  format:            CourseFormat
  description:       string | null
  short_description: string | null
  duration_text:     string
  price:             number
  discounted_price:  number | null
  max_students:      number
  current_students:  number
  image_url:         string | null
  instructor_name:   string | null
  syllabus:          SyllabusModule[]
  includes:          string[]
  has_certificate:   boolean
  is_featured:       boolean
  is_active:         boolean
  next_start_date:   string | null
  display_order:     number
  created_at:        string
  updated_at:        string
}

export interface SyllabusModule {
  module:   number
  title:    string
  topics:   string[]
  duration: string
}

export interface Enrollment {
  id:           string
  reference:    string
  user_id:      string | null
  guest_name:   string | null
  guest_email:  string | null
  guest_phone:  string | null
  course_id:    string
  status:       EnrollmentStatus
  source:       BookingSource
  amount_paid:  number
  notes:        string | null
  enrolled_at:  string
  confirmed_at: string | null
  completed_at: string | null
  created_at:   string
  updated_at:   string
}

export interface Testimonial {
  id:               string
  user_id:          string | null
  client_name:      string
  client_image_url: string | null
  rating:           number
  review:           string
  service_label:    string
  service_id:       string | null
  is_verified:      boolean
  is_featured:      boolean
  is_published:     boolean
  created_at:       string
}

export interface GalleryItem {
  id:            string
  image_url:     string
  thumbnail_url: string | null
  category_id:   string | null
  title:         string | null
  description:   string | null
  alt_text:      string | null
  is_featured:   boolean
  is_published:  boolean
  display_order: number
  uploaded_by:   string | null
  created_at:    string
}

export interface ContactInquiry {
  id:          string
  name:        string
  email:       string
  phone:       string | null
  subject:     string
  message:     string
  status:      InquiryStatus
  priority:    InquiryPriority
  assigned_to: string | null
  replied_at:  string | null
  replied_by:  string | null
  created_at:  string
}

export interface InquiryNote {
  id:         string
  inquiry_id: string
  note:       string
  note_type:  NoteType
  created_by: string | null
  created_at: string
}

export interface InquiryWithNotes extends ContactInquiry {
  notes: InquiryNote[]
}

export interface OpeningHourEntry {
  day:    string
  open:   string   // 24-hour "HH:mm"
  close:  string   // 24-hour "HH:mm"
  closed: boolean
}

export interface Product {
  id:                string
  name:              string
  slug:              string
  short_description: string | null
  description:       string | null
  expert_note:       string | null
  price:             number
  compare_at_price:  number | null
  image_url:         string | null
  gallery_urls:      string[]
  category:          ProductCategory
  tags:              string[]          // 'bestseller' | 'staff_pick' | 'new' | 'limited'
  suitable_for:      string[]
  ingredients:       string | null
  how_to_use:        string | null
  is_featured:       boolean
  is_active:         boolean
  in_stock:          boolean
  stock_count:       number | null
  sort_order:        number
  created_at:        string
  updated_at:        string
}

export interface ProductOrder {
  id:             string
  reference:      string
  product_id:     string | null
  product_name:   string
  unit_price:     number
  quantity:       number
  total_amount:   number
  customer_name:  string
  customer_email: string
  customer_phone: string | null
  notes:          string | null
  status:         ProductOrderStatus
  created_at:     string
  updated_at:     string
}

export interface ProductOrderWithProduct extends ProductOrder {
  product: Product | null
}

export type ShopOrderSource   = 'online' | 'walk_in' | 'phone' | 'instagram' | 'whatsapp' | 'other'
export type ShopPaymentMethod = 'cash' | 'card' | 'esewa' | 'khalti' | 'fonepay' | 'credit' | 'other'

export interface ShopOrder {
  id:             string
  reference:      string
  customer_name:  string
  customer_email: string
  customer_phone: string | null
  notes:          string | null
  item_count:     number
  total_amount:   number
  status:         ProductOrderStatus
  source:         ShopOrderSource
  payment_method: ShopPaymentMethod | null
  created_by:     string | null
  created_at:     string
  updated_at:     string
}

export interface ShopOrderItem {
  id:           string
  order_id:     string
  product_id:   string | null
  product_name: string
  image_url:    string | null
  unit_price:   number
  quantity:     number
  subtotal:     number
}

export interface ShopOrderWithItems extends ShopOrder {
  items: ShopOrderItem[]
}

export interface AnnouncementBar {
  id:         string
  is_active:  boolean
  message:    string
  link_text:  string | null
  link_url:   string | null
  updated_at: string
}

export interface SiteSettings {
  id:               string
  name:             string
  tagline:          string
  email:            string
  phone:            string
  address:          string
  map_url:          string
  instagram:        string
  facebook:         string
  youtube:          string
  tiktok:           string
  opening_hours:    OpeningHourEntry[]
  meta_title:       string
  meta_description: string
  og_image:         string
  updated_at:       string
}

// ── Insert types (what you send to INSERT) ────────────────────

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>
export type BookingInsert = Omit<Booking, 'id' | 'reference' | 'created_at' | 'updated_at'>
export type EnrollmentInsert = Omit<Enrollment, 'id' | 'reference' | 'enrolled_at' | 'created_at' | 'updated_at'>
export type TestimonialInsert = Omit<Testimonial, 'id' | 'created_at'>
export type ContactInquiryInsert = Omit<ContactInquiry, 'id' | 'created_at' | 'status' | 'priority' | 'assigned_to' | 'replied_at' | 'replied_by'>

// ── Joined / enriched types ───────────────────────────────────

export interface BookingWithDetails extends Booking {
  service:  Service
  staff:    Staff | null
  profile:  Profile | null
}

export interface ServiceWithCategory extends Service {
  category: Category
}

export interface EnrollmentWithCourse extends Enrollment {
  course: AcademyCourse
}

// ── Supabase full Database type (for createClient generic) ────

export interface Database {
  public: {
    Tables: {
      profiles:           { Row: Profile;        Insert: ProfileInsert;        Update: Partial<ProfileInsert> }
      categories:         { Row: Category;       Insert: Omit<Category,'id'|'created_at'>; Update: Partial<Category> }
      staff:              { Row: Staff;           Insert: Omit<Staff,'id'|'created_at'|'updated_at'>; Update: Partial<Staff> }
      services:           { Row: Service;         Insert: ServiceInsert;        Update: Partial<ServiceInsert> }
      availability_slots: { Row: AvailabilitySlot; Insert: Omit<AvailabilitySlot,'id'>; Update: Partial<AvailabilitySlot> }
      blocked_dates:      { Row: BlockedDate;     Insert: Omit<BlockedDate,'id'|'created_at'>; Update: Partial<BlockedDate> }
      bookings:           { Row: Booking;         Insert: BookingInsert;        Update: Partial<BookingInsert> }
      academy_courses:    { Row: AcademyCourse;   Insert: Omit<AcademyCourse,'id'|'current_students'|'created_at'|'updated_at'>; Update: Partial<AcademyCourse> }
      enrollments:        { Row: Enrollment;      Insert: EnrollmentInsert;     Update: Partial<EnrollmentInsert> }
      testimonials:       { Row: Testimonial;     Insert: TestimonialInsert;    Update: Partial<TestimonialInsert> }
      gallery:            { Row: GalleryItem;     Insert: Omit<GalleryItem,'id'|'created_at'>; Update: Partial<GalleryItem> }
      contact_inquiries:  { Row: ContactInquiry;  Insert: ContactInquiryInsert; Update: Partial<ContactInquiry> }
      inquiry_notes:      { Row: InquiryNote;     Insert: Omit<InquiryNote,'id'|'created_at'>; Update: Partial<InquiryNote> }
      site_settings:      { Row: SiteSettings;       Insert: Partial<SiteSettings>;    Update: Partial<SiteSettings> }
      announcement_bar:   { Row: AnnouncementBar;   Insert: Partial<AnnouncementBar>; Update: Partial<AnnouncementBar> }
      products:           { Row: Product;            Insert: Omit<Product,'id'|'created_at'|'updated_at'>; Update: Partial<Product> }
      product_orders:     { Row: ProductOrder;       Insert: Omit<ProductOrder,'id'|'reference'|'total_amount'|'created_at'|'updated_at'>; Update: Partial<ProductOrder> }
      shop_orders:        { Row: ShopOrder;          Insert: Omit<ShopOrder,'id'|'reference'|'created_at'|'updated_at'>; Update: Partial<ShopOrder> }
      shop_order_items:   { Row: ShopOrderItem;      Insert: Omit<ShopOrderItem,'id'|'subtotal'>; Update: Partial<ShopOrderItem> }
    }
    Enums: {
      user_role:         UserRole
      booking_status:    BookingStatus
      course_level:      CourseLevel
      course_format:     CourseFormat
      enrollment_status: EnrollmentStatus
      inquiry_status:       InquiryStatus
      day_of_week:          DayOfWeek
      product_category:     ProductCategory
      product_order_status: ProductOrderStatus
    }
    Functions: {
      is_admin:               { Args: Record<never,never>; Returns: boolean }
      is_staff_or_admin:      { Args: Record<never,never>; Returns: boolean }
      check_booking_conflict: { Args: { p_staff_id: string; p_date: string; p_start_time: string; p_end_time: string; p_exclude_id?: string }; Returns: boolean }
      get_available_slots:    { Args: { p_staff_id: string; p_date: string; p_duration: number }; Returns: Array<{ slot_time: string; is_available: boolean }> }
    }
  }
}
