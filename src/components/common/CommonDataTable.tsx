import { type ReactNode, useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { CardFooter, CardHeader } from 'react-bootstrap'

import ComponentCard from '@/components/cards/ComponentCard'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'

export type CommonDataTableContext<TData> = {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  columnFilters: ColumnFiltersState
  setColumnFilters: (filters: ColumnFiltersState) => void
  sorting: SortingState
  setSorting: (sorting: SortingState) => void
}

export type CommonDataTableProps<TData> = {
  title: string
  data: TData[]
  columns: ColumnDef<TData, any>[]
  itemsName?: string
  emptyMessage?: ReactNode
  initialPageSize?: number
  showInfo?: boolean
  renderHeader?: (context: CommonDataTableContext<TData>) => ReactNode
  renderHeaderRight?: (context: CommonDataTableContext<TData>) => ReactNode
}

const CommonDataTable = <TData,>({
  title,
  data,
  columns,
  itemsName = 'items',
  emptyMessage,
  initialPageSize = 5,
  showInfo = true,
  renderHeader,
  renderHeaderRight,
}: CommonDataTableProps<TData>) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    enableColumnFilters: true,
  })

  const totalItems = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const start = totalItems === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(start + pageSize - 1, totalItems)

  const context = useMemo(
    () => ({
      globalFilter,
      setGlobalFilter,
      columnFilters,
      setColumnFilters,
      sorting,
      setSorting,
    }),
    [globalFilter, columnFilters, sorting],
  )

  return (
    <ComponentCard title={title} bodyClassName="p-0" headerClassName="d-none">
      {(renderHeader || renderHeaderRight) && (
        <CardHeader className="border-light justify-content-between">
          <div className="d-flex flex-wrap gap-2 justify-content-start">
            {renderHeader ? renderHeader(context) : null}
          </div>
          <div className="d-flex align-items-center gap-2">
            {renderHeaderRight ? renderHeaderRight(context) : null}
          </div>
        </CardHeader>
      )}

      <DataTable table={table} emptyMessage={emptyMessage} />

      <CardFooter className="border-light">
        <TablePagination
          totalItems={totalItems}
          start={start}
          end={end}
          itemsName={itemsName}
          showInfo={showInfo}
          previousPage={table.previousPage}
          canPreviousPage={table.getCanPreviousPage()}
          pageCount={table.getPageCount()}
          pageIndex={pageIndex}
          setPageIndex={table.setPageIndex}
          nextPage={table.nextPage}
          canNextPage={table.getCanNextPage()}
        />
      </CardFooter>
    </ComponentCard>
  )
}

export default CommonDataTable
