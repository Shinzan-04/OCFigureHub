import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Download, Eye, Globe } from 'lucide-react';
import { PRODUCTS } from '../data/products';

const topDownloads = [...PRODUCTS]
  .sort((a, b) => b.downloads - a.downloads)
  .slice(0, 8)
  .map(p => ({ name: p.title.split(' - ').pop() || p.title, downloads: p.downloads, category: p.category }));

const trafficSources = [
  { name: 'Direct', value: 38, color: '#8B5CF6' },
  { name: 'Social', value: 27, color: '#06B6D4' },
  { name: 'Google', value: 22, color: '#10B981' },
  { name: 'Referral', value: 10, color: '#F59E0B' },
  { name: 'Other', value: 3, color: '#EF4444' },
];

const weeklyData = [
  { day: 'Mon', views: 4200, downloads: 890 },
  { day: 'Tue', views: 5100, downloads: 1100 },
  { day: 'Wed', views: 4800, downloads: 980 },
  { day: 'Thu', views: 6200, downloads: 1340 },
  { day: 'Fri', views: 7100, downloads: 1560 },
  { day: 'Sat', views: 8900, downloads: 2100 },
  { day: 'Sun', views: 7600, downloads: 1800 },
];

const categoryData = [
  { name: 'Anime', resources: 14, downloads: 39110, revenue: 7250000 },
  { name: 'Monsters', resources: 4, downloads: 4470, revenue: 1400000 },
  { name: 'Free', resources: 5, downloads: 32110, revenue: 0 },
];

const popularModels = [...PRODUCTS]
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 5);

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
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
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

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Page Views', value: '44,800', change: '+18%', color: '#8B5CF6', icon: Eye },
          { label: 'Total Downloads', value: '9,770', change: '+23%', color: '#10B981', icon: Download },
          { label: 'Avg Session', value: '4m 32s', change: '+8%', color: '#06B6D4', icon: Globe },
          { label: 'Conversion', value: '3.2%', change: '+0.4%', color: '#F59E0B', icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}1A` }}>
                <s.icon size={16} color={s.color} />
              </div>
              <span style={{ color: '#10B981', fontSize: 11 }}>{s.change}</span>
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

      {/* Row: Downloads per resource + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Downloads per resource */}
        <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Downloads per Resource</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topDownloads} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#ccc', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="downloads" name="Resource Downloads" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
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

      {/* Category breakdown */}
      <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Category Performance</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="name" tick={{ fill: '#ccc', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(v) => <span style={{ color: '#999', fontSize: 11 }}>{v}</span>} />
            <Bar dataKey="downloads" name="Category Downloads" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="resources" name="Category Resources" fill="#06B6D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Most Popular Models */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Most Popular Models (by Likes)</h3>
        </div>
        <div className="divide-y" style={{ borderColor: '#1A1A1A' }}>
          {popularModels.map((p, i) => (
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
              <img src={p.image} alt={p.title} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }} className="truncate">{p.title}</p>
                <p style={{ color: '#888', fontSize: 11 }}>{p.creator} · {p.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p style={{ color: '#EC4899', fontSize: 13, fontWeight: 600 }}>♥ {p.likes.toLocaleString()}</p>
                <p style={{ color: '#06B6D4', fontSize: 11 }}>{p.downloads.toLocaleString()} dl</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}