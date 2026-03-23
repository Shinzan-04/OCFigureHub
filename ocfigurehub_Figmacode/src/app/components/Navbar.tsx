import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, Heart, LayoutDashboard, LogOut, Crown, ChevronDown, Download } from 'lucide-react';
import { useSaved } from '../context/SavedContext';
import { useAuthStore } from '../../store/authStore';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { savedIds } = useSaved();
  const { user, isLoggedIn, logout } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Explore' },
    { href: '/upgrade', label: 'Membership' },
    { href: '/about-us', label: 'About Us' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
  const isAdmin = user?.role === 'Admin';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ backgroundColor: 'rgba(11,11,11,0.92)', borderColor: '#262626', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
          >
            <span className="text-white text-xs font-black">OC</span>
          </div>
          <span className="text-white font-bold text-base hidden sm:block">
            OC Figure <span style={{ color: '#8B5CF6' }}>HUB</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
              style={{
                color: isActive(link.href) ? '#FFFFFF' : '#A1A1A1',
                backgroundColor: isActive(link.href) ? '#262626' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = '#A1A1A1';
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {/* Admin Dashboard button */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors duration-200 hover:border-[#8B5CF6]"
              style={{ borderColor: '#8B5CF660', color: '#8B5CF6', backgroundColor: '#8B5CF610' }}
            >
              <LayoutDashboard size={15} />
              Admin
            </Link>
          )}

          {/* Saved */}
          <Link
            to="/saved"
            className="relative p-2 rounded-xl border transition-colors duration-200 hover:border-[#8B5CF6]"
            style={{ borderColor: '#262626', color: '#A1A1A1' }}
          >
            <Heart size={18} />
            {savedIds.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                {savedIds.length > 9 ? '9+' : savedIds.length}
              </span>
            )}
          </Link>

          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors hover:border-[#8B5CF6]"
                style={{ borderColor: '#262626', color: '#A1A1A1' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff' }}
                >
                  {userInitial}
                </div>
                <span className="text-sm text-white hidden lg:block max-w-[120px] truncate">
                  {user.displayName}
                </span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl border p-2 z-20"
                    style={{ backgroundColor: '#111111', borderColor: '#262626' }}
                  >
                    <div className="px-3 py-2.5 mb-1">
                      <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                      <p className="text-xs truncate" style={{ color: '#A1A1A1' }}>{user.email}</p>
                      {isAdmin && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="h-px my-1" style={{ backgroundColor: '#262626' }} />
                    <Link
                      to="/upgrade"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[#1A1A1A]"
                      style={{ color: '#A1A1A1' }}
                    >
                      <Crown size={15} /> Membership
                    </Link>
                    <Link
                      to="/download-history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[#1A1A1A]"
                      style={{ color: '#A1A1A1' }}
                    >
                      <Download size={15} /> Lịch sử download
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[#1A1A1A]"
                      style={{ color: '#A1A1A1' }}
                    >
                      <Heart size={15} /> Đã lưu
                    </Link>
                    <div className="h-px my-1" style={{ backgroundColor: '#262626' }} />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[#1A1A1A]"
                      style={{ color: '#EF4444' }}
                    >
                      <LogOut size={15} /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors duration-200 hover:border-[#8B5CF6]"
                style={{ borderColor: '#262626', color: '#A1A1A1' }}
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 hover:opacity-90"
                style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile buttons */}
        <div className="flex md:hidden items-center gap-3">
          <Link to="/saved" className="relative p-2 rounded-xl" style={{ color: '#A1A1A1' }}>
            <Heart size={20} />
            {savedIds.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                {savedIds.length}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileOpen((o) => !o)} className="p-2 rounded-xl" style={{ color: '#A1A1A1' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ borderColor: '#262626', backgroundColor: '#0B0B0B' }}>
          <div className="px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: isActive(link.href) ? '#FFFFFF' : '#A1A1A1',
                  backgroundColor: isActive(link.href) ? '#262626' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ color: '#8B5CF6', backgroundColor: '#8B5CF610' }}
              >
                <LayoutDashboard size={15} /> Admin
              </Link>
            )}
            <div className="h-px my-1" style={{ backgroundColor: '#262626' }} />
            {isLoggedIn && user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff' }}
                  >
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-sm text-white truncate">{user.displayName}</p>
                    <p className="text-xs" style={{ color: '#A1A1A1' }}>{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: '#EF4444' }}
                >
                  <LogOut size={15} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-1">
                <Link
                  to="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium border"
                  style={{ borderColor: '#262626', color: '#A1A1A1' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}