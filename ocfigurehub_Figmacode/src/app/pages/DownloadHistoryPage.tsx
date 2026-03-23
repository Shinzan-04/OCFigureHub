import { Download, CheckCircle2, XCircle, Box } from 'lucide-react';
import { Link } from 'react-router';
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
        <div className="space-y-4">
          {history.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.productId}`}
              className="flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all hover:border-[#8B5CF6] hover:bg-[#1A1A1A] group"
              style={{ backgroundColor: '#111111', borderColor: '#262626' }}
            >
              <div className="flex items-center gap-4 md:gap-6">
                {/* Thumbnail */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-[#262626] flex-shrink-0 relative">
                  {item.thumbnailUrl ? (
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.productName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Box size={24} style={{ color: '#A1A1A1' }} />
                    </div>
                  )}
                  {/* Status Indicator Icon Overlay */}
                  <div className="absolute -bottom-2 -right-2 bg-[#111111] rounded-full p-1 group-hover:bg-[#1A1A1A] transition-colors">
                    {item.success ? (
                      <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                    ) : (
                      <XCircle size={16} style={{ color: '#EF4444' }} />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm md:text-base font-bold text-white line-clamp-1 group-hover:text-[#8B5CF6] transition-colors">
                    {item.productName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#A1A1A1' }}>
                    <span>ID: {item.productId.substring(0, 8)}...</span>
                  </div>
                  <p className="text-xs font-mono" style={{ color: '#666' }}>
                    {new Date(item.downloadedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-2 text-right">
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                  style={{
                    backgroundColor: item.success ? '#10B98115' : '#EF444415',
                    color: item.success ? '#10B981' : '#EF4444',
                    border: `1px solid ${item.success ? '#10B98140' : '#EF444440'}`
                  }}
                >
                  {item.success ? 'Thành công' : 'Thất bại'}
                </span>
                
                {item.failureReason && (
                  <span className="text-[10px] md:text-xs max-w-[120px] md:max-w-xs truncate" style={{ color: '#EF4444' }}>
                    {item.failureReason}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
