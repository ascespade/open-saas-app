'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@/types/database'
import { userMenuItems } from './constants'

export const UserMenuItems = ({
  user,
  onItemClick,
}: {
  user?: Partial<User>
  onItemClick?: () => void
}) => {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      onItemClick?.()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <>
      {userMenuItems.map((item) => {
        if (item.isAuthRequired && !user) return null
        if (item.isAdminOnly && (!user || !user.is_admin)) return null

        return (
          <li key={item.name}>
            <Link
              href={item.to}
              onClick={onItemClick}
              className="text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-7 transition-colors"
            >
              <item.icon size="1.1rem" />
              {item.name}
            </Link>
          </li>
        )
      })}
      <li>
        <button
          onClick={handleLogout}
          className="text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-7 transition-colors"
        >
          <LogOut size="1.1rem" />
          Log Out
        </button>
      </li>
    </>
  )
}
