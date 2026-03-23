import { Outlet, ScrollRestoration } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SavedProvider } from '../context/SavedContext';

export function Root() {
  return (
    <SavedProvider>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0B0B0B' }}>
        <Navbar />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
        <ScrollRestoration />
      </div>
    </SavedProvider>
  );
}
