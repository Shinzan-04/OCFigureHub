import { Download, CheckCircle2, XCircle } from 'lucide-react';
import { useDownloadHistory } from '../../hooks/useDownloadHistory';
import { EmptyState } from '../components/EmptyState';

export function DownloadHistoryPage() {
  const { data: history, isLoading } = useDownloadHistory();

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <Download size={24} style={{ color: '#8B5CF6' }} />
        <h1 className="text-2xl md:text-3xl font-bold text-white">Lịch sử Download</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl animate-pulse"
              style={{ backgroundColor: '#1a1a1a' }}
            />
          ))}
        </div>
      ) : !history || history.length === 0 ? (
        <EmptyState
          message="Chưa có lịch sử download"
          description="Mua sản phẩm và tải xuống để xem lịch sử tại đây"
          icon={<Download size={24} style={{ color: '#A1A1A1' }} />}
        />
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-5 py-4 rounded-xl border transition-colors hover:border-[#8B5CF6]"
              style={{ backgroundColor: '#111111', borderColor: '#262626' }}
            >
              <div className="flex items-center gap-4">
                {item.success ? (
                  <CheckCircle2 size={20} style={{ color: '#10B981' }} />
                ) : (
                  <XCircle size={20} style={{ color: '#EF4444' }} />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    Product ID: {item.productId.substring(0, 8)}...
                  </p>
                  <p className="text-xs" style={{ color: '#A1A1A1' }}>
                    {new Date(item.downloadedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.failureReason && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                    {item.failureReason}
                  </span>
                )}
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: item.success ? '#10B98120' : '#EF444420',
                    color: item.success ? '#10B981' : '#EF4444',
                  }}
                >
                  {item.success ? 'Thành công' : 'Thất bại'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
