export type SortDirection = 'asc' | 'desc' | null

export interface ColumnConfig<T = Record<string, unknown>> {
    name: string
    field: keyof T & string
    sort?: boolean
    render?: (value: T[keyof T], row: T) => React.ReactNode
    width?: string
    align?: 'left' | 'center' | 'right'
}

export interface SortState {
    field: string
    direction: SortDirection
}

export interface PaginationState {
    page: number
    pageSize: number
    total: number
}

export interface FilterState {
    query: string
    [key: string]: unknown
}

export interface TableQueryState {
    page: number
    pageSize: number
    query: string
    sortField: string
    sortDirection: Exclude<SortDirection, null>
}

export interface TableFetchResult<T> {
    data: T[]
    total: number
    emptyMessage?: string
}

export interface TableDataSource<T> {
    fetchData: (query: TableQueryState) => Promise<TableFetchResult<T>>
    initialQuery?: Partial<TableQueryState>
}

export interface TableProps<T = Record<string, unknown>> {
    columns: ColumnConfig<T>[]
    data?: T[]
    rowKey: keyof T & string
    loading?: boolean
    emptyMessage?: string
    loadingRows?: number
    sortState?: SortState
    onSortChange?: (sort: SortState) => void
    onRowClick?: (row: T) => void
    pagination?: PaginationState
    onPageChange?: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    filterState?: FilterState
    onFilterChange?: (filter: FilterState) => void
    showSearch?: boolean
    className?: string
    stickyHeader?: boolean
    dataSource?: TableDataSource<T>
}
