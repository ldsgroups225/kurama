import type { ReactNode } from 'react'
import { Component } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary for lazy loaded components
 * Provides fallback UI and retry functionality
 */
export class LazyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Lazy loading error:', error)
    this.props.onError?.(error)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[200px] items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription className="space-y-4">
              <p className="font-medium">Failed to load component</p>
              <p className="text-sm">
                There was an error loading this part of the application.
              </p>
              <Button
                onClick={this.handleReload}
                variant="outline"
                size="sm"
              >
                Reload Page
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
