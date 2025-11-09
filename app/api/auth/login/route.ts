import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create response object - this pattern matches middleware
    let response = NextResponse.next({
      request,
    })

    // Create Supabase client using the same pattern as middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            console.log('🍪 setAll called with', cookiesToSet.length, 'cookies')
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log(`   Setting cookie: ${name} = ${value.substring(0, 20)}...`)
            })

            // Update request cookies
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })

            // Create new response with cookies
            response = NextResponse.next({
              request,
            })

            // Set cookies in response
            cookiesToSet.forEach(({ name, value, options }) => {
              if (options) {
                response.cookies.set(name, value, options as any)
                console.log(`   ✅ Cookie set in response: ${name}`)
              } else {
                response.cookies.set(name, value)
                console.log(`   ✅ Cookie set in response (no options): ${name}`)
              }
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      console.error('Login failed - no user or session')
      return NextResponse.json(
        { error: 'Login failed - no user or session returned' },
        { status: 500 }
      )
    }

    console.log('✅ Login successful for user:', data.user.email)
    console.log('✅ Session created:', !!data.session)

    // Verify session
    const { data: { session: verifySession } } = await supabase.auth.getSession()
    console.log('✅ Session verification:', !!verifySession)

    // Get cookies from response
    const responseCookies = response.cookies.getAll()
    console.log('✅ Response cookies count:', responseCookies.length)
    responseCookies.forEach(cookie => {
      console.log(`   Cookie: ${cookie.name} = ${cookie.value.substring(0, 30)}...`)
    })

    // Create JSON response with the cookies from the supabase response
    const jsonResponse = NextResponse.json(
      { success: true, user: { id: data.user.id, email: data.user.email } },
      { status: 200 }
    )

    // Copy all cookies from the supabase response to the JSON response
    responseCookies.forEach(cookie => {
      jsonResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        ...cookie,
      } as any)
    })

    return jsonResponse
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
