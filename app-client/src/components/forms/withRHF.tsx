 
import type { FieldPath, FieldValues } from "react-hook-form";
import type { Control } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";


/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WithRHFProps<T extends FieldValues> {
  name: FieldPath<T>;
   
  control: Control<T, any>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  errorMsg?: string;
}

export function withRHF<
  T extends FieldValues,
  P extends { className?: string; disabled?: boolean; placeholder?: string },
>(
    _Component: React.ComponentType<P>,
    renderField: (
    field: any,
    props: Omit<WithRHFProps<T> & P, "name" | "control">,
  ) => React.ReactNode,
) {
    return function RHFComponent({
        name,
        control,
        label,
        description,
        placeholder,
        disabled,
        required,
        className,
        containerClassName,
        labelClassName,
        descriptionClassName,
        errorClassName,
        errorMsg,
        ...rest
    }: WithRHFProps<T> & Omit<P, "className" | "disabled" | "placeholder">) {
        return (
            <FormField
                control={control as any}
                name={name}
                render={({ field }: { field: any }) => (
                    <FormItem className={cn(containerClassName)}>
                        {label && (
                            <FormLabel className={cn(labelClassName)}>
                                {label}
                                {required && <span className="text-destructive ml-1">*</span>}
                            </FormLabel>
                        )}
                        <FormControl>
                            {renderField(field, {
                                label,
                                description,
                                placeholder,
                                disabled,
                                required,
                                className,
                                containerClassName,
                                labelClassName,
                                descriptionClassName,
                                errorClassName,
                                errorMsg,
                                ...rest,
                            } as any)}
                        </FormControl>
                        {description && (
                            <FormDescription className={cn(descriptionClassName)}>
                                {description}
                            </FormDescription>
                        )}
                        <FormMessage className={cn(errorClassName)}>
                            {errorMsg}
                        </FormMessage>
                    </FormItem>
                )}
            />
        );
    };
}
