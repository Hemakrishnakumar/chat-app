import { toast } from "sonner";



type ToastVariant = "success" | "info" | "warning" | "error"

const variantStyles = {
    success: "!bg-primary !text-primary-foreground border-border",
    info: "!bg-accent !text-accent-foreground border-border",
    warning: "!bg-secondary !text-secondary-foreground border-border",
    error: "!bg-destructive !text-destructive-foreground border-border",
};

export function showToast(
    message: string,
    variant: ToastVariant = "success"
) {
    toast[variant](message, {
        className: variantStyles[variant],
    });
}