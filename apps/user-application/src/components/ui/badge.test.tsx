import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Badge } from './badge'

describe('badge component', () => {
  test('renders a badge with default props', () => {
    render(<Badge>New</Badge>)
    const badge = screen.getByText('New')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground', 'border-transparent')
  })

  test('renders with different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)
    let badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground', 'border-transparent')

    rerender(<Badge variant="destructive">Error</Badge>)
    badge = screen.getByText('Error')
    expect(badge).toHaveClass('bg-destructive', 'text-white', 'border-transparent')

    rerender(<Badge variant="outline">Outline</Badge>)
    badge = screen.getByText('Outline')
    expect(badge).toHaveClass('text-foreground')
  })

  test('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })

  test('renders as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>,
    )
    const link = screen.getByRole('link', { name: 'Link Badge' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  test('has correct base styling classes', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'border',
      'px-2',
      'py-0.5',
      'text-xs',
      'font-medium',
      'w-fit',
      'whitespace-nowrap',
      'shrink-0',
    )
  })
})
