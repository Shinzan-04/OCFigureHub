import React, { useState } from 'react';
import { Search, Download, Eye, TrendingUp } from 'lucide-react';
import { PRODUCTS } from '../data/products';

type OrderStatus = 'Completed' | 'Pending' | 'Refunded' | 'Failed';

interface Order {
  id: string;
  user: string;
  userEmail: string;
  product: string;
  productImage: string;
  price: number;
  date: string;
  status: OrderStatus;
  paymentMethod: string;
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  Completed: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  Pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  Refunded: { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
  Failed: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
};

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', user: 'anime_lover_vn', userEmail: 'animelover@gmail.com', product: 'Jujutsu Kaisen - Sukuna', productImage: PRODUCTS[7].image, price: 95000, date: '2025-03-10', status: 'Completed', paymentMethod: 'MoMo' },
  { id: 'ORD-002', user: 'fig_collector', userEmail: 'figcollector@gmail.com', product: 'Frieren - Frieren', productImage: PRODUCTS[6].image, price: 85000, date: '2025-03-09', status: 'Completed', paymentMethod: 'VNPay' },
  { id: 'ORD-003', user: 'tanaka_kun', userEmail: 'tanaka@gmail.com', product: 'Chainsaw Man - Makima', productImage: PRODUCTS[3].image, price: 75000, date: '2025-03-09', status: 'Completed', paymentMethod: 'Bank' },
  { id: 'ORD-004', user: 'new_user_vn', userEmail: 'newuser2@gmail.com', product: 'Toji Fushiguro', productImage: PRODUCTS[11].image, price: 80000, date: '2025-03-08', status: 'Pending', paymentMethod: 'MoMo' },
  { id: 'ORD-005', user: 'otaku_dan', userEmail: 'otaku@gmail.com', product: 'My Hero Academia - Bakugo', productImage: PRODUCTS[1].image, price: 65000, date: '2025-03-07', status: 'Completed', paymentMethod: 'ZaloPay' },
  { id: 'ORD-006', user: 'figure_fan', userEmail: 'figurefan@gmail.com', product: 'Ai Hoshino - Oshi no Ko', productImage: PRODUCTS[8].image, price: 70000, date: '2025-03-06', status: 'Refunded', paymentMethod: 'VNPay' },
  { id: 'ORD-007', user: 'collector_pro', userEmail: 'collector@gmail.com', product: 'Chainsaw Man - Denji', productImage: PRODUCTS[10].image, price: 60000, date: '2025-03-05', status: 'Completed', paymentMethod: 'MoMo' },
  { id: 'ORD-008', user: 'anime_fan_01', userEmail: 'animefan@gmail.com', product: 'Shoto Todoroki', productImage: PRODUCTS[12].image, price: 65000, date: '2025-03-04', status: 'Failed', paymentMethod: 'Bank' },
  { id: 'ORD-009', user: 'fig_collector', userEmail: 'figcollector@gmail.com', product: 'Chainsaw Man - Reze', productImage: PRODUCTS[9].image, price: 75000, date: '2025-03-03', status: 'Completed', paymentMethod: 'ZaloPay' },
  { id: 'ORD-010', user: 'tanaka_kun', userEmail: 'tanaka@gmail.com', product: 'BEASTARS - Louis', productImage: PRODUCTS[13].image, price: 50000, date: '2025-03-02', status: 'Completed', paymentMethod: 'MoMo' },
  { id: 'ORD-011', user: 'anime_lover_vn', userEmail: 'animelover@gmail.com', product: 'Digimon - Agumon', productImage: PRODUCTS[5].image, price: 45000, date: '2025-03-01', status: 'Completed', paymentMethod: 'VNPay' },
  { id: 'ORD-012', user: 'new_collector', userEmail: 'newcollector@gmail.com', product: 'BEASTARS - Legoshi', productImage: PRODUCTS[2].image, price: 55000, date: '2025-02-28', status: 'Pending', paymentMethod: 'Bank' },
];

const totalRevenue = MOCK_ORDERS.filter(o => o.status === 'Completed').reduce((s, o) => s + o.price, 0);
const totalOrders = MOCK_ORDERS.length;
const completedOrders = MOCK_ORDERS.filter(o => o.status === 'Completed').length;

export function AdminOrders() {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = orders.filter(o => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Orders</h2>
        <p style={{ color: '#666', fontSize: 13 }}>Purchase history & transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: totalOrders, color: '#8B5CF6' },
          { label: 'Completed', value: completedOrders, color: '#10B981' },
          { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: '#F59E0B' },
          { label: 'Total Revenue', value: `₫${(totalRevenue / 1000).toFixed(0)}k`, color: '#06B6D4' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
            <p style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</p>
            <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#666' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders, users, products..."
            className="w-full pl-9 pr-4 py-2 rounded-lg outline-none"
            style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'Completed', 'Pending', 'Refunded', 'Failed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-lg text-xs transition-all"
              style={{
                background: statusFilter === s ? '#8B5CF6' : '#1A1A1A',
                color: statusFilter === s ? '#fff' : '#999',
                border: '1px solid #262626',
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #262626' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              {['Order ID', 'User', 'Product', 'Price', 'Method', 'Date', 'Status'].map(col => (
                <th key={col} className="text-left px-4 py-3" style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                <td className="px-4 py-3">
                  <span style={{ color: '#8B5CF6', fontSize: 12, fontFamily: 'monospace' }}>{o.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{o.user}</p>
                    <p style={{ color: '#666', fontSize: 11 }}>{o.userEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={o.productImage} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    <span style={{ color: '#ccc', fontSize: 13 }} className="max-w-xs truncate">{o.product}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#10B981', fontSize: 13, fontWeight: 600 }}>
                    ₫{o.price.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#1A1A1A', color: '#888' }}>
                    {o.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: '#888', fontSize: 12 }}>
                  {new Date(o.date).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: STATUS_COLORS[o.status].bg, color: STATUS_COLORS[o.status].text }}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: '#666' }}>No orders found</div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span style={{ color: '#8B5CF6', fontSize: 11, fontFamily: 'monospace' }}>{o.id}</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{o.user}</p>
                <p style={{ color: '#888', fontSize: 11 }}>{o.userEmail}</p>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: STATUS_COLORS[o.status].bg, color: STATUS_COLORS[o.status].text }}
              >
                {o.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <img src={o.productImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p style={{ color: '#ccc', fontSize: 13 }}>{o.product}</p>
                <div className="flex gap-3">
                  <span style={{ color: '#10B981', fontSize: 12, fontWeight: 600 }}>₫{o.price.toLocaleString()}</span>
                  <span style={{ color: '#888', fontSize: 11 }}>{o.paymentMethod}</span>
                  <span style={{ color: '#888', fontSize: 11 }}>{new Date(o.date).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
