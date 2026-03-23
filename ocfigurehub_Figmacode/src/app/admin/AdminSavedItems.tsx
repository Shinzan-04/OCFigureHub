import React, { useState } from 'react';
import { Bookmark, Search, Download, Heart, Trash2, User } from 'lucide-react';
import { PRODUCTS } from '../data/products';

interface SavedEntry {
  userId: string;
  username: string;
  avatar: string;
  savedProducts: string[];
  totalSaved: number;
  lastActive: string;
}

const SAVED_ENTRIES: SavedEntry[] = [
  { userId: '1', username: 'fig_collector', avatar: 'FC', savedProducts: ['1','2','3','4','7','8'], totalSaved: 6, lastActive: '2025-03-10' },
  { userId: '2', username: 'anime_lover_vn', avatar: 'AL', savedProducts: ['4','7','8','9'], totalSaved: 4, lastActive: '2025-03-09' },
  { userId: '3', username: 'tanaka_kun', avatar: 'TK', savedProducts: ['2','3','5'], totalSaved: 3, lastActive: '2025-03-08' },
  { userId: '4', username: 'otaku_dan', avatar: 'OD', savedProducts: ['8','11','12'], totalSaved: 3, lastActive: '2025-03-07' },
  { userId: '5', username: 'collector_pro', avatar: 'CP', savedProducts: ['1','4','6','7','8','9','10','11'], totalSaved: 8, lastActive: '2025-03-06' },
  { userId: '6', username: 'digimon_fan', avatar: 'DF', savedProducts: ['1','6','15','16','17'], totalSaved: 5, lastActive: '2025-03-05' },
];

// Most saved products
const savedCounts: Record<string, number> = {};
SAVED_ENTRIES.forEach(entry => {
  entry.savedProducts.forEach(id => {
    savedCounts[id] = (savedCounts[id] || 0) + 1;
  });
});

const mostSaved = Object.entries(savedCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([id, count]) => ({ product: PRODUCTS.find(p => p.id === id)!, count }))
  .filter(x => x.product);

const totalSavedActions = Object.values(savedCounts).reduce((s, v) => s + v, 0);

export function AdminSavedItems() {
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = SAVED_ENTRIES.filter(e =>
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Saved Items</h2>
        <p style={{ color: '#666', fontSize: 13 }}>User wishlist & saved resource activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users Saving', value: SAVED_ENTRIES.length, color: '#8B5CF6' },
          { label: 'Total Saves', value: totalSavedActions, color: '#EC4899' },
          { label: 'Avg per User', value: (totalSavedActions / SAVED_ENTRIES.length).toFixed(1), color: '#06B6D4' },
          { label: 'Most Saved', value: mostSaved[0]?.count || 0, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
            <p style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</p>
            <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Most Saved Products */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <Bookmark size={16} color="#EC4899" />
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Most Saved Resources</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mostSaved.map(({ product: p, count }, i) => (
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
              <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p style={{ color: '#fff', fontSize: 12, fontWeight: 500 }} className="truncate">{p.title}</p>
                <p style={{ color: '#888', fontSize: 11 }}>{p.creator}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Bookmark size={11} color="#EC4899" />
                  <span style={{ color: '#EC4899', fontSize: 11, fontWeight: 600 }}>{count} saves</span>
                </div>
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
            <div key={entry.userId}>
              <div
                className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-white/2 transition-all"
                onClick={() => setExpandedUser(expandedUser === entry.userId ? null : entry.userId)}
              >
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
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(236,72,153,0.15)', color: '#EC4899' }}>
                    <Bookmark size={10} />
                    {entry.totalSaved} saved
                  </span>
                  <span style={{ color: '#666', fontSize: 14 }}>{expandedUser === entry.userId ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded: show saved products */}
              {expandedUser === entry.userId && (
                <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {entry.savedProducts.map(id => {
                    const p = PRODUCTS.find(pr => pr.id === id);
                    if (!p) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #262626' }}>
                        <img src={p.image} alt={p.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p style={{ color: '#ccc', fontSize: 11 }} className="truncate">{p.title}</p>
                          <p style={{ color: p.isFree ? '#10B981' : '#F59E0B', fontSize: 10, fontWeight: 600 }}>
                            {p.isFree ? 'Free' : `₫${(p.price / 1000).toFixed(0)}k`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
