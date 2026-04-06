export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    name: string
    email: string
    password: string
}

export interface GoogleAuthPayload {
    token: string
}

export interface ForgotPasswordPayload {
    email: string
}

export interface ResetPasswordPayload {
    token: string
    password: string
}

export interface AuthUser {
    id?: string | number
    name?: string
    email?: string
    photo_url?: string
    [key: string]: unknown
}

export interface LoginResponse {
    data: AuthUser    
}

export interface RegisterResponse {
    user: AuthUser
    token: string
}

export interface GoogleAuthResponse {
    user: AuthUser
    token: string
}

export interface VerifyEmailPayload {
    token: string
}

export interface ResendVerificationPayload {
    email: string
}


export interface AuthContextValue {
    user: AuthUser | null
    loading: boolean
    isAuthenticated: boolean
    error: string | null
    clearError: () => void
    login: (payload: LoginPayload) => Promise<void>  
    register: (payload: RegisterPayload) => Promise<void>  
    googleAuth: (payload: GoogleAuthPayload) => Promise<void>
    logout: () => Promise<void>
    refetchUser: () => Promise<void>
}