'use client'

import { useAuth } from '@/contexts/AuthContext'
import DefaultLayout from '@/src/admin/layout/DefaultLayout'

function AdminMessages() {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <DefaultLayout user={user}>
      <div>This page is under construction 🚧</div>
    </DefaultLayout>
  )
}

export default AdminMessages
