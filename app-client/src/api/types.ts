export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data: T
    meta?: ApiMeta | null
    timestamp?: string
}

export interface ApiMeta {
    page: number
    limit: number
    total: number
    totalPages: number
    [key: string]: unknown
}

export interface ApiError {
    statusCode: number
    message: string
    error?: string
    details?: ApiErrorDetail[] | unknown
}

export interface ApiErrorDetail {
    field: string
    message: string
}

/** @internal Raw error block from the backend failure envelope */
export interface RawBackendError {
    code?: string
    statuscode?: number
    details?: ApiErrorDetail[] | null
}

export interface RequestCallbacks<T = unknown> {
    onSuccess?: (data: T) => void
    onError?: (error: ApiError) => void
}

export interface RequestOptions<T = unknown> extends RequestCallbacks<T> {
    params?: Record<string, unknown>
    headers?: Record<string, string>
}
