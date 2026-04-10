'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, ExternalLink, Calendar, TrendingUp, Edit2, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface BrandPage {
  id: number
  brand_id: number
  page_url: string
  page_name: string | null
  is_active: boolean
  last_scraped_at: string | null
  total_ads_scraped: number
  created_at: string
  updated_at: string
}

interface BrandPagesDialogProps {
  brandId: number | null
  brandName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandPagesDialog({
  brandId,
  brandName,
  open,
  onOpenChange,
}: BrandPagesDialogProps) {
  const [pages, setPages] = useState<BrandPage[]>([])
  const [loading, setLoading] = useState(false)
  const [newPageUrl, setNewPageUrl] = useState('')
  const [newPageName, setNewPageName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingPageId, setEditingPageId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (open && brandId) {
      fetchPages()
    }
  }, [open, brandId])

  const fetchPages = async () => {
    if (!brandId) return

    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/pages`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch pages')
      }

      const data = await response.json()
      setPages(data)
    } catch (error) {
      console.error('Error fetching pages:', error)
      toast.error('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPage = async () => {
    if (!brandId || !newPageUrl.trim()) {
      toast.error('Please enter a page URL')
      return
    }

    try {
      setAdding(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/pages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_url: newPageUrl.trim(),
            page_name: newPageName.trim() || null,
            is_active: true,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add page')
      }

      toast.success('Page added successfully')
      setNewPageUrl('')
      setNewPageName('')
      await fetchPages()
    } catch (error: any) {
      console.error('Error adding page:', error)
      toast.error(error.message || 'Failed to add page')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleActive = async (pageId: number, currentState: boolean) => {
    if (!brandId) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/pages/${pageId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !currentState }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update page status')
      }

      toast.success(`Page ${!currentState ? 'activated' : 'deactivated'}`)
      await fetchPages()
    } catch (error) {
      console.error('Error toggling page:', error)
      toast.error('Failed to update page status')
    }
  }

  const handleUpdatePageName = async (pageId: number) => {
    if (!brandId) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/pages/${pageId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_name: editName.trim() || null }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update page name')
      }

      toast.success('Page name updated')
      setEditingPageId(null)
      setEditName('')
      await fetchPages()
    } catch (error) {
      console.error('Error updating page name:', error)
      toast.error('Failed to update page name')
    }
  }

  const handleDeletePage = async (pageId: number, pageUrl: string) => {
    if (!brandId) return

    if (!confirm(`Are you sure you want to delete this page?\n\n${pageUrl}`)) {
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/pages/${pageId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete page')
      }

      toast.success('Page deleted successfully')
      await fetchPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error('Failed to delete page')
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Pages - {brandName}</DialogTitle>
          <DialogDescription>
            Add and manage multiple Facebook pages for this brand
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Page Section */}
          <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Page
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page-url">Page URL *</Label>
                <Input
                  id="page-url"
                  placeholder="https://www.facebook.com/..."
                  value={newPageUrl}
                  onChange={(e) => setNewPageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddPage()
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-name">Page Name (Optional)</Label>
                <Input
                  id="page-name"
                  placeholder="e.g., Main Page, Secondary Page"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddPage()
                  }}
                />
              </div>
            </div>
            <Button onClick={handleAddPage} disabled={adding || !newPageUrl.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {adding ? 'Adding...' : 'Add Page'}
            </Button>
          </div>

          {/* Existing Pages */}
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : pages.length === 0 ? (
            <Alert>
              <AlertDescription>
                No pages added yet. Add your first Facebook page above.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page Name / URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      Ads Scraped
                    </TableHead>
                    <TableHead>
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Last Scraped
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        {editingPageId === page.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdatePageName(page.id)
                                if (e.key === 'Escape') {
                                  setEditingPageId(null)
                                  setEditName('')
                                }
                              }}
                              className="h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdatePageName(page.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingPageId(null)
                                setEditName('')
                              }}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {page.page_name || 'Unnamed Page'}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingPageId(page.id)
                                  setEditName(page.page_name || '')
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <a
                              href={page.page_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              {new URL(page.page_url).pathname.substring(0, 40)}
                              {new URL(page.page_url).pathname.length > 40 ? '...' : ''}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={page.is_active}
                            onCheckedChange={() => handleToggleActive(page.id, page.is_active)}
                          />
                          <Badge
                            variant={page.is_active ? 'default' : 'secondary'}
                            className={page.is_active ? 'bg-green-500' : ''}
                          >
                            {page.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {page.total_ads_scraped}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(page.last_scraped_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePage(page.id, page.page_url)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {pages.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4 text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-medium">Total Pages:</span> {pages.length}
                </div>
                <div>
                  <span className="font-medium">Active:</span>{' '}
                  {pages.filter((p) => p.is_active).length}
                </div>
                <div>
                  <span className="font-medium">Total Ads:</span>{' '}
                  {pages.reduce((sum, p) => sum + p.total_ads_scraped, 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
