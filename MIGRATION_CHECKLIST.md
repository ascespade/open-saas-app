# ✅ Checklist للتحويل الكامل: Wasp → Next.js + Supabase

## 📋 Checklist شامل

### 🎯 المرحلة 1: الإعداد والتحضير

#### Project Setup
- [ ] إنشاء Next.js project جديد
- [ ] تثبيت جميع dependencies
- [ ] إعداد TypeScript configuration
- [ ] إعداد TailwindCSS
- [ ] إعداد ESLint و Prettier

#### Supabase Setup
- [ ] إنشاء Supabase project
- [ ] نسخ Database URL و Anon Key
- [ ] إعداد `.env.local` file
- [ ] إنشاء Supabase client (`lib/supabase/client.ts`)
- [ ] إنشاء Supabase server client (`lib/supabase/server.ts`)

#### Project Structure
- [ ] إنشاء `app/` directory structure
- [ ] إنشاء `components/` directory
- [ ] إنشاء `lib/` directory
- [ ] إنشاء `hooks/` directory
- [ ] إنشاء `contexts/` directory
- [ ] إنشاء `types/` directory

---

### 🗄️ المرحلة 2: Database Migration

#### Schema Conversion
- [ ] تحويل `User` model إلى Supabase table
- [ ] تحويل `Page` model إلى Supabase table
- [ ] تحويل `Component` model إلى Supabase table
- [ ] تحويل `Task` model إلى Supabase table
- [ ] تحويل `GptResponse` model إلى Supabase table
- [ ] تحويل `File` model إلى Supabase table
- [ ] تحويل `DailyStats` model إلى Supabase table
- [ ] تحويل `PageViewSource` model إلى Supabase table
- [ ] تحويل `ContactFormMessage` model إلى Supabase table
- [ ] تحويل `Logs` model إلى Supabase table

#### Database Setup
- [ ] إنشاء جميع tables في Supabase
- [ ] إعداد Foreign Keys
- [ ] إعداد Indexes
- [ ] إعداد Row Level Security (RLS)
- [ ] إنشاء RLS Policies
- [ ] اختبار RLS Policies

#### TypeScript Types
- [ ] إنشاء `types/database.ts`
- [ ] تعريف `User` type
- [ ] تعريف `Page` type
- [ ] تعريف `Component` type
- [ ] تعريف `Task` type
- [ ] تعريف `GptResponse` type
- [ ] تعريف `File` type
- [ ] تعريف باقي types

#### Data Migration
- [ ] Export data من Wasp database
- [ ] Import data إلى Supabase
- [ ] التحقق من البيانات
- [ ] اختبار البيانات

---

### 🔐 المرحلة 3: Authentication Migration

#### Supabase Auth Setup
- [ ] إعداد Supabase Auth
- [ ] إنشاء Auth Context (`contexts/AuthContext.tsx`)
- [ ] إنشاء `useAuth` hook
- [ ] إعداد Auth Provider في root layout

#### Auth Pages
- [ ] تحويل Login page (`app/login/page.tsx`)
- [ ] تحويل Signup page (`app/signup/page.tsx`)
- [ ] تحويل Password Reset page (`app/password-reset/page.tsx`)
- [ ] تحويل Email Verification page (`app/email-verification/page.tsx`)
- [ ] تحويل Request Password Reset page (`app/request-password-reset/page.tsx`)

#### Auth Functions
- [ ] تحويل `signIn` function
- [ ] تحويل `signUp` function
- [ ] تحويل `signOut` function
- [ ] تحويل `getCurrentUser` function
- [ ] تحويل `resetPassword` function
- [ ] تحويل `verifyEmail` function

#### Auth Middleware
- [ ] إنشاء Auth middleware (`middleware.ts`)
- [ ] إعداد protected routes
- [ ] إعداد redirect logic

---

### 🔄 المرحلة 4: Operations → API Routes

#### Page Builder Operations
- [ ] تحويل `savePage` operation → `app/api/pages/route.ts` (POST)
- [ ] تحويل `getPage` operation → `app/api/pages/[id]/route.ts` (GET)
- [ ] تحويل `getUserPages` operation → `app/api/pages/route.ts` (GET)
- [ ] تحويل `deletePage` operation → `app/api/pages/[id]/route.ts` (DELETE)

#### User Operations
- [ ] تحويل `getPaginatedUsers` operation → `app/api/users/route.ts` (GET)
- [ ] تحويل `updateIsUserAdminById` operation → `app/api/users/[id]/route.ts` (PATCH)

#### Task Operations
- [ ] تحويل `createTask` operation → `app/api/tasks/route.ts` (POST)
- [ ] تحويل `deleteTask` operation → `app/api/tasks/[id]/route.ts` (DELETE)
- [ ] تحويل `updateTask` operation → `app/api/tasks/[id]/route.ts` (PATCH)
- [ ] تحويل `getAllTasksByUser` operation → `app/api/tasks/route.ts` (GET)

#### AI Operations
- [ ] تحويل `generateGptResponse` operation → `app/api/ai/generate/route.ts` (POST)
- [ ] تحويل `getGptResponses` operation → `app/api/ai/responses/route.ts` (GET)

#### File Upload Operations
- [ ] تحويل `createFileUploadUrl` operation → `app/api/files/upload/route.ts` (POST)
- [ ] تحويل `addFileToDb` operation → `app/api/files/route.ts` (POST)
- [ ] تحويل `getAllFilesByUser` operation → `app/api/files/route.ts` (GET)
- [ ] تحويل `getDownloadFileSignedURL` operation → `app/api/files/[id]/download/route.ts` (GET)
- [ ] تحويل `deleteFile` operation → `app/api/files/[id]/route.ts` (DELETE)

#### Payment Operations
- [ ] تحويل `generateCheckoutSession` operation → `app/api/payments/checkout/route.ts` (POST)
- [ ] تحويل `getCustomerPortalUrl` operation → `app/api/payments/portal/route.ts` (GET)
- [ ] تحويل `paymentsWebhook` API → `app/api/payments/webhook/route.ts` (POST)

#### Analytics Operations
- [ ] تحويل `getDailyStats` operation → `app/api/analytics/stats/route.ts` (GET)
- [ ] تحويل `dailyStatsJob` → Next.js cron job أو Vercel cron

---

### 📄 المرحلة 5: Pages Migration

#### Public Pages
- [ ] تحويل Landing page (`app/page.tsx`)
- [ ] تحويل Pricing page (`app/pricing/page.tsx`)

#### Auth Pages
- [ ] تحويل Login page (`app/login/page.tsx`)
- [ ] تحويل Signup page (`app/signup/page.tsx`)
- [ ] تحويل Password Reset page (`app/password-reset/page.tsx`)
- [ ] تحويل Email Verification page (`app/email-verification/page.tsx`)
- [ ] تحويل Request Password Reset page (`app/request-password-reset/page.tsx`)

#### User Pages
- [ ] تحويل Account page (`app/account/page.tsx`)
- [ ] تحويل Demo App page (`app/demo-app/page.tsx`)

#### Page Builder Pages
- [ ] تحويل Page Builder List page (`app/page-builder/page.tsx`)
- [ ] تحويل Page Builder Edit page (`app/page-builder/edit/page.tsx`)

#### Admin Pages
- [ ] تحويل Analytics Dashboard (`app/admin/page.tsx`)
- [ ] تحويل Users Dashboard (`app/admin/users/page.tsx`)
- [ ] تحويل Settings page (`app/admin/settings/page.tsx`)
- [ ] تحويل Calendar page (`app/admin/calendar/page.tsx`)
- [ ] تحويل UI Buttons page (`app/admin/ui/buttons/page.tsx`)
- [ ] تحويل Messages page (`app/admin/messages/page.tsx`)

#### Other Pages
- [ ] تحويل File Upload page (`app/file-upload/page.tsx`)
- [ ] تحويل Checkout Result page (`app/checkout/page.tsx`)
- [ ] تحويل 404 page (`app/not-found.tsx`)

---

### 🧩 المرحلة 6: Components Migration

#### UI Components
- [ ] نقل جميع UI components من `src/components/ui/` إلى `components/ui/`
- [ ] تحديث imports في جميع components
- [ ] اختبار جميع UI components

#### Feature Components
- [ ] نقل Page Builder components
- [ ] نقل File Upload components
- [ ] نقل Payment components
- [ ] نقل Admin components
- [ ] نقل Landing page components

#### Layout Components
- [ ] تحويل NavBar component
- [ ] تحويل Footer component
- [ ] تحويل Sidebar component
- [ ] تحويل Header component

---

### 🎣 المرحلة 7: Hooks Migration

#### Custom Hooks
- [ ] إنشاء `hooks/usePages.ts`
- [ ] إنشاء `hooks/useTasks.ts`
- [ ] إنشاء `hooks/useFiles.ts`
- [ ] إنشاء `hooks/useAuth.ts` (في AuthContext)
- [ ] إنشاء `hooks/usePayment.ts`
- [ ] إنشاء `hooks/useAI.ts`

#### Utility Hooks
- [ ] نقل `hooks/use-toast.ts`
- [ ] نقل `hooks/useDebounce.ts`
- [ ] نقل `hooks/useLocalStorage.ts`
- [ ] نقل `hooks/useColorMode.ts`

---

### 🔧 المرحلة 8: Features Migration

#### Page Builder
- [ ] نقل جميع Page Builder components
- [ ] تحويل Page Builder operations
- [ ] تحديث Page Builder pages
- [ ] اختبار Page Builder functionality

#### File Upload
- [ ] تحويل AWS S3 integration
- [ ] تحويل File Upload operations
- [ ] تحديث File Upload page
- [ ] اختبار File Upload functionality

#### Payment Integration
- [ ] تحويل Stripe integration
- [ ] تحويل Lemon Squeezy integration
- [ ] تحويل Payment webhook
- [ ] اختبار Payment functionality

#### AI Integration
- [ ] تحويل OpenAI integration
- [ ] تحويل AI operations
- [ ] تحديث AI pages
- [ ] اختبار AI functionality

#### Analytics
- [ ] تحويل Analytics operations
- [ ] تحويل Analytics dashboard
- [ ] تحويل Analytics cron job
- [ ] اختبار Analytics functionality

---

### 🧪 المرحلة 9: Testing

#### Unit Tests
- [ ] كتابة unit tests للـ API routes
- [ ] كتابة unit tests للـ hooks
- [ ] كتابة unit tests للـ components
- [ ] كتابة unit tests للـ utilities

#### Integration Tests
- [ ] كتابة integration tests للـ Authentication
- [ ] كتابة integration tests للـ Page Builder
- [ ] كتابة integration tests للـ File Upload
- [ ] كتابة integration tests للـ Payment
- [ ] كتابة integration tests للـ AI

#### E2E Tests
- [ ] كتابة E2E tests للـ Authentication flow
- [ ] كتابة E2E tests للـ Page Builder flow
- [ ] كتابة E2E tests للـ Payment flow
- [ ] كتابة E2E tests للـ File Upload flow

#### Performance Tests
- [ ] اختبار performance للـ API routes
- [ ] اختبار performance للـ database queries
- [ ] اختبار performance للـ components
- [ ] اختبار performance للـ pages

---

### 🚀 المرحلة 10: Deployment

#### Environment Setup
- [ ] إعداد environment variables في Vercel
- [ ] إعداد Supabase environment variables
- [ ] إعداد AWS environment variables
- [ ] إعداد Stripe environment variables
- [ ] إعداد OpenAI environment variables

#### Vercel Deployment
- [ ] إنشاء Vercel project
- [ ] ربط GitHub repository
- [ ] إعداد build settings
- [ ] إعداد environment variables
- [ ] Deploy إلى production

#### Supabase Setup
- [ ] إعداد Supabase production database
- [ ] إعداد Supabase RLS policies
- [ ] إعداد Supabase Auth settings
- [ ] إعداد Supabase Storage (إذا لزم الأمر)

#### Monitoring
- [ ] إعداد error tracking (Sentry)
- [ ] إعداد analytics (Plausible/Google Analytics)
- [ ] إعداد logging
- [ ] إعداد monitoring

---

### 📝 المرحلة 11: Documentation

#### Code Documentation
- [ ] توثيق API routes
- [ ] توثيق hooks
- [ ] توثيق components
- [ ] توثيق utilities

#### User Documentation
- [ ] تحديث README.md
- [ ] إنشاء migration guide
- [ ] إنشاء setup guide
- [ ] إنشاء deployment guide

---

### ✅ Final Checklist

#### Pre-Launch
- [ ] جميع tests passing
- [ ] جميع features working
- [ ] جميع pages accessible
- [ ] جميع API routes working
- [ ] جميع database queries optimized
- [ ] جميع error handling implemented
- [ ] جميع loading states implemented
- [ ] جميع error messages user-friendly

#### Post-Launch
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Monitor user feedback
- [ ] Fix critical bugs
- [ ] Optimize performance
- [ ] Update documentation

---

## 📊 Progress Tracking

### Overall Progress: 0%

- [ ] Phase 1: Setup (0%)
- [ ] Phase 2: Database (0%)
- [ ] Phase 3: Authentication (0%)
- [ ] Phase 4: API Routes (0%)
- [ ] Phase 5: Pages (0%)
- [ ] Phase 6: Components (0%)
- [ ] Phase 7: Hooks (0%)
- [ ] Phase 8: Features (0%)
- [ ] Phase 9: Testing (0%)
- [ ] Phase 10: Deployment (0%)
- [ ] Phase 11: Documentation (0%)

---

## 🎯 Priority Order

### High Priority (Must Do First)
1. ✅ Phase 1: Setup
2. ✅ Phase 2: Database Migration
3. ✅ Phase 3: Authentication
4. ✅ Phase 4: API Routes (Core operations)

### Medium Priority (Do After High Priority)
5. ✅ Phase 5: Pages (Core pages)
6. ✅ Phase 6: Components (Core components)
7. ✅ Phase 7: Hooks (Core hooks)

### Low Priority (Can Do Later)
8. ✅ Phase 8: Features (Additional features)
9. ✅ Phase 9: Testing (Comprehensive testing)
10. ✅ Phase 10: Deployment (Production deployment)
11. ✅ Phase 11: Documentation (Complete documentation)

---

## 📝 Notes

- استخدم هذا الـ checklist لتتبع التقدم
- ضع علامة ✅ عند إكمال كل مهمة
- راجع الـ checklist بانتظام
- حدّث الـ progress tracking

---

## 🚀 Ready to Start?

ابدأ بالمرحلة 1: الإعداد والتحضير!

