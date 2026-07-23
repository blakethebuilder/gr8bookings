import { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import pb, { type Booking } from '../lib/pocketbase'

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function load() {
      try {
        const b = await pb.collection('bookings').getFullList<Booking>({
          sort: '-created',
          expand: 'room,time_slot',
        })
        setBookings(b)
      } catch (e) {
        console.error('Failed to load bookings:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading bookings...</div>
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
      <div className="flex gap-2 mb-6">
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
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Reference</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Players</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Payment</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Waiver</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-b border-gray-800/50 hover:bg-white/5 cursor-pointer">
                    <td className="py-3 px-4 font-mono text-xs text-gr8-gold">{b.reference}</td>
                    <td className="py-3 px-4 text-white font-medium">{b.customer_name}</td>
                    <td className="py-3 px-4 text-gray-400">{b.customer_email}</td>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        b.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        b.payment_status === 'unpaid' ? 'bg-yellow-500/20 text-yellow-400' :
                        b.payment_status === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {b.waiver_signed ? (
                        <span className="text-green-400 text-xs font-bold">✓ Signed</span>
                      ) : (
                        <span className="text-gray-600 text-xs">Pending</span>
                      )}
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
