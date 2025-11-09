# أمثلة عملية للتحويل: Wasp → Next.js + Supabase

## 📋 أمثلة التحويل

### 1. تحويل Wasp Operation إلى Next.js API Route

#### Wasp (Before)

```typescript
// src/page-builder/operations.ts
import type { Page } from "wasp/entities";
import type { SavePage } from "wasp/server/operations";
import { HttpError } from "wasp/server";

export const savePage: SavePage<{
  id?: string;
  name: string;
  slug: string;
  componentTree: string | null;
}, Page> = async (args, context) => {
  const { id, name, slug, componentTree } = args;
  const user = context.user;

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  if (id) {
    const updatedPage = await context.entities.Page.update({
      where: { id },
      data: {
        name,
        slug,
        componentTree: componentTree || "",
        updatedAt: new Date(),
      },
    });
    return updatedPage;
  } else {
    const newPage = await context.entities.Page.create({
      data: {
        name,
        slug,
        componentTree: componentTree || "",
        userId: user.id,
        isPublished: false,
      },
    });
    return newPage;
  }
};
```

#### Next.js + Supabase (After)

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
    const { data: existingPage, error: fetchError } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPage) {
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

    const { data: updatedPage, error: updateError } = await supabase
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

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

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

    const { data: newPage, error: insertError } = await supabase
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

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(newPage)
  }
}
```

---

### 2. تحويل Wasp Query إلى Next.js API Route

#### Wasp (Before)

```typescript
// src/page-builder/operations.ts
export const getUserPages: GetUserPages<{}, Page[]> = async (args, context) => {
  const user = context.user;

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  const pages = await context.entities.Page.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return pages;
};
```

#### Next.js + Supabase (After)

```typescript
// app/api/pages/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: pages, error } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(pages || [])
}
```

---

### 3. تحويل Client-side Hook

#### Wasp (Before)

```typescript
// src/page-builder/PageBuilderPage.tsx
import { useQuery, useAction } from "wasp/client/operations";
import { getPage, savePage, deletePage } from "wasp/client/operations";
import { useAuth } from "wasp/client/auth";

export default function PageBuilderPage() {
  const { data: user } = useAuth();
  const { data: page, isLoading } = useQuery(
    getPage,
    pageId ? { id: pageId } : undefined
  );
  const savePageAction = useAction(savePage);
  const deletePageAction = useAction(deletePage);

  const handleSave = async () => {
    await savePageAction({
      id: pageId,
      name: pageName,
      slug: pageSlug,
      componentTree: JSON.stringify(componentTree),
    });
  };
}
```

#### Next.js + Supabase (After)

```typescript
// app/page-builder/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePages } from '@/hooks/usePages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PageBuilderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pageId = searchParams.get('id')
  const { user, loading: authLoading } = useAuth()
  const { pages, loading: pagesLoading, savePage, deletePage } = usePages()

  const [pageName, setPageName] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [componentTree, setComponentTree] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (pageId && pages) {
      const page = pages.find(p => p.id === pageId)
      if (page) {
        setPageName(page.name)
        setPageSlug(page.slug)
        setComponentTree(page.component_tree ? JSON.parse(page.component_tree) : null)
      }
    }
  }, [pageId, pages])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await savePage({
        id: pageId || undefined,
        name: pageName,
        slug: pageSlug,
        componentTree: componentTree ? JSON.stringify(componentTree) : null,
      })
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || pagesLoading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="container mx-auto p-8">
      {/* Page Builder UI */}
    </div>
  )
}
```

---

### 4. تحويل Authentication

#### Wasp (Before)

```typescript
// src/auth/LoginPage.tsx
import { useAuth } from "wasp/client/auth";
import { login } from "wasp/client/auth";

export default function Login() {
  const { data: user } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
  };
}
```

#### Next.js + Supabase (After)

```typescript
// app/login/page.tsx
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
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/demo-app')
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
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
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  )
}
```

---

### 5. تحويل Database Access

#### Wasp (Before)

```typescript
// src/page-builder/operations.ts
const page = await context.entities.Page.findUnique({
  where: { id },
  include: { user: true },
});

const pages = await context.entities.Page.findMany({
  where: { userId: user.id },
  orderBy: { updatedAt: "desc" },
});

const updatedPage = await context.entities.Page.update({
  where: { id },
  data: {
    name,
    slug,
    componentTree: componentTree || "",
    updatedAt: new Date(),
  },
});

const newPage = await context.entities.Page.create({
  data: {
    name,
    slug,
    componentTree: componentTree || "",
    userId: user.id,
    isPublished: false,
  },
});

await context.entities.Page.delete({
  where: { id },
});
```

#### Next.js + Supabase (After)

```typescript
// Using Supabase Client
const { data: page } = await supabase
  .from('pages')
  .select('*, users(*)')
  .eq('id', id)
  .single()

const { data: pages } = await supabase
  .from('pages')
  .select('*')
  .eq('user_id', user.id)
  .order('updated_at', { ascending: false })

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

await supabase
  .from('pages')
  .delete()
  .eq('id', id)
```

---

### 6. تحويل Routing

#### Wasp (Before)

```wasp
route PageBuilderListRoute { path: "/page-builder", to: PageBuilderListPage }
page PageBuilderListPage {
  authRequired: true,
  component: import PageBuilderListPage from "@src/page-builder/PageListPage"
}

route PageBuilderRoute { path: "/page-builder/edit", to: PageBuilderPage }
page PageBuilderPage {
  authRequired: true,
  component: import PageBuilderPage from "@src/page-builder/PageBuilderPage"
}
```

#### Next.js (After)

```typescript
// app/page-builder/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
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

// app/page-builder/edit/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PageBuilderPage from '@/components/page-builder/PageBuilderPage'

export default function PageBuilderEditPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <PageBuilderPage />
}
```

---

### 7. تحويل File Upload

#### Wasp (Before)

```typescript
// src/file-upload/operations.ts
export const createFileUploadUrl: CreateFileUploadUrl<{...}, { url: string; fields: object }> = async (args, context) => {
  const user = context.user;
  // AWS S3 presigned URL logic
};
```

#### Next.js + Supabase (After)

```typescript
// app/api/files/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const key = `${user.id}/${Date.now()}-${file.name}`

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: file.type,
  })

  await s3Client.send(command)

  // Save to database
  const { data: fileRecord, error: dbError } = await supabase
    .from('files')
    .insert({
      user_id: user.id,
      name: file.name,
      type: file.type,
      s3_key: key,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(fileRecord)
}
```

---

### 8. تحويل Payment Integration

#### Wasp (Before)

```typescript
// src/payment/operations.ts
export const generateCheckoutSession: GenerateCheckoutSession<{...}, { url: string }> = async (args, context) => {
  const user = context.user;
  // Stripe checkout session logic
};
```

#### Next.js + Supabase (After)

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
    metadata: {
      userId: user.id,
    },
  })

  return NextResponse.json({ url: session.url })
}
```

---

### 9. تحويل AI Integration

#### Wasp (Before)

```typescript
// src/demo-ai-app/operations.ts
export const generateGptResponse: GenerateGptResponse<{...}, GptResponse> = async (args, context) => {
  const user = context.user;
  // OpenAI API call
};
```

#### Next.js + Supabase (After)

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
  const { data: gptResponse, error: dbError } = await supabase
    .from('gpt_responses')
    .insert({
      user_id: user.id,
      content,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(gptResponse)
}
```

---

## 🔄 Mapping Table

| Wasp | Next.js + Supabase |
|------|-------------------|
| `wasp/client/operations` | Custom hooks + API routes |
| `wasp/server/operations` | API routes (`app/api/...`) |
| `wasp/entities` | TypeScript types (`types/database.ts`) |
| `wasp/client/auth` | Auth Context (`contexts/AuthContext.tsx`) |
| `wasp/client/router` | Next.js App Router |
| `context.entities.Page` | `supabase.from('pages')` |
| `context.user` | `supabase.auth.getUser()` |
| `useQuery(getPage, args)` | `usePages()` hook |
| `useAction(savePage)` | `savePage()` function in hook |
| `main.wasp` routes | `app/.../page.tsx` files |
| `authRequired: true` | Auth check in page component |

---

## 📝 ملاحظات مهمة

1. **Database Naming**: Wasp uses camelCase (userId), Supabase uses snake_case (user_id)
2. **Type Safety**: Supabase types need to be manually defined
3. **Error Handling**: Supabase returns errors differently than Prisma
4. **Relations**: Supabase uses `.select('*, users(*)')` instead of Prisma's `include`
5. **Authentication**: Supabase Auth is completely different from Wasp Auth

---

## 🚀 Next Steps

1. ابدأ بالمرحلة 1: الإعداد والتحضير
2. انتقل للمرحلة 2: Database Migration
3. ثم المرحلة 3: Authentication Migration
4. وأخيراً المرحلة 4: Operations Migration

