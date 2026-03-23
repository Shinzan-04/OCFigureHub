import { Search } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  message = 'Không tìm thấy kết quả',
  description = 'Thử lại sau hoặc thay đổi bộ lọc',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#111111' }}
      >
        {icon || <Search size={24} style={{ color: '#A1A1A1' }} />}
      </div>
      <p className="text-base font-medium text-white">{message}</p>
      <p className="text-sm" style={{ color: '#A1A1A1' }}>
        {description}
      </p>
    </div>
  );
}
