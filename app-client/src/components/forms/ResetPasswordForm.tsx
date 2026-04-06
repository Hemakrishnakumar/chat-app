import { useState } from "react";
import { DynamicForm } from "@/components/forms/DynamicForm";
// import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services";

import {
    changePasswordSchema,
    type ChangePasswordFormData,
} from "@/validations/authValidation";

import type { FormFieldConfig } from "@/components/forms/types";
import { useNavigate } from "react-router-dom";



const changePasswordFields: FormFieldConfig[] = [
    {
        name: "password",
        type: "password",
        label: "New Password",
        placeholder: "Enter your new password",
        required: true,
    },
    {
        name: "confirmPassword",
        type: "password",
        label: "Confirm Password",
        placeholder: "Confirm your new password",
        required: true,
    },
];

const defaultValues: ChangePasswordFormData = {
    password: "",
    confirmPassword: "",
};

export function ChangePasswordForm() {
    const token = "test-token";

    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!token) {
        return (
            <div className="text-center p-10 text-red-500">
                Invalid or expired reset link
            </div>
        );
    }


    const handleSubmit = async (data: ChangePasswordFormData) => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            await authService.resetPassword(
                {
                    token,
                    password: data.password,
                },
                {
                    onSuccess: () => {
                        setSuccess(true);
                    },
                    onError: (err) => {
                        setError(err.message || "Something went wrong");
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
                <h2>Password Changed Successfully</h2>
                <p>Your password has been updated.</p>

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

            <DynamicForm<ChangePasswordFormData>
                schema={changePasswordSchema}
                defaultValues={defaultValues}
                fields={changePasswordFields}
                onSubmit={handleSubmit}
                submitButtonText={loading ? "Updating..." : "Change Password"}
                validationMode="onChange"
            />
        </div>
    );
}
