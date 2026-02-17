'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Settings, Save, RefreshCw, Power, TrendingUp, Calendar } from 'lucide-react'

interface GlobalSettings {
  scraper_enabled: boolean
  max_ads_per_brand: number
  max_daily_ads_per_brand: number
}

export function SettingsInterface() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`)

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      setSettings(data)
      setHasChanges(false)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSettingChange = (key: keyof GlobalSettings, value: boolean | number) => {
    if (!settings) return

    setSettings({
      ...settings,
      [key]: value,
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)

      // Update each setting individually
      const updates = [
        {
          key: 'scraper_enabled',
          value: settings.scraper_enabled,
        },
        {
          key: 'max_ads_per_brand',
          value: settings.max_ads_per_brand,
        },
        {
          key: 'max_daily_ads_per_brand',
          value: settings.max_daily_ads_per_brand,
        },
      ]

      for (const update of updates) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/settings/${update.key}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: update.value }),
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to update ${update.key}`)
        }
      }

      // Reload settings on server
      await handleReload()

      toast.success('Settings saved successfully')
      setHasChanges(false)
      await fetchSettings()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReload = async () => {
    try {
      setReloading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/reload`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to reload settings')
      }

      toast.success('Settings reloaded on server')
    } catch (error) {
      console.error('Error reloading settings:', error)
      toast.error('Failed to reload settings')
    } finally {
      setReloading(false)
    }
  }

  const handleDiscard = () => {
    fetchSettings()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!settings) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load settings. Please refresh the page.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Master Control Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Master Control
              </CardTitle>
              <CardDescription>
                Global on/off switch for the AdSpy scraper
              </CardDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              settings.scraper_enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {settings.scraper_enabled ? 'ENABLED' : 'DISABLED'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4" />
                <Label htmlFor="scraper-enabled" className="text-base font-medium">
                  Enable AdSpy Scraper
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                When disabled, scheduled scraping will be skipped entirely
              </p>
            </div>
            <Switch
              id="scraper-enabled"
              checked={settings.scraper_enabled}
              onCheckedChange={(checked) => handleSettingChange('scraper_enabled', checked)}
            />
          </div>

          {!settings.scraper_enabled && (
            <Alert className="mt-4">
              <AlertDescription>
                ⚠️ Scraper is currently DISABLED. No ads will be scraped until you enable it.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Scraping Limits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Scraping Limits
          </CardTitle>
          <CardDescription>
            Default limits for all brands (can be overridden per-brand)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Max Ads Per Brand */}
          <div className="space-y-2">
            <Label htmlFor="max-ads" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Max Ads Per Brand (Per Run)
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="max-ads"
                type="number"
                min="0"
                max="100"
                value={settings.max_ads_per_brand}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val) && val >= 0 && val <= 100) {
                    handleSettingChange('max_ads_per_brand', val)
                  }
                }}
                className="max-w-xs"
              />
              <span className="text-sm text-gray-500">ads per scrape run</span>
            </div>
            <p className="text-sm text-gray-500">
              Maximum number of ads to scrape from each brand per scheduled run
            </p>
          </div>

          {/* Max Daily Ads */}
          <div className="space-y-2">
            <Label htmlFor="max-daily-ads" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Max Daily Ads Per Brand
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="max-daily-ads"
                type="number"
                min="0"
                max="50"
                value={settings.max_daily_ads_per_brand}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val) && val >= 0 && val <= 50) {
                    handleSettingChange('max_daily_ads_per_brand', val)
                  }
                }}
                className="max-w-xs"
              />
              <span className="text-sm text-gray-500">ads per day</span>
            </div>
            <p className="text-sm text-gray-500">
              Maximum number of new ads to process per brand per day (prevents over-scraping)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          {hasChanges ? (
            <span className="font-medium text-amber-600">
              ⚠️ You have unsaved changes
            </span>
          ) : (
            <span>All changes saved</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReload}
            disabled={reloading || saving}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${reloading ? 'animate-spin' : ''}`} />
            Reload Server Config
          </Button>
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              disabled={saving}
            >
              Discard
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Note:</strong> Changes to these settings take effect immediately for new scrape runs.
          Per-brand overrides can be configured in the Brand Management page.
        </AlertDescription>
      </Alert>
    </div>
  )
}
