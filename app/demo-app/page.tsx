'use client'

import { ArrowRight, Loader2, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useGptResponses } from '@/hooks/useGptResponses'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
} from '@/src/components/ui/card'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { ToastAction } from '@/src/components/ui/toast'
import { toast } from '@/src/hooks/use-toast'
import { cn } from '@/src/lib/utils'
import type {
  GeneratedSchedule,
  Task as ScheduleTask,
  TaskItem,
  TaskPriority,
} from '@/src/demo-ai-app/schedule'
import Link from 'next/link'

export default function DemoAppPage() {
  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-primary">AI</span> Day Scheduler
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg leading-8">
          This example app uses OpenAI's chat completions with function calling
          to return a structured JSON object. Try it out, enter your day's
          tasks, and let AI do the rest!
        </p>
        {/* begin AI-powered Todo List */}
        <Card className="bg-muted/10 my-8">
          <CardContent className="mx-auto my-8 space-y-10 px-6 py-10 sm:w-[90%] md:w-[70%] lg:w-[50%]">
            <NewTaskForm />
          </CardContent>
        </Card>
        {/* end AI-powered Todo List */}
      </div>
    </div>
  )
}

function NewTaskForm() {
  const { tasks, createTask, updateTask, deleteTask, loading: tasksLoading } = useTasks()
  const { generateResponse, loading: gptLoading } = useGptResponses()
  const [description, setDescription] = useState<string>('')
  const [todaysHours, setTodaysHours] = useState<number>(8)
  const [response, setResponse] = useState<GeneratedSchedule | null>({
    tasks: [
      {
        name: 'Respond to emails',
        priority: 'high' as TaskPriority,
      },
      {
        name: 'Learn WASP',
        priority: 'low' as TaskPriority,
      },
      {
        name: 'Read a book',
        priority: 'medium' as TaskPriority,
      },
    ],
    taskItems: [
      {
        description: 'Read introduction and chapter 1',
        time: 0.5,
        taskName: 'Read a book',
      },
      {
        description: 'Read chapter 2 and take notes',
        time: 0.3,
        taskName: 'Read a book',
      },
      {
        description: 'Read chapter 3 and summarize key points',
        time: 0.2,
        taskName: 'Read a book',
      },
      {
        description: 'Check and respond to important emails',
        time: 1,
        taskName: 'Respond to emails',
      },
      {
        description: 'Organize and prioritize remaining emails',
        time: 0.5,
        taskName: 'Respond to emails',
      },
      {
        description: 'Draft responses to urgent emails',
        time: 0.5,
        taskName: 'Respond to emails',
      },
      {
        description: 'Watch tutorial video on WASP',
        time: 0.5,
        taskName: 'Learn WASP',
      },
      {
        description: 'Complete online quiz on the basics of WASP',
        time: 1.5,
        taskName: 'Learn WASP',
      },
      {
        description: 'Review quiz answers and clarify doubts',
        time: 1,
        taskName: 'Learn WASP',
      },
    ],
  })
  const [isPlanGenerating, setIsPlanGenerating] = useState<boolean>(false)

  const handleSubmit = async () => {
    try {
      await createTask(description)
      setDescription('')
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'))
    }
  }

  const handleGeneratePlan = async () => {
    try {
      setIsPlanGenerating(true)
      const schedule = await generateResponse(todaysHours)
      if (schedule) {
        setResponse(schedule)
      }
    } catch (err: any) {
      if (err.message?.includes('402') || err.message?.includes('credits')) {
        toast({
          title: '⚠️ You are out of credits!',
          style: {
            minWidth: '400px',
          },
          action: (
            <ToastAction
              altText="Go to pricing page to buy credits/subscription"
              asChild
            >
              <Link href="/pricing">
                Go to pricing page <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </ToastAction>
          ),
        })
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } finally {
      setIsPlanGenerating(false)
    }
  }

  return (
    <div className="flex flex-col justify-center gap-10">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Input
            type="text"
            id="description"
            className="flex-1"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
          />
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!description}
            variant="default"
            size="default"
          >
            Add Task
          </Button>
        </div>
      </div>

      <div className="col-span-full space-y-10">
        {tasksLoading && (
          <div className="text-muted-foreground">Loading...</div>
        )}
        {tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Todo
                key={task.id}
                id={task.id}
                isDone={task.is_done}
                description={task.description}
                time={task.time}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            ))}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor="time"
                  className="text-muted-foreground text-nowrap text-sm font-semibold"
                >
                  How many hours will you work today?
                </Label>
                <Input
                  type="number"
                  id="time"
                  step={0.5}
                  min={1}
                  max={24}
                  className="min-w-[7rem] text-center"
                  value={todaysHours}
                  onChange={(e) => setTodaysHours(+e.currentTarget.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-center">
            Add tasks to begin
          </div>
        )}
      </div>

      <Button
        type="button"
        disabled={isPlanGenerating || tasks?.length === 0}
        onClick={() => handleGeneratePlan()}
        variant="default"
        size="default"
        className="w-full"
        data-testid="generate-schedule-button"
      >
        {isPlanGenerating ? (
          <>
            <Loader2 className="mr-2 inline-block animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Schedule'
        )}
      </Button>

      {!!response && (
        <div className="flex flex-col">
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Today's Schedule
          </h3>
          <Schedule schedule={response} />
        </div>
      )}
    </div>
  )
}

type TodoProps = {
  id: string
  isDone: boolean
  description: string
  time: string
  updateTask: (id: string, updates: { isDone?: boolean; time?: string }) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

function Todo({ id, isDone, description, time, updateTask, deleteTask }: TodoProps) {
  const handleCheckboxChange = async (checked: boolean) => {
    await updateTask(id, { isDone: checked })
  }

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateTask(id, { time: e.currentTarget.value })
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Checkbox
        checked={isDone}
        onCheckedChange={handleCheckboxChange}
        id={`task-${id}`}
      />
      <Label
        htmlFor={`task-${id}`}
        className={cn(
          'flex-1 cursor-pointer',
          isDone && 'text-muted-foreground line-through',
        )}
      >
        {description}
      </Label>
      <Input
        type="text"
        value={time}
        onChange={handleTimeChange}
        className="w-16 text-center"
        placeholder="1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function Schedule({ schedule }: { schedule: GeneratedSchedule }) {
  const taskItemsByTaskName = useMemo(() => {
    const map = new Map<string, TaskItem[]>()
    schedule.taskItems.forEach((item) => {
      const items = map.get(item.taskName) || []
      items.push(item)
      map.set(item.taskName, items)
    })
    return map
  }, [schedule.taskItems])

  const totalTime = useMemo(() => {
    return schedule.taskItems.reduce((acc, item) => acc + item.time, 0)
  }, [schedule.taskItems])

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground text-sm">
        Total time: {totalTime.toFixed(2)} hours
      </div>
      {schedule.tasks.map((task) => {
        const items = taskItemsByTaskName.get(task.name) || []
        return (
          <div key={task.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground font-semibold">{task.name}</h4>
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-medium',
                  task.priority === 'high' && 'bg-destructive/10 text-destructive',
                  task.priority === 'medium' && 'bg-warning/10 text-warning',
                  task.priority === 'low' && 'bg-muted text-muted-foreground',
                )}
              >
                {task.priority}
              </span>
            </div>
            <div className="space-y-1 pl-4">
              {items.map((item, index) => (
                <div key={index} className="text-muted-foreground text-sm">
                  • {item.description} ({item.time}h)
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
