import { SettingsInterface } from '@/components/settings/settings-interface'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">
          AdSpy Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Configure global scraper settings and manage master controls.
        </p>
      </div>

      <SettingsInterface />
    </div>
  )
}
