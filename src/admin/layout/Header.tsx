'use client'

import { useAuth } from '@/contexts/AuthContext'
import DarkModeSwitcher from '@/src/client/components/DarkModeSwitcher'
import { cn } from '@/src/lib/utils'
import { UserDropdown } from '@/src/user/UserDropdown'
import MessageButton from '@/src/admin/dashboards/messages/MessageButton'
import type { User } from '@/types/database'

const Header = (props: {
  sidebarOpen: boolean
  setSidebarOpen: (arg0: boolean) => void
  user: User
}) => {
  const { user } = useAuth()

  return (
    <header className="bg-background border-border sticky top-0 z-10 flex w-full border-b shadow-sm">
      <div className="flex flex-grow items-center justify-between px-8 py-5 sm:justify-end sm:gap-5">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}

          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation()
              props.setSidebarOpen(!props.sidebarOpen)
            }}
            className="z-99999 border-border bg-background block rounded-sm border p-1.5 shadow-sm lg:hidden"
          >
            <span className="h-5.5 w-5.5 relative block cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={cn(
                    'bg-foreground relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-[0] duration-200 ease-in-out',
                    {
                      '!w-full delay-300': !props.sidebarOpen,
                    },
                  )}
                ></span>
                <span
                  className={cn(
                    'bg-foreground relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-150 duration-200 ease-in-out',
                    {
                      'delay-400 !w-full': !props.sidebarOpen,
                    },
                  )}
                ></span>
                <span
                  className={cn(
                    'bg-foreground relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm delay-200 duration-200 ease-in-out',
                    {
                      '!w-full delay-500': !props.sidebarOpen,
                    },
                  )}
                ></span>
              </span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
            <MessageButton />
          </ul>
          {user && <UserDropdown user={user} />}
        </div>
      </div>
    </header>
  )
}

export default Header
