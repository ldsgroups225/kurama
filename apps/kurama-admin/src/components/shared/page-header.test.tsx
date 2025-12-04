import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title')
  })

  it('should render description when provided', () => {
    render(<PageHeader title="Title" description="Test description" />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    render(<PageHeader title="Title" />)
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  it('should render actions when provided', () => {
    render(
      <PageHeader
        title="Title"
        actions={<button>Action Button</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
  })

  it('should not render actions container when not provided', () => {
    const { container } = render(<PageHeader title="Title" />)
    // Only the title container should exist
    expect(container.querySelectorAll('.flex.items-center.gap-2')).toHaveLength(0)
  })
})
