import { getAllStaff } from '@/services/staff.service'
import { AboutPageClient } from '@/components/sections/AboutPageClient'

export default async function AboutPage() {
  const { data: staff } = await getAllStaff()
  return <AboutPageClient staff={staff ?? []} />
}
