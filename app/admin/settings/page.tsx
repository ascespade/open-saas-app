'use client'

import { FileText, Mail, Upload, User } from 'lucide-react'
import { FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import Breadcrumb from '@/src/admin/layout/Breadcrumb'
import DefaultLayout from '@/src/admin/layout/DefaultLayout'

const SettingsPage = () => {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return <div>Loading...</div>
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // TODO implement
    event.preventDefault()
    alert('Not yet implemented')
  }

  return (
    <DefaultLayout user={user}>
      <div className="max-w-270 mx-auto">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="mb-5.5 gap-5.5 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <Label
                        htmlFor="full-name"
                        className="text-foreground mb-3 block text-sm font-medium"
                      >
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="left-4.5 text-muted-foreground absolute top-2 h-5 w-5" />
                        <Input
                          className="pl-11.5"
                          type="text"
                          name="fullName"
                          id="full-name"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <Label
                        htmlFor="email"
                        className="text-foreground mb-3 block text-sm font-medium"
                      >
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="left-4.5 text-muted-foreground absolute top-2 h-5 w-5" />
                        <Input
                          className="pl-11.5"
                          type="email"
                          name="email"
                          id="email"
                          placeholder="Enter your email"
                          defaultValue={user.email || ''}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <Label
                      htmlFor="bio"
                      className="text-foreground mb-3 block text-sm font-medium"
                    >
                      Bio
                    </Label>
                    <Textarea
                      rows={6}
                      placeholder="Write your bio here"
                      id="bio"
                    />
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default SettingsPage
