import { z } from 'zod'

// ── Auth ─────────────────────────────────────────────────────

export const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Enter a valid email address'),
  phone:    z.string().regex(/^\+?[0-9\s\-]{7,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

export const signInSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

// ── Booking ───────────────────────────────────────────────────

export const bookingSchema = z.object({
  serviceId:   z.string().uuid('Select a service'),
  staffId:     z.string().uuid().optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a date'),
  startTime:   z.string().regex(/^\d{2}:\d{2}$/, 'Select a time slot'),
  // Client info (for guests)
  guestName:   z.string().min(2).max(100).optional(),
  guestEmail:  z.string().email().optional(),
  guestPhone:  z.string().regex(/^\+?[0-9\s\-]{7,15}$/).optional(),
  notes:       z.string().max(500).optional(),
})

export type BookingFormValues = z.infer<typeof bookingSchema>

// ── Contact ───────────────────────────────────────────────────

export const contactSchema = z.object({
  name:    z.string().min(2, 'Name is required').max(100),
  email:   z.string().email('Enter a valid email address'),
  phone:   z.string().optional(),
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export type ContactFormValues = z.infer<typeof contactSchema>

// ── Enrollment ────────────────────────────────────────────────

export const enrollmentSchema = z.object({
  courseId:   z.string().uuid('Select a course'),
  guestName:  z.string().min(2).max(100).optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  notes:      z.string().max(500).optional(),
})

export type EnrollmentFormValues = z.infer<typeof enrollmentSchema>

// ── Profile ───────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  full_name:     z.string().min(2).max(100),
  phone:         z.string().optional(),
  date_of_birth: z.string().optional(),
})

export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>

// ── Type exports ──────────────────────────────────────────────

export type SignUpValues        = z.infer<typeof signUpSchema>
export type SignInValues        = z.infer<typeof signInSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues  = z.infer<typeof resetPasswordSchema>
