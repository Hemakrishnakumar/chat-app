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
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

/**
 * Props for the ConfirmModal component
 * 
 * @interface ConfirmModalProps
 * @property {boolean} isOpen - Controls whether the modal is open
 * @property {() => void} onClose - Callback when modal is closed
 * @property {() => void} onConfirm - Callback when confirm action is triggered
 * @property {string} title - Modal title text
 * @property {string} message - Modal message/content
 * @property {string} [confirmText="Confirm"] - Text for confirm button
 * @property {string} [cancelText="Cancel"] - Text for cancel button
 * @property {"default" | "danger" | "success" | "info"} [variant="default"] - Visual variant
 * @property {React.ReactNode} [icon] - Custom icon to display
 * @property {boolean} [isLoading=false] - Shows loading state on confirm button
 */
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "success" | "info";
  icon?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * ConfirmModal Component
 * 
 * A reusable confirmation dialog for user actions with support for multiple variants,
 * custom icons, loading states, and keyboard navigation.
 * 
 * Features:
 * - Multiple variants: default, danger, success, info
 * - Dynamic icons for each variant
 * - Custom icon support
 * - Loading state for async operations
 * - Escape key to close
 * - Prevents accidental closing by clicking outside
 * - Light/dark mode support via shadcn
 * 
 * @component
 * @example
 * // Basic usage
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleConfirm}
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed?"
 *   confirmText="Yes, proceed"
 *   cancelText="No, cancel"
 *   variant="danger"
 * />
 * 
 * @example
 * // With loading state
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleAsyncAction}
 *   title="Processing"
 *   message="Please wait..."
 *   isLoading={true}
 * />
 * 
 * @example
 * // With custom icon
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleConfirm}
 *   title="Custom Icon"
 *   message="This modal has a custom icon"
 *   icon={<CustomIcon />}
 * />
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    icon,
    isLoading = false,
}) => {


    const handleConfirm = () => {
        onConfirm();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-md"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={onClose}
            >
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {icon || (() => {
                            const getIconConfig = () => {
                                switch (variant) {
                                    case "danger":
                                        return {
                                            icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
                                            bgColor: "bg-destructive/10",
                                            testId: "danger-icon"
                                        };
                                    case "success":
                                        return {
                                            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                                            bgColor: "bg-green-100",
                                            testId: "success-icon"
                                        };
                                    case "info":
                                        return {
                                            icon: <Info className="h-5 w-5 text-blue-600" />,
                                            bgColor: "bg-blue-100",
                                            testId: "info-icon"
                                        };
                                    default:
                                        return null;
                                }
                            };

                            const iconConfig = getIconConfig();
                            if (iconConfig) {
                                return (
                                    <div 
                                        className={`rounded-full p-2 ${iconConfig.bgColor}`} 
                                        data-testid={iconConfig.testId}
                                    >
                                        {iconConfig.icon}
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        <DialogTitle className="text-left">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-left pt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="mt-2 sm:mt-0"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === "danger" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={cn(
                            variant === "danger" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                            variant === "success" && "bg-green-600 text-white hover:bg-green-700",
                            variant === "info" && "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmModal;