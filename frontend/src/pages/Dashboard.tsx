import { useEffect, useState } from 'react'
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react'
import pb, { type Room, type Booking } from '../lib/pocketbase'

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const r = await pb.collection('rooms').getFullList<Room>({ sort: 'sort_order' })
        setRooms(r)
        const b = await pb.collection('bookings').getFullList<Booking>({ sort: '-id', limit: 10 })
        setBookings(b)
      } catch (e) {
        console.error('Failed to load:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // PocketBase v0.25 doesn't expose 'created' field — show all bookings for now
  const todayBookings = bookings

  const stats = [
    { label: 'Rooms', value: rooms.length, icon: Calendar, color: 'text-gr8-red' },
    { label: 'Active Bookings', value: bookings.filter(b => b.status === 'confirmed').length, icon: Users, color: 'text-gr8-gold' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'text-yellow-500' },
    { label: 'Revenue', value: `R${bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + b.total_amount, 0)}`, icon: TrendingUp, color: 'text-green-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Game Master</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-dark">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room overview */}
      <div className="card-dark mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Rooms Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {rooms.map(room => (
            <div key={room.id} className="bg-white/5 rounded-lg p-3 border border-gray-700/50">
              <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: room.color }} />
              <p className="text-sm font-semibold text-white">{room.name}</p>
              <p className="text-xs text-gray-500">{room.duration_minutes}min • R{room.price_per_player}/pp</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card-dark">
        <h2 className="text-lg font-bold text-white mb-4">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings yet. They'll appear here once customers start booking.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Reference</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Players</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-gray-800/50 hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-xs text-gr8-gold">{b.reference}</td>
                    <td className="py-3 px-4 text-white">{b.customer_name}</td>
                    <td className="py-3 px-4 text-gray-400">{b.player_count}</td>
                    <td className="py-3 px-4 text-gray-400">R{b.total_amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
