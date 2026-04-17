export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        GOOGLE: '/auth/google',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        REFRESH: '/auth/refresh',
        VERIFY_EMAIL: '/auth/verify-email',
        RESEND_VERIFICATION: '/auth/resend-verification',
    },
    USERS: {
        LIST: '/users',
        CREATE: '/users',
        DETAIL: (id: string) => `/users/${id}`,
        UPDATE: (id: string) => `/users/${id}`,
        PATCH: (id: string) => `/users/${id}`,
        DELETE: (id: string) => `/users/${id}`,
        SOFT_DELETE: (id: string) => `/users/${id}/soft-delete`,
        SEARCH: '/users/search',
    },
    CHATS: {
        LIST: '/conversations',
        CREATE_CONVERSATION: '/conversations',
        SEND_MESSAGE: '/conversations/send-message',
        MEMBERS: (id: string) => `/conversations/${id}/members`
    },
    AUDIT_LOGS: '/audit-logs',
    USER_DEVICES: (id: string) => `/users/${id}/devices`,
} as const;
