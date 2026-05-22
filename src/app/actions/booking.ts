'use server'

import { createBooking, getAvailableSlots as _getSlots } from '@/services/booking.service'
import { getAllServices } from '@/services/services.service'
import { getAllStaff, getStaffByBranch } from '@/services/staff.service'
import { getServerUser } from '@/lib/auth/get-server-user'
import type { ServiceWithCategory, Staff } from '@/types'
import type { TimeSlotResult } from '@/services/booking.service'

export async function fetchServicesAction(): Promise<ServiceWithCategory[]> {
  const result = await getAllServices()
  return result.data ?? []
}

export async function fetchStaffAction(branch?: string): Promise<Staff[]> {
  const result = branch ? await getStaffByBranch(branch) : await getAllStaff()
  return result.data ?? []
}

export async function fetchSlotsAction(
  staffId: string,
  date: string,
  duration: number
): Promise<TimeSlotResult[]> {
  const result = await _getSlots(staffId, date, duration)
  return result.data ?? []
}

export interface BookingActionInput {
  serviceId:   string
  staffId?:    string
  branch:      string
  bookingDate: string
  startTime:   string
  guestName?:  string
  guestEmail?: string
  guestPhone?: string
  notes?:      string
}

export async function createBookingAction(
  input: BookingActionInput,
  serviceDuration: number,
  servicePrice:    number
): Promise<{ reference?: string; error?: string }> {
  const user = await getServerUser()

  const result = await createBooking(
    { ...input, userId: user?.id },
    serviceDuration,
    servicePrice
  )

  if (result.error) return { error: result.error.message }

  // WhatsApp is sent only when admin confirms/cancels/completes — not on creation.
  return { reference: result.data.reference }
}
