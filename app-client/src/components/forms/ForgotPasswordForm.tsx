import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { authService } from "@/services";

import {
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from "@/validations/authValidation";

import type { FormFieldConfig } from "@/components/forms/types";
import { useNavigate } from "react-router-dom";



const emailResetFields: FormFieldConfig[] = [
    {
        name: "email",
        type: "email",
        label: "Email Address",
        placeholder: "you@example.com",
        required: true,
    },
];

const defaultValues: ForgotPasswordFormData = {
    email: "",
};

export function EmailResetForm() {
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: ForgotPasswordFormData) => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            await authService.forgotPassword(
                { email: data.email },
                {
                    onSuccess: () => {
                        setSuccess(true);
                    },
                    onError: (err) => {
                        setError(err.message || "Failed to send reset link");
                    },
                }
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center p-10">
                <h2>Reset Link Sent</h2>
                <p>Please check your email to reset your password.</p>
                <button
                    onClick={() => navigate("/login")}
                    className="mt-5 px-5 py-2 bg-black text-white rounded hover:bg-gray-800 transition cursor-pointer"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            {error && (
                <p className="text-red-500 mb-3 text-sm text-center">{error}</p>
            )}

            <DynamicForm<ForgotPasswordFormData>
                schema={forgotPasswordSchema}
                defaultValues={defaultValues}
                fields={emailResetFields}
                onSubmit={handleSubmit}
                submitButtonText={loading ? "Sending..." : "Send Reset Link"}
            />
        </div>
    );
}