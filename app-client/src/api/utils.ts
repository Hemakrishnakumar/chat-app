import type { ApiError, ApiMeta } from './types';

/**
 * Type guard — narrows an unknown catch value to ApiError.
 * Use this in components/hooks to safely access error fields.
 *
 * @example
 * try { ... } catch (err) {
 *   if (isApiError(err)) toast.error(err.message);
 * }
 */
export function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error
    );
}

/** Returns true when the error is a 401 Unauthorized response. */
export function isUnauthorized(error: unknown): boolean {
    return isApiError(error) && error.statusCode === 401;
}

/** Returns true when the error is a 403 Forbidden response. */
export function isForbidden(error: unknown): boolean {
    return isApiError(error) && error.statusCode === 403;
}

/** Returns true when the error is a network/connectivity failure (no HTTP status). */
export function isNetworkError(error: unknown): boolean {
    return isApiError(error) && error.statusCode === 0;
}

/**
 * Strips undefined/null values from a params object before passing to apiClient.
 * Prevents sending `?page=undefined` in query strings.
 *
 * @example
 * apiClient.get(ENDPOINTS.USERS.LIST, { params: cleanParams({ page: 1, search: undefined }) });
 */
export function cleanParams<T extends Record<string, unknown>>(params: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ) as Partial<T>;
}

/**
 * Checks whether a paginated response has a next page.
 */
export function hasNextPage(meta: ApiMeta | null | undefined): boolean {
    if (!meta) return false;
    return meta.page < meta.totalPages;
}

/**
 * Checks whether a paginated response has a previous page.
 */
export function hasPrevPage(meta: ApiMeta | null | undefined): boolean {
    if (!meta) return false;
    return meta.page > 1;
}
