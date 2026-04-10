import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { authService } from '@/services';
import type { AuthUser, LoginPayload, RegisterPayload, GoogleAuthPayload } from '@/types';
import { AuthContext } from './authContext';



export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const clearError = useCallback(() => setError(null), []);

    const refetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authService.getProfile();
            setUser(data.data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetchUser();
    }, [refetchUser]);

    const login = useCallback(async (payload: LoginPayload) => {
        setLoading(true);
        setError(null);
        try {
            const data = await authService.login(payload);
            setUser(data.data.user)
           
        } catch (err: unknown) {
            const message = (err as { message?: string }).message ?? 'Login failed. Please try again.';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (payload: RegisterPayload) => {
        setLoading(true);
        setError(null);
        try {
            const data = await authService.register(payload);            
        } catch (err: unknown) {
            const message =
                (err as { message?: string }).message ?? 'Registration failed. Please try again.';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const googleAuth = useCallback(async (payload: GoogleAuthPayload) => {
        setLoading(true);
        setError(null);
        try {
            const data = await authService.googleAuth(payload);
            setUser(data.user);
        } catch (err: unknown) {
            const message =
                (err as { message?: string }).message ?? 'Google sign-in failed. Please try again.';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await authService.logout();
            await refetchUser();
        } finally {
            setLoading(false);
        }
    }, [refetchUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                error,
                clearError,
                login,
                register,
                googleAuth,
                logout,
                refetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
