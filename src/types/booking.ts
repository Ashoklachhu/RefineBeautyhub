export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Booking {
  id: string
  userId: string
  serviceId: string
  staffId?: string
  date: string
  timeSlot: string
  status: BookingStatus
  notes?: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface BookingFormData {
  serviceId: string
  staffId?: string
  date: string
  timeSlot: string
  notes?: string
  clientName: string
  clientEmail: string
  clientPhone: string
}
