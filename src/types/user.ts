export type UserRole = 'client' | 'staff' | 'admin'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  role: UserRole
  preferences?: UserPreferences
  createdAt: string
}

export interface UserPreferences {
  favoriteServices?: string[]
  preferredStaff?: string
  notificationsEnabled: boolean
  marketingEmails: boolean
}
