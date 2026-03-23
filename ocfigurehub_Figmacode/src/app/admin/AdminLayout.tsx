import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link, useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingCart,
  Crown, Bookmark, BarChart2, FileText, Settings,
  Menu, X, Bell, LogOut, ChevronRight,
  Box, AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/resources', icon: Package, label: 'Resources' },
  { path: '/admin/categories', icon: Tag, label: 'Categories' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/admin/membership', icon: Crown, label: 'Membership' },
  { path: '/admin/saved', icon: Bookmark, label: 'Saved Items' },
  { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/admin/content', icon: FileText, label: 'Content' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

function AdminLayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuthStore();

  const currentPage = navItems.find(item =>
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  // Admin guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/', { replace: true });
    } else if (user?.role !== 'Admin') {
      navigate('/?error=no-permission', { replace: true });
    }
  }, [user, isLoggedIn, navigate]);

  // Show access denied while redirecting
  if (!user || user.role !== 'Admin') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-6"
        style={{ backgroundColor: '#0B0B0B' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
          style={{ backgroundColor: '#EF444420' }}
        >
          <AlertTriangle size={30} style={{ color: '#EF4444' }} />
        </div>
        <h1 className="text-2xl font-black text-white text-center">
          Bạn không có quyền truy cập trang này.
        </h1>
        <p className="text-sm text-center" style={{ color: '#A1A1A1' }}>
          You do not have permission to access this page.
        </p>
        <Link
          to="/"
          className="mt-2 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userInitial = user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0B0B0B', color: '#E5E5E5' }}>
      {/* Overlay for mobile/tablet sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300
          lg:relative lg:translate-x-0 lg:flex
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ width: 240, background: '#111111', borderRight: '1px solid #262626', flexShrink: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: '#8B5CF6' }}>
              <Box size={16} color="#fff" />
            </div>
            <div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>OC Figure</span>
              <span style={{ color: '#8B5CF6', fontWeight: 700, fontSize: 14 }}> Hub</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ color: '#999' }}>
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3">
          <span className="inline-block px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 600 }}>
            Admin Panel
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: isActive ? '#8B5CF6' : '#999',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                }}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: user info, back to site + logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #262626' }}>
          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg" style={{ background: '#1A1A1A' }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: '#8B5CF6', color: '#fff' }}
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <p style={{ color: '#ccc', fontSize: 12, fontWeight: 500 }} className="truncate">{user.email}</p>
              <p style={{ color: '#8B5CF6', fontSize: 10 }}>Admin</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all"
            style={{ color: '#888', fontSize: 14 }}
          >
            <Box size={16} />
            <span>Back to Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all hover:bg-[#1A1A1A]"
            style={{ color: '#EF4444', fontSize: 14 }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 py-3 flex-shrink-0"
          style={{ background: '#111111', borderBottom: '1px solid #262626', height: 60 }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile/tablet hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg"
              style={{ color: '#999' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ color: '#fff', fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>
                {currentPage?.label || 'Admin'}
              </h1>
              <p style={{ color: '#666', fontSize: 12 }}>OC Figure Hub Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification */}
            <button className="relative p-2 rounded-lg" style={{ background: '#1A1A1A', color: '#999' }}>
              <Bell size={18} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: '#8B5CF6' }}
              />
            </button>

            {/* Admin avatar */}
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: '#1A1A1A' }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#8B5CF6', color: '#fff' }}
              >
                {userInitial}
              </div>
              <span style={{ color: '#ccc', fontSize: 13, fontWeight: 500 }} className="hidden sm:block">
                {user.email?.split('@')[0]}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg transition-colors hover:bg-[#1A1A1A]"
              style={{ color: '#EF4444' }}
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
        style={{ background: '#111111', borderTop: '1px solid #262626' }}
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5"
              style={{ color: isActive ? '#8B5CF6' : '#666' }}
            >
              <item.icon size={18} />
              <span style={{ fontSize: 9, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
            </NavLink>
          );
        })}
        <button
          className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5"
          style={{ color: '#666' }}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={18} />
          <span style={{ fontSize: 9 }}>More</span>
        </button>
      </nav>
    </div>
  );
}

export function AdminLayout() {
  return <AdminLayoutInner />;
}
