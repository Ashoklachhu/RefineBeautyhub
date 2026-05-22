'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  getAvailableSlots,
  createBooking,
  cancelBooking,
  getUserBookings,
  type CreateBookingInput,
  type TimeSlotResult,
} from '@/services/booking.service'
import type { Booking, BookingWithDetails } from '@/types/database'

export function useAvailableSlots() {
  const [slots,     setSlots]     = useState<TimeSlotResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchSlots = useCallback(
    async (staffId: string, date: string, duration: number) => {
      setIsLoading(true)
      const result = await getAvailableSlots(staffId, date, duration)
      setIsLoading(false)

      if (result.error) {
        toast.error(result.error.message)
        return
      }
      setSlots(result.data)
    },
    []
  )

  return { slots, isLoading, fetchSlots }
}

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false)
  const [booking,   setBooking]   = useState<Booking | null>(null)

  const submit = useCallback(
    async (
      input:           CreateBookingInput,
      serviceDuration: number,
      servicePrice:    number
    ) => {
      setIsLoading(true)
      const result = await createBooking(input, serviceDuration, servicePrice)
      setIsLoading(false)

      if (result.error) {
        toast.error(result.error.message)
        return null
      }

      setBooking(result.data)
      toast.success(`Booking confirmed! Reference: ${result.data.reference}`)
      return result.data
    },
    []
  )

  return { booking, isLoading, submit }
}

export function useUserBookings(userId: string | undefined) {
  const [bookings,  setBookings]  = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    const result = await getUserBookings(userId)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error.message)
      return
    }
    setBookings(result.data)
  }, [userId])

  const cancel = useCallback(
    async (bookingId: string, cancelledBy: string, reason?: string) => {
      const result = await cancelBooking(bookingId, cancelledBy, reason)
      if (result.error) {
        toast.error(result.error.message)
        return false
      }
      toast.success('Booking cancelled.')
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
        )
      )
      return true
    },
    []
  )

  return { bookings, isLoading, fetch, cancel }
}
