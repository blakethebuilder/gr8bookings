import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AuthGate from './components/AuthGate'
import Login from './pages/Login'
import GMDashboard from './pages/GMDashboard'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Bookings from './pages/Bookings'
import Settings from './pages/Settings'
import StaffManagement from './pages/StaffManagement'
import Book from './pages/Book'
import BookConfirm from './pages/BookConfirm'
import Waiver from './pages/Waiver'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/book" element={<Book />} />
      <Route path="/book/confirm/:reference" element={<BookConfirm />} />
      <Route path="/waiver/:id" element={<Waiver />} />

      {/* Staff routes (both roles) */}
      <Route element={<AuthGate allowedRoles={['grandmaster', 'gamemaster']} />}>
        <Route element={<Layout />}>
          <Route path="/gm" element={<GMDashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings" element={<Bookings />} />
        </Route>
      </Route>

      {/* Grandmaster-only routes */}
      <Route element={<AuthGate allowedRoles={['grandmaster']} />}>
        <Route element={<Layout />}>
          <Route path="/grandmaster" element={<Dashboard />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
