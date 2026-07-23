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
  extendedProps: {
    type: 'booking' | 'block' | 'slot'
    status: string
    roomName: string
    customerName?: string
    playerCount?: number
    reference?: string
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
          expand: 'room',
        }),
        pb.collection('gm_blocks').getFullList<GmBlock>({
          expand: 'room',
        }),
      ])

      const calendarEvents: CalendarEvent[] = []

      for (const b of bookingsData) {
        const room = roomsData.find(r => r.id === b.room)
        if (!room) continue

        calendarEvents.push({
          id: `booking-${b.id}`,
          title: `${b.customer_name} (${b.player_count}p)`,
          start: `${b.created.split('T')[0]}T${b.created.split('T')[1]?.slice(0, 5) || '11:00'}`,
          end: `${b.created.split('T')[0]}T${addMinutes(new Date(b.created), room.duration_minutes).toTimeString().slice(0, 5)}`,
          color: room.color,
          extendedProps: {
            type: 'booking',
            status: b.status,
            roomName: room.name,
            customerName: b.customer_name,
            playerCount: b.player_count,
            reference: b.reference,
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

  // Track realtime connection via subscription attempts
  useEffect(() => {
    pb.collection('_').getOne('').catch(() => {}).finally(() => setRealtimeConnected(true))
  }, [])

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
    })
    setShowBlockModal(true)
  }

  const handleEventClick = (clickInfo: any) => {
    const props = clickInfo.event.extendedProps
    if (props.type === 'booking') {
      alert(
        `Booking: ${props.reference}\n` +
        `Customer: ${props.customerName}\n` +
        `Room: ${props.roomName}\n` +
        `Players: ${props.playerCount}\n` +
        `Status: ${props.status}`
      )
    }
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
    </div>
  )
}

function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}
