# Movie Streaming Web - Frontend Project

A modern, production-ready NextJS frontend for the Movie Streaming Platform, built with TypeScript, Material-UI, and Clean Architecture principles.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Configure backend API URL (edit .env.local)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                 # NextJS App Router (Pages)
├── modules/             # Feature modules (auth, movie, user, etc.)
├── components/          # Shared UI components
├── services/            # API client & services
├── hooks/               # Custom React hooks
├── context/             # Global state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── constants/           # Constants & configuration
├── styles/              # Global styles
├── config/              # Configuration files
└── middleware.ts        # NextJS middleware
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🎯 Key Features

- ✨ **Modern Tech Stack** - NextJS 15 + React 19 + TypeScript
- 🎨 **Material-UI Components** - Professional UI components
- 🔐 **Authentication** - JWT-based authentication
- 🗂️ **Clean Architecture** - Feature-based organization
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Performance** - SSR, code splitting, image optimization
- 🧪 **Testing Ready** - Jest + React Testing Library
- 🛡️ **Type Safe** - Full TypeScript support
- 🌐 **API Integration** - Axios with interceptors
- 🎭 **State Management** - Context API + React Query

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript check

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 🔧 Environment Variables

Create `.env.local` file:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

## 📚 API Integration

All API calls go through the service layer:

```typescript
// Usage in components
import authService from '@/modules/auth/api/auth-service';

const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password'
    });
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## 🔐 Authentication

Authentication is handled through Context API:

```typescript
import { useAuth } from '@/modules/auth/hooks/useAuth';

const Component = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={() => login(email, password)}>Login</button>
      )}
    </div>
  );
};
```

## 🎨 Theming

MUI theme is configured in `src/config/theme.ts`:

```typescript
import { lightTheme, darkTheme } from '@/config/theme';
```

Customize colors and styles in the theme configuration.

## 🧪 Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files should be placed next to components:
```
component/
├── Component.tsx
├── Component.test.tsx
└── Component.module.css
```

## 📤 Deployment

### Build for production
```bash
npm run build
npm run start
```

### Docker
```bash
docker build -t movie-streaming-web .
docker run -p 3000:3000 movie-streaming-web
```

### Environment-specific builds
```bash
# Production
NEXT_PUBLIC_API_BASE_URL=https://api.example.com npm run build

# Staging
NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com npm run build
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Submit a pull request

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Follow project structure conventions

## 📝 License

This project is part of the Movie Streaming Platform project.

## 🆘 Troubleshooting

### CORS Errors
- Verify backend CORS configuration
- Check `NEXT_PUBLIC_API_BASE_URL` in .env.local

### Type Errors
- Run `npm run type-check`
- Check tsconfig.json path aliases

### Module Not Found
- Verify import paths match tsconfig.json
- Clear .next folder: `rm -rf .next`

## 📞 Support

For issues and questions:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review code examples in the project
3. Check backend API documentation

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure environment: `.env.local`
3. ✅ Add CORS to backend
4. ✅ Implement feature pages
5. ✅ Add authentication flow
6. ✅ Connect to backend APIs

Happy coding! 🎉
