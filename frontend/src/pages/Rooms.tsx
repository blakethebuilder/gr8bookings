import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import pb, { type Room } from '../lib/pocketbase'

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const r = await pb.collection('rooms').getFullList<Room>({ sort: 'sort_order' })
        setRooms(r)
      } catch (e) {
        console.error('Failed to load rooms:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading rooms...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Rooms & Time Slots</h1>
          <p className="text-gray-500 mt-1">Manage escape rooms and availability</p>
        </div>
      </div>

      {/* Room cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="card-dark group hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: room.color }}
                />
                <h3 className="text-lg font-bold text-white">{room.name}</h3>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white">
                  <Edit size={14} />
                </button>
                <button className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{room.description}</p>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-white/5 rounded p-2">
                <p className="text-gr8-red font-bold text-sm">{room.duration_minutes}min</p>
                <p className="text-[10px] text-gray-500 uppercase">Duration</p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-gr8-gold font-bold text-sm">{room.min_players}-{room.max_players}</p>
                <p className="text-[10px] text-gray-500 uppercase">Players</p>
              </div>
              <div className="bg-white/5 rounded p-2">
                <p className="text-green-400 font-bold text-sm">R{room.price_per_player}</p>
                <p className="text-[10px] text-gray-500 uppercase">Per person</p>
              </div>
            </div>

            {room.difficulty && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Difficulty</span>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(room.difficulty / 10) * 100}%`,
                      backgroundColor: room.color,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white">{room.difficulty}/10</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                room.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-500'
              }`}>
                {room.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-[10px] text-gray-600">Reset: {room.reset_buffer_minutes}min</span>
            </div>
          </div>
        ))}

        {/* Add room card */}
        <button className="card-dark border-dashed border-gray-700 hover:border-gr8-red/50 flex flex-col items-center justify-center min-h-[200px] text-gray-500 hover:text-gr8-red transition-colors">
          <Plus size={32} className="mb-2" />
          <span className="text-sm font-medium">Add Room</span>
        </button>
      </div>
    </div>
  )
}
