import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the ErrorModal component
 * 
 * @interface ErrorModalProps
 * @property {boolean} isOpen - Controls whether the modal is open
 * @property {() => void} onClose - Callback when modal is closed
 * @property {string} [title="An Error Occurred"] - Error title text
 * @property {string} [message="Something went wrong. Please try again later."] - Error message
 * @property {string | number} [errorCode] - Error code to display
 * @property {boolean} [showCloseButton=true] - Whether to show close button
 * @property {string} [closeButtonText="Close"] - Text for close button
 * @property {"error" | "warning"} [variant="error"] - Visual variant (error or warning)
 */
export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  errorCode?: string | number;
  showCloseButton?: boolean;
  closeButtonText?: string;
  variant?: "error" | "warning";
}

/**
 * ErrorModal Component
 * 
 * A modal component for displaying API/runtime errors with error codes and messages.
 * Supports both error and warning variants with appropriate visual styling.
 * 
 * Features:
 * - Error and warning variants with distinct visual styles
 * - Error code display support
 * - Customizable messages and titles
 * - Escape key to close
 * - Prevents accidental closing by clicking outside
 * - Light/dark mode support via shadcn
 * 
 * @component
 * @example
 * // Basic error modal
 * <ErrorModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="API Error"
 *   message="Failed to fetch data from server."
 *   errorCode={500}
 *   variant="error"
 *   closeButtonText="Retry"
 * />
 * 
 * @example
 * // Warning modal
 * <ErrorModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Storage Warning"
 *   message="Your storage is almost full (90% used)."
 *   variant="warning"
 *   closeButtonText="Acknowledge"
 * />
 */
const ErrorModal: React.FC<ErrorModalProps> = ({
    isOpen,
    onClose,
    title = "An Error Occurred",
    message = "Something went wrong. Please try again later.",
    errorCode,
    showCloseButton = true,
    closeButtonText = "Close",
    variant = "error",
}) => {
    const iconColor = variant === "error" ? "text-destructive" : "text-amber-500";
    const bgColor = variant === "error" ? "bg-destructive/10" : "bg-amber-50";
    const borderColor = variant === "error" ? "border-destructive/20" : "border-amber-200";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={cn(
                    "sm:max-w-md",
                    "border-2",
                    borderColor
                )}
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={onClose}
            >
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className={cn("rounded-full p-3", bgColor)}>
                            {variant === "error" ? (
                                <XCircle className={cn("h-6 w-6", iconColor)} />
                            ) : (
                                <AlertCircle className={cn("h-6 w-6", iconColor)} />
                            )}
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-left">{title}</DialogTitle>
                            {errorCode && (
                                <div className="mt-1">
                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    Error Code: {errorCode}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogHeader>
        
                <DialogDescription className="text-left pt-2 px-1">
                    <div className="whitespace-pre-wrap break-words">
                        {message}
                    </div>
                </DialogDescription>

                {showCloseButton && (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant={variant === "error" ? "destructive" : "outline"}
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            {closeButtonText}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ErrorModal;