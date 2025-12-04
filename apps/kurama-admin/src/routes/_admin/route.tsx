import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AdminSidebar, AdminHeader } from '@/components/layout'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { checkAuth } from '@/core/functions/auth'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    try {
      const result = await checkAuth()
      return { user: result.user }
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
