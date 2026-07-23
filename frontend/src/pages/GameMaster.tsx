import { useEffect, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { RefreshCw, Zap, UserPlus, Ban } from 'lucide-react'
import pb, { type Room, type Booking, type TimeSlot, type GmBlock } from '../lib/pocketbase'
import { useRealtime } from '../hooks/useRealtime'
import BlockModal from '../components/BlockModal'
import QuickBook from '../components/QuickBook'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  color: string
  backgroundColor?: string
  extendedProps: {
    type: 'booking' | 'block' | 'slot'
    status: string
    paymentStatus?: string
    roomName: string
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    playerCount?: number
    reference?: string
    waiverSigned?: boolean
  }
}

export default function GameMaster() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showQuickBook, setShowQuickBook] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date; room?: string } | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  const loadCalendarData = useCallback(async () => {
    try {
      const roomsData = await pb.collection('rooms').getFullList<Room>({
        sort: 'sort_order',
        filter: 'is_active = true',
      })
      setRooms(roomsData)

      const [bookingsData, blocksData, hostsData] = await Promise.all([
        pb.collection('bookings').getFullList<Booking>({
          filter: 'status != "cancelled"',
          expand: 'room,time_slot',
        }),
        pb.collection('gm_blocks').getFullList<GmBlock>({
          expand: 'room',
        }),
        pb.collection('game_hosts').getFullList({ expand: 'staff' }).catch(() => [] as any[]),
      ])

      // Build host lookup: bookingId → GM name
      const hostMap: Record<string, string> = {}
      const hostsArr = Array.isArray(hostsData) ? hostsData : []
      for (const h of hostsArr) {
        hostMap[h.booking] = h.expand?.staff?.name || ''
      }

      const calendarEvents: CalendarEvent[] = []

      for (const b of bookingsData) {
        const room = roomsData.find(r => r.id === b.room)
        const ts = b.expand?.time_slot as TimeSlot | undefined
        if (!room || !ts) continue

        const gmName = hostMap[b.id]
        const dateStr = ts.date.split(' ')[0]
        calendarEvents.push({
          id: `booking-${b.id}`,
          title: `${b.customer_name} (${b.player_count}p)${gmName ? ` • ${gmName}` : ''}`,
          start: `${dateStr}T${ts.start_time}:00`,
          end: `${dateStr}T${ts.end_time}:00`,
          color: room.color,
          extendedProps: {
            type: 'booking',
            status: b.status,
            paymentStatus: b.payment_status,
            roomName: room.name,
            customerName: b.customer_name,
            customerEmail: b.customer_email,
            customerPhone: b.customer_phone,
            playerCount: b.player_count,
            reference: b.reference,
            waiverSigned: b.waiver_signed,
          },
        })
      }

      for (const block of blocksData) {
        const room = roomsData.find(r => r.id === block.room)
        calendarEvents.push({
          id: `block-${block.id}`,
          title: block.reason || 'Blocked',
          start: `${block.date}T${block.start_time}`,
          end: `${block.date}T${block.end_time}`,
          color: '#6B7280',
          extendedProps: {
            type: 'block',
            status: 'blocked',
            roomName: room?.name || 'Unknown',
          },
        })
      }

      setEvents(calendarEvents)
    } catch (e) {
      console.error('Failed to load calendar data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCalendarData()
  }, [loadCalendarData])

  // Realtime subscriptions
  useRealtime('bookings', (action, record) => {
    console.log(`[SSE] Booking ${action}:`, record.id)
    loadCalendarData() // Reload on any booking change
  })

  useRealtime('gm_blocks', (action, record) => {
    console.log(`[SSE] Block ${action}:`, record.id)
    loadCalendarData()
  })

  useRealtime('time_slots', (action, record) => {
    console.log(`[SSE] Slot ${action}:`, record.id)
  })

  // Track realtime connection
  useEffect(() => {
    const checkConnection = () => {
      pb.health.check().then(() => setRealtimeConnected(true)).catch(() => setRealtimeConnected(false))
    }
    checkConnection()
    const interval = setInterval(checkConnection, 10000)
    return () => clearInterval(interval)
  }, [])

  const [slotAction, setSlotAction] = useState<'book' | 'block' | null>(null)

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
    })
    setSlotAction(null) // Show action picker
  }

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Game Master HQ</h1>
          <p className="text-gray-500 mt-1">Live booking calendar</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Realtime indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs">
            <Zap size={12} className={realtimeConnected ? 'text-green-400' : 'text-gray-600'} />
            <span className={realtimeConnected ? 'text-green-400' : 'text-gray-600'}>
              {realtimeConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={() => loadCalendarData()}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Room color legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {rooms.map(room => (
          <div key={room.id} className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
            {room.name}
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-gray-500" />
          GM Block
        </div>
      </div>

      {/* FullCalendar */}
      <div className="card-dark p-4 calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay',
          }}
          slotMinTime="10:00:00"
          slotMaxTime="19:00:00"
          slotDuration="00:30:00"
          allDaySlot={false}
          weekends={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="calc(100vh - 280px)"
          eventDisplay="block"
          nowIndicator={true}
        />
      </div>

      {/* Modals */}
      {showBlockModal && selectedSlot && (
        <BlockModal
          rooms={rooms}
          slot={selectedSlot}
          onClose={() => {
            setShowBlockModal(false)
            setSelectedSlot(null)
          }}
          onComplete={() => {
            setShowBlockModal(false)
            setSelectedSlot(null)
            loadCalendarData()
          }}
        />
      )}

      {showQuickBook && selectedSlot && (
        <QuickBook
          rooms={rooms}
          slot={selectedSlot}
          onClose={() => {
            setShowQuickBook(false)
            setSelectedSlot(null)
          }}
          onComplete={() => {
            setShowQuickBook(false)
            setSelectedSlot(null)
            loadCalendarData()
          }}
        />
      )}

      {/* Action picker when selecting empty slot */}
      {selectedSlot && !slotAction && !showBlockModal && !showQuickBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSlot(null)}>
          <div className="card-dark w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <p className="text-sm text-gray-400 mb-1">What would you like to do?</p>
            <p className="text-white font-bold mb-4">
              {format(selectedSlot.start, 'EEE, MMM d • HH:mm')} — {format(selectedSlot.end, 'HH:mm')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowQuickBook(true) }}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg bg-gr8-red/10 border border-gr8-red/30 hover:bg-gr8-red/20 transition-colors">
                <UserPlus size={24} className="text-gr8-red" />
                <span className="text-sm font-bold text-white">Book Session</span>
                <span className="text-xs text-gray-500">Walk-in or phone booking</span>
              </button>
              <button onClick={() => { setShowBlockModal(true) }}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-gray-700 hover:bg-white/10 transition-colors">
                <Ban size={24} className="text-gray-400" />
                <span className="text-sm font-bold text-white">Block Slot</span>
                <span className="text-xs text-gray-500">Maintenance or event</span>
              </button>
            </div>
            <button onClick={() => setSelectedSlot(null)} className="w-full mt-3 text-sm text-gray-500 hover:text-white py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="card-dark w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent.backgroundColor }} />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {selectedEvent.extendedProps.type === 'booking' ? 'Booking' : 'GM Block'}
                </span>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-white text-xl">&times;</button>
            </div>

            {selectedEvent.extendedProps.type === 'booking' ? (
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-bold text-white">{selectedEvent.extendedProps.customerName}</p>
                  <p className="text-sm text-gray-400">{selectedEvent.extendedProps.roomName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Reference</p>
                    <p className="text-gr8-gold font-mono text-sm">{selectedEvent.extendedProps.reference}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Players</p>
                    <p className="text-white font-bold">{selectedEvent.extendedProps.playerCount}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Booking Status</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      selectedEvent.extendedProps.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      selectedEvent.extendedProps.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>{selectedEvent.extendedProps.status}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Payment</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      selectedEvent.extendedProps.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{selectedEvent.extendedProps.paymentStatus}</span>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Email</span><span className="text-white">{selectedEvent.extendedProps.customerEmail}</span>
                  </div>
                  {selectedEvent.extendedProps.customerPhone && (
                    <div className="flex justify-between text-gray-400">
                      <span>Phone</span><span className="text-white">{selectedEvent.extendedProps.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Waiver</span>
                    <span className={selectedEvent.extendedProps.waiverSigned ? 'text-green-400' : 'text-yellow-400'}>
                      {selectedEvent.extendedProps.waiverSigned ? '✓ Signed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold text-white mb-2">{selectedEvent.title}</p>
                <p className="text-sm text-gray-400">
                  {selectedEvent.start && format(selectedEvent.start, 'EEE, MMM d • HH:mm')}
                  {selectedEvent.end && ` — ${format(selectedEvent.end, 'HH:mm')}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

<style>{`
  /* FullCalendar dark theme */
  .calendar-wrapper .fc {
    --fc-bg-event: rgba(255,255,255,0.03);
    --fc-border-color: #333;
    --fc-button-bg-color: #1e1e1e;
    --fc-button-border-color: #333;
    --fc-button-hover-bg-color: #333;
    --fc-button-hover-border-color: #555;
    --fc-button-active-bg-color: #E53935;
    --fc-button-active-border-color: #E53935;
    --fc-today-bg-color: rgba(229,57,53,0.05);
    --fc-page-bg-color: transparent;
    --fc-neutral-bg-color: #1a1a1a;
    --fc-list-event-hover-bg-color: #222;
  }
  .calendar-wrapper .fc .fc-toolbar-title {
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
  }
  .calendar-wrapper .fc .fc-button {
    color: #ccc;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 6px;
  }
  .calendar-wrapper .fc .fc-button-active {
    color: white !important;
  }
  .calendar-wrapper .fc .fc-timegrid-slot-label {
    color: #888;
    font-size: 0.75rem;
  }
  .calendar-wrapper .fc .fc-col-header-cell {
    background: #1a1a1a;
    color: #ccc;
    font-weight: 600;
    font-size: 0.8rem;
    padding: 8px 0;
  }
  .calendar-wrapper .fc .fc-col-header-cell-cushion {
    color: #ccc;
  }
  .calendar-wrapper .fc .fc-timegrid-slot {
    height: 2rem;
  }
  .calendar-wrapper .fc .fc-timegrid-slot-minor {
    border-color: #222;
  }
  .calendar-wrapper .fc .fc-timegrid-divider {
    border-color: #333;
  }
  .calendar-wrapper .fc .fc-timegrid-now-indicator-line {
    border-color: #E53935;
  }
  .calendar-wrapper .fc .fc-timegrid-now-indicator-arrow {
    border-color: #E53935;
  }
  .calendar-wrapper .fc .fc-event {
    border-radius: 4px;
    font-size: 0.75rem;
    padding: 2px 6px;
    border: none;
    font-weight: 500;
  }
  .calendar-wrapper .fc .fc-daygrid-day {
    background: transparent;
  }
  .calendar-wrapper .fc .fc-scrollgrid {
    border-color: #333;
  }
  .calendar-wrapper .fc th {
    border-color: #333;
  }
  .calendar-wrapper .fc td {
    border-color: #222;
  }
  .calendar-wrapper .fc .fc-timegrid-body {
    min-height: 400px;
  }
`}</style>
