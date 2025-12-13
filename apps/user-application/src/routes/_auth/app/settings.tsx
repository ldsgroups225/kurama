import { createFileRoute } from '@tanstack/react-router'
import { AppHeader } from '@/components/main'
import { VibrationSettings } from '@/components/settings'

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
        <VibrationSettings />

        {/* Placeholder for future settings */}
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">Plus de paramètres à venir...</p>
        </div>
      </main>
    </div>
  )
}
