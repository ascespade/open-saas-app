'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'
import type { User as AuthUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, username?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUser = async (authUserId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()

    if (!error && data) {
      setUser(data)
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user)
        fetchUser(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user)
        await fetchUser(session.user.id)
      } else {
        setAuthUser(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || null,
        },
      },
    })

    if (error) throw new Error(error.message)

    if (data.user) {
      setAuthUser(data.user)
      // User record will be created by trigger, but we can fetch it
      if (data.user) {
        await fetchUser(data.user.id)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw new Error(error.message)

    if (data.user) {
      setAuthUser(data.user)
      await fetchUser(data.user.id)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
    setAuthUser(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (authUser) {
      await fetchUser(authUser.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
