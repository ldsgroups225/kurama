import { createFileRoute, Link } from '@tanstack/react-router'
import { LayoutDashboard, BookOpen, Layers, Users, Settings } from '@/lib/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const features = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'View analytics and key metrics',
      href: '/dashboard',
    },
    {
      icon: BookOpen,
      title: 'Subjects',
      description: 'Manage educational subjects',
      href: '/subjects',
    },
    {
      icon: Layers,
      title: 'Lessons',
      description: 'Create and edit lessons',
      href: '/lessons',
    },
    {
      icon: Users,
      title: 'Users',
      description: 'Manage user accounts',
      href: '/users',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Settings className="h-4 w-4" />
            </div>
            <span className="text-xl font-semibold">Kurama Admin</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Welcome to Kurama Admin
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage educational content, users, and analytics for the Kurama learning platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.href} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={feature.href}>
                        Go to {feature.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
            <h2 className="mb-2 text-lg font-semibold">Getting Started</h2>
            <p className="text-sm text-muted-foreground">
              This admin panel is currently in development. Authentication and full CRUD operations
              will be available in upcoming releases.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
