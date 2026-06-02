import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Download, Eye, Globe, Loader2 } from 'lucide-react';
import { productsApi } from '../../api/products';
import { adminApi } from '../../api/admin';
import { analyticsApi } from '../../api/analytics';
import type { Product } from '../../types/product';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg p-3" style={{ background: '#1A1A1A', border: '1px solid #262626', fontSize: 12 }}>
        <p style={{ color: '#999', marginBottom: 4 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value?.toLocaleString()}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function AdminAnalytics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalDownloads: 0, totalRevenue: 0 });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [trafficSources, setTrafficSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, dashData, weekData, catDist] = await Promise.all([
          productsApi.getAll({ pageSize: 50 }),
          adminApi.getDashboard(),
          analyticsApi.weeklyActivity().catch(() => []),
          analyticsApi.categoryDistribution().catch(() => []),
        ]);
        setProducts(prodData.items || []);
        setStats(dashData);
        setWeeklyData(weekData);
        setTrafficSources(catDist);
      } catch (err) {
        console.error('Analytics load failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={36} style={{ color: '#8B5CF6' }} />
      </div>
    );
  }

  // Derive category breakdown from real products
  const categoryMap = new Map<string, { resources: number }>();
  products.forEach(p => {
    const cat = p.category || 'Other';
    const existing = categoryMap.get(cat) || { resources: 0 };
    existing.resources++;
    categoryMap.set(cat, existing);
  });
  const categoryData = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    resources: data.resources,
  }));

  // Top products by name (no downloads/likes field on API)
  const topProducts = products.slice(0, 8).map(p => ({ name: p.name, category: p.category }));

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Analytics</h2>
          <p style={{ color: '#666', fontSize: 13 }}>Platform performance insights</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#1A1A1A', border: '1px solid #262626' }}>
          {(['week', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded capitalize text-xs transition-all"
              style={{
                background: period === p ? '#8B5CF6' : 'transparent',
                color: period === p ? '#fff' : '#888',
                fontWeight: period === p ? 600 : 400,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats from API */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: stats.totalProducts.toLocaleString(), change: '', color: '#8B5CF6', icon: Eye },
          { label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), change: '', color: '#10B981', icon: Download },
          { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: '', color: '#06B6D4', icon: Globe },
          { label: 'Revenue', value: `₫${(stats.totalRevenue / 1_000_000).toFixed(1)}M`, change: '', color: '#F59E0B', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}1A` }}>
                <s.icon size={16} color={s.color} />
              </div>
            </div>
            <p style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>{s.value}</p>
            <p style={{ color: '#888', fontSize: 12 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Views + Downloads weekly */}
      <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Views & Downloads (This Week)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(v) => <span style={{ color: '#999', fontSize: 11 }}>{v}</span>} />
            <Line type="monotone" dataKey="views" name="Weekly Views" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="downloads" name="Weekly Downloads" stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row: Category Performance + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown from API */}
        <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="name" tick={{ fill: '#ccc', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="resources" name="Products" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Traffic Sources</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                >
                  {trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}%`, '']}
                  contentStyle={{ background: '#1A1A1A', border: '1px solid #262626', fontSize: 12 }}
                  labelStyle={{ color: '#999' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {trafficSources.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span style={{ color: '#ccc', fontSize: 12 }}>{s.name}</span>
                  </div>
                  <span style={{ color: s.color, fontSize: 12, fontWeight: 600 }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products from API */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Products</h3>
        </div>
        <div className="divide-y" style={{ borderColor: '#1A1A1A' }}>
          {products.slice(0, 8).map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-3">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{
                  background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#1A1A1A',
                  color: i < 3 ? '#000' : '#666',
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              {p.thumbnailUrl ? (
                <img src={p.thumbnailUrl} alt={p.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: '#1a1a2e', color: '#8B5CF640' }}>{p.name.charAt(0)}</div>
              )}
              <div className="flex-1 min-w-0">
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }} className="truncate">{p.name}</p>
                <p style={{ color: '#888', fontSize: 11 }}>{p.creator} · {p.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p style={{ color: '#8B5CF6', fontSize: 12, fontWeight: 600 }}>
                  {p.price === 0 ? 'Free' : `₫${(p.price / 1000).toFixed(0)}k`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}