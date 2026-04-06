/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Control, FieldValues } from "react-hook-form";
import type { FormFieldConfig } from "./types";
import {
    RHFInput,
    RHFTextarea,
    RHFCheckbox,
    RHFSelect,
    RHFRadioGroup,
    RHFSwitch,
    RHFMultiSelect,
    RHFMultiCheckbox,
    RHFMultiRadio,
    RHFNumber,
    RHFEmail,
    RHFPassword,
    RHFUrl,
    RHFDate,
    RHFTime,
    RHFDateTime,
    RHFColor,
    RHFRange,
    RHFFile,
    RHFHidden,
} from "./FormField";



interface DynamicFieldRendererProps<T extends FieldValues> {
  field: FormFieldConfig;
  control: Control<T>;
}

export function DynamicFieldRenderer<T extends FieldValues>({
    field,
    control,
}: DynamicFieldRendererProps<T>) {
    switch (field.type) {
        case "input":
            return <RHFInput {...(field as any)} control={control} name={field.name as any} />;

        case "textarea":
            return <RHFTextarea {...(field as any)} control={control} name={field.name as any} />;

        case "select":
            return <RHFSelect {...(field as any)} control={control} name={field.name as any} />;

        case "multi-select":
            return <RHFMultiSelect {...(field as any)} control={control} name={field.name as any} />;

        case "checkbox":
            return <RHFCheckbox {...(field as any)} control={control} name={field.name as any} />;

        case "multi-checkbox":
            return <RHFMultiCheckbox {...(field as any)} control={control} name={field.name as any} />;

        case "radio":
            return <RHFRadioGroup {...(field as any)} control={control} name={field.name as any} />;

        case "multi-radio":
            return <RHFMultiRadio {...(field as any)} control={control} name={field.name as any} />;

        case "switch":
            return <RHFSwitch {...(field as any)} control={control} name={field.name as any} />;

        case "number":
            return <RHFNumber {...(field as any)} control={control} name={field.name as any} />;

        case "email":
            return <RHFEmail {...(field as any)} control={control} name={field.name as any} />;

        case "password":
            return <RHFPassword {...(field as any)} control={control} name={field.name as any} />;

        case "url":
            return <RHFUrl {...(field as any)} control={control} name={field.name as any} />;

        case "date":
            return <RHFDate {...(field as any)} control={control} name={field.name as any} />;

        case "time":
            return <RHFTime {...(field as any)} control={control} name={field.name as any} />;

        case "datetime":
            return <RHFDateTime {...(field as any)} control={control} name={field.name as any} />;

        case "color":
            return <RHFColor {...(field as any)} control={control} name={field.name as any} />;

        case "range":
            return <RHFRange {...(field as any)} control={control} name={field.name as any} />;

        case "file":
            return <RHFFile {...(field as any)} control={control} name={field.name as any} />;

        case "hidden":
            return <RHFHidden {...(field as any)} control={control} name={field.name as any} />;

        default:
            return null;
    }
}
