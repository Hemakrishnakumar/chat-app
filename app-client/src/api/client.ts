import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import type { AxiosError } from 'axios';
import type { ApiError, RawBackendError, RequestOptions } from './types';



// const IS_DEV = import.meta.env.DEV;
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

// if (!BASE_URL && IS_DEV) {
//     console.warn('[ApiClient] VITE_API_BASE_URL is not set.');
// }

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL + '/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 30_000,
});

// ── Request interceptor ────────────────────────────────────────────────────

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (!config.headers) config.headers = new axios.AxiosHeaders();
        return config;
    },
    (error: unknown) => Promise.reject(error),
);

// ── Response interceptor ───────────────────────────────────────────────────

axiosInstance.interceptors.response.use(
    (response: AxiosResponse<any>) => {
        // Return the full response data as-is (don't unwrap)
        return { ...response, data: response.data };
    },
    (error: AxiosError<{ success: false; message?: string; error?: RawBackendError | string }>) => {
        const apiError = normaliseError(error);

        return Promise.reject(apiError);
    },
);

// ── Error normalisation ────────────────────────────────────────────────────

function normaliseError(
    error: AxiosError<{ success: false; message?: string; error?: RawBackendError | string }>,
): ApiError {
    if (error.response) {
        const { status, data } = error.response;
        const raw = data?.error;
        const rawError =
            typeof raw === 'object' && raw !== null ? (raw as RawBackendError) : undefined;

        return {
            statusCode: status,
            message: data?.message ?? fallbackMessage(status),
            error: rawError?.code,
            details: rawError?.details ?? undefined,
        };
    }

    if (error.request) {
        return {
            statusCode: 0,
            message:
                error.code === 'ECONNABORTED'
                    ? 'Request timed out. Please try again.'
                    : 'Network error. Please check your connection.',
            error: error.code,
        };
    }

    return { statusCode: 0, message: error.message ?? 'An unexpected error occurred.' };
}

function fallbackMessage(status: number): string {
    const map: Record<number, string> = {
        400: 'The request was invalid. Please check your input.',
        401: 'Your session has expired. Please log in again.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        422: 'Validation failed. Please review the form.',
        429: 'Too many requests. Please slow down.',
        500: 'A server error occurred. Please try again later.',
        503: 'Service unavailable. Please try again later.',
    };
    return map[status] ?? `An unexpected error occurred (${status}).`;
}

// ── Core execute helper ────────────────────────────────────────────────────

async function execute<T>(
    request: () => Promise<AxiosResponse<T>>,
    options?: RequestOptions<T>,
): Promise<T> {
    try {
        const response = await request();
        options?.onSuccess?.(response.data);
        return response.data;
    } catch (err) {
        const apiError = err as ApiError;
        options?.onError?.(apiError);
        throw apiError;
    }
}

function axiosConfig<T>(opts?: RequestOptions<T>): AxiosRequestConfig {
    return { params: opts?.params, headers: opts?.headers };
}

// ── Public client ──────────────────────────────────────────────────────────

export const apiClient = {
    get<T>(url: string, opts?: RequestOptions<T>): Promise<T> {
        return execute<T>(() => axiosInstance.get<T>(url, axiosConfig(opts)), opts);
    },

    post<T>(url: string, payload?: unknown, opts?: RequestOptions<T>): Promise<T> {
        return execute<T>(() => axiosInstance.post<T>(url, payload, axiosConfig(opts)), opts);
    },

    put<T>(url: string, payload?: unknown, opts?: RequestOptions<T>): Promise<T> {
        return execute<T>(() => axiosInstance.put<T>(url, payload, axiosConfig(opts)), opts);
    },

    patch<T>(url: string, payload?: unknown, opts?: RequestOptions<T>): Promise<T> {
        return execute<T>(() => axiosInstance.patch<T>(url, payload, axiosConfig(opts)), opts);
    },

    delete<T>(url: string, opts?: RequestOptions<T>): Promise<T> {
        return execute<T>(() => axiosInstance.delete<T>(url, axiosConfig(opts)), opts);
    },

    /** Direct access to the Axios instance for advanced use cases (multipart, cancellation, etc.) */
    instance: axiosInstance,
} as const;

export default apiClient;
