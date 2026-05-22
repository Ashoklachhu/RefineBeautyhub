import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturedServices } from '@/components/sections/FeaturedServices'
import { AboutPreview } from '@/components/sections/AboutPreview'
import { TeamSection } from '@/components/sections/TeamSection'
import { AcademyPreview } from '@/components/sections/AcademyPreview'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { GalleryPreview } from '@/components/sections/GalleryPreview'
import { CTABanner } from '@/components/sections/CTABanner'
import { FAQSection } from '@/components/sections/FAQSection'
import { FooterCTA } from '@/components/sections/FooterCTA'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedServices />
      <AboutPreview />
      <TeamSection />
      <AcademyPreview />
      <TestimonialsSection />
      <GalleryPreview />
      <CTABanner />
      <FAQSection />
      <FooterCTA />
    </>
  )
}
