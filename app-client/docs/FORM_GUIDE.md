# Form System Architecture

## How It Works

The form system has 3 layers:

1. **DynamicForm** - Main component that initializes React Hook Form
2. **DynamicFieldRenderer** - Routes fields to correct components
3. **RHF Components** - Renders UI (20+ field types)

## Core Components

### DynamicForm.tsx

Main component that renders the form. Pass these props:

```typescript
// 1. Define validation schema
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

// 2. Define initial values (must match schema keys)
const defaultValues = {
  email: '',
  password: '',
};

// 3. Define field configurations
const fields = [
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'password', type: 'password', label: 'Password', required: true },
];

// 4. Handle form submission
const handleSubmit = (data) => {
  console.log('Form data:', data);
  // data = { email: 'user@example.com', password: 'SecurePass123' }
};

// 5. Use the form component
<DynamicForm
  schema={schema}
  defaultValues={defaultValues}
  fields={fields}
  onSubmit={handleSubmit}
  submitButtonText="Login"
/>
```

**Props Explained:**
- `schema` - Zod validation schema (defines what data is valid)
- `defaultValues` - Initial form values (keys must match schema)
- `fields` - Array of field configurations (how to render each field)
- `onSubmit` - Function called when form is submitted with valid data
- `submitButtonText` - Label for submit button (optional, default: "Submit")

### DynamicFieldRenderer.tsx
Routes each field to the correct component based on type:
```typescript
switch (field.type) {
  case "input": return <RHFInput {...props} />;
  case "email": return <RHFEmail {...props} />;
  case "select": return <RHFSelect {...props} />;
  // ... 17 more types
}
```

### FormField.tsx
Contains 20+ RHF components for rendering fields.

## FormFieldConfig Interface

Configuration object for each dynamic field. This tells DynamicForm how to render each field.

```typescript
interface FormFieldConfig {
  name: string;                    // Must match schema key
  type: FieldType;                 // One of 20+ types (input, email, select, etc.)
  label?: string;                  // Display label
  placeholder?: string;            // Placeholder text
  description?: string;            // Helper text below field
  required?: boolean;              // Show * indicator
  disabled?: boolean;              // Disable field
  
  // Styling (all optional)
  className?: string;              // Input element classes
  labelClassName?: string;         // Label element classes
  descriptionClassName?: string;   // Description text classes
  errorClassName?: string;         // Error message classes
  containerClassName?: string;     // Container wrapper classes
  
  // Field-specific options
  options?: FormOption[];          // For select/radio/checkbox
  min?: number | string;           // For number/date/time
  max?: number | string;
  step?: number;                   // For number/range
  rows?: number;                   // For textarea
  accept?: string;                 // For file input
  multiple?: boolean;              // For file input
}
```

### How to Define Dynamic Fields

**Step 1: Create field configuration array**

Each object in the array defines one dynamic field:

```typescript
const fields: FormFieldConfig[] = [
  // Dynamic email field
  {
    name: 'email',                    // Must match schema key
    type: 'email',                    // Renders as email input
    label: 'Email Address',           // Display label
    placeholder: 'you@example.com',   // Placeholder text
    required: true,                   // Show * indicator
  },
  
  // Dynamic password field
  {
    name: 'password',
    type: 'password',                 // Renders as password input (masked)
    label: 'Password',
    description: 'Min 8 characters',  // Helper text
    required: true,
  },
  
  // Dynamic select field
  {
    name: 'country',
    type: 'select',                   // Renders as dropdown
    label: 'Country',
    options: [                        // Options for dropdown
      { label: 'USA', value: 'us' },
      { label: 'Canada', value: 'ca' },
    ],
    required: true,
  },
  
  // Dynamic number field
  {
    name: 'age',
    type: 'number',                   // Renders as number input
    label: 'Age',
    min: 18,                          // Minimum value
    max: 120,                         // Maximum value
    required: true,
  },
  
  // Dynamic checkbox field
  {
    name: 'terms',
    type: 'checkbox',                 // Renders as checkbox
    label: 'I accept terms and conditions',
    required: true,
  },
];
```

**Step 2: Pass fields array to DynamicForm**

```typescript
<DynamicForm
  schema={schema}
  defaultValues={defaultValues}
  fields={fields}              // Pass your field configurations
  onSubmit={handleSubmit}
/>
```

**Step 3: DynamicForm renders each field dynamically**

- DynamicFieldRenderer reads each field config
- Routes to correct component based on `type`
- Renders with label, placeholder, validation, etc.
- Validation happens based on `schema`
- Errors show below each field
- Required fields show asterisk (*)

## WithRHFProps Interface

Props passed to individual RHF components:

```typescript
interface WithRHFProps<T extends FieldValues> {
  // React Hook Form
  name: FieldPath<T>;              // Field name (type-safe)
  control: Control<T>;             // Form control object
  
  // Display
  label?: string;                  // Field label
  placeholder?: string;            // Placeholder text
  description?: string;            // Helper text
  
  // State
  required?: boolean;              // Show * indicator
  disabled?: boolean;              // Disable field
  
  // Styling
  className?: string;              // Input element classes
  labelClassName?: string;         // Label element classes
  descriptionClassName?: string;   // Description text classes
  errorClassName?: string;         // Error message classes
  
  // Error handling
  errorMsg?: string;               // Custom error message
}
```

### Basic Usage

RHF components are used internally by DynamicForm. You don't use them directly, but they receive these props:

```typescript
// Example: RHFEmail component receives
<RHFEmail
  name="email"
  control={form.control}
  label="Email Address"
  placeholder="you@example.com"
  required={true}
  className="border-2 border-blue-500"
/>
```

## Data Flow

```
User Input
    ↓
RHF Component
    ↓
React Hook Form
    ↓
Zod Validation
    ↓
Error Display / Submit
```

## File Structure

```
src/components/forms/
├── DynamicForm.tsx
├── DynamicFieldRenderer.tsx
├── FormField.tsx
├── withRHF.tsx
├── types.ts
└── index.ts
```

## Type Safety

All form data is fully typed with TypeScript and Zod:

```typescript
type FormData = z.infer<typeof schema>;

const handleSubmit = (data: FormData) => {
  // data is fully typed
};
```

## See Also

- **README.md** - Quick start and overview
- **src/pages/AdvancedForm.tsx** - Complete working example
- **src/pages/ValidationModesExample.tsx** - Two validation modes example

## Validation Modes

The form supports two validation modes via the `validationMode` prop:

### Mode 1: onSubmit (Submit-on-Click)
```typescript
<DynamicForm
  schema={schema}
  defaultValues={defaultValues}
  fields={fields}
  onSubmit={handleSubmit}
  validationMode="onSubmit"  // Button enabled by default
/>
```

**Behavior:**
- Button is **enabled by default**
- Validation happens **only on submit**
- Errors show **after clicking submit**
- Best for: Quick forms, surveys

### Mode 2: onChange (Real-Time)
```typescript
<DynamicForm
  schema={schema}
  defaultValues={defaultValues}
  fields={fields}
  onSubmit={handleSubmit}
  validationMode="onChange"  // Button disabled by default
/>
```

**Behavior:**
- Button is **disabled by default**
- Validation happens **as user types**
- Errors show **in real-time**
- Button enables **only when all fields are valid**
- Best for: Complex forms, sign-up forms

### Default Mode
If `validationMode` is not specified, it defaults to `'onChange'` (real-time validation).
