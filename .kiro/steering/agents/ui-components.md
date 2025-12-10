---
inclusion: fileMatch
fileMatchPattern: "apps/user-application/src/components/**/*.{tsx,ts}"
---

# UI Component Development Guide

## shadcn/ui + Radix UI Patterns

### Component Structure
```tsx
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "ghost"
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          variant === "outline" && "border-2",
          variant === "ghost" && "border-none shadow-none",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"
```

### Adding shadcn Components
```bash
# Add component via CLI
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# Components go to src/components/ui/
```

### Composition Pattern
```tsx
// Compound component pattern
export function Card({ children, className }: CardProps) {
  return <div className={cn("rounded-lg border", className)}>{children}</div>
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>
}

// Usage
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Gamification Components

### Level Badge
```tsx
export function LevelBadge({ level, xp, xpToNext }: LevelBadgeProps) {
  const progress = (xp / xpToNext) * 100
  
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-level text-white rounded-full px-3 py-1">
        Niveau {level}
      </div>
      <Progress value={progress} className="w-24" />
      <span className="text-xp text-sm">{xp}/{xpToNext} XP</span>
    </div>
  )
}
```

### Achievement Card
```tsx
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityClass = {
    common: "bg-gradient-common",
    rare: "bg-gradient-rare",
    epic: "bg-gradient-epic",
    legendary: "bg-gradient-legendary",
  }[achievement.rarity]
  
  return (
    <Card className={cn(rarityClass, "text-white")}>
      <CardContent className="flex items-center gap-3 p-4">
        <achievement.icon className="h-8 w-8" />
        <div>
          <h3 className="font-semibold">{achievement.title}</h3>
          <p className="text-sm opacity-80">{achievement.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Loading States

### Skeleton Components
```tsx
export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  )
}

// Usage
if (isLoading) return <CardSkeleton />
```

## Accessibility Requirements

### Icon Buttons
```tsx
// ✅ Always add aria-label for icon-only buttons
<Button variant="ghost" size="icon" aria-label="Fermer">
  <X className="h-4 w-4" />
</Button>
```

### Focus Management
```tsx
// Dialog focus trap
<Dialog>
  <DialogTrigger asChild>
    <Button>Ouvrir</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Focus automatically trapped */}
    <DialogHeader>
      <DialogTitle>Titre</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Screen Reader Announcements
```tsx
<div role="status" aria-live="polite">
  {message}
</div>
```

## Animation Patterns (Motion)
```tsx
import { motion } from "motion/react"

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
```

## Component Organization
- `components/ui/` - shadcn/ui base components
- `components/auth/` - Authentication components
- `components/gamification/` - XP, levels, achievements
- `components/learning/` - Flashcards, quiz, exam
- `components/payments/polar/` - Payment components
- `components/pwa/` - Offline, sync, install
