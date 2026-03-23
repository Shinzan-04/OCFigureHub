import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ordersApi } from '../../api/orders';

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const queryString = `?${searchParams.toString()}`;
        const result = await ordersApi.verifyPayment(queryString);
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Thanh toán thành công!');
        } else {
          setStatus('fail');
          setMessage(result.message || 'Thanh toán thất bại.');
        }
      } catch {
        // Fallback: check vnp_ResponseCode directly
        const responseCode = searchParams.get('vnp_ResponseCode');
        if (responseCode === '00') {
          setStatus('success');
          setMessage('Thanh toán thành công!');
        } else {
          setStatus('fail');
          setMessage(`Thanh toán thất bại. Mã lỗi: ${responseCode || 'unknown'}`);
        }
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[480px]">
        <div
          className="rounded-2xl border p-8 md:p-10 flex flex-col items-center gap-6"
          style={{ backgroundColor: '#111111', borderColor: '#262626' }}
        >
          {status === 'loading' && (
            <>
              <Loader2 size={48} className="animate-spin" style={{ color: '#8B5CF6' }} />
              <h1 className="text-xl font-bold text-white">Đang xác minh thanh toán...</h1>
              <p className="text-sm text-center" style={{ color: '#A1A1A1' }}>
                Vui lòng đợi trong giây lát
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#10B98120' }}
              >
                <CheckCircle2 size={40} style={{ color: '#10B981' }} />
              </div>
              <h1 className="text-xl font-bold text-white">Thanh toán thành công!</h1>
              <p className="text-sm text-center" style={{ color: '#A1A1A1' }}>
                {message}
              </p>
              <div className="flex gap-3 w-full">
                <Link
                  to="/"
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-center border transition-colors hover:border-[#8B5CF6]"
                  style={{ borderColor: '#262626', color: '#A1A1A1' }}
                >
                  Trang chủ
                </Link>
                <Link
                  to="/download-history"
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                >
                  Xem lịch sử
                </Link>
              </div>
            </>
          )}

          {status === 'fail' && (
            <>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#EF444420' }}
              >
                <XCircle size={40} style={{ color: '#EF4444' }} />
              </div>
              <h1 className="text-xl font-bold text-white">Thanh toán thất bại</h1>
              <p className="text-sm text-center" style={{ color: '#A1A1A1' }}>
                {message}
              </p>
              <div className="flex gap-3 w-full">
                <Link
                  to="/"
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-center border transition-colors hover:border-[#8B5CF6]"
                  style={{ borderColor: '#262626', color: '#A1A1A1' }}
                >
                  Trang chủ
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                >
                  Thử lại
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
