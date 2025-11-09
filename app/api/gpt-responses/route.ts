import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import type { GeneratedSchedule, Task as ScheduleTask, TaskItem, TaskPriority } from '@/src/demo-ai-app/schedule'
import type { Task } from '@/types/database'

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateScheduleWithGpt(
  tasks: Task[],
  hours: number,
): Promise<GeneratedSchedule | null> {
  const parsedTasks = tasks.map(({ description, time }) => ({
    description,
    time,
  }))

  const completion = await openAi.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'you are an expert daily planner. you will be given a list of main tasks and an estimated time to complete each task. You will also receive the total amount of hours to be worked that day. Your job is to return a detailed plan of how to achieve those tasks by breaking each task down into at least 3 subtasks each. MAKE SURE TO ALWAYS CREATE AT LEAST 3 SUBTASKS FOR EACH MAIN TASK PROVIDED BY THE USER! YOU WILL BE REWARDED IF YOU DO.',
      },
      {
        role: 'user',
        content: `I will work ${hours} hours today. Here are the tasks I have to complete: ${JSON.stringify(
          parsedTasks,
        )}. Please help me plan my day by breaking the tasks down into actionable subtasks with time and priority status.`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'parseTodaysSchedule',
          description: 'parses the days tasks and returns a schedule',
          parameters: {
            type: 'object',
            properties: {
              tasks: {
                type: 'array',
                description:
                  'Name of main tasks provided by user, ordered by priority',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Name of main task provided by user',
                    },
                    priority: {
                      type: 'string',
                      enum: ['low', 'medium', 'high'] as TaskPriority[],
                      description: 'task priority',
                    },
                  },
                },
              },
              taskItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    description: {
                      type: 'string',
                      description:
                        'detailed breakdown and description of sub-task related to main task. e.g., "Prepare your learning session by first reading through the documentation"',
                    },
                    time: {
                      type: 'number',
                      description:
                        'time allocated for a given subtask in hours, e.g. 0.5',
                    },
                    taskName: {
                      type: 'string',
                      description: 'name of main task related to subtask',
                    },
                  },
                },
              },
            },
            required: ['tasks', 'taskItems'],
          },
        },
      },
    ],
    tool_choice: {
      type: 'function',
      function: {
        name: 'parseTodaysSchedule',
      },
    },
    temperature: 1,
  })

  const gptResponse =
    completion?.choices[0]?.message?.tool_calls?.[0]?.function.arguments
  return gptResponse !== undefined ? JSON.parse(gptResponse) : null
}

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

    // Generate schedule with GPT
    console.log('Calling OpenAI API')
    const generatedSchedule = await generateScheduleWithGpt(
      tasks || [],
      hours,
    )

    if (generatedSchedule === null) {
      return NextResponse.json(
        { error: 'Encountered a problem in communication with OpenAI' },
        { status: 500 }
      )
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
      console.log('Decrementing credits and saving response')
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
