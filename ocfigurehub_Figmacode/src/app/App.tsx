import { RouterProvider } from 'react-router';
import { router } from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { configApi, PublicConfig } from '../api/config';
import MaintenancePage from './pages/MaintenancePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    hydrate();
    configApi.getPublicConfig().then(setConfig);
  }, [hydrate]);

  if (!config) return null; // or a loading spinner

  const isAllowedRoute = window.location.pathname.startsWith('/admin') || window.location.pathname === '/sign-in';
  if (config.maintenanceMode && !isAllowedRoute) {
    return <MaintenancePage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #262626',
          },
        }}
      />
    </QueryClientProvider>
  );
}
