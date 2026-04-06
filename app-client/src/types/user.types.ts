export interface User {
    id: string
    name: string
    email: string
    roles: string[]
    created_at: string
    status?: 'active' | 'inactive' | 'suspended'
}

export interface UsersResponse {
    data: User[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface AuditLog {
    id: string
    action: string
    resource: string
    ip: string
    status: 'success' | 'failed'
    created_at: string
}

export interface AuditLogsResponse {
    data: AuditLog[]
    meta: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface UserDevice {
    id: string
    device_type: string
    browser: string
    ip: string
    last_active: string
}
