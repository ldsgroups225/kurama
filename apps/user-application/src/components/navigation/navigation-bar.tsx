import { Link } from '@tanstack/react-router'
import { ExternalLink, Github, LogIn, Menu } from 'lucide-react'
import * as React from 'react'
import { AccountDialog } from '@/components/auth/account-dialog'
import { SyncStatus } from '@/components/pwa'
import { ThemeToggle } from '@/components/theme'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface NavigationItem {
  label: string
  href: string
  isExternal?: boolean
  scrollTo?: string
}

const navigationItems: NavigationItem[] = [
  { label: 'Fonctionnalités', href: '/#features', scrollTo: 'features' },
  {
    label: 'Guide',
    href: '/docs',
    isExternal: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/your-org/kurama',
    isExternal: true,
  },
]

export function NavigationBar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { data: session } = authClient.useSession()

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/app',
    })
  }

  const user = session?.user
  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U'

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = () => {
    setIsOpen(false)
  }

  return (
    <nav
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-500 ease-out',
        isScrolled
          ? `
            border-b border-border/50 bg-background/80 shadow-lg
            shadow-primary/5 backdrop-blur-xl
          `
          : 'bg-transparent',
      )}
    >
      <div className={`
        container mx-auto px-4
        sm:px-6
        lg:px-8
      `}
      >
        <div className={`
          flex h-16 items-center justify-between
          lg:h-20
        `}
        >
          {/* Logo and Brand */}
          <Link
            to="/"
            className="group flex items-center space-x-3 no-underline"
            aria-label="Kurama - Accueil"
          >
            <div className="flex flex-col">
              <span className={`
                bg-linear-to-r from-foreground to-foreground/80 bg-clip-text
                text-lg font-bold text-transparent transition-all duration-300
                group-hover:from-primary group-hover:to-primary/80
                lg:text-xl
              `}
              >
                Kurama
              </span>
              <span className={`
                text-xs font-medium tracking-wider text-muted-foreground
              `}
              >
                Préparez votre BEPC/BAC
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={`
            hidden items-center space-x-1
            lg:flex
          `}
          >
            {navigationItems.map(item => (
              <div key={item.label} className="group relative">
                {item.isExternal
                  ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                          group flex items-center space-x-2 rounded-lg px-4 py-2
                          text-sm font-medium text-muted-foreground
                          transition-all duration-300
                          hover:bg-accent/50 hover:text-foreground
                        `}
                    >
                      <span>{item.label}</span>
                      {item.label === 'GitHub'
                        ? (
                          <Github className="h-4 w-4" />
                        )
                        : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                    </a>
                  )
                  : (
                    <Link
                      to={item.href}
                      onClick={handleNavClick}
                      className={`
                          block rounded-lg px-4 py-2 text-sm font-medium
                          text-muted-foreground transition-all duration-300
                          hover:bg-accent/50 hover:text-foreground
                        `}
                    >
                      {item.label}
                    </Link>
                  )}
                <div className={`
                  absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2
                  transform bg-linear-to-r from-primary to-primary/80
                  transition-all duration-300
                  group-hover:w-3/4
                `}
                />
              </div>
            ))}

            {/* Sync Status & Theme Toggle */}
            <div className="ml-2 flex items-center gap-1 border-l border-border/30 pl-2">
              {session && <SyncStatus />}
              <ThemeToggle variant="ghost" align="end" />
            </div>
          </div>

          {/* Auth Button - Desktop */}
          <div className={`
            hidden
            lg:block
          `}
          >
            {session
              ? (
                <AccountDialog>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3"
                    data-profile-button
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage
                        src={user?.image || undefined}
                        alt={user?.name || 'User'}
                      />
                      <AvatarFallback className={`
                          bg-primary text-xs text-primary-foreground
                        `}
                      >
                        {fallbackText}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {user?.name || 'Account'}
                    </span>
                  </Button>
                </AccountDialog>
              )
              : (
                <Button
                  onClick={handleGoogleSignIn}
                  variant="default"
                  className="gap-2"
                  data-login-button
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )}
          </div>

          {/* Mobile Menu Button + Theme Toggle */}
          <div className={`
            flex items-center space-x-2
            lg:hidden
          `}
          >
            <ThemeToggle variant="ghost" align="end" />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`
                    relative h-10 w-10
                    hover:bg-accent/50
                  `}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={`
                  w-[300px] border-l border-border/50 bg-background/95
                  backdrop-blur-xl
                `}
              >
                <SheetHeader className="space-y-1 pb-6 text-left">
                  <SheetTitle className={`
                    bg-linear-to-r from-primary to-primary/80 bg-clip-text
                    text-xl font-bold text-transparent
                  `}
                  >
                    Navigation
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Explorez Kurama
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col space-y-2 pb-6">
                  {navigationItems.map(item => (
                    <div key={item.label} className="group relative">
                      {item.isExternal
                        ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                                flex w-full items-center justify-between
                                rounded-lg px-4 py-3 text-sm font-medium
                                text-muted-foreground transition-all
                                duration-300
                                hover:bg-accent/50 hover:text-foreground
                              `}
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{item.label}</span>
                            {item.label === 'GitHub'
                              ? (
                                <Github className="h-4 w-4" />
                              )
                              : (
                                <ExternalLink className="h-4 w-4" />
                              )}
                          </a>
                        )
                        : (
                          <Link
                            to={item.href}
                            onClick={handleNavClick}
                            className={`
                                flex w-full items-center rounded-lg px-4 py-3
                                text-left text-sm font-medium
                                text-muted-foreground transition-all
                                duration-300
                                hover:bg-accent/50 hover:text-foreground
                              `}
                          >
                            {item.label}
                          </Link>
                        )}
                    </div>
                  ))}
                </div>

                {/* Mobile Auth */}
                <div className="border-t border-border/50 pt-4">
                  {session
                    ? (
                      <div
                        className={`
                            flex items-center gap-3 rounded-lg bg-accent/30 px-4
                            py-3
                          `}
                        data-profile-button
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user?.image || undefined}
                            alt={user?.name || 'User'}
                          />
                          <AvatarFallback className={`
                              bg-primary text-sm text-primary-foreground
                            `}
                          >
                            {fallbackText}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    )
                    : (
                      <Button
                        onClick={handleGoogleSignIn}
                        variant="default"
                        className="w-full gap-2"
                        data-login-button
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In with Google
                      </Button>
                    )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
