import { useState, useEffect, createContext, useContext } from 'react'
import pb from './pocketbase'

export interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: 'grandmaster' | 'gamemaster'
  avatar_color: string
  is_active: boolean
  pin_code: string
  created: string
  updated: string
}

interface AuthContextType {
  staff: Staff | null
  login: (email: string, pin: string) => Promise<boolean>
  logout: () => void
  isGrandmaster: boolean
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  staff: null,
  login: async () => false,
  logout: () => {},
  isGrandmaster: false,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check stored session
    const stored = localStorage.getItem('gr8_staff')
    if (stored) {
      try {
        const s = JSON.parse(stored)
        setStaff(s)
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email: string, pin: string): Promise<boolean> => {
    try {
      // Find staff by email
      const result = await pb.collection('staff').getFirstListItem<Staff>(
        `email = "${email}" && is_active = true`
      )

      if (result && result.pin_code === pin) {
        setStaff(result)
        localStorage.setItem('gr8_staff', JSON.stringify(result))
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = () => {
    setStaff(null)
    localStorage.removeItem('gr8_staff')
  }

  return (
    <AuthContext.Provider value={{
      staff,
      login,
      logout,
      isGrandmaster: staff?.role === 'grandmaster',
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
