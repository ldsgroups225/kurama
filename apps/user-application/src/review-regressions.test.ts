import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

const appRoot = process.cwd()

function readAppFile(relativePath: string) {
  return readFileSync(join(appRoot, relativePath), 'utf8')
}

describe('review regressions', () => {
  test('root viewport metadata does not disable pinch zoom', () => {
    const rootRoute = readAppFile('src/routes/__root.tsx')

    expect(rootRoute).not.toContain('user-scalable=no')
    expect(rootRoute).not.toContain('maximum-scale=1')
  })

  test('global styles keep browser text selection and scroll affordances', () => {
    const styles = readAppFile('src/styles.css')

    expect(styles).not.toContain('user-select: none;')
    expect(styles).not.toContain('-webkit-user-select: none;')
    expect(styles).not.toContain('*::-webkit-scrollbar')
    expect(styles).not.toContain('scrollbar-width: none;')
  })

  test('landing features do not reference missing marketing asset files', () => {
    const featuresSection = readAppFile('src/components/landing/features-section.tsx')

    expect(featuresSection).not.toContain('/cloudflare.png')
    expect(featuresSection).not.toContain('/better-auth.png')
    expect(featuresSection).not.toContain('/polar.png')
    expect(featuresSection).not.toContain('/pnpm.webp')
  })

  test('onboarding screens do not generate render-time UUID keys', () => {
    const welcomeScreen = readAppFile('src/components/onboarding/welcome-screen.tsx')
    const onboardingScreen = readAppFile('src/components/onboarding/onboarding-screen.tsx')

    expect(welcomeScreen).not.toContain('generateUUID()')
    expect(onboardingScreen).not.toContain('generateUUID()')
  })

  test('dashboard route uses stable keys and wires its activity CTA', () => {
    const dashboardRoute = readAppFile('src/routes/_auth/app/index.lazy.tsx')

    expect(dashboardRoute).not.toContain('key={generateUUID()}')
    expect(dashboardRoute).toContain("key={stat.label}")
    expect(dashboardRoute).toContain("key={action.label}")
    expect(dashboardRoute).toContain("onClick={() => navigate({ to: '/app/progress' })}")
  })

  test('community page does not expose inert primary actions', () => {
    const groupsPage = readAppFile('src/routes/_auth/app/groups.tsx')

    expect(groupsPage).not.toContain('Créer un nouveau groupe')
    expect(groupsPage).toContain('Groupes bientôt disponibles')
    expect(groupsPage).toContain('openComingSoonDialog()')
    expect(groupsPage).toContain('openComingSoonDialog(group.name)')
  })

  test('motion-heavy entry screens account for reduced motion', () => {
    const welcomeScreen = readAppFile('src/components/onboarding/welcome-screen.tsx')
    const onboardingScreen = readAppFile('src/components/onboarding/onboarding-screen.tsx')
    const authScreen = readAppFile('src/components/auth/auth-screen.tsx')

    expect(welcomeScreen).toContain('useReducedMotion')
    expect(onboardingScreen).toContain('useReducedMotion')
    expect(authScreen).toContain('useReducedMotion')
  })

  test('icon-only buttons expose accessible names', () => {
    const header = readAppFile('src/components/layout/header.tsx')
    const appHeader = readAppFile('src/components/main/app-header.tsx')

    expect(header).toContain('aria-label="Open navigation menu"')
    expect(header).toContain('aria-label="Open notifications"')
    expect(appHeader).toContain('aria-label="Open notifications"')
    expect(appHeader).toContain('aria-label="Go back"')
  })
})
