/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DynamicFormProps } from "./types";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";



export function DynamicForm<T extends FieldValues>({
    schema,
    defaultValues,
    fields,
    onSubmit,
    submitButtonText = "Submit",
    className,
    validationMode = 'onSubmit',
}: DynamicFormProps<T>) {
    const form = useForm({
        resolver: zodResolver(schema as any),
        defaultValues: defaultValues as any,
        mode: validationMode === 'onSubmit' ? 'onSubmit' : 'onChange',
        reValidateMode: 'onChange', // Always re-validate on change to clear errors dynamically
    });

    // Watch all form fields and formState to trigger re-render
    const isFormValid = form.formState.isValid;
    const isSubmitting = form.formState.isSubmitting;

    // Button logic based on validation mode:
    // Mode 1 (onSubmit): Button enabled by default, only disabled while submitting
    // Mode 2 (onChange): Button disabled by default, enabled only when form is valid
    const isButtonDisabled = 
        validationMode === 'onSubmit' 
            ? isSubmitting 
            : !isFormValid || isSubmitting;

    const handleSubmit = form.handleSubmit((data) => {
        onSubmit(data);
    });

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
                {fields.map((field) => (
                    <DynamicFieldRenderer
                        key={field.name}
                        field={field}
                        control={form.control}
                    />
                ))}
                <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isButtonDisabled}
                >
                    {submitButtonText}
                </Button>
            </form>
        </Form>
    );
}
