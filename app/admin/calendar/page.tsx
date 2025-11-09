'use client'

import { useAuth } from '@/contexts/AuthContext'
import Breadcrumb from '@/src/admin/layout/Breadcrumb'
import DefaultLayout from '@/src/admin/layout/DefaultLayout'

const Calendar = () => {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Calendar" />
      <div className="border-border bg-card shadow-default w-full max-w-full rounded-sm border">
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-primary-foreground grid grid-cols-7 rounded-t-sm">
              <th className="h-15 flex items-center justify-center rounded-tl-sm p-1 text-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Sunday </span>
                <span className="block lg:hidden"> Sun </span>
              </th>
              <th className="h-15 flex items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Monday </span>
                <span className="block lg:hidden"> Mon </span>
              </th>
              <th className="h-15 flex items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Tuesday </span>
                <span className="block lg:hidden"> Tue </span>
              </th>
              <th className="h-15 flex items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Wednesday </span>
                <span className="block lg:hidden"> Wed </span>
              </th>
              <th className="h-15 flex items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Thursday </span>
                <span className="block lg:hidden"> Thur </span>
              </th>
              <th className="h-15 flex items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Friday </span>
                <span className="block lg:hidden"> Fri </span>
              </th>
              <th className="h-15 flex items-center justify-center rounded-tr-sm p-1 text-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Saturday </span>
                <span className="block lg:hidden"> Sat </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="grid grid-cols-7">
              {Array.from({ length: 7 }).map((_, index) => (
                <td
                  key={index}
                  className="ease border-border text-accent hover:bg-accent hover:text-accent-foreground md:h-25 xl:h-31 relative h-20 cursor-pointer border p-2 transition duration-500 md:p-6"
                >
                  <span className="font-medium">{index + 1}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </DefaultLayout>
  )
}

export default Calendar
