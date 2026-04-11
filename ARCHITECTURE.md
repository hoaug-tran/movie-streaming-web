## Project Structure Guide

### Overview
This is a **production-ready NextJS frontend** for Movie Streaming Platform, built with **Clean Architecture** principles and **Feature-Based** organization.

### Architecture Pattern: **Clean Architecture + Feature-Based**

```
src/
├── app/                    # NextJS App Router (Pages & Routes)
├── modules/                # Feature Modules (Isolated Business Logic)
│   ├── auth/              # Authentication module
│   ├── movie/             # Movie browsing module
│   ├── user/              # User profile module
│   ├── review/            # Reviews module
│   ├── comment/           # Comments module
│   ├── watchlist/         # Watchlist module
│   ├── subscription/      # Subscription module
│   └── admin/             # Admin management module
├── components/            # Shared UI Components
│   ├── Layout/            # Layout components (Navbar, Sidebar)
│   ├── Common/            # Common components (Header, Footer)
│   ├── Form/              # Form components
│   ├── UI/                # Base UI components
│   ├── Loading/           # Loading states
│   └── Error/             # Error boundaries
├── services/              # API Client & Services
├── hooks/                 # Custom React Hooks
├── context/               # React Context (State Management)
├── types/                 # Global TypeScript Types
├── utils/                 # Utility Functions
├── constants/             # Constants & Enums
├── styles/                # Global Styles
├── config/                # Configuration Files
└── middleware.ts          # NextJS Middleware
```

### Folder Structure Details

#### **modules/** - Feature-Based Modules
Each module is self-contained with its own:
- `types/` - Module-specific TypeScript types
- `api/` - API service calls
- `components/` - Module components
- `hooks/` - Module hooks

Example: `modules/auth/`
```
auth/
├── types/
│   └── auth.ts
├── api/
│   └── auth-service.ts
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ...
└── hooks/
    └── useAuth.ts
```

#### **components/** - Shared Components
```
components/
├── Layout/          # Layout wrappers (Navbar, Sidebar, Footer)
├── Common/          # Reusable common components
├── Form/            # Form building blocks
├── UI/              # Base UI components
├── Loading/         # Loading skeletons & spinners
└── Error/           # Error boundaries & error messages
```

#### **services/** - API Client
- `api-client.ts` - Axios instance with interceptors
- Service files for specific domains

#### **context/** - State Management
- `auth-context.tsx` - Global authentication state

#### **hooks/** - Custom Hooks
- `useApi.ts` - API hooks
- `useAuth.ts` - Authentication hooks
- `useFetch.ts` - Data fetching hooks

### Design Patterns

#### 1. **Clean Architecture**
- Separation of concerns (Business Logic, Presentation, Data)
- Dependency inversion
- Single responsibility principle

#### 2. **Feature-Based Organization**
- Each feature is self-contained
- Easy to find related code
- Scalable structure

#### 3. **API Service Pattern**
```typescript
// Usage in components
const { login } = useAuth();
await login(email, password);

// Service handles HTTP calls
// Context handles state
// Component focuses on UI
```

#### 4. **Custom Hooks**
- `useAuth()` - Authentication state
- `useGetData<T>()` - Fetch data with react-query
- `usePostData<T>()` - Submit data
- `useLocalStorage<T>()` - Persistent state

### Technology Stack

| Layer | Technology |
|-------|------------|
| **UI Framework** | NextJS 15 + React 19 |
| **Component Library** | Material-UI (MUI) |
| **State Management** | Context API + Zustand (optional) |
| **Data Fetching** | React Query + Axios |
| **Authentication** | JWT + Context API |
| **Type Safety** | TypeScript |
| **Styling** | MUI + CSS-in-JS (Emotion) |
| **Testing** | Jest + React Testing Library |
| **Linting** | ESLint + Prettier |

### Key Features

✅ **TypeScript** - Full type safety
✅ **SSR/SSG** - NextJS server capabilities
✅ **Authentication** - JWT-based auth flow
✅ **API Integration** - Clean API service layer
✅ **Error Handling** - Global error management
✅ **Loading States** - Skeleton screens
✅ **Routing** - NextJS App Router
✅ **State Management** - Context API with reducers
✅ **Custom Hooks** - Reusable logic
✅ **Responsive Design** - MUI responsive grid
✅ **Dark Mode Ready** - Theme switching
✅ **Testing Ready** - Jest configuration

### Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   ```

3. **Run development server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

### Development Workflow

#### Creating a New Feature Module

1. Create module structure:
   ```
   src/modules/newfeature/
   ├── types/
   │   └── newfeature.ts
   ├── api/
   │   └── newfeature-service.ts
   ├── components/
   │   └── NewFeatureComponent.tsx
   └── hooks/
       └── useNewFeature.ts
   ```

2. Define types in `types/newfeature.ts`
3. Create API service in `api/newfeature-service.ts`
4. Build components in `components/`
5. Create custom hooks in `hooks/`
6. Use in pages under `src/app/`

#### Example: Adding a Login Feature

```typescript
// 1. Use hook in component
const { login, loading, error } = useAuth();

// 2. Call login function
await login(email, password);

// 3. AuthContext handles state
// 4. AuthService handles API
// 5. Component updates UI
```

### API Integration Pattern

```typescript
// Service Layer (modules/auth/api/auth-service.ts)
class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data.data;
  }
}

// Hook Layer (modules/auth/hooks/useAuth.ts)
export const useAuth = () => useContext(AuthContext);

// Component Layer
const Component = () => {
  const { login } = useAuth();
  return <button onClick={() => login(email, password)}>Login</button>;
};
```

### State Management Pattern

```typescript
// Context with Reducer
const AuthContext = createContext<AuthContextType>();

// In AuthProvider
const [state, dispatch] = useReducer(authReducer, initialState);

// Dispatch actions
dispatch({ type: 'LOGIN_SUCCESS', payload: user });

// Provide to app
<AuthContext.Provider value={state}>{children}</AuthContext.Provider>
```

### Error Handling

```typescript
// Global error handling in API client
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

// Use in components
try {
  await login(email, password);
} catch (error) {
  setError(error.message);
}
```

### Best Practices

1. **Type Everything** - Use TypeScript for all files
2. **Colocate Related Code** - Keep components with their types/hooks
3. **Service Pattern** - All API calls go through services
4. **Custom Hooks** - Extract complex logic into hooks
5. **Constants** - Use constants file for magic strings
6. **Error Boundaries** - Wrap components in error boundaries
7. **Loading States** - Show loading UI during async operations
8. **Lazy Loading** - Use React.lazy for code splitting
9. **Memoization** - Use useMemo/useCallback wisely
10. **Environment Variables** - Use .env.local for sensitive data

### Performance Optimization

- `React.lazy()` for code splitting
- `next/Image` for image optimization
- `react-query` for smart caching
- Memoization with `useMemo` and `useCallback`
- Server-side rendering with NextJS

### Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Deployment

```bash
# Build
npm run build

# Start production server
npm run start

# Docker (if Dockerfile is provided)
docker build -t movie-streaming-web .
docker run -p 3000:3000 movie-streaming-web
```

### Troubleshooting

**Issue: CORS errors**
- Check backend CORS configuration
- Ensure API_BASE_URL in .env.local is correct

**Issue: Authentication token expired**
- Implement token refresh logic in API client
- Check token expiration in JWT config

**Issue: Module not found**
- Check tsconfig.json paths
- Ensure path aliases are correct

---

For more details, refer to:
- [NextJS Documentation](https://nextjs.org/docs)
- [MUI Documentation](https://mui.com/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
