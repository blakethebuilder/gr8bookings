import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import GameMaster from './pages/GameMaster'
import Rooms from './pages/Rooms'
import Bookings from './pages/Bookings'
import Settings from './pages/Settings'
import Book from './pages/Book'
import BookConfirm from './pages/BookConfirm'
import Waiver from './pages/Waiver'

function App() {
  return (
    <Routes>
      {/* Public booking flow (standalone layout) */}
      <Route path="/book" element={<Book />} />
      <Route path="/book/confirm/:reference" element={<BookConfirm />} />
      <Route path="/waiver/:id" element={<Waiver />} />

      {/* Game Master admin (sidebar layout) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gm" element={<GameMaster />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
