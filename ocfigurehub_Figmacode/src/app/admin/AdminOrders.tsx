import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { adminApi, type AdminOrder } from '../../api/admin';
import { toast } from 'react-hot-toast';

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  Paid: { bg: 'rgba(16,185,129,0.15)', text: '#10B981', icon: CheckCircle2 },
  Pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', icon: Clock },
  Failed: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', icon: XCircle },
  Cancelled: { bg: 'rgba(100,100,100,0.15)', text: '#999', icon: XCircle },
  Expired: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', icon: XCircle },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getOrders(page, 20);
        setOrders(data.items);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      } catch {
        toast.error('Không tải được danh sách orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  const filtered = orders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={36} style={{ color: '#8B5CF6' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Order Management</h2>
          <p style={{ color: '#666', fontSize: 13 }}>{totalItems} orders total</p>
        </div>
      </div>

      {/* Stat Chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', count: orders.length, color: '#8B5CF6' },
          { label: 'Paid', count: orders.filter(o => o.status === 'Paid').length, color: '#10B981' },
          { label: 'Pending', count: orders.filter(o => o.status === 'Pending').length, color: '#F59E0B' },
          { label: 'Failed', count: orders.filter(o => o.status === 'Failed').length, color: '#EF4444' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.label === 'All' ? 'all' : s.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: statusFilter === (s.label === 'All' ? 'all' : s.label) ? `${s.color}20` : '#111111',
              border: `1px solid ${statusFilter === (s.label === 'All' ? 'all' : s.label) ? s.color : '#262626'}`,
            }}
          >
            <span style={{ color: s.color, fontSize: 14, fontWeight: 700 }}>{s.count}</span>
            <span style={{ color: '#888', fontSize: 12 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #262626' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              {['Product', 'User', 'Amount', 'Plan', 'Status', 'Created', 'Paid At'].map(col => (
                <th key={col} className="text-left px-4 py-3" style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Pending;
              const StatusIcon = sc.icon;
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                  <td className="px-4 py-3">
                    <span style={{ color: '#8B5CF6', fontSize: 13, fontWeight: 600 }} className="line-clamp-1 max-w-[150px]" title={o.productName || o.planName || o.id}>
                      {o.productName || o.planName || o.id.substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p style={{ color: '#fff', fontSize: 13 }}>{o.userName || 'N/A'}</p>
                      <p style={{ color: '#666', fontSize: 11 }}>{o.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#10B981', fontSize: 13, fontWeight: 600 }}>
                    {formatPrice(o.totalAmount)}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#888', fontSize: 12 }}>
                    {o.planName || `${o.itemCount} items`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs"
                      style={{ background: sc.bg, color: sc.text }}>
                      <StatusIcon size={11} />
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#666', fontSize: 12 }}>
                    {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#666', fontSize: 12 }}>
                    {o.paidAt ? new Date(o.paidAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: '#666' }}>No orders found</div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.map((o) => {
          const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Pending;
          const StatusIcon = sc.icon;
          return (
            <div key={o.id} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{o.userName || 'N/A'}</p>
                  <p style={{ color: '#666', fontSize: 11 }}>{o.userEmail}</p>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: sc.bg, color: sc.text }}>
                  <StatusIcon size={10} />
                  {o.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#10B981', fontSize: 14, fontWeight: 700 }}>{formatPrice(o.totalAmount)}</span>
                <span style={{ color: '#666', fontSize: 11 }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className="w-8 h-8 rounded-lg text-xs font-semibold"
              style={{
                background: page === i + 1 ? '#8B5CF6' : '#1A1A1A',
                color: page === i + 1 ? '#fff' : '#888',
                border: '1px solid #262626',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
