/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import type { FieldValues } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { withRHF, type WithRHFProps } from "./withRHF";
import type { FormOption } from "./types";

/**
 * Factory function to create form field components with common structure
 * Reduces repetition of FormField, FormItem, FormLabel, FormDescription, FormMessage
 */
function createFormField<T extends FieldValues>(
    renderContent: (field: any, props: WithRHFProps<T>) => React.ReactNode,
    containerClass?: string,
) {
    return function Component(props: WithRHFProps<T>) {
        const {
            name,
            control,
            label,
            description,
            required,
            containerClassName,
            labelClassName,
            descriptionClassName,
            errorClassName,
            errorMsg,
        } = props;

        return (
            <FormField
                control={control as any}
                name={name}
                render={({ field, fieldState }: { field: any; fieldState: any }) => (
                    <FormItem className={cn(containerClass, containerClassName)}>
                        {label && (
                            <FormLabel className={cn(labelClassName)}>
                                {label}
                                {required && <span className="text-destructive ml-1">*</span>}
                            </FormLabel>
                        )}
                        <FormControl>
                            {renderContent(field, props)}
                        </FormControl>
                        {description && (
                            <FormDescription className={cn(descriptionClassName)}>
                                {description}
                            </FormDescription>
                        )}
                        <FormMessage className={cn(errorClassName)}>
                            {errorMsg || fieldState.error?.message}
                        </FormMessage>
                    </FormItem>
                )}
            />
        );
    };
}

// RHFInput - Input field with RHF
export const RHFInput = withRHF<FieldValues, React.ComponentProps<typeof Input>>(
    Input,
    (field, props) => (
        <Input
            {...field}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className={props.className}
        />
    ),
);

// RHFTextarea - Textarea field with RHF
export const RHFTextarea = withRHF<FieldValues, React.ComponentProps<typeof Textarea>>(
    Textarea,
    (field, props) => (
        <Textarea
            {...field}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className={props.className}
        />
    ),
);

// RHFCheckbox - Checkbox field with RHF
export const RHFCheckbox = createFormField<FieldValues>(
    (field, props) => (
        <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={props.disabled}
            className={props.className}
        />
    ),
    "flex flex-row items-start space-x-3 space-y-0",
);

// RHFSelect - Select field with RHF
export const RHFSelect = createFormField<FieldValues>(
    (field, props: any) => (
        <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={props.disabled}
        >
            <SelectTrigger className={props.className}>
                <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
                {(props.options || []).map((option: FormOption) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    ),
);

// RHFRadioGroup - Radio group field with RHF
export const RHFRadioGroup = createFormField<FieldValues>(
    (field, props: any) => (
        <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            className={cn("flex flex-col space-y-1", props.className)}
            disabled={props.disabled}
        >
            {(props.options || []).map((option: FormOption) => (
                <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                </div>
            ))}
        </RadioGroup>
    ),
    "space-y-3",
);

// RHFSwitch - Switch field with RHF
export const RHFSwitch = createFormField<FieldValues>(
    (field, props) => (
        <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={props.disabled}
            className={props.className}
        />
    ),
    "flex flex-row items-center justify-between rounded-lg border p-4",
);

// RHFMultiSelect - Multi-select field with RHF
export const RHFMultiSelect = createFormField<FieldValues>(
    (field, props: any) => (
        <div className={cn("flex flex-wrap gap-2", props.className)}>
            {(props.options || []).map((option: FormOption) => (
                <label
                    key={option.value}
                    className="flex items-center space-x-2 rounded border px-3 py-2 cursor-pointer hover:bg-secondary hover:border-primary transition-colors"
                >
                    <input
                        type="checkbox"
                        checked={(field.value || []).includes(option.value)}
                        onChange={(e) => {
                            const current = field.value || [];
                            if (e.target.checked) {
                                field.onChange([...current, option.value]);
                            } else {
                                field.onChange(
                                    current.filter((v: string) => v !== option.value),
                                );
                            }
                        }}
                        disabled={props.disabled}
                        className="rounded"
                    />
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    ),
);

// RHFMultiCheckbox - Multi-checkbox field with RHF
export const RHFMultiCheckbox = createFormField<FieldValues>(
    (field, props: any) => (
        <div className={cn("space-y-2", props.className)}>
            {(props.options || []).map((option: FormOption) => (
                <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                        checked={(field.value || []).includes(option.value)}
                        onCheckedChange={(checked: any) => {
                            const current = field.value || [];
                            if (checked) {
                                field.onChange([...current, option.value]);
                            } else {
                                field.onChange(
                                    current.filter((v: string) => v !== option.value),
                                );
                            }
                        }}
                        disabled={props.disabled}
                    />
                    <Label>{option.label}</Label>
                </div>
            ))}
        </div>
    ),
    "space-y-3",
);

// RHFMultiRadio - Multi-radio field with RHF (allows multiple selections)
export const RHFMultiRadio = createFormField<FieldValues>(
    (field, props: any) => (
        <div className={cn("flex flex-col space-y-1", props.className)}>
            {(props.options || []).map((option: FormOption) => (
                <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                        id={option.value}
                        checked={(field.value || []).includes(option.value)}
                        onCheckedChange={(checked: any) => {
                            const current = field.value || [];
                            if (checked) {
                                field.onChange([...current, option.value]);
                            } else {
                                field.onChange(
                                    current.filter((v: string) => v !== option.value),
                                );
                            }
                        }}
                        disabled={props.disabled}
                    />
                    <Label htmlFor={option.value}>{option.label}</Label>
                </div>
            ))}
        </div>
    ),
    "space-y-3",
);

// RHFNumber - Number input field with RHF
export const RHFNumber = createFormField<FieldValues>(
    (field, props: any) => {
        const formatNumberWithComma = (value: any) => {
            if (!value) return '';
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        const removeComma = (value: string) => {
            return value.replace(/,/g, '');
        };

        return (
            <Input
                type="text"
                value={props.isComma ? formatNumberWithComma(field.value) : field.value}
                onChange={(e) => {
                    const value = props.isComma ? removeComma(e.target.value) : e.target.value;
                    field.onChange(value ? Number(value) : '');
                }}
                placeholder={props.placeholder}
                disabled={props.disabled}
                className={props.className}
                inputMode="numeric"
            />
        );
    },
);

// RHFEmail - Email input field with RHF
export const RHFEmail = createFormField<FieldValues>(
    (field, props) => (
        <Input
            type="email"
            {...field}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className={props.className}
        />
    ),
);

// RHFPassword - Password input field with RHF with show/hide toggle
export const RHFPassword = createFormField<FieldValues>(
    (field, props) => {
        const [showPassword, setShowPassword] = React.useState(false);

        return (
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                    placeholder={props.placeholder}
                    disabled={props.disabled}
                    className={cn(props.className, "pr-10")}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={props.disabled}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>
        );
    },
);

// RHFUrl - URL input field with RHF
export const RHFUrl = createFormField<FieldValues>(
    (field, props) => (
        <Input
            type="url"
            {...field}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className={props.className}
        />
    ),
);

// RHFDate - Date input field with RHF
export const RHFDate = createFormField<FieldValues>(
    (field, props: any) => (
        <Input
            type="date"
            {...field}
            disabled={props.disabled}
            className={props.className}
            min={props.min}
            max={props.max}
        />
    ),
);

// RHFTime - Time input field with RHF
export const RHFTime = createFormField<FieldValues>(
    (field, props: any) => (
        <Input
            type="time"
            {...field}
            disabled={props.disabled}
            className={props.className}
            min={props.min}
            max={props.max}
        />
    ),
);

// RHFDateTime - DateTime input field with RHF
export const RHFDateTime = createFormField<FieldValues>(
    (field, props: any) => (
        <Input
            type="datetime-local"
            {...field}
            disabled={props.disabled}
            className={props.className}
            min={props.min}
            max={props.max}
        />
    ),
);

// RHFColor - Color input field with RHF
export const RHFColor = createFormField<FieldValues>(
    (field, props) => (
        <Input
            type="color"
            {...field}
            disabled={props.disabled}
            className={props.className}
        />
    ),
);

// RHFRange - Range input field with RHF
export const RHFRange = createFormField<FieldValues>(
    (field, props: any) => (
        <Input
            type="range"
            {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
            disabled={props.disabled}
            className={props.className}
            min={props.min}
            max={props.max}
            step={props.step}
        />
    ),
);

// RHFFile - File input field with RHF
export const RHFFile = createFormField<FieldValues>(
    (field, props: any) => (
        <Input
            type="file"
            onChange={(e) => field.onChange(e.target.files?.[0])}
            disabled={props.disabled}
            className={props.className}
            accept={props.accept}
            multiple={props.multiple}
        />
    ),
);

// RHFHidden - Hidden input field with RHF
export const RHFHidden = createFormField<FieldValues>(
    (field, props) => (
        <Input
            type="hidden"
            {...field}
            className={props.className}
        />
    ),
);
