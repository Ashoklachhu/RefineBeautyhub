import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturedServices } from '@/components/sections/FeaturedServices'
import { AboutPreview } from '@/components/sections/AboutPreview'
import { TeamSection } from '@/components/sections/TeamSection'
import { AcademyPreview } from '@/components/sections/AcademyPreview'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { VideoGallery } from '@/components/sections/VideoGallery'
import { CTABanner } from '@/components/sections/CTABanner'
import { FAQSection } from '@/components/sections/FAQSection'
import { FooterCTA } from '@/components/sections/FooterCTA'
import { loadSiteSettings } from '@/lib/settings'
import { SITE } from '@/constants'

export default async function HomePage() {
  const settings = await loadSiteSettings()

  return (
    <>
      <HeroSection />
      <VideoGallery />
      <FeaturedServices />
      <AboutPreview />
      <TeamSection />
      <AcademyPreview />
      <TestimonialsSection />
      <CTABanner phone={settings?.phone ?? SITE.phone} />
      <FAQSection />
      <FooterCTA />
    </>
  )
}
