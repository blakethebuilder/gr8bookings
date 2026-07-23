import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Calendar, BookOpen, Settings, LogOut,
  Users, Crown
} from 'lucide-react'
import { useAuth } from '../lib/auth'

const gmNavItems = [
  { to: '/gm', icon: CalendarDays, label: 'My Games' },
]

const grandmasterNavItems = [
  { to: '/grandmaster', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/gm', icon: CalendarDays, label: 'My Games' },
  { to: '/rooms', icon: Calendar, label: 'Rooms' },
  { to: '/bookings', icon: BookOpen, label: 'Bookings' },
  { to: '/staff', icon: Users, label: 'Staff' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { staff, isGrandmaster, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = isGrandmaster ? grandmasterNavItems : gmNavItems

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gr8-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-gr8-card border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black text-white tracking-tight">
            THE GR8 <span className="text-gr8-red">ESCAPE</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isGrandmaster ? 'Grandmaster Portal' : 'Game Master HQ'}
          </p>
        </div>

        {/* User info */}
        {staff && (
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: staff.avatar_color }}
            >
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{staff.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {isGrandmaster ? <Crown size={10} className="text-gr8-red" /> : null}
                {isGrandmaster ? 'Grandmaster' : 'Game Master'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gr8-red/10 text-gr8-red'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
