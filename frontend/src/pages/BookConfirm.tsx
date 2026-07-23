import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Calendar, Clock, Users, Home, AlertCircle, Loader2, Share2, Copy, Check, Shield, Download } from 'lucide-react'
import { format } from 'date-fns'
import pb, { type Booking, type Room, type TimeSlot } from '../lib/pocketbase'

export default function BookConfirm() {
  const { reference } = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!reference) return

    pb.collection('bookings').getFirstListItem<Booking>(
      `reference = "${reference}"`,
      { expand: 'room,time_slot' },
    ).then(async b => {
      setBooking(b)
      if (b.expand?.room) setRoom(b.expand.room as Room)
      if (b.expand?.time_slot) setTimeSlot(b.expand.time_slot as TimeSlot)

      // Security: Don't auto-confirm — ITN webhook handles real confirmation
      // For sandbox testing, admin can manually confirm via dashboard

      setLoading(false)
    }).catch(err => {
      console.error('[BookConfirm] Failed to load booking:', err)
      setLoading(false)
    })
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-gr8-red" size={32} />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Booking not found</h1>
          <p className="text-gray-500 mb-6">Reference "{reference}" doesn't match any booking.</p>
          <Link to="/" className="btn-gr8 px-6 py-3 inline-block">Go Home</Link>
        </div>
      </div>
    )
  }

  const isConfirmed = booking.status === 'confirmed' || booking.payment_status === 'paid'

  // Generate ICS file for calendar download
  const downloadICS = () => {
    if (!room || !timeSlot) return
    const dateStr = timeSlot.date.split(' ')[0]
    const startDateTime = `${dateStr}T${timeSlot.start_time}:00`
    const endDateTime = `${dateStr}T${timeSlot.end_time}:00`

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The Gr8 Escape//Booking//EN',
      'BEGIN:VEVENT',
      `DTSTART:${startDateTime.replace(/[-:]/g, '').replace('T', 'T')}`,
      `DTEND:${endDateTime.replace(/[-:]/g, '').replace('T', 'T')}`,
      `SUMMARY:Escape Room - ${room.name}`,
      `DESCRIPTION:The Gr8 Escape - ${room.name}\\nBooking: ${booking.reference}\\nPlayers: ${booking.player_count}\\nPlease arrive 15 minutes early. No phones allowed.`,
      `LOCATION:The Gr8 Escape, Pineslopes Office Park, Fourways, Johannesburg`,
      `STATUS:CONFIRMED`,
      `END:VEVENT`,
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gr8escape-${room.name.toLowerCase().replace(/\s+/g, '-')}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-white/10 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xl font-black text-white tracking-tight">
            THE GR8 <span className="text-gr8-red">ESCAPE</span>
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="mb-8">
          {confirming ? (
            <Loader2 size={64} className="text-gr8-gold mx-auto mb-4 animate-spin" />
          ) : isConfirmed ? (
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
          ) : (
            <AlertCircle size={64} className="text-yellow-400 mx-auto mb-4" />
          )}

          <h1 className="text-3xl font-black text-white mb-2">
            {confirming ? 'Confirming Payment...' : isConfirmed ? 'Booking Confirmed!' : 'Booking Received'}
          </h1>
          <p className="text-gray-400">
            Reference: <span className="text-gr8-gold font-mono font-bold">{booking.reference}</span>
          </p>
        </div>

        <div className="bg-[#1e1e1e] border border-gray-700/50 rounded-xl p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            {room && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: room.color }} />}
            <span className="text-lg font-bold text-white">{room?.name || 'Escape Room'}</span>
          </div>
          <div className="space-y-3 text-sm">
            {timeSlot && (
              <div className="flex items-center gap-3 text-gray-400">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-white">
                  {format(new Date(timeSlot.date), 'EEEE, MMMM d, yyyy')} • {timeSlot.start_time} — {timeSlot.end_time}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-400">
              <Clock size={16} className="text-gray-500" />
              <span className="text-white">{room?.duration_minutes || 60} minutes</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Users size={16} className="text-gray-500" />
              <span className="text-white">{booking.player_count} players</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <span className="text-gray-500">👤</span>
              <span className="text-white">{booking.customer_name} ({booking.customer_email})</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between">
            <span className="text-gray-400">Total</span>
            <span className="text-gr8-gold font-bold text-lg">R{booking.total_amount}</span>
          </div>
        </div>

        {!isConfirmed && !confirming && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 text-sm text-left">
            <p className="text-yellow-400 font-bold mb-1">Payment Pending</p>
            <p className="text-gray-400">Your booking has been saved. We'll confirm once payment is received.</p>
          </div>
        )}

        {/* Share Waiver Link */}
        <div className="bg-[#1e1e1e] border border-gr8-red/30 rounded-xl p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} className="text-gr8-red" />
            <h3 className="text-lg font-bold text-white">Player Waiver</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            All players must sign an indemnity waiver before the game. Share this link with your group:
          </p>
          <div className="flex items-center gap-2 bg-white/5 border border-gray-700 rounded-lg p-3">
            <input
              readOnly
              value={`${window.location.origin}/waiver/${booking.reference}`}
              className="flex-1 bg-transparent text-sm text-gray-300 font-mono outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/waiver/${booking.reference}`)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gr8-red/20 text-gr8-red text-sm font-medium hover:bg-gr8-red/30 transition-colors"
            >
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Each player should open this link and sign before arriving. Waivers are also available at reception.
          </p>
        </div>

        {/* Calendar download */}
        <button onClick={downloadICS} className="w-full bg-white/5 border border-gray-700/50 rounded-xl p-4 mb-6 text-left hover:bg-white/10 transition-colors flex items-center gap-3">
          <Download size={20} className="text-gr8-gold" />
          <div>
            <p className="text-white font-medium text-sm">Add to Calendar</p>
            <p className="text-xs text-gray-500">Download .ics file for Google Calendar, Apple Calendar, Outlook</p>
          </div>
        </button>

        <div className="bg-white/5 border border-gray-700/50 rounded-xl p-4 mb-8 text-sm text-gray-400 text-left">
          <p className="mb-2">A confirmation email will be sent to <strong className="text-white">{booking.customer_email}</strong></p>
          <p>Please arrive <strong className="text-white">15 minutes early</strong>. No phones or recording devices allowed in the rooms.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-gr8 px-8 py-3 flex items-center justify-center gap-2">
            <Home size={18} /> Back to Home
          </Link>
          <Link to="/book" className="px-8 py-3 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2">
            Book Another Room
          </Link>
        </div>
      </div>
    </div>
  )
}
