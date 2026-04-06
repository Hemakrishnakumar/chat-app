import React, { useMemo } from 'react';
import type { PaginationState } from './types';
import { cn } from '@/lib/utils';



export interface PaginationProps {
    pagination: PaginationState
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    pageSizeOptions?: number[]
    maxPageButtons?: number
    hidePageSize?: boolean
    hideTotalCount?: boolean
    className?: string
}

function buildPageWindows(current: number, total: number, max: number): Array<number | '...'> {
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

    const half = Math.floor((max - 3) / 2);
    const leftEdge = 1;
    const rightEdge = total;

    let start = Math.max(2, current - half);
    let end = Math.min(total - 1, current + half);

    if (current - half <= 2) {
        end = Math.min(total - 1, max - 2);
        start = 2;
    }
    if (current + half >= total - 1) {
        start = Math.max(2, total - max + 2);
        end = total - 1;
    }

    const pages: Array<number | '...'> = [leftEdge];
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (end < total - 1) pages.push('...');
    pages.push(rightEdge);
    return pages;
}

const ChevronLeft = () => (
    <svg
        width={14}
        height={14}
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
    >
        <path d="M9 2L4 7l5 5" />
    </svg>
);
const ChevronRight = () => (
    <svg
        width={14}
        height={14}
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
    >
        <path d="M5 2l5 5-5 5" />
    </svg>
);
const ChevronsLeft = () => (
    <svg
        width={14}
        height={14}
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
    >
        <path d="M7 2L2 7l5 5M12 2L7 7l5 5" />
    </svg>
);
const ChevronsRight = () => (
    <svg
        width={14}
        height={14}
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
    >
        <path d="M7 2l5 5-5 5M2 2l5 5-5 5" />
    </svg>
);

const Pagination: React.FC<PaginationProps> = ({
    pagination,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
    maxPageButtons = 5,
    hidePageSize = false,
    hideTotalCount = false,
    className,
}) => {
    const { page, pageSize, total } = pagination;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    const pages = useMemo(
        () => buildPageWindows(page, totalPages, maxPageButtons),
        [maxPageButtons, page, totalPages],
    );

    const go = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
        onPageChange(nextPage);
    };

    const pageButtonClass = (active: boolean, disabled: boolean) =>
        cn(
            'inline-flex h-8 min-w-[32px] items-center justify-center rounded-md px-2 text-xs font-medium outline-none transition-all duration-100',
            active
                ? 'border-2 border-primary bg-primary font-semibold text-primary-foreground'
                : disabled
                    ? 'cursor-not-allowed border border-border bg-muted/20 text-muted-foreground'
                    : 'cursor-pointer border border-border bg-background text-foreground/70 hover:bg-muted/20',
        );

    return (
        <div
            className={cn(
                'flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background px-4 py-3 font-sans text-xs text-muted-foreground select-none',
                className,
            )}
        >
            <div className="flex items-center gap-2">
                {!hideTotalCount ? (
                    <span>
                        {total === 0 ? 'No results' : `Showing ${from}-${to} of ${total.toLocaleString()}`}
                    </span>
                ) : null}

                {!hidePageSize ? (
                    <label className={cn('flex items-center gap-1.5', !hideTotalCount ? 'ml-4' : '')}>
                        <span>Rows per page</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="h-8 cursor-pointer rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                            aria-label="Page size"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : null}
            </div>

            {/* ── Right: navigation controls ── */}
            <div className="flex items-center gap-1">
                {/* First */}
                <button
                    onClick={() => go(1)}
                    disabled={page <= 1}
                    className={pageButtonClass(false, page <= 1)}
                    aria-label="First page"
                >
                    <ChevronsLeft />
                </button>

                {/* Prev */}
                <button
                    onClick={() => go(page - 1)}
                    disabled={page <= 1}
                    className={pageButtonClass(false, page <= 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft />
                </button>

                {/* Page number buttons */}
                {pages.map((item, index) =>
                    item === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="min-w-[32px] text-center tracking-wide text-muted-foreground/50"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={item}
                            onClick={() => go(item)}
                            disabled={item === page}
                            className={pageButtonClass(item === page, false)}
                            aria-label={`Page ${item}`}
                            aria-current={item === page ? 'page' : undefined}
                        >
                            {item}
                        </button>
                    ),
                )}

                {/* Next */}
                <button
                    onClick={() => go(page + 1)}
                    disabled={page >= totalPages}
                    className={pageButtonClass(false, page >= totalPages)}
                    aria-label="Next page"
                >
                    <ChevronRight />
                </button>

                {/* Last */}
                <button
                    onClick={() => go(totalPages)}
                    disabled={page >= totalPages}
                    className={pageButtonClass(false, page >= totalPages)}
                    aria-label="Last page"
                >
                    <ChevronsRight />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
