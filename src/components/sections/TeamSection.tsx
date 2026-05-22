import { getAllStaff } from '@/services/staff.service'
import { TeamCarousel } from './TeamCarousel'

export async function TeamSection() {
  const result = await getAllStaff()
  const staff  = result.data ?? []

  if (staff.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-neutral-950">
      <div className="luxury-container">
        <TeamCarousel staff={staff} />
      </div>
    </section>
  )
}
