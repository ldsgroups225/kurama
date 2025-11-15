import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, Monitor, Moon, Sun } from '@/lib/icons'
import { useTheme } from './use-theme'

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showLabel?: boolean
  align?: 'start' | 'center' | 'end'
}

export function ThemeToggle({
  variant = 'ghost',
  size = 'default',
  showLabel = false,
  align = 'end',
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Animation variants for icons
  const iconVariants = {
    sun: 'transition-all duration-500 ease-in-out',
    moon: 'transition-all duration-500 ease-in-out',
    system: 'transition-all duration-300 ease-in-out',
  }

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return (
        <Monitor
          className={`
            h-4 w-4
            ${iconVariants.system}
            scale-100 rotate-0
          `}
          aria-hidden="true"
        />
      )
    }

    if (resolvedTheme === 'dark') {
      return (
        <Moon
          className={`
            h-4 w-4
            ${iconVariants.moon}
            scale-100 rotate-0
          `}
          aria-hidden="true"
        />
      )
    }

    return (
      <Sun
        className={`
          h-4 w-4
          ${iconVariants.sun}
          scale-100 rotate-0
        `}
        aria-hidden="true"
      />
    )
  }

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Use light theme',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Use dark theme',
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Use system theme',
    },
  ] as const

  const handleThemeSelect = (newTheme: typeof theme) => {
    setTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`
            relative overflow-hidden transition-all duration-200 ease-in-out
            hover:scale-105
            focus:ring-2 focus:ring-ring focus:ring-offset-2
            active:scale-95
            ${showLabel ? 'gap-2' : 'aspect-square'}
          `}
          aria-label="Toggle theme"
        >
          <div className="relative flex items-center justify-center">
            {getCurrentIcon()}
          </div>
          {showLabel && (
            <span className="text-sm font-medium">
              {themeOptions.find(option => option.value === theme)?.label}
            </span>
          )}
          <span className="sr-only">
            Current theme:
            {' '}
            {theme === 'system' ? `System (${resolvedTheme})` : theme}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className={`
          w-56 border border-border/50 bg-popover/95 p-2 shadow-lg
          backdrop-blur-sm
        `}
      >
        <div className="grid gap-1">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = theme === option.value

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleThemeSelect(option.value)}
                className={`
                  group flex cursor-pointer items-center gap-3 rounded-md px-3
                  py-2.5 transition-all duration-200 ease-in-out
                  hover:bg-accent/80
                  focus:bg-accent/80
                  ${isSelected ? 'bg-accent/60 text-accent-foreground' : ''}
                `}
              >
                <div className="flex h-5 w-5 items-center justify-center">
                  <Icon
                    className={`
                      h-4 w-4 transition-all duration-200
                      ${isSelected
                ? 'scale-110 text-accent-foreground'
                : `text-muted-foreground`}
                      group-hover:scale-105
                    `}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={`
                    text-sm leading-none font-medium
                    ${isSelected ? 'text-accent-foreground' : 'text-foreground'}
                  `}
                  >
                    {option.label}
                  </span>
                  <span className={`
                    mt-0.5 text-xs leading-none text-muted-foreground
                  `}
                  >
                    {option.description}
                  </span>
                </div>

                {isSelected && (
                  <Check className={`
                    h-4 w-4 animate-in text-accent-foreground duration-150
                    fade-in-0 zoom-in-75
                  `}
                  />
                )}
              </DropdownMenuItem>
            )
          })}
        </div>

        {resolvedTheme && (
          <div className="mt-2 border-t border-border/50 pt-2">
            <div className={`
              flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground
            `}
            >
              <div className={`
                h-2 w-2 rounded-full transition-colors duration-200
                ${resolvedTheme === 'dark'
            ? 'bg-gradient-xp'
            : `bg-gradient-level`}
              `}
              />
              Currently using
              {' '}
              {resolvedTheme}
              {' '}
              theme
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simplified version for minimal use cases
export function ThemeToggleSimple() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark')
    }
    else if (theme === 'dark') {
      setTheme('system')
    }
    else {
      setTheme('light')
    }
  }

  return (
    <Button
      variant="ghost"
      size="default"
      onClick={handleToggle}
      className={`
        relative aspect-square overflow-hidden transition-all duration-200
        ease-in-out
        hover:scale-105
        focus:ring-2 focus:ring-ring focus:ring-offset-2
        active:scale-95
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <div className="relative flex items-center justify-center">
        {theme === 'system' && (
          <Monitor className={`
            h-4 w-4 scale-100 rotate-0 transition-all duration-300 ease-in-out
          `}
          />
        )}
        {resolvedTheme === 'dark' && theme !== 'system' && (
          <Moon className={`
            h-4 w-4 scale-100 rotate-0 transition-all duration-500 ease-in-out
          `}
          />
        )}
        {resolvedTheme === 'light' && theme !== 'system' && (
          <Sun className={`
            h-4 w-4 scale-100 rotate-0 transition-all duration-500 ease-in-out
          `}
          />
        )}
      </div>
      <span className="sr-only">
        Current theme:
        {' '}
        {theme === 'system' ? `System (${resolvedTheme})` : theme}
      </span>
    </Button>
  )
}
