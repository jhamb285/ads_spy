'use client'

import { useState } from 'react'
import { addBrand } from '@/lib/api'
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

interface AddBrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddBrandDialog({ open, onOpenChange, onSuccess }: AddBrandDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    avatar: '',
    brand_name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addBrand(formData)
      toast.success('Brand added successfully. Use "Manage Pages" to add Facebook pages.')
      setFormData({ avatar: '', brand_name: '' })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add brand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
          <DialogDescription>
            Add a new brand to track. After creating the brand, use "Manage Pages" to add Facebook pages.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar (optional)</Label>
            <Input
              id="avatar"
              placeholder="e.g., 👕 or LOGO"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Emoji or short text to represent this brand
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_name">Brand Name *</Label>
            <Input
              id="brand_name"
              placeholder="e.g., Nike"
              value={formData.brand_name}
              onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">
              After adding the brand, use "Manage Pages" to add Facebook pages to track
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
              {loading ? 'Adding...' : 'Add Brand'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
