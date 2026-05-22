export const SITE = {
  name: 'Refined Beauty Hub',
  tagline: 'Where Beauty Meets Excellence',
  description:
    'Premium luxury beauty salon and beauty academy in Kathmandu, Nepal. Expert services in hair, skin, nails, makeup, and professional beauty education.',
  email: 'hello@refinedbeautyhub.com',
  phone: '+977-1-4123456',
  whatsapp: '+9779801234567',
  address: 'Lazimpat, Kathmandu, Nepal 44600',
  mapUrl: 'https://maps.google.com/?q=Lazimpat,Kathmandu,Nepal',
  instagram: 'https://instagram.com/refinedbeautyhub',
  facebook: 'https://facebook.com/refinedbeautyhub',
  tiktok: 'https://tiktok.com/@refinedbeautyhub',
  youtube: 'https://youtube.com/@refinedbeautyhub',
} as const

export const BRANCHES = [
  {
    id:      'jadibuti' as const,
    name:    'Jadibuti Branch',
    address: 'Jadibuti, Kathmandu, Nepal',
    mapUrl:  'https://maps.google.com/?q=Jadibuti,Kathmandu,Nepal',
  },
  {
    id:      'machapokhari' as const,
    name:    'Machapokhari Branch',
    address: 'Machapokhari, Kathmandu, Nepal',
    mapUrl:  'https://maps.google.com/?q=Machapokhari,Kathmandu,Nepal',
  },
] as const

export type BranchId = (typeof BRANCHES)[number]['id']

export const OPENING_HOURS = [
  { day: 'Sunday', open: '10:00 AM', close: '7:00 PM', closed: false },
  { day: 'Monday', open: '10:00 AM', close: '7:00 PM', closed: false },
  { day: 'Tuesday', open: '10:00 AM', close: '7:00 PM', closed: false },
  { day: 'Wednesday', open: '10:00 AM', close: '7:00 PM', closed: false },
  { day: 'Thursday', open: '10:00 AM', close: '7:00 PM', closed: false },
  { day: 'Friday', open: '10:00 AM', close: '8:00 PM', closed: false },
  { day: 'Saturday', open: '9:00 AM', close: '8:00 PM', closed: false },
] as const

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Shop', href: '/shop' },
  { label: 'Academy', href: '/academy' },
  { label: 'Contact', href: '/contact' },
] as const

export const SERVICE_CATEGORIES = [
  { value: 'hair', label: 'Hair', icon: 'scissors' },
  { value: 'skin', label: 'Skin & Facials', icon: 'sparkles' },
  { value: 'nails', label: 'Nails', icon: 'gem' },
  { value: 'makeup', label: 'Makeup', icon: 'palette' },
  { value: 'lashes', label: 'Lashes', icon: 'eye' },
  { value: 'brows', label: 'Brows', icon: 'feather' },
  { value: 'body', label: 'Body Care', icon: 'heart' },
  { value: 'bridal', label: 'Bridal', icon: 'crown' },
] as const

export const TIME_SLOTS = [
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
] as const

export const WHY_CHOOSE_US = [
  {
    title: 'Expert Professionals',
    description: 'Our team holds international certifications with years of industry experience.',
    icon: 'award',
  },
  {
    title: 'Premium Products',
    description: 'We use only luxury, skin-safe brands trusted by top professionals worldwide.',
    icon: 'sparkles',
  },
  {
    title: 'Personalized Service',
    description: 'Every treatment is tailored to your unique features and preferences.',
    icon: 'heart',
  },
  {
    title: 'Hygienic Standards',
    description: 'Hospital-grade hygiene protocols ensure your safety at every visit.',
    icon: 'shield',
  },
  {
    title: 'Tranquil Ambiance',
    description: 'Step into a sanctuary designed for complete relaxation and indulgence.',
    icon: 'flower',
  },
  {
    title: 'Certified Training',
    description: 'Our academy offers globally recognized certifications in beauty arts.',
    icon: 'graduation-cap',
  },
] as const
