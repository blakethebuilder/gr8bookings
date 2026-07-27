import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp,
  BarChart3,
  Loader2,
  CreditCard,
  Wallet,
  Calendar,
  Clock,
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import pb, { type Room, type Booking, type TimeSlot } from '../lib/pocketbase'
import { useRealtime } from '../hooks/useRealtime'

interface RoomRevenue {
  room: Room
  totalBookings: number
  paidBookings: number
  revenue: number
  depositRevenue: number
  fullPaymentRevenue: number
  thisWeekRevenue: number
  thisMonthRevenue: number
}

export default function Finances() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [roomsData, bookingsData, slotsData] = await Promise.all([
        pb.collection('rooms').getFullList<Room>({ sort: 'sort_order' }),
        pb.collection('bookings').getFullList<Booking>({ sort: '-id' }),
        pb.collection('time_slots').getFullList<TimeSlot>({ sort: 'date,start_time' }),
      ])
      setRooms(roomsData)
      setBookings(bookingsData)
      setTimeSlots(slotsData)
    } catch (e) {
      console.error('Failed to load finance data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])
  useRealtime('bookings', () => loadData())

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Build booking → slot date map
  const bookingDate = useMemo(() => {
    const map = new Map<string, string>()
    for (const slot of timeSlots) {
      map.set(slot.id, slot.date)
    }
    return map
  }, [timeSlots])

  const paidBookings = useMemo(() => bookings.filter(b => b.payment_status === 'paid'), [bookings])

  const revenueAllTime = useMemo(() => {
    return paidBookings.reduce((sum, b) => sum + b.total_amount, 0)
  }, [paidBookings])

  const revenueThisWeek = useMemo(() => {
    return paidBookings
      .filter(b => {
        const date = bookingDate.get(b.time_slot)
        if (!date) return false
        try { return isWithinInterval(parseISO(date), { start: weekStart, end: weekEnd }) } catch { return false }
      })
      .reduce((sum, b) => sum + b.total_amount, 0)
  }, [paidBookings, bookingDate, weekStart, weekEnd])

  const revenueThisMonth = useMemo(() => {
    return paidBookings
      .filter(b => {
        const date = bookingDate.get(b.time_slot)
        if (!date) return false
        try { return isWithinInterval(parseISO(date), { start: monthStart, end: monthEnd }) } catch { return false }
      })
      .reduce((sum, b) => sum + b.total_amount, 0)
  }, [paidBookings, bookingDate, monthStart, monthEnd])

  const bookingsThisWeek = useMemo(() => {
    return bookings.filter(b => {
      const date = bookingDate.get(b.time_slot)
      if (!date) return false
      try { return isWithinInterval(parseISO(date), { start: weekStart, end: weekEnd }) } catch { return false }
    }).length
  }, [bookings, bookingDate, weekStart, weekEnd])

  const bookingsThisMonth = useMemo(() => {
    return bookings.filter(b => {
      const date = bookingDate.get(b.time_slot)
      if (!date) return false
      try { return isWithinInterval(parseISO(date), { start: monthStart, end: monthEnd }) } catch { return false }
    }).length
  }, [bookings, bookingDate, monthStart, monthEnd])

  const roomRevenue = useMemo(() => {
    return rooms.map(room => {
      const roomBookings = bookings.filter(b => b.room === room.id)
      const paid = roomBookings.filter(b => b.payment_status === 'paid')

      const thisWeekPaid = paid.filter(b => {
        const date = bookingDate.get(b.time_slot)
        if (!date) return false
        try { return isWithinInterval(parseISO(date), { start: weekStart, end: weekEnd }) } catch { return false }
      })

      const thisMonthPaid = paid.filter(b => {
        const date = bookingDate.get(b.time_slot)
        if (!date) return false
        try { return isWithinInterval(parseISO(date), { start: monthStart, end: monthEnd }) } catch { return false }
      })

      return {
        room,
        totalBookings: roomBookings.length,
        paidBookings: paid.length,
        revenue: paid.reduce((sum, b) => sum + b.total_amount, 0),
        depositRevenue: paid
          .filter(b => b.payment_type === 'deposit')
          .reduce((sum, b) => sum + (b.deposit_amount || 640), 0),
        fullPaymentRevenue: paid
          .filter(b => b.payment_type === 'full')
          .reduce((sum, b) => sum + b.total_amount, 0),
        thisWeekRevenue: thisWeekPaid.reduce((sum, b) => sum + b.total_amount, 0),
        thisMonthRevenue: thisMonthPaid.reduce((sum, b) => sum + b.total_amount, 0),
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [rooms, bookings, bookingDate, weekStart, weekEnd, monthStart, monthEnd])

  const paymentBreakdown = useMemo(() => {
    const paid = bookings.filter(b => b.payment_status === 'paid')
    const unpaid = bookings.filter(b => b.payment_status === 'unpaid')
    const failed = bookings.filter(b => b.payment_status === 'failed')
    const refunded = bookings.filter(b => b.payment_status === 'refunded')

    return {
      paid: { count: paid.length, amount: paid.reduce((s, b) => s + b.total_amount, 0) },
      unpaid: { count: unpaid.length, amount: unpaid.reduce((s, b) => s + b.total_amount, 0) },
      failed: { count: failed.length, amount: failed.reduce((s, b) => s + b.total_amount, 0) },
      refunded: { count: refunded.length, amount: refunded.reduce((s, b) => s + b.total_amount, 0) },
    }
  }, [bookings])

  const depositSummary = useMemo(() => {
    const depositBookings = bookings.filter(b => b.payment_type === 'deposit')
    const depositsCollected = depositBookings
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.deposit_amount || 640), 0)
    const balanceDue = depositBookings
      .filter(b => b.status !== 'cancelled' && b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.balance_due || 0), 0)
    return { depositsCollected, balanceDue, depositCount: depositBookings.length }
  }, [bookings])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gr8-red" size={32} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          <span className="text-gr8-gold">Finances</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Revenue, payments, and financial breakdown.
        </p>
      </div>

      {/* Revenue Overview — this week, this month, all time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-dark">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gr8-red/10 text-gr8-red">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">R{revenueThisWeek.toLocaleString()}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                This Week · {bookingsThisWeek} bookings
              </p>
            </div>
          </div>
        </div>
        <div className="card-dark">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gr8-gold/10 text-gr8-gold">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">R{revenueThisMonth.toLocaleString()}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                This Month · {bookingsThisMonth} bookings
              </p>
            </div>
          </div>
        </div>
        <div className="card-dark">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">R{revenueAllTime.toLocaleString()}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">All Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Avg & count summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-dark text-center">
          <p className="text-2xl sm:text-3xl font-black text-white">
            R{paidBookings.length > 0
              ? Math.round(revenueAllTime / paidBookings.length).toLocaleString()
              : '0'}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Avg / Booking</p>
        </div>
        <div className="card-dark text-center">
          <p className="text-2xl sm:text-3xl font-black text-green-400">{paidBookings.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Paid Bookings</p>
        </div>
        <div className="card-dark text-center">
          <p className="text-2xl sm:text-3xl font-black text-gr8-gold">{bookings.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Bookings</p>
        </div>
        <div className="card-dark text-center">
          <p className="text-2xl sm:text-3xl font-black text-blue-400">{rooms.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Active Rooms</p>
        </div>
      </div>

      {/* Deposit vs Full Payment */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Wallet size={18} className="text-gr8-gold" />
          Deposit vs Full Payment
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-dark">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Deposits Collected</p>
            <p className="text-2xl font-bold text-gr8-gold">
              R{depositSummary.depositsCollected.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">{depositSummary.depositCount} deposit bookings</p>
          </div>
          <div className="card-dark">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Balance Due at Venue</p>
            <p className="text-2xl font-bold text-yellow-400">
              R{depositSummary.balanceDue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">To collect on arrival</p>
          </div>
          <div className="card-dark">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Full Payments</p>
            <p className="text-2xl font-bold text-green-400">
              R{roomRevenue.reduce((s, r) => s + r.fullPaymentRevenue, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">{bookings.filter(b => b.payment_type === 'full').length} bookings</p>
          </div>
          <div className="card-dark">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-white">R{revenueAllTime.toLocaleString()}</p>
            <p className="text-xs text-gray-600">All paid bookings</p>
          </div>
        </div>
      </div>

      {/* Payment Status Breakdown */}
      <div className="card-dark mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-gr8-red" />
          Payment Status Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{paymentBreakdown.paid.count}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Paid</p>
            <p className="text-sm text-green-400/70 mt-1">R{paymentBreakdown.paid.amount.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{paymentBreakdown.unpaid.count}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Unpaid</p>
            <p className="text-sm text-yellow-400/70 mt-1">R{paymentBreakdown.unpaid.amount.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{paymentBreakdown.failed.count}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Failed</p>
            <p className="text-sm text-red-400/70 mt-1">R{paymentBreakdown.failed.amount.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{paymentBreakdown.refunded.count}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Refunded</p>
            <p className="text-sm text-blue-400/70 mt-1">R{paymentBreakdown.refunded.amount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Per-Room Revenue */}
      <div className="card-dark">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-gr8-red" />
          Revenue by Room
        </h2>
        {roomRevenue.length === 0 ? (
          <p className="text-gray-500 text-sm">No revenue data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Room</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-medium">Bookings</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-medium">Paid</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">This Week</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">This Month</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">All Time</th>
                </tr>
              </thead>
              <tbody>
                {roomRevenue.map(({ room, totalBookings, paidBookings, revenue, thisWeekRevenue, thisMonthRevenue }) => {
                  const maxRev = Math.max(...roomRevenue.map(r => r.revenue), 1)
                  const barWidth = Math.round((revenue / maxRev) * 100)

                  return (
                    <tr key={room.id} className="border-b border-gray-800/50 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
                          <span className="font-bold text-white">{room.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-400">{totalBookings}</td>
                      <td className="py-3 px-4 text-center text-green-400 font-bold">{paidBookings}</td>
                      <td className="py-3 px-4 text-right text-gr8-gold font-bold">
                        R{thisWeekRevenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-white font-bold">
                        R{thisMonthRevenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div>
                          <span className="text-white font-bold">R{revenue.toLocaleString()}</span>
                          <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-1 max-w-[120px] ml-auto">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${barWidth}%`, backgroundColor: room.color }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
