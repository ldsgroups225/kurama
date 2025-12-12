import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  emptyMessage?: string
  // Selection props
  selectable?: boolean
  selectedIds?: Set<number>
  onSelectionChange?: (ids: Set<number>) => void
  getRowId?: (item: T) => number
}

export function DataTable<T>({
  columns,
  data,
  page,
  totalPages,
  total,
  onPageChange,
  isLoading,
  emptyMessage = 'Aucune donnée',
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  getRowId,
}: DataTableProps<T>) {
  const allPageIds = selectable && getRowId ? data.map(getRowId) : []
  const allSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id))
  const someSelected = allPageIds.some((id) => selectedIds.has(id))

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    const newSelection = new Set(selectedIds)
    if (checked) {
      allPageIds.forEach((id) => newSelection.add(id))
    } else {
      allPageIds.forEach((id) => newSelection.delete(id))
    }
    onSelectionChange(newSelection)
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (!onSelectionChange) return
    const newSelection = new Set(selectedIds)
    if (checked) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    onSelectionChange(newSelection)
  }

  const colSpan = selectable ? columns.length + 1 : columns.length

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Sélectionner tout"
                    {...(someSelected && !allSelected ? { 'data-state': 'indeterminate' } : {})}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => {
                const rowId = getRowId?.(item)
                const isSelected = rowId !== undefined && selectedIds.has(rowId)
                return (
                  <TableRow key={index} data-state={isSelected ? 'selected' : undefined}>
                    {selectable && rowId !== undefined && (
                      <TableCell className="w-12">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(rowId, !!checked)}
                          aria-label="Sélectionner la ligne"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.cell(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectable && selectedIds.size > 0 ? (
            <span>{selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''} · </span>
          ) : null}
          {total} résultat{total > 1 ? 's' : ''}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <span className="text-sm">
              Page {page} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
