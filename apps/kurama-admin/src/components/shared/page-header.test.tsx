import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { PageHeader } from './page-header'

describe('pageHeader', () => {
  test('should render title', () => {
    render(<PageHeader title="Test Title" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title')
  })

  test('should render description when provided', () => {
    render(<PageHeader title="Title" description="Test description" />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  test('should not render description when not provided', () => {
    render(<PageHeader title="Title" />)
    expect(screen.queryByText('Test description')).not.toBeInTheDocument()
  })

  test('should render actions when provided', () => {
    render(
      <PageHeader
        title="Title"
        actions={<button type="button">Action Button</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
  })

  test('should not render actions container when not provided', () => {
    const { container } = render(<PageHeader title="Title" />)
    // Only the title container should exist
    expect(container.querySelectorAll('.flex.items-center.gap-2')).toHaveLength(0)
  })
})
