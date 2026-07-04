import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './features/auth/auth.store';
import { LoginScreen } from './features/auth/components/LoginScreen';
import { AppLayout } from './components/layout/AppLayout';
import { CertList } from './features/certificates/components/CertList';

function AppContent() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <LoginScreen />;
  }

  return (
    <AppLayout>
      <CertList />
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;