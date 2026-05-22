import { adminGetTestimonials } from '@/app/actions/admin'
import { TestimonialsManager } from '@/components/admin/TestimonialsManager'

export const dynamic = 'force-dynamic'

export default async function AdminTestimonialsPage() {
  const testimonials = await adminGetTestimonials()
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Testimonials</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{testimonials.length} reviews</p>
      </div>
      <TestimonialsManager testimonials={testimonials} />
    </div>
  )
}
