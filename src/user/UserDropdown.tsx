'use client'

import { ChevronDown, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { User as UserEntity } from '@/types/database'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { userMenuItems } from './constants'

export function UserDropdown({ user }: { user: Partial<UserEntity> }) {
  const [open, setOpen] = useState(false)
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="text-foreground hover:text-primary flex items-center transition-colors duration-300 ease-in-out">
          <span className="text-foreground mr-2 hidden text-right text-sm font-medium lg:block">
            {user.username || user.email}
          </span>
          <User className="size-5" />
          <ChevronDown className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {userMenuItems.map((item) => {
          if (item.isAuthRequired && !user) return null
          if (item.isAdminOnly && (!user || !user.is_admin)) return null

          return (
            <DropdownMenuItem key={item.name} asChild>
              <Link
                href={item.to}
                onClick={() => {
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3"
              >
                <item.icon size="1.1rem" />
                {item.name}
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuItem>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3"
          >
            <LogOut size="1.1rem" />
            Log Out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
