import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { configApi, PublicConfig } from '../api/config';
import MaintenancePage from './pages/MaintenancePage';
import { ZaloWarningBanner } from './components/ZaloWarningBanner';

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
    let mounted = true;

    // Safety timeout: if API hangs, fallback to default config
    const timeoutId = setTimeout(() => {
      if (mounted && !config) {
        setConfig({ allowRegistration: true, maintenanceMode: false });
      }
    }, 3000);

    configApi.getPublicConfig().then((cfg) => {
      if (mounted) {
        setConfig(cfg);
        clearTimeout(timeoutId);
      }
    }).catch(() => {
      if (mounted) {
        setConfig({ allowRegistration: true, maintenanceMode: false });
        clearTimeout(timeoutId);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [hydrate]);

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center gap-4 text-white">
        <img src="/logo.png" alt="OC Figure Hub" className="h-10 w-auto opacity-90" style={{ filter: 'invert(1)' }} />
        <div className="flex items-center gap-2 text-sm text-[#A1A1A1]">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải OC Figure Hub...</span>
        </div>
      </div>
    );
  }

  const isAllowedRoute = window.location.pathname.startsWith('/admin') || window.location.pathname === '/sign-in';
  if (config.maintenanceMode && !isAllowedRoute) {
    return <MaintenancePage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ZaloWarningBanner />
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

