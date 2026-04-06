# Dynamic Form System

A production-ready form system built with React Hook Form, Zod, and shadcn UI.

## Quick Start

### 1. Define Schema
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});
```

### 2. Define Fields
```typescript
const fields = [
  { name: 'email', type: 'email', label: 'Email', required: true },
  { name: 'password', type: 'password', label: 'Password', required: true },
];
```

### 3. Use Form
```typescript
import { DynamicForm } from '@/components/forms';

export function LoginForm() {
  return (
    <DynamicForm
      schema={schema}
      defaultValues={{ email: '', password: '' }}
      fields={fields}
      onSubmit={(data) => console.log(data)}
      submitButtonText="Login"
    />
  );
}
```

## Features

- **20+ Field Types** - input, email, password, select, checkbox, radio, date, time, color, file, etc.
- **Type-Safe** - Full TypeScript + Zod validation
- **Real-Time Validation** - Instant error feedback
- **Smart Submit Button** - Auto-disables when invalid
- **Tailwind CSS** - Beautiful styling
- **Accessibility** - ARIA labels and keyboard navigation

## Field Types

| Type | Returns | Use |
|------|---------|-----|
| input | string | Text |
| email | string | Email |
| password | string | Password |
| number | number | Numbers |
| textarea | string | Long text |
| select | string | Single choice |
| multi-select | string[] | Multiple choices |
| checkbox | boolean | Yes/No |
| radio | string | Single option |
| switch | boolean | Toggle |
| date | string | Date picker |
| time | string | Time picker |
| file | File | File upload |

## Documentation

- **[FORM_GUIDE.md](FORM_GUIDE.md)** - Architecture & technical details
- **[src/pages/AdvancedForm.tsx](../src/pages/AdvancedForm.tsx)** - Complete working example

## Technologies

- React Hook Form
- Zod
- shadcn UI
- Tailwind CSS
- TypeScript
