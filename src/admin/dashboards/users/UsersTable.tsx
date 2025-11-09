'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/hooks/useUsers'
import useDebounce from '../../../client/hooks/useDebounce'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Switch } from '../../../components/ui/switch'
import { SubscriptionStatus } from '../../../payment/plans'
import LoadingSpinner from '../../layout/LoadingSpinner'
import DropdownEditDelete from './DropdownEditDelete'
import type { User } from '@/types/database'

function AdminSwitch({ id, is_admin }: Pick<User, 'id' | 'is_admin'>) {
  const { user: currentUser } = useAuth()
  const { updateIsUserAdminById, loading } = useUsers()
  const isCurrentUser = currentUser?.id === id

  return (
    <Switch
      checked={is_admin}
      onCheckedChange={async (value) => {
        try {
          await updateIsUserAdminById(id, value)
        } catch (error) {
          console.error('Error updating admin status:', error)
        }
      }}
      disabled={isCurrentUser || loading}
    />
  )
}

const UsersTable = () => {
  const { getPaginatedUsers, loading } = useUsers()
  const [currentPage, setCurrentPage] = useState(1)
  const [emailFilter, setEmailFilter] = useState<string | undefined>(undefined)
  const [isAdminFilter, setIsAdminFilter] = useState<boolean | undefined>(
    undefined,
  )
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<
    Array<SubscriptionStatus | null>
  >([])
  const [data, setData] = useState<{
    users: Pick<
      User,
      | 'id'
      | 'email'
      | 'username'
      | 'subscription_status'
      | 'payment_processor_user_id'
      | 'is_admin'
    >[]
    totalPages: number
  } | null>(null)

  const debouncedEmailFilter = useDebounce(emailFilter, 300)

  const skipPages = currentPage - 1

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getPaginatedUsers({
          skipPages,
          filter: {
            ...(debouncedEmailFilter && { emailContains: debouncedEmailFilter }),
            ...(isAdminFilter !== undefined && { isAdmin: isAdminFilter }),
            ...(subscriptionStatusFilter.length > 0 && {
              subscriptionStatusIn: subscriptionStatusFilter,
            }),
          },
        })
        setData(result)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [skipPages, debouncedEmailFilter, isAdminFilter, subscriptionStatusFilter, getPaginatedUsers])

  useEffect(
    function backToPageOne() {
      setCurrentPage(1)
    },
    [debouncedEmailFilter, subscriptionStatusFilter, isAdminFilter],
  )

  const handleStatusToggle = (status: SubscriptionStatus | null) => {
    setSubscriptionStatusFilter((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status)
      } else {
        return [...prev, status]
      }
    })
  }

  const clearAllStatusFilters = () => {
    setSubscriptionStatusFilter([])
  }

  const hasActiveFilters =
    subscriptionStatusFilter && subscriptionStatusFilter.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-card rounded-sm border shadow">
        <div className="bg-muted/40 flex w-full flex-col items-start justify-between gap-3 p-6">
          <span className="text-sm font-medium">Filters:</span>
          <div className="flex w-full items-center justify-between gap-3 px-2">
            <div className="relative flex items-center gap-3">
              <Label
                htmlFor="email-filter"
                className="text-muted-foreground text-sm"
              >
                email:
              </Label>
              <Input
                type="text"
                id="email-filter"
                placeholder="dude@example.com"
                onChange={(e) => {
                  const value = e.currentTarget.value
                  setEmailFilter(value === '' ? undefined : value)
                }}
              />
              <Label
                htmlFor="status-filter"
                className="text-muted-foreground ml-2 text-sm"
              >
                status:
              </Label>
              <div className="relative">
                <Select>
                  <SelectTrigger className="w-full min-w-[200px]">
                    <SelectValue placeholder="Select Status Filter" />
                  </SelectTrigger>
                  <SelectContent className="w-[300px]">
                    <div className="p-2">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Subscription Status
                        </span>
                        {subscriptionStatusFilter.length > 0 && (
                          <button
                            onClick={clearAllStatusFilters}
                            className="text-muted-foreground hover:text-foreground text-xs"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="all-statuses"
                            checked={subscriptionStatusFilter.length === 0}
                            onCheckedChange={() => clearAllStatusFilters()}
                          />
                          <Label
                            htmlFor="all-statuses"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            All Statuses
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="has-not-subscribed"
                            checked={subscriptionStatusFilter.includes(null)}
                            onCheckedChange={() => handleStatusToggle(null)}
                          />
                          <Label
                            htmlFor="has-not-subscribed"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Has Not Subscribed
                          </Label>
                        </div>
                        {Object.values(SubscriptionStatus).map((status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={status}
                              checked={subscriptionStatusFilter.includes(
                                status,
                              )}
                              onCheckedChange={() => handleStatusToggle(status)}
                            />
                            <Label
                              htmlFor={status}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {status}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="admin-filter"
                  className="text-muted-foreground ml-2 text-sm"
                >
                  isAdmin:
                </Label>
                <Select
                  onValueChange={(value) => {
                    if (value === 'both') {
                      setIsAdminFilter(undefined)
                    } else {
                      setIsAdminFilter(value === 'true')
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="both" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">both</SelectItem>
                    <SelectItem value="true">true</SelectItem>
                    <SelectItem value="false">false</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {data?.totalPages && (
              <div className="flex max-w-60 flex-row items-center">
                <span className="text-md text-foreground mr-2">page</span>
                <Input
                  type="number"
                  min={1}
                  defaultValue={currentPage}
                  max={data?.totalPages}
                  onChange={(e) => {
                    const value = parseInt(e.currentTarget.value)
                    if (
                      data?.totalPages &&
                      value <= data?.totalPages &&
                      value > 0
                    ) {
                      setCurrentPage(value)
                    }
                  }}
                  className="w-20"
                />
                <span className="text-md text-foreground">
                  {' '}
                  /{data?.totalPages}{' '}
                </span>
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <div className="border-border flex items-center gap-2 px-2 pt-2">
              <span className="text-muted-foreground text-sm font-medium">
                Active Filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {subscriptionStatusFilter.map((status) => (
                  <Button
                    key={status ?? 'null'}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusToggle(status)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    {status ?? 'Has Not Subscribed'}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-border py-4.5 grid grid-cols-9 border-t-4 px-4 md:px-6">
          <div className="col-span-3 flex items-center">
            <p className="font-medium">Email / Username</p>
          </div>
          <div className="col-span-2 flex items-center">
            <p className="font-medium">Subscription Status</p>
          </div>
          <div className="col-span-2 flex items-center">
            <p className="font-medium">Stripe ID</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">Is Admin</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium"></p>
          </div>
        </div>
        {loading && <LoadingSpinner />}
        {!!data?.users &&
          data?.users?.length > 0 &&
          data.users.map((user) => (
            <div
              key={user.id}
              className="py-4.5 grid grid-cols-9 gap-4 px-4 md:px-6"
            >
              <div className="col-span-3 flex items-center">
                <div className="flex flex-col gap-1">
                  <p className="text-foreground text-sm">{user.email}</p>
                  <p className="text-foreground text-sm">{user.username}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                <p className="text-foreground text-sm">
                  {user.subscription_status}
                </p>
              </div>
              <div className="col-span-2 flex items-center">
                <p className="text-muted-foreground text-sm">
                  {user.payment_processor_user_id}
                </p>
              </div>
              <div className="col-span-1 flex items-center">
                <div className="text-foreground text-sm">
                  <AdminSwitch id={user.id} is_admin={user.is_admin} />
                </div>
              </div>
              <div className="col-span-1 flex items-center">
                <DropdownEditDelete />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default UsersTable
