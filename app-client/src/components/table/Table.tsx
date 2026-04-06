import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { cn } from '@/lib/utils';

import Pagination from './Pagination';
import type { PaginationState, SortDirection, TableProps, TableQueryState } from './types';
import Skeleton from '../ui/skeleton';
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui';



const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const parsePositiveInt = (value: string | null, fallback: number) => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildTableParams = (query: TableQueryState, defaults: TableQueryState) => {
    const params = new URLSearchParams();

    if (query.query) {
        params.set('query', query.query);
    }

    if (query.sortField !== defaults.sortField) {
        params.set('sortField', query.sortField);
    }

    if (query.sortDirection !== defaults.sortDirection) {
        params.set('sortOrder', query.sortDirection);
    }

    if (query.page !== defaults.page) {
        params.set('page', query.page.toString());
    }

    if (query.pageSize !== defaults.pageSize) {
        params.set('limit', query.pageSize.toString());
    }

    return params;
};

const SortIcon: React.FC<{ direction: SortDirection }> = ({ direction }) => {
    if (direction === 'asc')
        return (
            <svg
                className="inline-block h-2.5 w-2.5 flex-shrink-0"
                viewBox="0 0 12 12"
                fill="currentColor"
            >
                <path d="M6 2l4 7H2z" />
            </svg>
        );
    if (direction === 'desc')
        return (
            <svg className="inline-block h-2.5 w-2.5 rotate-180 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 2l4 7H2z" />
            </svg>
        );
    return (
        <svg className="inline-block h-2.5 w-2.5 flex-shrink-0 opacity-30" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1l3 4H3zM6 11l-3-4h6z" />
        </svg>
    );
};

const FilterBar: React.FC<{
    initialValue: string
    onSearch: (value: string) => void
}> = ({ initialValue, onSearch }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.8}
            >
                <circle cx={6.5} cy={6.5} r={4.5} />
                <path d="M10.5 10.5l3 3" strokeLinecap="round" />
            </svg>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onSearch(value);
                    }
                }}
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
                onClick={() => onSearch(value)}
                className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
            >
                Search
            </button>
            {value ? (
                <button
                    onClick={() => {
                        setValue('');
                        onSearch('');
                    }}
                    className="border-none bg-transparent text-lg leading-none text-muted-foreground hover:text-foreground"
                >
                    x
                </button>
            ) : null}
        </div>
    );
};

function Table<T extends Record<string, unknown>>({
    columns,
    data,
    rowKey,
    loading = false,
    emptyMessage = 'No data available.',
    loadingRows = 5,
    sortState,
    onSortChange,
    onRowClick,
    pagination,
    onPageChange,
    onPageSizeChange,
    filterState,
    onFilterChange,
    showSearch = false,
    className,
    stickyHeader = false,
    dataSource,
}: TableProps<T>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [remoteData, setRemoteData] = useState<T[]>([]);
    const [remoteTotal, setRemoteTotal] = useState(0);
    const [remoteLoading, setRemoteLoading] = useState(false);
    const [remoteError, setRemoteError] = useState<string | null>(null);

    const defaultQuery = useMemo<TableQueryState>(() => ({
        page: dataSource?.initialQuery?.page ?? DEFAULT_PAGE,
        pageSize: dataSource?.initialQuery?.pageSize ?? DEFAULT_PAGE_SIZE,
        query: dataSource?.initialQuery?.query ?? '',
        sortField: dataSource?.initialQuery?.sortField ?? columns[0]?.field ?? 'id',
        sortDirection: dataSource?.initialQuery?.sortDirection ?? 'desc',
    }), [columns, dataSource]);

    const queryState = useMemo<TableQueryState>(() => {
        if (!dataSource) {
            return {
                page: pagination?.page ?? defaultQuery.page,
                pageSize: pagination?.pageSize ?? defaultQuery.pageSize,
                query: filterState?.query ?? defaultQuery.query,
                sortField: sortState?.field ?? defaultQuery.sortField,
                sortDirection: sortState?.direction === 'asc' ? 'asc' : defaultQuery.sortDirection,
            };
        }

        return {
            page: parsePositiveInt(searchParams.get('page'), defaultQuery.page),
            pageSize: parsePositiveInt(searchParams.get('limit'), defaultQuery.pageSize),
            query: searchParams.get('query') ?? defaultQuery.query,
            sortField: searchParams.get('sortField') ?? defaultQuery.sortField,
            sortDirection: searchParams.get('sortOrder') === 'asc' ? 'asc' : defaultQuery.sortDirection,
        };
    }, [dataSource, defaultQuery, filterState?.query, pagination?.page, pagination?.pageSize, searchParams, sortState?.direction, sortState?.field]);

    useEffect(() => {
        if (!dataSource) {
            return;
        }

        let active = true;

        const loadData = async () => {
            setRemoteLoading(true);
            setRemoteError(null);

            try {
                const response = await dataSource.fetchData(queryState);

                if (!active) {
                    return;
                }

                setRemoteData(response.data);
                setRemoteTotal(response.total);
                setRemoteError(response.emptyMessage ?? null);
            } catch (error) {
                if (!active) {
                    return;
                }

                const message =
                    typeof error === 'object' &&
                    error !== null &&
                    'message' in error &&
                    typeof error.message === 'string'
                        ? error.message
                        : 'Something went wrong. Please try again.';

                setRemoteData([]);
                setRemoteTotal(0);
                setRemoteError(message);
            } finally {
                if (active) {
                    setRemoteLoading(false);
                }
            }
        };

        loadData();

        return () => {
            active = false;
        };
    }, [dataSource, queryState]);

    const resolvedData = dataSource ? remoteData : (data ?? []);
    const resolvedLoading = dataSource ? remoteLoading : loading;
    const resolvedPagination = dataSource
        ? { page: queryState.page, pageSize: queryState.pageSize, total: remoteTotal }
        : pagination;
    const resolvedSortState = dataSource
        ? { field: queryState.sortField, direction: queryState.sortDirection }
        : sortState;
    const resolvedFilterState = dataSource
        ? { query: queryState.query }
        : filterState;
    const resolvedEmptyMessage = dataSource && remoteError ? remoteError : emptyMessage;

    const updateQueryState = useCallback((nextQuery: TableQueryState) => {
        setSearchParams(buildTableParams(nextQuery, defaultQuery));
    }, [defaultQuery, setSearchParams]);

    const handleSort = (field: string) => {
        if (dataSource) {
            const activeDirection = resolvedSortState?.field === field ? resolvedSortState.direction : null;
            const nextDirection = activeDirection === 'asc' ? 'desc' : 'asc';

            updateQueryState({
                ...queryState,
                sortField: field,
                sortDirection: nextDirection,
                page: DEFAULT_PAGE,
            });
            return;
        }

        if (!onSortChange) return;

        const activeDirection = sortState?.field === field ? sortState.direction : null;
        onSortChange({
            field,
            direction: activeDirection === 'asc' ? 'desc' : 'asc',
        });
    };

    const handleSearch = useCallback((query: string) => {
        if (dataSource) {
            updateQueryState({
                ...queryState,
                query,
                page: DEFAULT_PAGE,
            });
            return;
        }

        onFilterChange?.({ ...(filterState ?? { query: '' }), query });
    }, [dataSource, filterState, onFilterChange, queryState, updateQueryState]);

    const handleResolvedPageChange = useCallback((page: number) => {
        if (dataSource) {
            updateQueryState({
                ...queryState,
                page,
            });
            return;
        }

        onPageChange?.(page);
    }, [dataSource, onPageChange, queryState, updateQueryState]);

    const handleResolvedPageSizeChange = useCallback((pageSize: number) => {
        if (dataSource) {
            updateQueryState({
                ...queryState,
                page: DEFAULT_PAGE,
                pageSize,
            });
            return;
        }

        onPageSizeChange?.(pageSize);
    }, [dataSource, onPageSizeChange, queryState, updateQueryState]);

    const isClickable = Boolean(onRowClick);

    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-lg border border-border bg-background font-sans text-sm text-foreground shadow-sm',
                className,
            )}
        >
            {showSearch ? (
                <FilterBar
                    initialValue={resolvedFilterState?.query ?? ''}
                    onSearch={handleSearch}
                />
            ) : null}

            <div className="overflow-x-auto">
                <UITable>
                    <TableHeader className={cn('bg-muted/20', stickyHeader ? 'sticky top-0 z-10' : '')}>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead
                                    key={col.field}
                                    className={cn(
                                        'whitespace-nowrap text-xs uppercase',
                                        resolvedSortState?.field === col.field
                                            ? 'text-primary'
                                            : 'text-muted-foreground',
                                        col.sort ? 'cursor-pointer select-none hover:text-primary' : '',
                                    )}
                                    style={{ width: col.width }}
                                    onClick={col.sort ? () => handleSort(col.field) : undefined}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.name}
                                        {col.sort ? (
                                            <SortIcon
                                                direction={
                                                    resolvedSortState?.field === col.field
                                                        ? (resolvedSortState.direction ?? null)
                                                        : null
                                                }
                                            />
                                        ) : null}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {resolvedLoading
                            ? Array.from({ length: loadingRows }).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`}>
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.field}
                                            className={cn(
                                                col.align === 'center'
                                                    ? 'text-center'
                                                    : col.align === 'right'
                                                        ? 'text-right'
                                                        : 'text-left',
                                            )}
                                        >
                                            <Skeleton
                                                variant="line"
                                                width={rowIndex % 2 === 0 ? '60%' : '80%'}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : null}

                        {!resolvedLoading && resolvedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="py-12 text-center">
                                    {resolvedEmptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : null}

                        {!resolvedLoading
                            ? resolvedData.map((row) => (
                                <TableRow
                                    key={String(row[rowKey])}
                                    className={cn('hover:bg-muted/20', isClickable ? 'cursor-pointer' : '')}
                                    onClick={isClickable ? () => onRowClick?.(row) : undefined}
                                    tabIndex={isClickable ? 0 : undefined}
                                    onKeyDown={
                                        isClickable
                                            ? (event) => {
                                                if (event.key === 'Enter') {
                                                    onRowClick?.(row);
                                                }
                                            }
                                            : undefined
                                    }
                                >
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.field}
                                            className={cn(
                                                col.align === 'center'
                                                    ? 'text-center'
                                                    : col.align === 'right'
                                                        ? 'text-right'
                                                        : 'text-left',
                                            )}
                                        >
                                            {col.render
                                                ? col.render(row[col.field], row)
                                                : String(row[col.field] ?? '')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : null}
                    </TableBody>
                </UITable>
            </div>

            {resolvedPagination ? (
                <Pagination
                    pagination={resolvedPagination as PaginationState}
                    onPageChange={handleResolvedPageChange}
                    onPageSizeChange={handleResolvedPageSizeChange}
                />
            ) : null}
        </div>
    );
}

export default Table;
