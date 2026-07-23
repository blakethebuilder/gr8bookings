import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Calendar, BookOpen, Settings, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gm', icon: CalendarDays, label: 'Game Master HQ' },
  { to: '/rooms', icon: Calendar, label: 'Rooms & Slots' },
  { to: '/bookings', icon: BookOpen, label: 'Bookings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-gr8-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-gr8-card border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black text-white tracking-tight">
            THE GR8 <span className="text-gr8-red">ESCAPE</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Game Master HQ</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 w-full transition-colors">
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
