import { addMinutes, format, setHours, setMinutes, isBefore } from 'date-fns'

/**
 * Business hours:
 * Mon-Thu: 09:30 – 18:30
 * Fri-Sat: 09:30 – 20:00
 * Sun:     09:30 – 18:30
 */
export function getBusinessHours(date: Date): { open: string; close: string } {
  const day = date.getDay()
  // Fri=5, Sat=6
  if (day === 5 || day === 6) {
    return { open: '09:30', close: '20:00' }
  }
  // All other days
  return { open: '09:30', close: '18:30' }
}

/**
 * Generate available time slots for a room on a given date.
 */
export function generateSlots(
  date: Date,
  durationMinutes: number,
  resetBufferMinutes: number,
): { start: string; end: string }[] {
  const { open, close } = getBusinessHours(date)
  const [openH, openM] = open.split(':').map(Number)
  const [closeH, closeM] = close.split(':').map(Number)

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const slotStart = setMinutes(setHours(dayStart, openH), openM)
  const dayEnd = setMinutes(setHours(dayStart, closeH), closeM)

  const totalBlock = durationMinutes + resetBufferMinutes
  const slots: { start: string; end: string }[] = []
  let cursor = slotStart

  while (true) {
    const slotEnd = addMinutes(cursor, durationMinutes)
    const blockEnd = addMinutes(cursor, totalBlock)

    if (isBefore(dayEnd, slotEnd) || isBefore(dayEnd, blockEnd)) break

    slots.push({
      start: format(cursor, 'HH:mm'),
      end: format(slotEnd, 'HH:mm'),
    })

    cursor = blockEnd
  }

  return slots
}

/**
 * All days are business days (open 7 days a week).
 */
export function isBusinessDay(_date: Date): boolean {
  return true
}
