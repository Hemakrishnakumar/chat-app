import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { loginSchema, type LoginFormData } from '@/validations/authValidation';
import type { FormFieldConfig } from '@/components/forms/types';
import { useAuth } from '@/context';



const loginFields: FormFieldConfig[] = [
    {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'you@example.com',
        required: true,
    },
    {
        name: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Enter your password',
        required: true,
    },
];

const defaultValues: LoginFormData = {
    email: '',
    password: '',
};

export default function Login() {
    const { isAuthenticated, login, loading, error } = useAuth();  
    const navigate = useNavigate();
    
    if(isAuthenticated) {
        navigate('/')
    }

    

    const handleSubmit = useCallback(
        async (data: LoginFormData) => {
            try {
                await login(data);                
            } catch {
                // error is set inside AuthContext
            }
        },
        [login],
    );
    
    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-mute-foreground p-8 shadow-sm">
                    {/* Error from AuthContext */}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <DynamicForm<LoginFormData>
                        schema={loginSchema}
                        defaultValues={defaultValues}
                        fields={loginFields}
                        onSubmit={handleSubmit}
                        submitButtonText={loading ? 'Signing in...' : 'Sign In'}
                    />                    
                    

                    {/* Register Link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="font-medium text-primary hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
