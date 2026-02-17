'use client'

import { useState } from 'react'
import { Brand } from '@/lib/types'
import { updateBrand } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { EditBrandDialog } from './edit-brand-dialog'
import { DeleteBrandDialog } from './delete-brand-dialog'
import { BrandPagesDialog } from './brand-pages-dialog'
import { BrandSettingsDialog } from './brand-settings-dialog'
import { Edit, Trash2, FileText, Settings2 } from 'lucide-react'
import { toast } from 'sonner'

interface BrandTableProps {
  brands: Brand[]
  onUpdate: () => void
}

export function BrandTable({ brands, onUpdate }: BrandTableProps) {
  const [editBrand, setEditBrand] = useState<Brand | null>(null)
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null)
  const [pagesBrand, setPagesBrand] = useState<{ id: number; name: string } | null>(null)
  const [settingsBrand, setSettingsBrand] = useState<{ id: number; name: string } | null>(null)
  const [toggling, setToggling] = useState<number | null>(null)

  const handleToggleActive = async (brand: Brand) => {
    setToggling(brand.id)
    try {
      await updateBrand(brand.id, { active: !brand.active })
      toast.success(`${brand.brand_name} ${!brand.active ? 'activated' : 'deactivated'}`)
      onUpdate()
    } catch (error) {
      toast.error('Failed to update brand status')
    } finally {
      setToggling(null)
    }
  }

  if (brands.length === 0) {
    return (
      <div className="rounded-lg border border-black/10 p-12 text-center">
        <p className="text-gray-500">No brands found. Add your first brand to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-black/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Brand Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  {brand.avatar ? (
                    <div className="flex items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium w-20 overflow-hidden">
                      <span className="truncate">{brand.avatar}</span>
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-500 shrink-0">
                      {brand.brand_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{brand.brand_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={brand.active ? 'default' : 'secondary'}>
                      {brand.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={brand.active}
                      disabled={toggling === brand.id}
                      onCheckedChange={() => handleToggleActive(brand)}
                    />
                    {toggling === brand.id && (
                      <span className="text-xs text-gray-500">Updating...</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPagesBrand({ id: brand.id, name: brand.brand_name })}
                      title="Manage Pages"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSettingsBrand({ id: brand.id, name: brand.brand_name })}
                      title="Brand Settings"
                    >
                      <Settings2 className="h-4 w-4 text-purple-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditBrand(brand)}
                      title="Edit Brand"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteBrand(brand)}
                      title="Delete Brand"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editBrand && (
        <EditBrandDialog
          brand={editBrand}
          open={!!editBrand}
          onOpenChange={(open) => !open && setEditBrand(null)}
          onSuccess={onUpdate}
        />
      )}

      {deleteBrand && (
        <DeleteBrandDialog
          brand={deleteBrand}
          open={!!deleteBrand}
          onOpenChange={(open) => !open && setDeleteBrand(null)}
          onSuccess={onUpdate}
        />
      )}

      {pagesBrand && (
        <BrandPagesDialog
          brandId={pagesBrand.id}
          brandName={pagesBrand.name}
          open={!!pagesBrand}
          onOpenChange={(open) => !open && setPagesBrand(null)}
        />
      )}

      {settingsBrand && (
        <BrandSettingsDialog
          brandId={settingsBrand.id}
          brandName={settingsBrand.name}
          open={!!settingsBrand}
          onOpenChange={(open) => !open && setSettingsBrand(null)}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
