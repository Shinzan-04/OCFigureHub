import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, MessageCircle, Facebook } from 'lucide-react';
import { newsletterApi } from '../../api/newsletter';
import { toast } from 'react-hot-toast';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await newsletterApi.subscribe(email);
      setSubscribed(true);
      setEmail('');
      toast.success(res.message || 'Đăng ký thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      className="border-t mt-auto"
      style={{ backgroundColor: '#0B0B0B', borderColor: '#262626' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Left */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 w-fit">
              <img src="/logo.png" alt="OC Figure Hub" className="h-9 w-auto" style={{ filter: 'invert(1)' }} />
              <span className="text-white font-bold text-lg">
                OC Figure <span style={{ color: '#8B5CF6' }}>HUB</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#A1A1A1' }}>
              The new home for your digital goods — high-quality 3D anime model repository for the creative community.
            </p>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A1A1A1' }}>
                  Navigation
                </span>
                {[
                  { href: '/', label: 'Explore' },
                  { href: '/about-us', label: 'About Us' },
                  { href: '/upgrade', label: 'Membership' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white w-fit"
                    style={{ color: '#A1A1A1' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A1A1A1' }}>
                  Support
                </span>
                <a
                  href="https://m.me/61590154153324"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200 hover:text-white w-fit flex items-center gap-2"
                  style={{ color: '#00B2FF' }}
                >
                  <svg viewBox="0 0 36 36" fill="currentColor" width="16" height="16">
                    <path d="M18 1.4C8.7 1.4 1.2 8.5 1.2 17.2c0 4.9 2.4 9.3 6.1 12.3v5.1l5.5-3.1c1.7.5 3.5.7 5.2.7 9.3 0 16.8-7.1 16.8-15.8S27.3 1.4 18 1.4zm1.1 21.3-4.3-4.7-8.4 4.7 9.2-9.9 4.4 4.7 8.3-4.7-9.2 9.9z"/>
                  </svg>
                  Messenger
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61590154153324"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-200 hover:text-white w-fit flex items-center gap-2"
                  style={{ color: '#3b5998' }}
                >
                  Facebook Fanpage
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#A1A1A1' }}>
                  Account
                </span>
                {[
                  { href: '/sign-in', label: 'Sign In' },
                  { href: '/sign-up', label: 'Sign Up' },
                  { href: '/forgot-password', label: 'Reset Password' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white w-fit"
                    style={{ color: '#A1A1A1' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Newsletter */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="font-bold text-white text-lg mb-2">Get the latest updates</h3>
              <p className="text-sm" style={{ color: '#A1A1A1' }}>
                Subscribe to receive notifications about new files, discounts, and updates from the OC Figure HUB community.
              </p>
            </div>

            {subscribed ? (
              <div
                className="p-4 rounded-2xl border text-center"
                style={{ borderColor: '#8B5CF6', backgroundColor: '#8B5CF610' }}
              >
                <p className="text-sm font-medium" style={{ color: '#8B5CF6' }}>
                  🎉 Thanks for subscribing!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none transition-colors duration-200"
                  style={{
                    backgroundColor: '#111111',
                    border: '1px solid #262626',
                    color: '#FFFFFF',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B5CF6')}
                  onBlur={(e) => (e.target.style.borderColor = '#262626')}
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 justify-center px-5 py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
                >
                  Subscribe
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: '#262626' }}
        >
          <p className="text-xs" style={{ color: '#A1A1A1' }}>
            © 2026 OC Figure HUB. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#A1A1A1' }}>
            Made with ❤️ for the anime community
          </p>
        </div>
      </div>
    </footer>
  );
}
