import { LayoutDashboard, Settings, User as UserIcon } from 'lucide-react'

export const userMenuItems = [
  {
    name: 'Account',
    to: '/account',
    icon: UserIcon,
    isAuthRequired: true,
    isAdminOnly: false,
  },
  {
    name: 'Admin Dashboard',
    to: '/admin',
    icon: LayoutDashboard,
    isAuthRequired: true,
    isAdminOnly: true,
  },
  {
    name: 'Settings',
    to: '/admin/settings',
    icon: Settings,
    isAuthRequired: true,
    isAdminOnly: true,
  },
] as const
