import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import API from '../../api/client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Link xác thực không hợp lệ.');
      return;
    }

    API.get('/auth/verify-email', { params: { token, email } })
      .then(() => {
        setStatus('success');
        setMessage('Email đã được xác thực thành công!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Link xác thực không hợp lệ hoặc đã hết hạn.');
      });
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '60px', height: '60px', margin: '0 auto 1.5rem',
              border: '4px solid rgba(139,92,246,0.3)',
              borderTopColor: '#8B5CF6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Đang xác thực email...
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Vui lòng chờ trong giây lát</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '80px', height: '80px', margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem'
            }}>✓</div>
            <h2 style={{ color: '#10B981', fontSize: '1.8rem', marginBottom: '0.75rem' }}>
              Xác thực thành công!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: 1.6 }}>
              {message}
            </p>
            <Link to="/sign-in" style={{
              display: 'inline-block',
              padding: '0.875rem 2.5rem',
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              color: '#fff',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              Đăng nhập ngay
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '80px', height: '80px', margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem'
            }}>✕</div>
            <h2 style={{ color: '#EF4444', fontSize: '1.8rem', marginBottom: '0.75rem' }}>
              Xác thực thất bại
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: 1.6 }}>
              {message}
            </p>
            <Link to="/sign-in" style={{
              display: 'inline-block',
              padding: '0.875rem 2.5rem',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'background 0.2s',
            }}>
              Quay lại đăng nhập
            </Link>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
