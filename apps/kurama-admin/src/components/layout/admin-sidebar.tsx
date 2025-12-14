import { Link, useLocation, useRouter } from '@tanstack/react-router'
import {
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Target,
  Users,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/subjects', label: 'Matières', icon: BookOpen },
  { href: '/grades', label: 'Niveaux', icon: GraduationCap },
  { href: '/series', label: 'Séries', icon: Target },
  { href: '/lessons', label: 'Leçons', icon: Layers },
  { href: '/cards', label: 'Cartes', icon: FileText },
  { href: '/users', label: 'Utilisateurs', icon: Users },
]

export function AdminSidebar() {
  const location = useLocation()
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    await router.invalidate()
    await router.navigate({ to: '/' })
  }

  return (
    <Sidebar collapsible="icon">
      {/* Logo Header */}
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-2 py-1">
          <img src="/icon.png" alt="Kurama" className="h-8 w-8 rounded-lg" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-base font-semibold leading-tight">Kurama</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive
                  = location.pathname === item.href
                  || location.pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Déconnexion"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
