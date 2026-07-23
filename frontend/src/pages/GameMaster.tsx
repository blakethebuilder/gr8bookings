import { useEffect, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { RefreshCw, Zap } from 'lucide-react'
import pb, { type Room, type Booking, type TimeSlot, type GmBlock } from '../lib/pocketbase'
import { useRealtime } from '../hooks/useRealtime'
import SlotGenerator from '../components/SlotGenerator'
import BlockModal from '../components/BlockModal'

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
  const [showSlotGen, setShowSlotGen] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date; room?: string } | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  const loadCalendarData = useCallback(async () => {
    try {
      const roomsData = await pb.collection('rooms').getFullList<Room>({
        sort: 'sort_order',
        filter: 'is_active = true',
      })
      setRooms(roomsData)

      const [bookingsData, blocksData] = await Promise.all([
        pb.collection('bookings').getFullList<Booking>({
          filter: 'status != "cancelled"',
          expand: 'room,time_slot',
        }),
        pb.collection('gm_blocks').getFullList<GmBlock>({
          expand: 'room',
        }),
      ])

      const calendarEvents: CalendarEvent[] = []

      for (const b of bookingsData) {
        const room = roomsData.find(r => r.id === b.room)
        const ts = b.expand?.time_slot as TimeSlot | undefined
        if (!room || !ts) continue

        // Use time_slot date/time, not booking.created
        const dateStr = ts.date.split(' ')[0] // "2026-07-24"
        calendarEvents.push({
          id: `booking-${b.id}`,
          title: `${b.customer_name} (${b.player_count}p)`,
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

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
    })
    setShowBlockModal(true)
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
            onClick={() => setShowSlotGen(true)}
            className="px-4 py-2 rounded-lg bg-gr8-red text-white text-sm font-bold hover:bg-gr8-red/80 transition-colors"
          >
            Generate Slots
          </button>
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
      <div className="card-dark p-4 overflow-hidden">
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
          slotDuration="00:15:00"
          allDaySlot={false}
          weekends={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          nowIndicator={true}
          businessHours={{
            daysOfWeek: [4, 5, 6, 0],
            startTime: '11:00',
            endTime: '18:00',
          }}
        />
      </div>

      {/* Modals */}
      {showSlotGen && (
        <SlotGenerator
          rooms={rooms}
          onClose={() => setShowSlotGen(false)}
          onComplete={() => {
            setShowSlotGen(false)
            loadCalendarData()
          }}
        />
      )}

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
