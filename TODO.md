# TODO: Remove Authentication Entirely

## Tasks
- [x] Update src/App.tsx: Remove AuthProvider, auth routes, ProtectedRoute wrappers, set / to HomePage, /encode to EncodePage
- [x] Delete src/contexts/AuthContext.tsx
- [x] Delete src/components/auth/ProtectedRoute.tsx
- [x] Delete src/pages/LoginPage.tsx
- [x] Delete src/pages/CreateAccountPage.tsx
- [x] Delete src/utils/auth.ts
- [x] Update src/components/layout/Header.tsx: Remove auth imports and UI
- [x] Update src/components/layout/Footer.tsx: Remove auth imports and logic
- [x] Update src/components/home/Hero.tsx: Remove auth imports and logic, direct navigation
- [x] Test app for direct access to features
- [x] Confirm no auth UI remains
