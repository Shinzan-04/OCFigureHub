import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ShoppingBag, ChevronLeft, ChevronRight, Package, Loader2, Calendar, CreditCard } from 'lucide-react';
import { ordersApi } from '../../api/orders';

interface OrderItem {
  productId: string;
  productName: string;
  productThumbnail?: string;
  unitPrice: number;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paidAt?: string;
  planName?: string;
  items: OrderItem[];
}

function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  Pending: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B', label: 'Pending' },
  Paid: { bg: 'rgba(16,185,129,0.1)', text: '#10B981', label: 'Paid' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', label: 'Cancelled' },
  Failed: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', label: 'Failed' },
  Expired: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', label: 'Expired' },
};

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await ordersApi.getMyOrders(page, 10);
        setOrders(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ backgroundColor: '#0B0B0B' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(139, 92, 246, 0.1)' }}
          >
            <ShoppingBag size={20} style={{ color: '#8B5CF6' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Order History</h1>
            <p className="text-xs" style={{ color: '#666' }}>Track all your orders</p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="animate-spin" size={32} style={{ color: '#8B5CF6' }} />
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: '#333' }} />
            <p className="text-sm font-medium text-white mb-1">No orders yet</p>
            <p className="text-xs mb-6" style={{ color: '#666' }}>Start exploring and get your first product!</p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
            >
              Explore Now
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => {
              const st = statusColors[order.status] || statusColors.Pending;
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border p-5 transition-colors hover:border-[#333]"
                  style={{ borderColor: '#1A1A1A', backgroundColor: '#111111' }}
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: st.bg, color: st.text }}
                      >
                        {st.label}
                      </span>
                      {order.planName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}>
                          {order.planName}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#8B5CF6' }}>
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 rounded-xl"
                          style={{ backgroundColor: '#0B0B0B' }}
                        >
                          {item.productThumbnail ? (
                            <img
                              src={item.productThumbnail}
                              alt={item.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1A1A1A' }}>
                              <Package size={16} style={{ color: '#666' }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/product/${item.productId}`}
                              className="text-xs font-medium text-white hover:text-[#8B5CF6] transition-colors truncate block"
                            >
                              {item.productName}
                            </Link>
                          </div>
                          <span className="text-xs font-medium" style={{ color: '#A1A1A1' }}>
                            {formatPrice(item.unitPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order Footer */}
                  <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid #1A1A1A' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} style={{ color: '#555' }} />
                      <span className="text-[11px]" style={{ color: '#555' }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    {order.paidAt && (
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={12} style={{ color: '#10B981' }} />
                        <span className="text-[11px]" style={{ color: '#10B981' }}>
                          Paid on: {formatDate(order.paidAt)}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] ml-auto" style={{ color: '#333' }}>
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border transition-colors hover:border-[#8B5CF6] disabled:opacity-30"
                  style={{ borderColor: '#262626', color: '#A1A1A1' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs" style={{ color: '#666' }}>
                  Page {page}/{totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border transition-colors hover:border-[#8B5CF6] disabled:opacity-30"
                  style={{ borderColor: '#262626', color: '#A1A1A1' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
