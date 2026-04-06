import type { ResendVerificationPayload, VerifyEmailPayload } from '@/types/auth.types';
import { apiClient, API_ENDPOINTS } from '../api';
import type { RequestCallbacks, RequestOptions } from '../api';
import type {
    LoginPayload,
    LoginResponse,
    RegisterPayload,
    RegisterResponse,
    GoogleAuthPayload,
    GoogleAuthResponse,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    AuthUser,
} from '../types';



const { AUTH } = API_ENDPOINTS;

export const authService = {
    /**
     * Accepts RequestCallbacks directly — no params or extra headers needed.
     * Use when the call site only cares about success/error side-effects.
     *
     * @example
     * authService.login(credentials, {
     *   onSuccess: (data) => navigate("/dashboard"),
     *   onError:   (err)  => toast.error(err.message),
     * });
     */
    login(payload: LoginPayload, callbacks?: RequestCallbacks<LoginResponse>) {
        return apiClient.post<LoginResponse>(AUTH.LOGIN, payload, callbacks);
    },
    register(payload: RegisterPayload, callbacks?: RequestCallbacks<RegisterResponse>) {
        return apiClient.post<RegisterResponse>(AUTH.REGISTER, payload, callbacks);
    },

    googleAuth(payload: GoogleAuthPayload, callbacks?: RequestCallbacks<GoogleAuthResponse>) {
        return apiClient.post<GoogleAuthResponse>(AUTH.GOOGLE, payload, callbacks);
    },

    /**
     * Uses RequestCallbacks — logout carries no payload or query params.
     *
     * @example
     * authService.logout({
     *   onSuccess: () => navigate("/login"),
     *   onError:   (err) => console.error(err.message),
     * });
     */
    logout(callbacks?: RequestCallbacks<null>) {
        return apiClient.post<null>(AUTH.LOGOUT, undefined, callbacks);
    },

    /**
     * Uses RequestCallbacks — profile is a simple GET with no params.
     *
     * @example
     * authService.getProfile({
     *   onSuccess: (user) => setUser(user),
     *   onError:   (err)  => toast.error(err.message),
     * });
     */
    getProfile(callbacks?: RequestCallbacks<LoginResponse>) {
        return apiClient.get<LoginResponse>(AUTH.PROFILE, callbacks);
    },

    /**
     * Uses RequestCallbacks — simple fire-and-forget with side-effect feedback.
     *
     * @example
     * authService.forgotPassword({ email }, {
     *   onSuccess: () => toast.success("Reset link sent"),
     *   onError:   (err) => toast.error(err.message),
     * });
     */
    forgotPassword(payload: ForgotPasswordPayload, callbacks?: RequestCallbacks<null>) {
        return apiClient.post<null>(AUTH.FORGOT_PASSWORD, payload, callbacks);
    },

    /**
     * Uses RequestCallbacks — confirmation call with no query params needed.
     *
     * @example
     * authService.resetPassword({ token, password }, {
     *   onSuccess: () => navigate("/login"),
     *   onError:   (err) => setError(err.message),
     * });
     */
    resetPassword(payload: ResetPasswordPayload, callbacks?: RequestCallbacks<null>) {
        return apiClient.post<null>(AUTH.RESET_PASSWORD, payload, callbacks);
    },

    /**
     * Uses full RequestOptions — may need custom headers (e.g. X-Refresh-Token)
     * in some backend implementations, so we keep the wider type here.
     */
    refreshSession(opts?: RequestOptions<null>) {
        return apiClient.post<null>(AUTH.REFRESH, undefined, opts);
    },

    verifyEmail(payload: VerifyEmailPayload, callbacks?: RequestCallbacks<null>) {
        return apiClient.post<null>(AUTH.VERIFY_EMAIL, payload, callbacks);
    },

    resendVerification(payload: ResendVerificationPayload, callbacks?: RequestCallbacks<null>) {
        return apiClient.post<null>(AUTH.RESEND_VERIFICATION, payload, callbacks);
    },
};
