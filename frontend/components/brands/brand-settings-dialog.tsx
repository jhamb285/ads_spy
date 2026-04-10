'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Save, TrendingUp, Calendar, Settings2 } from 'lucide-react'
import { toast } from 'sonner'

interface BrandSettings {
  use_overrides: boolean
  max_ads_override: number | null
  max_daily_ads_override: number | null
}

interface EffectiveSettings {
  max_ads_per_brand: number
  max_daily_ads_per_brand: number
}

interface BrandSettingsDialogProps {
  brandId: number | null
  brandName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function BrandSettingsDialog({
  brandId,
  brandName,
  open,
  onOpenChange,
  onUpdate,
}: BrandSettingsDialogProps) {
  const [settings, setSettings] = useState<BrandSettings | null>(null)
  const [effectiveSettings, setEffectiveSettings] = useState<EffectiveSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (open && brandId) {
      fetchSettings()
      fetchEffectiveSettings()
    }
  }, [open, brandId])

  const fetchSettings = async () => {
    if (!brandId) return

    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/settings`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      setSettings(data)
      setHasChanges(false)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load brand settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchEffectiveSettings = async () => {
    if (!brandId) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/effective-settings`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch effective settings')
      }

      const data = await response.json()
      setEffectiveSettings(data)
    } catch (error) {
      console.error('Error fetching effective settings:', error)
    }
  }

  const handleSave = async () => {
    if (!brandId || !settings) return

    try {
      setSaving(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/brands/${brandId}/settings`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Brand settings saved successfully')
      setHasChanges(false)
      await fetchEffectiveSettings()
      onUpdate?.()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    fetchSettings()
    setHasChanges(false)
  }

  const updateSetting = (updates: Partial<BrandSettings>) => {
    if (!settings) return
    setSettings({ ...settings, ...updates })
    setHasChanges(true)
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!settings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load brand settings. Please try again.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Brand Settings - {brandName}
          </DialogTitle>
          <DialogDescription>
            Override global scraping limits for this specific brand
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Use Overrides Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="use-overrides" className="text-base font-medium">
                Enable Brand-Specific Overrides
              </Label>
              <p className="text-sm text-gray-500">
                Use custom settings for this brand instead of global defaults
              </p>
            </div>
            <Switch
              id="use-overrides"
              checked={settings.use_overrides}
              onCheckedChange={(checked) => updateSetting({ use_overrides: checked })}
            />
          </div>

          {/* Override Settings */}
          <div className={`space-y-4 ${!settings.use_overrides ? 'opacity-50' : ''}`}>
            {/* Max Ads Override */}
            <div className="space-y-2">
              <Label htmlFor="max-ads-override" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Max Ads Per Run
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="max-ads-override"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.max_ads_override || ''}
                  onChange={(e) =>
                    updateSetting({
                      max_ads_override: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  disabled={!settings.use_overrides}
                  placeholder="Leave empty for default"
                  className="max-w-xs"
                />
                <span className="text-sm text-gray-500">
                  {settings.use_overrides && settings.max_ads_override
                    ? `${settings.max_ads_override} ads per run`
                    : effectiveSettings
                    ? `Default: ${effectiveSettings.max_ads_per_brand}`
                    : ''}
                </span>
              </div>
            </div>

            {/* Max Daily Ads Override */}
            <div className="space-y-2">
              <Label htmlFor="max-daily-override" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Max Daily Ads
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="max-daily-override"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.max_daily_ads_override || ''}
                  onChange={(e) =>
                    updateSetting({
                      max_daily_ads_override: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  disabled={!settings.use_overrides}
                  placeholder="Leave empty for default"
                  className="max-w-xs"
                />
                <span className="text-sm text-gray-500">
                  {settings.use_overrides && settings.max_daily_ads_override
                    ? `${settings.max_daily_ads_override} ads per day`
                    : effectiveSettings
                    ? `Default: ${effectiveSettings.max_daily_ads_per_brand}`
                    : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Effective Settings Display */}
          {effectiveSettings && (
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Current Effective Settings:</strong>
                <div className="mt-2 space-y-1">
                  <div>
                    • Max ads per run: <strong>{effectiveSettings.max_ads_per_brand}</strong>{' '}
                    {settings.use_overrides && settings.max_ads_override
                      ? '(override)'
                      : '(global)'}
                  </div>
                  <div>
                    • Max daily ads: <strong>{effectiveSettings.max_daily_ads_per_brand}</strong>{' '}
                    {settings.use_overrides && settings.max_daily_ads_override
                      ? '(override)'
                      : '(global)'}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!settings.use_overrides && (
            <Alert>
              <AlertDescription className="text-sm">
                This brand is using global default settings. Enable overrides to set custom limits.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {hasChanges && (
              <span className="font-medium text-amber-600">⚠️ Unsaved changes</span>
            )}
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="ghost" onClick={handleDiscard} disabled={saving}>
                Discard
              </Button>
            )}
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
