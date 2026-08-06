import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ordersApi } from '../../api/orders';

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');
  const [message, setMessage] = useState('');
  const [productId, setProductId] = useState<string | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const queryString = `?${searchParams.toString()}`;
        const result = await ordersApi.verifyPayment(queryString);
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Thanh toán thành công!');
          if (result.productId) setProductId(result.productId);
          if (result.isSubscription) setIsSubscription(result.isSubscription);
        } else {
          setStatus('fail');
          setMessage(result.message || 'Thanh toán thất bại.');
        }
      } catch {
        setStatus('fail');
        setMessage('Không thể xác minh thanh toán. Vui lòng kiểm tra lịch sử đơn hàng.');
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
              <h1 className="text-xl font-bold text-white">Verifying payment...</h1>
              <p className="text-sm text-center" style={{ color: '#A1A1A1' }}>
                Please wait a moment
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
              <h1 className="text-xl font-bold text-white">Payment Successful!</h1>
              <p className="text-sm text-center" style={{ color: '#A1A1A1' }}>
                {message}
              </p>
              <div className="flex gap-3 w-full mt-2">
                <Link
                  to="/"
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-center border transition-colors hover:border-[#8B5CF6]"
                  style={{ borderColor: '#262626', color: '#A1A1A1' }}
                >
                  Home
                </Link>
                {isSubscription ? (
                  <Link
                    to="/upgrade"
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                  >
                    Back to Membership
                  </Link>
                ) : productId ? (
                  <Link
                    to={`/product/${productId}`}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                  >
                    Download Model Now
                  </Link>
                ) : (
                  <Link
                    to="/download-history"
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                  >
                    View History
                  </Link>
                )}
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
              <h1 className="text-xl font-bold text-white">Payment Failed</h1>
              <p className="text-sm text-center" style={{ color: '#A1A1A1' }}>
                {message}
              </p>
              <div className="flex gap-3 w-full">
                <Link
                  to="/"
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-center border transition-colors hover:border-[#8B5CF6]"
                  style={{ borderColor: '#262626', color: '#A1A1A1' }}
                >
                  Home
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
