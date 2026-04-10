'use client'

import { useState } from 'react'
import { Brand } from '@/lib/types'
import { updateBrand } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface EditBrandDialogProps {
  brand: Brand
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditBrandDialog({ brand, open, onOpenChange, onSuccess }: EditBrandDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    avatar: brand.avatar,
    brand_name: brand.brand_name,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateBrand(brand.id, formData)
      toast.success('Brand updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update brand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
          <DialogDescription>
            Update brand information. Changes will take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-avatar">Avatar</Label>
            <Input
              id="edit-avatar"
              placeholder="e.g., 👕 or LOGO"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-brand_name">Brand Name *</Label>
            <Input
              id="edit-brand_name"
              placeholder="e.g., Nike"
              value={formData.brand_name}
              onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">
              Use "Manage Pages" to add or edit Facebook pages for this brand
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
