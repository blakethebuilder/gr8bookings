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
  is_working: boolean
  pin_code: string
  created: string
  updated: string
}

interface AuthContextType {
  staff: Staff | null
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>
  logout: () => void
  isGrandmaster: boolean
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  staff: null,
  login: async () => ({ success: false }),
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
    const stored = localStorage.getItem('gr8_staff')
    if (stored && pb.authStore.isValid) {
      try {
        const s = JSON.parse(stored)
        setStaff(s)
      } catch {}
    } else {
      localStorage.removeItem('gr8_staff')
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{success: boolean; error?: string}> => {
    try {
      const { record, token } = await pb.collection('staff').authWithPassword(email, password)
      if (!record) {
        return { success: false, error: 'Staff account not found' }
      }
      if (!record.is_active) {
        return { success: false, error: 'Account is deactivated' }
      }
      setStaff(record as unknown as Staff)
      localStorage.setItem('gr8_staff', JSON.stringify(record))
      return { success: true }
    } catch (err: any) {
      console.error('[Auth] Login failed:', err)
      return { success: false, error: err?.message || 'Invalid email or PIN code' }
    }
  }

  const logout = () => {
    pb.authStore.clear()
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
