'use client'

import { Heart, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/src/components/ui/button'
import Breadcrumb from '@/src/admin/layout/Breadcrumb'
import DefaultLayout from '@/src/admin/layout/DefaultLayout'

const Buttons = () => {
  const { user, loading } = useAuth()

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Buttons" />

      {/* Button Variants */}
      <div className="border-border bg-card shadow-default mb-10 rounded-sm border">
        <div className="border-border border-b px-7 py-4">
          <h3 className="text-foreground font-medium">Button Variants</h3>
        </div>

        <div className="p-4 md:p-6 xl:p-9">
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </div>
      </div>

      {/* Button Sizes */}
      <div className="border-border bg-card shadow-default mb-10 rounded-sm border">
        <div className="border-border border-b px-7 py-4">
          <h3 className="text-foreground font-medium">Button Sizes</h3>
        </div>

        <div className="p-4 md:p-6 xl:p-9">
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Plus />
            </Button>
          </div>
        </div>
      </div>

      {/* Button with Icon */}
      <div className="border-border bg-card shadow-default mb-10 rounded-sm border">
        <div className="border-border border-b px-7 py-4">
          <h3 className="text-foreground font-medium">Button with Icon</h3>
        </div>

        <div className="p-4 md:p-6 xl:p-9">
          <div className="flex flex-wrap gap-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Like
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default Buttons
