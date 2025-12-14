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
  align?: 'start' | 'center' | 'end'
}

export function ThemeToggle({
  variant = 'ghost',
  size = 'default',
  align = 'end',
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" aria-hidden="true" />
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="h-4 w-4" aria-hidden="true" />
    }
    return <Sun className="h-4 w-4" aria-hidden="true" />
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="aspect-square" aria-label="Toggle theme">
          {getCurrentIcon()}
          <span className="sr-only">
            Current theme:
            {' '}
            {theme === 'system' ? `System (${resolvedTheme})` : theme}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-40">
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = theme === option.value

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="flex cursor-pointer items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
              {isSelected && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
