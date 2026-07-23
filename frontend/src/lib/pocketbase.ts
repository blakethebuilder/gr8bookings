import PocketBase from 'pocketbase'

const pb = new PocketBase('/')
pb.autoCancellation(false)

// Clear any stale auth from admin panel visits
pb.authStore.clear()

export default pb

export interface Room {
  id: string
  name: string
  slug: string
  description: string
  story: string
  difficulty: number | null
  duration_minutes: number
  reset_buffer_minutes: number
  min_players: number
  max_players: number
  price_per_player: number
  currency: string
  image: string
  color: string
  is_active: boolean
  sort_order: number
  created: string
  updated: string
}

export interface TimeSlot {
  id: string
  room: string
  date: string
  start_time: string
  end_time: string
  status: 'available' | 'reserved' | 'full' | 'blocked'
  created: string
  updated: string
}

export interface Booking {
  id: string
  reference: string
  time_slot: string
  room: string
  customer_name: string
  customer_email: string
  customer_phone: string
  player_count: number
  price_per_player: number
  total_amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed'
  payment_method: string
  payment_id: string
  notes: string
  waiver_signed: boolean
  waiver_url: string
  reminder_sent: boolean
  created: string
  updated: string
  expand?: {
    room?: Room
    time_slot?: TimeSlot
  }
}

export interface GmBlock {
  id: string
  room: string
  date: string
  start_time: string
  end_time: string
  reason: string
  created: string
  updated: string
}
