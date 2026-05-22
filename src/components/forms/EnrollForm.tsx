'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { enrollmentSchema, type EnrollmentFormValues } from '@/lib/validations'
import { enrollInCourseAction } from '@/app/actions/academy'

interface EnrollFormProps {
  courseId: string
}

export function EnrollForm({ courseId }: EnrollFormProps) {
  const [enrolled, setEnrolled] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { courseId },
  })

  async function onSubmit(values: EnrollmentFormValues) {
    try {
      const result = await enrollInCourseAction({
        courseId:   values.courseId,
        guestName:  values.guestName,
        guestEmail: values.guestEmail,
        guestPhone: values.guestPhone,
        notes:      values.notes,
      })
      if (result.error) { toast.error(result.error); return }
      setEnrolled(true)
      toast.success('Enrollment request submitted!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (enrolled) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="font-medium text-foreground mb-1">Enrollment Submitted!</p>
        <p className="text-sm text-muted-foreground">We&apos;ll confirm your spot via email shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register('courseId')} />

      <div className="space-y-1.5">
        <Label htmlFor="guestName" className="text-xs">Your Name *</Label>
        <Input id="guestName" placeholder="Full name" {...register('guestName')}
          className={`h-9 text-sm ${errors.guestName ? 'border-destructive' : ''}`} />
        {errors.guestName && <p className="text-xs text-destructive">{errors.guestName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="guestEmail" className="text-xs">Email *</Label>
        <Input id="guestEmail" type="email" placeholder="you@email.com" {...register('guestEmail')}
          className={`h-9 text-sm ${errors.guestEmail ? 'border-destructive' : ''}`} />
        {errors.guestEmail && <p className="text-xs text-destructive">{errors.guestEmail.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="guestPhone" className="text-xs">Phone</Label>
        <Input id="guestPhone" type="tel" placeholder="+977 98XXXXXXXX" {...register('guestPhone')}
          className="h-9 text-sm" />
      </div>

      <Button type="submit" disabled={isSubmitting}
        className="w-full h-10 gold-gradient text-white border-0 hover:opacity-90 font-medium text-sm">
        {isSubmitting
          ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Enrolling...</>
          : <><span>Enroll Now</span><ArrowRight className="w-3.5 h-3.5 ml-2" /></>}
      </Button>
    </form>
  )
}
