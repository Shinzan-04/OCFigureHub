import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Package, Users, Download, DollarSign, TrendingUp, Clock, ArrowUpRight, Star } from 'lucide-react';
import { PRODUCTS } from '../data/products';

const monthlyData = [
  { month: 'Aug', downloads: 3200, revenue: 4800000, users: 89 },
  { month: 'Sep', downloads: 4100, revenue: 6200000, users: 115 },
  { month: 'Oct', downloads: 3800, revenue: 5700000, users: 98 },
  { month: 'Nov', downloads: 5200, revenue: 7800000, users: 134 },
  { month: 'Dec', downloads: 4600, revenue: 6900000, users: 120 },
  { month: 'Jan', downloads: 6800, revenue: 10200000, users: 178 },
  { month: 'Feb', downloads: 7200, revenue: 10800000, users: 195 },
  { month: 'Mar', downloads: 8900, revenue: 13350000, users: 240 },
];

const stats = [
  { label: 'Total Resources', value: '18', icon: Package, change: '+3 this month', color: '#8B5CF6' },
  { label: 'Total Users', value: '1,247', icon: Users, change: '+240 this month', color: '#06B6D4' },
  { label: 'Total Downloads', value: '52,690', icon: Download, change: '+8,900 this month', color: '#10B981' },
  { label: 'Total Revenue', value: '₫12.4M', icon: DollarSign, change: '+₫2.1M this month', color: '#F59E0B' },
];

const recentUploads = PRODUCTS.slice(0, 6);

const topProducts = [...PRODUCTS]
  .sort((a, b) => b.downloads - a.downloads)
  .slice(0, 5);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg p-3" style={{ background: '#1A1A1A', border: '1px solid #262626', fontSize: 12 }}>
        <p style={{ color: '#999', marginBottom: 4 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value.toLocaleString()}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminDashboard() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{ background: '#111111', border: '1px solid #262626' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}1A` }}
              >
                <stat.icon size={20} color={stat.color} />
              </div>
              <ArrowUpRight size={16} color="#10B981" />
            </div>
            <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{stat.value}</p>
            <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{stat.label}</p>
            <p style={{ color: '#10B981', fontSize: 11, marginTop: 6 }}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Downloads */}
        <div className="rounded-xl p-4 lg:p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Monthly Downloads</h3>
              <p style={{ color: '#666', fontSize: 12 }}>Last 8 months</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <TrendingUp size={12} color="#10B981" />
              <span style={{ color: '#10B981', fontSize: 11, fontWeight: 600 }}>+23%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dashDownloadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="downloads"
                name="Monthly Downloads"
                stroke="#8B5CF6"
                fill="url(#dashDownloadsGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Growth */}
        <div className="rounded-xl p-4 lg:p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Revenue Growth</h3>
              <p style={{ color: '#666', fontSize: 12 }}>VND (millions)</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <TrendingUp size={12} color="#F59E0B" />
              <span style={{ color: '#F59E0B', fontSize: 11, fontWeight: 600 }}>+178%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#666', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Monthly Revenue (₫)"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: '#F59E0B', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Registrations Chart */}
      <div className="rounded-xl p-4 lg:p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>User Registrations</h3>
            <p style={{ color: '#666', fontSize: 12 }}>New users per month</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(6,182,212,0.1)' }}>
            <TrendingUp size={12} color="#06B6D4" />
            <span style={{ color: '#06B6D4', fontSize: 11, fontWeight: 600 }}>+35%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="users" name="Monthly New Users" fill="#06B6D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Uploads */}
        <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
            <div className="flex items-center gap-2">
              <Clock size={16} color="#8B5CF6" />
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Recent Uploads</h3>
            </div>
            <span style={{ color: '#8B5CF6', fontSize: 12, cursor: 'pointer' }}>View all →</span>
          </div>
          <div className="divide-y" style={{ borderColor: '#1A1A1A' }}>
            {recentUploads.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }} className="truncate">{p.title}</p>
                  <p style={{ color: '#666', fontSize: 11 }}>{p.creator}</p>
                </div>
                <div className="text-right">
                  <p style={{ color: '#8B5CF6', fontSize: 12, fontWeight: 600 }}>
                    {p.isFree ? 'Free' : `₫${(p.price / 1000).toFixed(0)}k`}
                  </p>
                  <p style={{ color: '#666', fontSize: 11 }}>{p.downloads} dl</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
            <div className="flex items-center gap-2">
              <Star size={16} color="#F59E0B" />
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Top Downloads</h3>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                  style={{
                    background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : '#262626',
                    color: i < 3 ? '#000' : '#666',
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <img src={p.image} alt={p.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p style={{ color: '#fff', fontSize: 13 }} className="truncate">{p.title}</p>
                  <p style={{ color: '#666', fontSize: 11 }}>{p.category}</p>
                </div>
                <div className="flex items-center gap-1" style={{ color: '#06B6D4', fontSize: 12, fontWeight: 600 }}>
                  <Download size={12} />
                  {p.downloads.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}