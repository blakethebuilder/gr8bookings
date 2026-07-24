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
  password: string
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

  const login = async (email: string, password: string): Promise<{success: boolean; error?: string}> => {
    try {
      const result = await pb.collection('staff').getFirstListItem<Staff>(
        `email = "${email}" && is_active = true`
      )

      if (!result) {
        return { success: false, error: 'Staff account not found' }
      }

      if (result.password !== password) {
        return { success: false, error: 'Invalid password' }
      }

      setStaff(result)
      localStorage.setItem('gr8_staff', JSON.stringify(result))
      return { success: true }
    } catch (err: any) {
      console.error('[Auth] Login failed:', err)
      return { success: false, error: err?.message || 'Connection failed — is PocketBase running?' }
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
