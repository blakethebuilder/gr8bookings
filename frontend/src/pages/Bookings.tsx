import { useEffect, useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import pb, { type Booking, type Room, type TimeSlot } from '../lib/pocketbase'
import AssignGM from '../components/AssignGM'

interface HostInfo {
  staffName: string
  staffColor: string
  status: string
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Record<string, Room>>({})
  const [slots, setSlots] = useState<Record<string, TimeSlot>>({})
  const [hosts, setHosts] = useState<Record<string, HostInfo>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [assignModal, setAssignModal] = useState<{ booking: Booking; room: Room; timeSlot: TimeSlot } | null>(null)

  const loadData = async () => {
    try {
      const [bookingsData, roomsList, slotsList, hostsList] = await Promise.all([
        pb.collection('bookings').getFullList<Booking>({ sort: '-id' }),
        pb.collection('rooms').getFullList<Room>(),
        pb.collection('time_slots').getFullList<TimeSlot>(),
        pb.collection('game_hosts').getFullList({ expand: 'staff' }).catch(() => [] as any[]),
      ])

      // Build lookup maps
      const roomMap: Record<string, Room> = {}
      roomsList.forEach(r => { roomMap[r.id] = r })

      const slotMap: Record<string, TimeSlot> = {}
      slotsList.forEach(s => { slotMap[s.id] = s })

      const hostMap: Record<string, HostInfo> = {}
      const hostsArr = Array.isArray(hostsList) ? hostsList : []
      for (const h of hostsArr) {
        const staff = h.expand?.staff
        hostMap[h.booking] = {
          staffName: staff?.name || 'Unknown',
          staffColor: staff?.avatar_color || '#666',
          status: h.status,
        }
      }

      setRooms(roomMap)
      setSlots(slotMap)
      setHosts(hostMap)
      setBookings(bookingsData)
    } catch (e) {
      console.error('Failed to load bookings:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gr8-red" size={32} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Bookings</h1>
          <p className="text-gray-500 mt-1">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-gr8-red text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings table */}
      <div className="card-dark overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Ref</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Room</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Players</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">GM</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Payment</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Waiver</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const room = rooms[b.room]
                  const ts = slots[b.time_slot]
                  const host = hosts[b.id]

                  return (
                    <tr key={b.id} className="border-b border-gray-800/50 hover:bg-white/5">
                      <td className="py-3 px-4 font-mono text-xs text-gr8-gold">{b.reference}</td>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{b.customer_name}</p>
                        <p className="text-xs text-gray-500">{b.customer_email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: room?.color }} />
                          <span className="text-gray-300 text-xs">{room?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {ts ? `${format(new Date(ts.date), 'MMM d')} ${ts.start_time}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-center">{b.player_count}</td>
                      <td className="py-3 px-4 text-gray-400">R{b.total_amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {host ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ backgroundColor: host.staffColor }}>
                              {host.staffName[0]}
                            </div>
                            <span className="text-xs text-gray-300">{host.staffName}</span>
                          </div>
                        ) : room && ts ? (
                          <button
                            onClick={() => setAssignModal({ booking: b, room, timeSlot: ts })}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-gray-500 hover:text-gr8-red hover:bg-gr8-red/10 text-xs transition-colors"
                          >
                            <UserPlus size={12} /> Assign
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            b.payment_type === 'full' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {b.payment_type === 'full' ? 'Full' : 'Deposit'}
                          </span>
                          {b.balance_due > 0 && (
                            <p className="text-gray-500 mt-1">R{b.balance_due} due</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {b.waiver_signed ? (
                          <span className="text-green-400 text-xs font-bold">✓</span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign GM Modal */}
      {assignModal && (
        <AssignGM
          booking={assignModal.booking}
          room={assignModal.room}
          timeSlot={assignModal.timeSlot}
          onClose={() => setAssignModal(null)}
          onComplete={() => {
            setAssignModal(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}
