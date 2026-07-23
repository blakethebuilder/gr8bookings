import { addMinutes, format, parseISO, setHours, setMinutes, isBefore, isAfter } from 'date-fns'

/**
 * Generate available time slots for a room on a given date.
 * Business hours: Thu-Sun 11:00-18:00 (configurable via settings).
 */
export function generateSlots(
  date: Date,
  durationMinutes: number,
  resetBufferMinutes: number,
  businessOpen = '11:00',
  businessClose = '18:00',
): { start: string; end: string }[] {
  const [openH, openM] = businessOpen.split(':').map(Number)
  const [closeH, closeM] = businessClose.split(':').map(Number)

  const dayStart = setMinutes(setMinutes(date, 0), 0)
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
 * Check if a date is a valid business day (Thu-Sun).
 */
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day === 4 || day === 5 || day === 6 || day === 0 // Thu=4, Fri=5, Sat=6, Sun=0
}
