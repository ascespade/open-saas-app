import { AuthPageLayout } from '@/src/auth/AuthPageLayout'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function RequestPasswordResetPage() {
  return (
    <AuthPageLayout>
      <ForgotPasswordForm />
    </AuthPageLayout>
  )
}
