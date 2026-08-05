import { useState, useEffect } from 'react';
import { Bookmark, Search, Loader2 } from 'lucide-react';
import { productsApi } from '../../api/products';
import type { Product } from '../../types/product';

import { adminApi } from '../../api/admin';

export interface SavedEntry {
  userId: string;
  username: string;
  avatar: string | null;
  totalSaved: number;
  lastActive: string;
}

export function AdminSavedItems() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, savedData] = await Promise.all([
          productsApi.getAll({ pageSize: 10 }),
          adminApi.getSavedItemsData(),
        ]);
        setProducts(prodData.items || []);
        setSavedEntries(savedData.savedEntries || []);
      } catch (err) {
        console.error('Failed to load saved items data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSavedActions = savedEntries.reduce((s, e) => s + e.totalSaved, 0);

  const filtered = savedEntries.filter(e =>
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={36} style={{ color: '#8B5CF6' }} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Saved Items</h2>
        <p style={{ color: '#666', fontSize: 13 }}>User wishlist & saved resource activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users Saving', value: savedEntries.length, color: '#8B5CF6' },
          { label: 'Total Saves', value: totalSavedActions, color: '#EC4899' },
          { label: 'Avg per User', value: savedEntries.length ? (totalSavedActions / savedEntries.length).toFixed(1) : 0, color: '#06B6D4' },
          { label: 'Products Available', value: products.length, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
            <p style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</p>
            <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Most Popular Products (from API) */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <Bookmark size={16} color="#EC4899" />
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Top Products</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.slice(0, 6).map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid #262626' }}>
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{
                  background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#262626',
                  color: i < 3 ? '#000' : '#666',
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              {p.thumbnailUrl ? (
                <img src={p.thumbnailUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: '#1a1a2e', color: '#8B5CF640' }}>{p.name.charAt(0)}</div>
              )}
              <div className="flex-1 min-w-0">
                <p style={{ color: '#fff', fontSize: 12, fontWeight: 500 }} className="truncate">{p.name}</p>
                <p style={{ color: '#888', fontSize: 11 }}>{p.creator}</p>
                <p style={{ color: p.price === 0 ? '#10B981' : '#F59E0B', fontSize: 10, fontWeight: 600 }}>
                  {p.price === 0 ? 'Free' : `₫${(p.price / 1000).toFixed(0)}k`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Saves Activity */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>User Save Activity</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#666' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-8 pr-3 py-1.5 rounded-lg outline-none"
              style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 12 }}
            />
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: '#1A1A1A' }}>
          {filtered.map((entry) => (
            <div key={entry.userId} className="flex items-center gap-3 px-5 py-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700 }}
              >
                {entry.avatar}
              </div>
              <div className="flex-1">
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{entry.username}</p>
                <p style={{ color: '#666', fontSize: 11 }}>Last active: {new Date(entry.lastActive).toLocaleDateString('vi-VN')}</p>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(236,72,153,0.15)', color: '#EC4899' }}>
                <Bookmark size={10} />
                {entry.totalSaved} saved
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-xl px-5 py-3 text-xs" style={{ background: '#F59E0B10', border: '1px solid #F59E0B30', color: '#F59E0B' }}>
        ⚠️ Saved items are currently stored locally on each user's browser. Backend API for centralized save tracking is planned.
      </div>
    </div>
  );
}
