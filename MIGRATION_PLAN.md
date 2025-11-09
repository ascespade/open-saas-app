# خطة التحويل الكامل: Wasp → Next.js App Router + Supabase

## 📋 نظرة عامة

هذه خطة تفصيلية للتحويل الكامل من Wasp إلى Next.js App Router مع Supabase.

**نسبة النجاح المتوقعة:** 60-70%
**الوقت المقدر:** 6-10 أسابيع
**الصعوبة:** متوسطة إلى عالية

---

## 🎯 المرحلة 1: الإعداد والتحضير (أسبوع 1)

### 1.1 إنشاء Next.js Project

```bash
npx create-next-app@latest open-saas-nextjs --typescript --tailwind --app
cd open-saas-nextjs
```

### 1.2 تثبيت Dependencies

```bash
# Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# UI Components (نفس المكتبات المستخدمة)
npm install @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-checkbox
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label
npm install @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-separator
npm install @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-toast

# Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Charts
npm install apexcharts react-apexcharts

# Utilities
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react vanilla-cookieconsent

# Payment
npm install stripe @lemonsqueezy/lemonsqueezy.js

# AWS (للـ File Upload)
npm install @aws-sdk/client-s3 @aws-sdk/s3-presigned-post @aws-sdk/s3-request-presigner

# AI
npm install openai

# Analytics
npm install @google-analytics/data
```

### 1.3 إعداد Supabase

1. إنشاء Supabase Project
2. نسخ Database URL و Anon Key
3. إنشاء `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 1.4 إعداد Supabase Client

إنشاء `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

إنشاء `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

---

## 🗄️ المرحلة 2: Database Migration (أسبوع 1-2)

### 2.1 تحويل Prisma Schema إلى Supabase Tables

من `schema.prisma` إلى Supabase SQL:

```sql
-- User Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  payment_processor_user_id TEXT UNIQUE,
  lemon_squeezy_customer_portal_url TEXT,
  subscription_status TEXT,
  subscription_plan TEXT,
  date_paid TIMESTAMP WITH TIME ZONE,
  credits INTEGER DEFAULT 3
);

-- Page Table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  component_tree TEXT
);

-- Component Table
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  component_id TEXT NOT NULL,
  parent_id TEXT,
  props TEXT,
  styles TEXT,
  "order" INTEGER DEFAULT 0
);

-- Task Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  time TEXT DEFAULT '1',
  is_done BOOLEAN DEFAULT FALSE
);

-- GptResponse Table
CREATE TABLE gpt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);

-- File Table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  s3_key TEXT NOT NULL
);

-- DailyStats Table
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW() UNIQUE,
  total_views INTEGER DEFAULT 0,
  prev_day_views_change_percent TEXT DEFAULT '0',
  user_count INTEGER DEFAULT 0,
  paid_user_count INTEGER DEFAULT 0,
  user_delta INTEGER DEFAULT 0,
  paid_user_delta INTEGER DEFAULT 0,
  total_revenue DOUBLE PRECISION DEFAULT 0,
  total_profit DOUBLE PRECISION DEFAULT 0
);

-- PageViewSource Table
CREATE TABLE page_view_sources (
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  daily_stats_id INTEGER REFERENCES daily_stats(id),
  visitors INTEGER DEFAULT 0,
  PRIMARY KEY (date, name)
);

-- ContactFormMessage Table
CREATE TABLE contact_form_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Logs Table
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message TEXT NOT NULL,
  level TEXT NOT NULL
);
```

### 2.2 إعداد Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own pages" ON pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pages" ON pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pages" ON pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pages" ON pages
  FOR DELETE USING (auth.uid() = user_id);
```

### 2.3 إنشاء TypeScript Types

إنشاء `types/database.ts`:

```typescript
export type User = {
  id: string
  created_at: string
  email: string | null
  username: string | null
  is_admin: boolean
  payment_processor_user_id: string | null
  lemon_squeezy_customer_portal_url: string | null
  subscription_status: string | null
  subscription_plan: string | null
  date_paid: string | null
  credits: number
}

export type Page = {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  name: string
  slug: string
  is_published: boolean
  published_at: string | null
  component_tree: string | null
}

export type Component = {
  id: string
  created_at: string
  updated_at: string
  page_id: string
  type: string
  component_id: string
  parent_id: string | null
  props: string | null
  styles: string | null
  order: number
}

// ... باقي الـ Types
```

---

## 🔐 المرحلة 3: Authentication Migration (أسبوع 2-3)

### 3.1 إعداد Supabase Auth

إنشاء `lib/auth.ts`:

```typescript
import { supabase } from './supabase/client'

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

### 3.2 إنشاء Auth Context

إنشاء `contexts/AuthContext.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
```

### 3.3 تحويل Auth Pages

من `src/auth/LoginPage.tsx` إلى `app/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signIn(email, password)
      router.push('/demo-app')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit">Login</Button>
      </form>
    </div>
  )
}
```

---

## 🔄 المرحلة 4: Operations → API Routes (أسبوع 3-4)

### 4.1 تحويل Wasp Operations إلى Next.js API Routes

**من Wasp:**
```typescript
// src/page-builder/operations.ts
export const savePage: SavePage<{...}, Page> = async (args, context) => {
  const user = context.user
  // ... logic
}
```

**إلى Next.js:**
```typescript
// app/api/pages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, slug, componentTree } = body

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
      { status: 400 }
    )
  }

  if (id) {
    // Update existing page
    const { data: existingPage } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Check if slug is taken
    const { data: slugConflict } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .eq('user_id', user.id)
      .neq('id', id)
      .single()

    if (slugConflict) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 400 })
    }

    const { data: updatedPage } = await supabase
      .from('pages')
      .update({
        name,
        slug,
        component_tree: componentTree || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    return NextResponse.json(updatedPage)
  } else {
    // Create new page
    const { data: slugConflict } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .eq('user_id', user.id)
      .single()

    if (slugConflict) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 400 })
    }

    const { data: newPage } = await supabase
      .from('pages')
      .insert({
        name,
        slug,
        component_tree: componentTree || '',
        user_id: user.id,
        is_published: false,
      })
      .select()
      .single()

    return NextResponse.json(newPage)
  }
}
```

### 4.2 تحويل Queries إلى API Routes

**من Wasp:**
```typescript
// src/page-builder/operations.ts
export const getUserPages: GetUserPages<{}, Page[]> = async (args, context) => {
  const user = context.user
  const pages = await context.entities.Page.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  })
  return pages
}
```

**إلى Next.js:**
```typescript
// app/api/pages/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return NextResponse.json(pages)
}
```

### 4.3 إنشاء Client-side Hooks

إنشاء `hooks/usePages.ts`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Page } from '@/types/database'

export function usePages() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError(new Error('Unauthorized'))
        return
      }

      const { data, error: fetchError } = await supabase
        .from('pages')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError
      setPages(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const savePage = async (pageData: {
    id?: string
    name: string
    slug: string
    componentTree: string | null
  }) => {
    const response = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save page')
    }

    const savedPage = await response.json()
    await fetchPages() // Refresh list
    return savedPage
  }

  const deletePage = async (id: string) => {
    const response = await fetch(`/api/pages/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete page')
    }

    await fetchPages() // Refresh list
  }

  return { pages, loading, error, savePage, deletePage, refetch: fetchPages }
}
```

---

## 📄 المرحلة 5: Pages Migration (أسبوع 4-5)

### 5.1 تحويل Pages من Wasp إلى Next.js

**من Wasp:**
```wasp
route PageBuilderListRoute { path: "/page-builder", to: PageBuilderListPage }
page PageBuilderListPage {
  authRequired: true,
  component: import PageBuilderListPage from "@src/page-builder/PageListPage"
}
```

**إلى Next.js:**
```typescript
// app/page-builder/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePages } from '@/hooks/usePages'
import PageListPage from '@/components/page-builder/PageListPage'

export default function PageBuilderListPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <PageListPage />
}
```

### 5.2 تحويل Components

نقل React components كما هي مع تعديل الـ imports:

**من:**
```typescript
import { useQuery, useAction } from 'wasp/client/operations'
import { getPage, savePage } from 'wasp/client/operations'
import { useAuth } from 'wasp/client/auth'
```

**إلى:**
```typescript
import { usePages } from '@/hooks/usePages'
import { useAuth } from '@/contexts/AuthContext'
```

---

## 🔧 المرحلة 6: Features Migration (أسبوع 5-7)

### 6.1 Page Builder

1. نقل components من `src/page-builder/components/` إلى `components/page-builder/`
2. تحديث imports
3. تحويل operations إلى API routes
4. تحديث hooks

### 6.2 File Upload

تحويل AWS S3 integration:

```typescript
// app/api/files/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  // Upload to S3
  const s3Client = new S3Client({ region: process.env.AWS_REGION! })
  const key = `${user.id}/${Date.now()}-${file.name}`

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
    })
  )

  // Save to database
  const { data: fileRecord } = await supabase
    .from('files')
    .insert({
      user_id: user.id,
      name: file.name,
      type: file.type,
      s3_key: key,
    })
    .select()
    .single()

  return NextResponse.json(fileRecord)
}
```

### 6.3 Payment Integration

تحويل Stripe integration:

```typescript
// app/api/payments/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { planId } = await request.json()

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email!,
    payment_method_types: ['card'],
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
```

### 6.4 AI Integration

تحويل OpenAI integration:

```typescript
// app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { prompt } = await request.json()

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  })

  const content = completion.choices[0]?.message?.content || ''

  // Save to database
  const { data: gptResponse } = await supabase
    .from('gpt_responses')
    .insert({
      user_id: user.id,
      content,
    })
    .select()
    .single()

  return NextResponse.json(gptResponse)
}
```

---

## 🧪 المرحلة 7: Testing & Polish (أسبوع 7-8)

### 7.1 Unit Tests

```typescript
// __tests__/api/pages.test.ts
import { POST } from '@/app/api/pages/route'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

describe('POST /api/pages', () => {
  it('should create a new page', async () => {
    // Test implementation
  })
})
```

### 7.2 Integration Tests

```typescript
// __tests__/integration/page-builder.test.ts
describe('Page Builder Integration', () => {
  it('should create, update, and delete pages', async () => {
    // Test implementation
  })
})
```

### 7.3 Performance Optimization

1. إضافة caching للـ API routes
2. استخدام React Server Components حيث ممكن
3. Optimize database queries
4. Add loading states

---

## 📝 Checklist للتحويل

### Database
- [ ] تحويل Prisma schema إلى Supabase SQL
- [ ] إعداد Row Level Security (RLS)
- [ ] إنشاء TypeScript types
- [ ] Migrate existing data

### Authentication
- [ ] إعداد Supabase Auth
- [ ] إنشاء Auth Context
- [ ] تحويل Login page
- [ ] تحويل Signup page
- [ ] تحويل Password reset
- [ ] تحويل Email verification

### API Routes
- [ ] تحويل Page Builder operations
- [ ] تحويل File Upload operations
- [ ] تحويل Payment operations
- [ ] تحويل AI operations
- [ ] تحويل User operations
- [ ] تحويل Analytics operations

### Pages
- [ ] تحويل Landing page
- [ ] تحويل Page Builder pages
- [ ] تحويل Admin dashboard
- [ ] تحويل User account page
- [ ] تحويل Pricing page

### Components
- [ ] نقل UI components
- [ ] تحديث imports
- [ ] تحويل data fetching
- [ ] إضافة loading states

### Features
- [ ] Page Builder
- [ ] File Upload
- [ ] Payment Integration
- [ ] AI Integration
- [ ] Analytics Dashboard

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

---

## 🚀 Deployment

### 7.1 Vercel Deployment

```bash
npm install -g vercel
vercel
```

### 7.2 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

---

## 📚 Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ⚠️ ملاحظات مهمة

1. **Authentication**: Supabase Auth مختلف تماماً عن Wasp Auth - يحتاج إعادة كتابة كاملة
2. **Database Access**: Prisma → Supabase Client - syntax مختلف تماماً
3. **Operations**: Wasp operations → Next.js API Routes - يحتاج إعادة هيكلة
4. **Routing**: Wasp routing → Next.js App Router - structure مختلف
5. **Type Safety**: TypeScript types تحتاج إعادة تعريف

---

## 🎯 الخلاصة

التحويل ممكن لكنه يتطلب:
- **6-10 أسابيع** من العمل المكثف
- **فريق مكون من 2-3 مطورين**
- **إعادة كتابة 60-70%** من الكود
- **اختبار شامل** لكل feature

**نسبة النجاح المتوقعة:** 60-70%

