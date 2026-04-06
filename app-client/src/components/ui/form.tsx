/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any, react-refresh/only-export-components */
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
    Controller,
    FormProvider,
    useFormContext,
} from "react-hook-form";

import { cn } from "@/lib/utils";



const Form = FormProvider;

// Simplified FormField - just wraps Controller, no context needed
const FormField = React.forwardRef<
  React.ElementRef<typeof Controller>,
  React.ComponentPropsWithoutRef<typeof Controller>
>(({ ...props }, ref) => (
    <Controller {...(props as any)} ref={ref as any} />
));
FormField.displayName = "FormField";

// Simplified useFormField - kept for backward compatibility but minimal
const useFormField = () => {
    useFormContext(); // Ensure we're inside FormProvider
    return {
        formItemId: `form-item-${Math.random()}`,
        formDescriptionId: `form-item-description-${Math.random()}`,
        formMessageId: `form-item-message-${Math.random()}`,
        error: undefined,
    };
};

// Simplified FormItem - just a div wrapper
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormItem.displayName = "FormItem";

// Simplified FormLabel - just a label wrapper
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block text-start",
            className
        )}
        {...props}
    />
));
FormLabel.displayName = "FormLabel";

// Simplified FormControl - just a Slot wrapper
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => (
    <Slot ref={ref} {...props} />
));
FormControl.displayName = "FormControl";

// Simplified FormDescription - just a paragraph
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground text-start", className)}
        {...props}
    />
));
FormDescription.displayName = "FormDescription";

// Simplified FormMessage - just a paragraph with error styling
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
    if (!children) {
        return null;
    }

    return (
        <p
            ref={ref}
            className={cn("text-sm font-medium text-destructive text-start", className)}
            {...props}
        >
            {children}
        </p>
    );
});
FormMessage.displayName = "FormMessage";

export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
};
