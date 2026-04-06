# React + Vite + TypeScript Boilerplate

A production-ready React boilerplate with essential components, error handling, and routing system. Built with TypeScript, Tailwind CSS, and modern best practices.

## 🚀 Features

### 🎯 Core Stack
- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and development server
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library

### 🎨 UI Components
- **Modal Components** - Reusable, accessible modal dialogs
- **Error Handling** - Comprehensive error boundaries and pages
- **Routing System** - Complete routing with error pages
- **Form Components** - Ready-to-use form elements

### 🛡️ Error Handling
- **Global Error Boundary** - Catches React render errors
- **Error Pages** - 404 (Not Found) and 403 (Forbidden) pages
- **Error Modals** - API/runtime error display
- **Router Error Handling** - Route-level error boundaries

### 🧭 Routing
- **React Router v6** - Modern routing solution
- **Nested Routes** - Organized route structure
- **Catch-all 404** - Handles undefined routes
- **Protected Routes** - Pattern for authentication

## 📦 Installation

```js
export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            // Other configs...

            // Remove tseslint.configs.recommended and replace with this
            tseslint.configs.recommendedTypeChecked,
            // Alternatively, use this for stricter rules
            tseslint.configs.strictTypeChecked,
            // Optionally, add this for stylistic rules
            tseslint.configs.stylisticTypeChecked,

            // Other configs...
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
])
```

## Project Work: Task #12 (Auth Context & Provider)

This project includes a reusable auth module for task `#12`.

Implemented location:

- `src/context/auth-context/`

Supporting API layer:

- `src/api/client.ts`
- `src/api/endpoints.ts`
- `src/api/types.ts`
- `src/api/utils.ts`

Main capabilities:

- Calls profile endpoint on provider mount.
- Stores fetched user profile in auth state.
- Exposes `useAuth()` with:
  - `user`
  - `token`
  - `isAuthenticated`
  - `isLoading`
  - `error`
  - `setToken()`
  - `refreshProfile()`
  - `logout()`

### Backend Response Support

The provider is built to handle wrapped API responses like:

- `success: true` with `data`
- `success: false` with `message`, `error.code`, `error.details`

Types are defined in:

- `src/api/types.ts`

The auth provider uses the shared API client (`apiClient.instance`) so it follows common interceptors and normalized error handling used by the rest of the app.

### Auth Modes

The provider supports both reusable modes through config.

1. `cookie` mode (default, production-oriented)
2. `bearer` mode (token storage mode)

Default config file:

- `src/context/auth-context/config.ts`

Auth endpoint defaults now come from shared endpoint constants:

- `API_ENDPOINTS.AUTH.PROFILE`
- `API_ENDPOINTS.AUTH.LOGOUT`

### Session Cookie Clear Flow

In cookie mode, `logout()`:

1. Calls backend logout endpoint (default: `/auth/logout`)
2. Sends request with credentials
3. Clears local auth state

This keeps frontend state deterministic even if network logout fails.

In bearer mode, `logout()` clears the configured token storage key and local auth state.

### How To Use In This Project

App wrapping is in `src/main.tsx`.

Example:

```tsx
const authMode = import.meta.env.VITE_AUTH_MODE === 'bearer' ? 'bearer' : 'cookie';

<AuthProvider config={getAppAuthConfig(authMode)}>
    <App />
</AuthProvider>
```

Set backend URL in env:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_AUTH_MODE=cookie
```

### How To Reuse In Other Projects

To use this in another project:

1. Copy folders `src/context/auth-context/` and `src/api/`
2. Update `src/context/auth-context/config.ts`:
   - `MODE_DEFAULTS.cookie`
   - `MODE_DEFAULTS.bearer`
   - `APP_AUTH_OVERRIDES`
3. Update `src/api/endpoints.ts` if your backend path contracts differ
4. Wrap app root with one provider using mode key only
5. Set env values (`VITE_API_BASE_URL`, `VITE_AUTH_MODE`)
6. Use `useAuth()` in pages/components

Reusable standard pattern:

```tsx
const authMode = import.meta.env.VITE_AUTH_MODE === 'bearer' ? 'bearer' : 'cookie';

<AuthProvider config={getAppAuthConfig(authMode)}>
    <App />
</AuthProvider>
```

Why this is standard:

- `main.tsx` passes only auth mode key.
- Endpoint paths and mode behavior are centralized in `config.ts`.
- Endpoint values are shared through `src/api/endpoints.ts` constants.
- API success/error handling is centralized in `src/api/client.ts` interceptors.
- New projects only edit config defaults/overrides, not provider internals.

Important for reuse across projects:

- Each project may have different auth endpoints.
- Primary update point: `src/api/endpoints.ts`
    - `API_ENDPOINTS.AUTH.PROFILE`
    - `API_ENDPOINTS.AUTH.LOGOUT`
- Optional override point: `src/context/auth-context/config.ts`
    - `MODE_DEFAULTS.cookie.profilePath` / `MODE_DEFAULTS.cookie.logoutPath`
    - `MODE_DEFAULTS.bearer.profilePath` / `MODE_DEFAULTS.bearer.logoutPath`
    - Use this only when a project needs mode-specific endpoint differences.
- Example per project:
    - Project A: `API_ENDPOINTS.AUTH.PROFILE = /auth/profile`, `API_ENDPOINTS.AUTH.LOGOUT = /auth/logout`
    - Project B: `API_ENDPOINTS.AUTH.PROFILE = /users/me`, `API_ENDPOINTS.AUTH.LOGOUT = /session/logout`
    - Project C: `API_ENDPOINTS.AUTH.PROFILE = /v1/account/profile`, `API_ENDPOINTS.AUTH.LOGOUT = /v1/auth/signout`

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            // Other configs...
            // Enable lint rules for React
            reactX.configs['recommended-typescript'],
            // Enable lint rules for React DOM
            reactDom.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
])
```bash
# Clone the repository
git clone <repository-url>
cd react-boilerplate

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable components
│   ├── modals/          # Modal components
│   │   ├── ConfirmModal.tsx  # Confirmation dialogs
│   │   ├── ErrorModal.tsx    # Error display modals
│   │   ├── DataModal.tsx     # Scrollable data modals
│   │   └── index.ts     # Barrel exports
│   ├── ui/              # UI components (shadcn)
│   └── ErrorBoundary.tsx # Global error boundary
├── pages/               # Page components
│   ├── NotFound.tsx     # 404 page
│   ├── Forbidden.tsx    # 403 page
│   ├── Login.tsx        # Login page
│   └── ErrorFallback.tsx # Error fallback UI
├── router/              # Routing configuration
│   └── index.tsx        # Router setup
├── lib/                 # Utilities
│   └── utils.ts         # Utility functions
├── App.tsx              # Main application
└── main.tsx             # Application entry point
```

## 🎯 Component Usage

### Modal Components

#### ConfirmModal
```tsx
import { ConfirmModal } from '@/components';

const Example = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={() => console.log('Confirmed')}
      title="Confirm Action"
      message="Are you sure you want to proceed?"
      confirmText="Yes, proceed"
      cancelText="No, cancel"
      variant="danger" // default, danger, success, info
      isLoading={false}
    />
  );
};
```

#### ErrorModal
```tsx
import { ErrorModal } from '@/components';

const Example = () => {
  return (
    <ErrorModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="API Error"
      message="Failed to fetch data from server."
      errorCode={500}
      variant="error" // error or warning
      closeButtonText="Retry"
    />
  );
};
```

#### DataModal
```tsx
import { DataModal } from '@/components';

const Example = () => {
  return (
    <DataModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="User Details"
      description="Detailed user information"
      size="lg" // sm, md, lg, xl, full
      scrollable={true}
    >
      <div>Custom content here</div>
    </DataModal>
  );
};
```

### Error Boundary
```tsx
// Wrap your entire app in main.tsx
import ErrorBoundary from '@/components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </StrictMode>,
);
```

### Custom Error Boundary Usage
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

const Example = () => {
  return (
    <ErrorBoundary
      onError={(error, info) => {
        // Log to error reporting service
        console.error('Error:', error, info);
      }}
      onReset={() => {
        // Handle reset logic
        console.log('Error boundary reset');
      }}
      resetKeys={[someState]} // Reset when this changes
    >
      <ErrorProneComponent />
    </ErrorBoundary>
  );
};
```

## 🚦 Routing

### Router Configuration
The router is configured in `src/router/index.tsx` with:
- Main application route (`/`)
- Login route (`/login`)
- Error pages (`/forbidden`, `*` for 404)
- Error boundary for route errors

### Adding New Routes
```tsx
// In src/router/index.tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouterError />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  // ... other routes
]);
```

## 🎨 Styling

### Tailwind CSS
This project uses Tailwind CSS for styling. Configuration is in `tailwind.config.ts`.

### Custom Utilities
The `cn` utility function combines `clsx` and `twMerge` for conditional class names:

```tsx
import { cn } from '@/lib/utils';

const Example = () => {
  return (
    <div className={cn(
      'base-class',
      isActive && 'active-class',
      isError && 'error-class'
    )}>
      Content
    </div>
  );
};
```

## 🔧 Configuration

### TypeScript
- Configuration: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Strict mode enabled
- Path aliases configured (`@/*` → `src/*`)

### Vite
- Configuration: `vite.config.ts`
- React plugin with SWC
- Path aliases
- Environment variables

### ESLint & Prettier
- Code quality enforcement
- Auto-formatting on save
- TypeScript support
- Tailwind CSS plugin

## 📚 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run lint:fix` - Auto-fix lint issues
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage

## 🧪 Testing

The project is set up for testing with:
- Jest testing framework
- React Testing Library
- TypeScript support
- Coverage reporting

## 📦 Dependencies

### Core
- `react` & `react-dom` - React library
- `typescript` - TypeScript support
- `vite` - Build tool

### UI & Styling
- `tailwindcss` - CSS framework
- `shadcn-ui` - Component library
- `lucide-react` - Icon library
- `clsx` & `tailwind-merge` - Class utilities

### Routing & State
- `react-router-dom` - Routing
- `react-error-boundary` - Error handling

### Development
- `eslint` - Code linting
- `prettier` - Code formatting
- `jest` - Testing
- `@testing-library/react` - React testing

## 🚀 Deployment

### Building for Production
```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Variables
Create a `.env` file for environment-specific configuration:

```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My App
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the excellent build tool
- [Tailwind CSS](https://tailwindcss.com/) for the CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [React Router](https://reactrouter.com/) for routing
- [React Error Boundary](https://github.com/bvaughn/react-error-boundary) for error handling

---

Built with ❤️ for the React community