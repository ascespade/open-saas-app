'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import Link from 'next/link'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { authUser, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && authUser && user) {
      router.push('/demo-app')
      router.refresh()
    }
  }, [authUser, user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log('🔐 Starting login process...')

      // Sign in directly with Supabase client
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('❌ Sign in error:', signInError.message)
        throw new Error(signInError.message)
      }

      if (!data.user || !data.session) {
        console.error('❌ No user or session returned')
        throw new Error('Login failed - no user or session returned')
      }

      console.log('✅ Sign in successful, user:', data.user.email)
      console.log('✅ Session token exists:', !!data.session.access_token)

      // Wait for session to be fully established and cookies to be set
      // Check session multiple times to ensure it's ready
      let sessionReady = false
      let sessionCheckCount = 0
      const maxChecks = 20

      while (!sessionReady && sessionCheckCount < maxChecks) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (session && session.user && !sessionError) {
          console.log(`✅ Session verified on attempt ${sessionCheckCount + 1}`)
          sessionReady = true
          break
        }

        sessionCheckCount++
        await new Promise(resolve => setTimeout(resolve, 250))
      }

      if (!sessionReady) {
        console.warn('⚠️ Session not fully verified after', maxChecks, 'attempts')
        console.warn('⚠️ Proceeding with redirect anyway...')
      }

      // Additional wait to ensure cookies are propagated to browser
      console.log('⏳ Waiting for cookie propagation...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify one more time
      const { data: { session: finalSession } } = await supabase.auth.getSession()
      if (finalSession) {
        console.log('✅ Final session check: OK')
      } else {
        console.warn('⚠️ Final session check: No session found')
      }

      // Use window.location.href for a full page reload
      // This ensures cookies are sent with the request to middleware
      console.log('🔄 Redirecting to /demo-app...')
      window.location.href = '/demo-app'

    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <div className="text-sm text-center space-y-2">
        <div>
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="underline">
            go to signup
          </Link>
          .
        </div>
        <div>
          Forgot your password?{' '}
          <Link href="/request-password-reset" className="underline">
            reset it
          </Link>
          .
        </div>
      </div>
    </form>
  )
}
