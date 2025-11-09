'use client'

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  LayoutTemplate,
  Settings,
  Sheet,
  X,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/src/client/static/logo.webp'
import { cn } from '@/src/lib/utils'
import SidebarLinkGroup from './SidebarLinkGroup'
import Image from 'next/image'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (arg: boolean) => void
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname()

  const trigger = useRef<any>(null)
  const sidebar = useRef<any>(null)

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded')
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  )

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return
      setSidebarOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return
      setSidebarOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString())
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded')
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded')
    }
  }, [sidebarExpanded])

  return (
    <aside
      ref={sidebar}
      className={cn(
        'bg-background border-border absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="border-border flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/">
          <Image
            src={Logo}
            alt="Logo"
            width={176}
            height={32}
            priority
          />
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="border-border bg-background block rounded-sm border p-1.5 shadow-sm lg:hidden"
        >
          <X className="h-5.5 w-5.5 fill-current" />
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="border-border no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="px-4 py-4 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="text-muted-foreground mb-4 ml-4 text-sm font-semibold">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Menu Item Dashboard --> */}
              <li>
                <Link
                  href="/admin"
                  className={cn(
                    'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-muted',
                    pathname === '/admin' && 'bg-muted',
                  )}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
              </li>
              {/* <!-- Menu Item Dashboard --> */}

              {/* <!-- Menu Item Users --> */}
              <li>
                <Link
                  href="/admin/users"
                  className={cn(
                    'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-muted',
                    pathname === '/admin/users' && 'bg-muted',
                  )}
                >
                  <Sheet className="h-5 w-5" />
                  Users
                </Link>
              </li>
              {/* <!-- Menu Item Users --> */}

              {/* <!-- Menu Item Calendar --> */}
              <SidebarLinkGroup
                activeCondition={pathname === '/admin/calendar'}
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handleClick()
                        }}
                        className={cn(
                          'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-muted',
                          pathname === '/admin/calendar' && 'bg-muted',
                        )}
                      >
                        <Calendar className="h-5 w-5" />
                        Calendar
                        {open ? (
                          <ChevronUp className="absolute right-4 top-1/2 -translate-y-1/2 fill-current" />
                        ) : (
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 fill-current" />
                        )}
                      </Link>
                      {/* <!-- Dropdown Menu Start --> */}
                      {open && (
                        <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                          <li>
                            <Link
                              href="/admin/calendar"
                              className={cn(
                                'group relative flex items-center gap-2.5 rounded-md px-4 py-2 text-sm font-medium duration-300 ease-in-out hover:text-primary',
                                pathname === '/admin/calendar' && 'text-primary',
                              )}
                            >
                              Calendar
                            </Link>
                          </li>
                        </ul>
                      )}
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  )
                }}
              </SidebarLinkGroup>
              {/* <!-- Menu Item Calendar --> */}

              {/* <!-- Menu Item Settings --> */}
              <li>
                <Link
                  href="/admin/settings"
                  className={cn(
                    'group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium duration-300 ease-in-out hover:bg-muted',
                    pathname === '/admin/settings' && 'bg-muted',
                  )}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </li>
              {/* <!-- Menu Item Settings --> */}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
