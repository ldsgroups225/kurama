import { createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '@/components/main'
import { ThemeSettings, VibrationSettings } from '@/components/settings'

export const Route = createFileRoute('/_auth/app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Paramètres"
        showAvatar={false}
        showBackButton={true}
        onBackClick={() => window.history.back()}
      />

      <main className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
        <ThemeSettings />
        <VibrationSettings />
      </main>
    </div>
  )
}
