import * as React from 'react'

type Theme = 'dark' | 'light' | 'system'

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme?: 'light' | 'dark'
  systemTheme?: 'light' | 'dark'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: undefined,
  systemTheme: undefined,
}

export const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)
