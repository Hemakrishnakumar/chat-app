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
//import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the DataModal component
 * 
 * @interface DataModalProps
 * @property {boolean} isOpen - Controls whether the modal is open
 * @property {() => void} onClose - Callback when modal is closed
 * @property {string} [title="Details"] - Modal title text
 * @property {string} [description] - Modal description/subtitle
 * @property {React.ReactNode} [children] - Custom content to render inside modal
 * @property {boolean} [showCloseButton=true] - Whether to show close button in footer
 * @property {string} [closeButtonText="Close"] - Text for close button
 * @property {boolean} [showHeader=true] - Whether to show header section
 * @property {"sm" | "md" | "lg" | "xl" | "full"} [size="md"] - Modal size
 * @property {boolean} [scrollable=true] - Whether content area is scrollable
 * @property {boolean} [showFooter=true] - Whether to show footer section
 */
export interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  closeButtonText?: string;
  showHeader?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  scrollable?: boolean;
  showFooter?: boolean;
}

/**
 * DataModal Component
 * 
 * A scrollable modal component for displaying detailed information with custom content.
 * Supports multiple sizes, scrollable content, and customizable header/footer.
 * 
 * Features:
 * - Multiple size options: sm, md, lg, xl, full
 * - Scrollable content area
 * - Custom content rendering via children prop
 * - Optional header and footer
 * - Close button in header
 * - Escape key to close
 * - Prevents accidental closing by clicking outside
 * - Light/dark mode support via shadcn
 * 
 * @component
 * @example
 * // Basic data modal
 * <DataModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="User Details"
 *   description="Detailed user information"
 *   size="lg"
 *   scrollable={true}
 * >
 *   <div>
 *     <h3>User Information</h3>
 *     <p>Name: John Doe</p>
 *     <p>Email: john@example.com</p>
 *   </div>
 * </DataModal>
 * 
 * @example
 * // Modal with custom content
 * <DataModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Report Data"
 *   size="xl"
 *   scrollable={true}
 * >
 *   <Table>
 *     <TableHeader>...</TableHeader>
 *     <TableBody>...</TableBody>
 *   </Table>
 * </DataModal>
 * 
 * @example
 * // Modal without header
 * <DataModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   showHeader={false}
 *   showFooter={false}
 * >
 *   <CustomComponent />
 * </DataModal>
 */
const DataModal: React.FC<DataModalProps> = ({
    isOpen,
    onClose,
    title = "Details",
    description,
    children,
    showCloseButton = true,
    closeButtonText = "Close",
    showHeader = true,
    size = "md",
    scrollable = true,
    showFooter = true,
}) => {
    const sizeClasses = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        full: "sm:max-w-[90vw]",
    };

    const contentClasses = cn(
        sizeClasses[size],
        scrollable && "max-h-[80vh] flex flex-col"
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={contentClasses}
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={onClose}
            >
                {showHeader && (
                    <DialogHeader className="flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-left">{title}</DialogTitle>
                                {description && (
                                    <DialogDescription className="text-left pt-1">
                                        {description}
                                    </DialogDescription>
                                )}
                            </div>
                            {/* <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button> */}
                        </div>
                    </DialogHeader>
                )}

                <div
                    className={cn(
                        "flex-1",
                        scrollable && "overflow-y-auto",
                        !showHeader && "pt-6"
                    )}
                >
                    {children}
                </div>

                {showFooter && showCloseButton && (
                    <DialogFooter className="flex-shrink-0 pt-4 border-t">
                        <Button 
                            type="button"
                            variant="outline"
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

export default DataModal;