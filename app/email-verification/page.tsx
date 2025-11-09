import { AuthPageLayout } from '@/src/auth/AuthPageLayout'
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm'

export default function EmailVerificationPage() {
  return (
    <AuthPageLayout>
      <VerifyEmailForm />
    </AuthPageLayout>
  )
}
