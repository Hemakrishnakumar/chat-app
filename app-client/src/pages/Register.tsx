import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { DataModal } from '@/components/modals';
import { registerSchema, type RegisterFormData } from '@/validations/authValidation';
import type { FormFieldConfig } from '@/components/forms/types';
import { useAuth } from '@/context';
import { Mail } from 'lucide-react';



const registerFields: FormFieldConfig[] = [
    {
        name: 'name',
        type: 'input',
        label: 'Full Name',
        placeholder: 'John Doe',
        required: true,
    },
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
        placeholder: 'Min 8 characters',
        // description: 'Must contain at least one uppercase letter and one number',
        required: true,
    },
    {
        name: 'confirmPassword',
        type: 'password',
        label: 'Confirm Password',
        placeholder: 'Re-enter your password',
        required: true,
    },
];

const defaultValues: RegisterFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
};

export default function Register() {
    const navigate = useNavigate();
    const { register, loading, error } = useAuth();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const handleSubmit = useCallback(
        async (data: RegisterFormData) => {
            try {
                await register({
                email: data.email,
                name: data.name,
                password: data.password
                });
                setRegisteredEmail(data.email);
                setShowSuccessModal(true);
            } catch {
                // error is set inside AuthContext
            }
        },
        [register],
    );

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        navigate('/login');
    };
    

    return (
        <div className="flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create an account
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">Sign up to get started today</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border-mute-foreground p-8 shadow-sm">
                    {/* Error from AuthContext */}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <DynamicForm<RegisterFormData>
                        schema={registerSchema}
                        defaultValues={defaultValues}
                        fields={registerFields}
                        onSubmit={handleSubmit}
                        submitButtonText={loading ? 'Creating account...' : 'Create Account'}
                        validationMode='onChange'
                    />
                    
                   
                    {/* Login Link */}
                    <p className={`mt-6 text-center text-sm text-muted-foreground`}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            <DataModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                title="Account Created Successfully!"
                description="Registration Complete"
                size="md"
                showHeader={true}
                showFooter={true}
                closeButtonText="Go to Login"
            >
                <div className="flex flex-col items-center text-center py-6 px-4 space-y-5">

                    {/* Icon */}
                    <div className="rounded-full bg-primary/10 p-4">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>

                    {/* Main Message */}
                    <div className="space-y-2">
                        <p className="text-base font-medium text-foreground">
                            A verification link has been sent
                        </p>

                        <p className="text-sm text-muted-foreground">
                            to <span className="font-semibold text-foreground">{registeredEmail}</span>
                        </p>
                    </div>

                    {/* Divider (optional but nice) */}
                    <div className="w-full h-px bg-border" />

                    {/* Description */}
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Please check your email and click the link to verify your account and complete the registration process.
                    </p>

                </div>
            </DataModal>
        </div>
    );
}
