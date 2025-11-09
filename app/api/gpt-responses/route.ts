import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: responses, error } = await supabase
      .from('gpt_responses')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(responses || [])
  } catch (error) {
    console.error('Error fetching GPT responses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { hours } = body

    if (typeof hours !== 'number') {
      return NextResponse.json({ error: 'Invalid hours' }, { status: 400 })
    }

    // Get user's tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', authUser.id)

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    // Get user data to check subscription and credits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check subscription status
    const isSubscribed =
      user.subscription_status === 'active' ||
      user.subscription_status === 'cancel_at_period_end'

    if (!isSubscribed && user.credits <= 0) {
      return NextResponse.json(
        { error: 'User has no subscription and is out of credits' },
        { status: 402 }
      )
    }

    // Generate schedule with GPT (this would need to be implemented)
    // For now, we'll create a placeholder response
    const generatedSchedule = {
      tasks: [],
      taskItems: [],
    }

    // Save response
    const { data: response, error: responseError } = await supabase
      .from('gpt_responses')
      .insert({
        user_id: authUser.id,
        content: JSON.stringify(generatedSchedule),
      })
      .select()
      .single()

    if (responseError) {
      return NextResponse.json({ error: responseError.message }, { status: 500 })
    }

    // Decrement credits if not subscribed
    if (!isSubscribed && user.credits > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: user.credits - 1 })
        .eq('id', authUser.id)

      if (updateError) {
        console.error('Error decrementing credits:', updateError)
      }
    }

    return NextResponse.json(generatedSchedule, { status: 201 })
  } catch (error) {
    console.error('Error generating GPT response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
