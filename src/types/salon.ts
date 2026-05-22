export type ServiceCategory =
  | 'hair'
  | 'skin'
  | 'nails'
  | 'makeup'
  | 'lashes'
  | 'brows'
  | 'body'
  | 'bridal'

export interface Service {
  id: string
  name: string
  slug: string
  category: ServiceCategory
  description: string
  shortDescription: string
  duration: number
  price: number
  priceMax?: number
  imageUrl: string
  featured: boolean
  popular: boolean
  benefits: string[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  imageUrl: string
  specialties: string[]
  experience: number
  instagram?: string
  featured: boolean
}

export interface GalleryItem {
  id: string
  imageUrl: string
  category: ServiceCategory
  title: string
  description?: string
  featured: boolean
  createdAt: string
}

export interface Testimonial {
  id: string
  clientName: string
  clientImageUrl?: string
  rating: number
  review: string
  service: string
  verified: boolean
  createdAt: string
}

export interface OpeningHours {
  day: string
  open: string
  close: string
  closed: boolean
}
