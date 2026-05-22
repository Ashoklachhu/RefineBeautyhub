'use server'

import { cancelBooking } from '@/services/booking.service'
import type { ServiceResult } from '@/lib/errors'
import type { Booking } from '@/types/database'

export async function cancelBookingAction(
  bookingId: string,
  cancelledBy: string,
  reason?: string
): Promise<{ error?: string }> {
  const result = await cancelBooking(bookingId, cancelledBy, reason)
  if (result.error) return { error: result.error.message }
  return {}
}
