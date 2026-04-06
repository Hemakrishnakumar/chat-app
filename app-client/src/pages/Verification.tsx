import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';



const Verification: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerification = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
            setSuccess(true);
        } catch (error: unknown) {
            const errorMessage =
            error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Verification failed. The link may be expired or invalid.';
            setError(errorMessage || 'Verification failed. The link may be expired or invalid.');
        } finally {
            setLoading(false);
        }
    }, [token]);


    useEffect(() => {
        if (token) {
            handleVerification();
        } else {
            setLoading(false);
        }
    }, [token, handleVerification]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    {loading && (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                            <p className="text-gray-600">Verifying your email...</p>
                        </div>
                    )}

                    {success && (
                        <div className="flex flex-col items-center space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-green-800">
                                    Email Verified Successfully!
                                </h3>
                                <p className="text-gray-600">
                                    Your email has been verified. You can now log in to your
                                    account.
                                </p>
                            </div>
                            <Button onClick={() => navigate('/login')} className="w-full">
                                Go to Login
                            </Button>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center space-y-4">
                            <XCircle className="h-12 w-12 text-red-600" />
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-red-800">
                                    Verification Failed
                                </h3>
                                <p className="text-gray-600">{error}</p>
                            </div>
                            <div className="flex space-x-2 w-full">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/login')}
                                    className="flex-1"
                                >
                                    Go to Login
                                </Button>
                                <Button onClick={() => navigate('/register')} className="flex-1">
                                    Register Again
                                </Button>
                            </div>
                        </div>
                    )}

                    {!token && !loading && (
                        <div className="flex flex-col items-center space-y-4">
                            <XCircle className="h-12 w-12 text-red-600" />
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-red-800">
                                    Invalid Verification Link
                                </h3>
                                <p className="text-gray-600">
                                    The verification link is missing or invalid.
                                </p>
                            </div>
                            <Button onClick={() => navigate('/register')} className="w-full">
                                Register Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Verification;
