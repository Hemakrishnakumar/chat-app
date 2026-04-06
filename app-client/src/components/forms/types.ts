import type { ZodSchema } from "zod";



export type FieldType =
  | "input"
  | "textarea"
  | "select"
  | "multi-select"
  | "checkbox"
  | "multi-checkbox"
  | "radio"
  | "multi-radio"
  | "switch"
  | "date"
  | "time"
  | "datetime"
  | "number"
  | "email"
  | "password"
  | "url"
  | "file"
  | "color"
  | "range"
  | "hidden";

export interface FormOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;                    // Mark field as required (shows * indicator)
  options?: FormOption[];
  
  // Styling - supports Tailwind classes and theme colors
  className?: string;                    // Input/field element classes
  containerClassName?: string;           // Container wrapper classes
  labelClassName?: string;               // Label element classes
  descriptionClassName?: string;         // Description text classes
  errorClassName?: string;               // Error message classes
  
  errorMsg?: string;
  
  // Additional props for specific field types
  min?: number | string;
  max?: number | string;
  step?: number;
  accept?: string; // for file input
  multiple?: boolean; // for file input
  rows?: number; // for textarea
  cols?: number; // for textarea
  isComma?: boolean; // for number input - show comma separated values (currency format)
}

export interface DynamicFormProps<T> {
  schema: ZodSchema<T>;
  defaultValues: T;
  fields: FormFieldConfig[];
  onSubmit: (data: T) => void;
  submitButtonText?: string;
  className?: string;
  validationMode?: 'onSubmit' | 'onChange';  // 'onSubmit': button enabled by default, validate on submit | 'onChange': button disabled by default, validate in real-time
}
