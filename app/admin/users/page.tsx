'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/hooks/useUsers'
import Breadcrumb from '@/src/admin/layout/Breadcrumb'
import DefaultLayout from '@/src/admin/layout/DefaultLayout'
import UsersTable from '@/src/admin/dashboards/users/UsersTable'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Users = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return <div>Loading...</div>
  }

  if (!user.is_admin) {
    return null
  }

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Users" />
      <div className="flex flex-col gap-10">
        <UsersTable />
      </div>
    </DefaultLayout>
  )
}

export default Users
