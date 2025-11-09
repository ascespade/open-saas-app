import { AuthPageLayout } from '@/src/auth/AuthPageLayout'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function PasswordResetPage() {
  return (
    <AuthPageLayout>
      <ResetPasswordForm />
    </AuthPageLayout>
  )
}
