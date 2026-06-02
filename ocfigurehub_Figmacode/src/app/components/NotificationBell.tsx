import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { useAuthStore } from '../../store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { isLoggedIn } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch unread count periodically
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchCount = () => {
      notificationsApi.getUnreadCount().then(setUnreadCount).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // 30s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll(1, 10);
      setNotifications(data.items || []);
      setUnreadCount(data.unread || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) fetchNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id: string) => {
    await notificationsApi.delete(id);
    const removed = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
  };

  const typeColors: Record<string, string> = {
    order: '#10B981',
    download: '#06B6D4',
    system: '#F59E0B',
    success: '#10B981',
    warning: '#EF4444',
    info: '#8B5CF6',
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl border transition-colors duration-200 hover:border-[#8B5CF6]"
        style={{ borderColor: '#262626', color: '#A1A1A1' }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: '#EF4444' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 md:w-96 rounded-2xl border shadow-2xl overflow-hidden"
          style={{ backgroundColor: '#111111', borderColor: '#262626', zIndex: 100 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#262626' }}>
            <h3 className="text-sm font-semibold text-white">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] px-2 py-1 rounded-lg transition-colors hover:bg-[#1A1A1A]"
                  style={{ color: '#8B5CF6' }}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-[11px] p-1 rounded-lg transition-colors hover:bg-[#1A1A1A]"
                style={{ color: '#A1A1A1' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="mx-auto mb-2" style={{ color: '#333' }} />
                <p className="text-xs" style={{ color: '#666' }}>Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#1A1A1A] group"
                  style={{
                    borderBottom: '1px solid #1A1A1A',
                    backgroundColor: n.isRead ? 'transparent' : 'rgba(139, 92, 246, 0.04)',
                  }}
                >
                  {/* Dot */}
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: n.isRead ? '#333' : (typeColors[n.type] || '#8B5CF6') }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{n.title}</p>
                    <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: '#A1A1A1' }}>{n.message}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#555' }}>{timeAgo(n.createdAt)}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1 rounded hover:bg-[#262626]"
                        title="Đánh dấu đã đọc"
                      >
                        <Check size={12} style={{ color: '#10B981' }} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1 rounded hover:bg-[#262626]"
                      title="Xoá"
                    >
                      <Trash2 size={12} style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
