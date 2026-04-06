# Toast Usage

## Setup

Wrap your application with `ToastProvider`.

```tsx
import ToastProvider from "@/components/ui/toast/ToastProvider"

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  )
}

export default App
```

---

## Using Toast

Import the hook:

```tsx
import { useToast } from "@/components/ui/toast/useToast"
```

Use the hook inside a component:

```tsx
function Example() {
  const toast = useToast()

  return (
    <>
      <button onClick={() => toast.success("Saved successfully")}>
        Success
      </button>

      <button onClick={() => toast.error("Something went wrong")}>
        Error
      </button>

      <button onClick={() => toast.warning("Warning message")}>
        Warning
      </button>

      <button onClick={() => toast.info("Information message")}>
        Info
      </button>
    </>
  )
}
```

---

## Available Variants

```
toast.success()
toast.error()
toast.warning()
toast.info()
```
