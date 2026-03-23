import React, { useState } from 'react';
import { Crown, Users, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type SubStatus = 'Active' | 'Expired' | 'Cancelled' | 'Trial';

interface Member {
  id: string;
  username: string;
  email: string;
  plan: 'Monthly' | 'Yearly';
  status: SubStatus;
  startDate: string;
  endDate: string;
  amount: number;
  avatar: string;
}

const STATUS_COLORS: Record<SubStatus, { bg: string; text: string; icon: React.ElementType }> = {
  Active: { bg: 'rgba(16,185,129,0.15)', text: '#10B981', icon: CheckCircle },
  Expired: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', icon: XCircle },
  Cancelled: { bg: 'rgba(100,100,100,0.15)', text: '#888', icon: XCircle },
  Trial: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', icon: Clock },
};

const MEMBERS: Member[] = [
  { id: '1', username: 'fig_collector', email: 'figcollector@gmail.com', plan: 'Yearly', status: 'Active', startDate: '2024-03-01', endDate: '2025-03-01', amount: 990000, avatar: 'FC' },
  { id: '2', username: 'anime_lover_vn', email: 'animelover@gmail.com', plan: 'Monthly', status: 'Active', startDate: '2025-02-10', endDate: '2025-03-10', amount: 99000, avatar: 'AL' },
  { id: '3', username: 'tanaka_kun', email: 'tanaka@gmail.com', plan: 'Monthly', status: 'Active', startDate: '2025-02-15', endDate: '2025-03-15', amount: 99000, avatar: 'TK' },
  { id: '4', username: 'otaku_dan', email: 'otaku@gmail.com', plan: 'Yearly', status: 'Active', startDate: '2024-09-01', endDate: '2025-09-01', amount: 990000, avatar: 'OD' },
  { id: '5', username: 'mage_collector', email: 'mage@gmail.com', plan: 'Monthly', status: 'Trial', startDate: '2025-03-08', endDate: '2025-03-22', amount: 0, avatar: 'MC' },
  { id: '6', username: 'old_member', email: 'oldmember@gmail.com', plan: 'Monthly', status: 'Expired', startDate: '2025-01-01', endDate: '2025-02-01', amount: 99000, avatar: 'OM' },
  { id: '7', username: 'figure_fan', email: 'figurefan@gmail.com', plan: 'Yearly', status: 'Cancelled', startDate: '2024-06-01', endDate: '2025-06-01', amount: 990000, avatar: 'FF' },
  { id: '8', username: 'digimon_fan', email: 'digifan@gmail.com', plan: 'Monthly', status: 'Active', startDate: '2025-03-01', endDate: '2025-04-01', amount: 99000, avatar: 'DF' },
  { id: '9', username: 'jjk_stan', email: 'jjkstan@gmail.com', plan: 'Yearly', status: 'Active', startDate: '2024-12-01', endDate: '2025-12-01', amount: 990000, avatar: 'JS' },
  { id: '10', username: 'collector_pro', email: 'collectorpro@gmail.com', plan: 'Monthly', status: 'Active', startDate: '2025-03-05', endDate: '2025-04-05', amount: 99000, avatar: 'CP' },
];

const monthlyRevData = [
  { month: 'Aug', revenue: 693000 },
  { month: 'Sep', revenue: 891000 },
  { month: 'Oct', revenue: 990000 },
  { month: 'Nov', revenue: 1287000 },
  { month: 'Dec', revenue: 1386000 },
  { month: 'Jan', revenue: 1782000 },
  { month: 'Feb', revenue: 1980000 },
  { month: 'Mar', revenue: 2277000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg p-3" style={{ background: '#1A1A1A', border: '1px solid #262626', fontSize: 12 }}>
        <p style={{ color: '#999' }}>{label}</p>
        <p style={{ color: '#8B5CF6', fontWeight: 600 }}>₫{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function AdminMembership() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const activeMembers = MEMBERS.filter(m => m.status === 'Active');
  const totalRevenue = MEMBERS.filter(m => m.status === 'Active').reduce((s, m) => s + m.amount, 0);
  const yearlyCount = activeMembers.filter(m => m.plan === 'Yearly').length;
  const monthlyCount = activeMembers.filter(m => m.plan === 'Monthly').length;

  const filtered = MEMBERS.filter(m => {
    const matchSearch = m.username.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <div>
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Membership Management</h2>
        <p style={{ color: '#666', fontSize: 13 }}>Pro subscriptions overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Members', value: activeMembers.length, icon: Crown, color: '#F59E0B' },
          { label: 'Monthly Plans', value: monthlyCount, icon: Users, color: '#8B5CF6' },
          { label: 'Yearly Plans', value: yearlyCount, icon: TrendingUp, color: '#10B981' },
          { label: 'Current Revenue', value: `₫${(totalRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: '#06B6D4' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}1A` }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
            <p style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>{s.value}</p>
            <p style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Subscription Revenue</h3>
            <p style={{ color: '#666', fontSize: 12 }}>Monthly membership revenue (₫)</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(139,92,246,0.1)' }}>
            <TrendingUp size={12} color="#8B5CF6" />
            <span style={{ color: '#8B5CF6', fontSize: 11, fontWeight: 600 }}>+228%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthlyRevData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="membershipRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Subscription Revenue" stroke="#8B5CF6" fill="url(#membershipRevGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Plans breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { plan: 'Monthly Plan', price: '₫99,000/tháng', desc: 'Gia hạn hàng tháng', count: monthlyCount, color: '#8B5CF6', perks: ['Tải không giới hạn', 'Truy cập file PRO', 'Ưu tiên hỗ trợ'] },
          { plan: 'Yearly Plan', price: '₫990,000/năm', desc: 'Tiết kiệm 2 tháng', count: yearlyCount, color: '#F59E0B', perks: ['Tất cả Monthly', 'Tiết kiệm 16%', 'Early access models'] },
        ].map(p => (
          <div key={p.plan} className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 style={{ color: '#fff', fontWeight: 600 }}>{p.plan}</h3>
                <p style={{ color: p.color, fontWeight: 700, fontSize: 18 }}>{p.price}</p>
                <p style={{ color: '#888', fontSize: 12 }}>{p.desc}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${p.color}15` }}>
                <span style={{ color: p.color, fontWeight: 800, fontSize: 18 }}>{p.count}</span>
              </div>
            </div>
            <ul className="space-y-1.5 mt-4">
              {p.perks.map(perk => (
                <li key={perk} className="flex items-center gap-2">
                  <CheckCircle size={13} color="#10B981" />
                  <span style={{ color: '#bbb', fontSize: 12 }}>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Members Table */}
      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#666' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-9 pr-4 py-2 rounded-lg outline-none"
              style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg outline-none"
            style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#ccc', fontSize: 13 }}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Trial">Trial</option>
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #262626' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #262626' }}>
                {['Member', 'Plan', 'Start', 'End', 'Amount', 'Status'].map(col => (
                  <th key={col} className="text-left px-4 py-3" style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const StatusIcon = STATUS_COLORS[m.status].icon;
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700 }}>
                          {m.avatar}
                        </div>
                        <div>
                          <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{m.username}</p>
                          <p style={{ color: '#666', fontSize: 11 }}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{
                        background: m.plan === 'Yearly' ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)',
                        color: m.plan === 'Yearly' ? '#F59E0B' : '#8B5CF6',
                      }}>
                        {m.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#888', fontSize: 12 }}>{new Date(m.startDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3" style={{ color: '#888', fontSize: 12 }}>{new Date(m.endDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: '#10B981', fontSize: 13, fontWeight: 600 }}>
                        {m.amount === 0 ? 'Free Trial' : `₫${m.amount.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs"
                        style={{ background: STATUS_COLORS[m.status].bg, color: STATUS_COLORS[m.status].text }}>
                        <StatusIcon size={11} />
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map(m => {
            const StatusIcon = STATUS_COLORS[m.status].icon;
            return (
              <div key={m.id} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700 }}>
                      {m.avatar}
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{m.username}</p>
                      <p style={{ color: '#666', fontSize: 11 }}>{m.email}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                    style={{ background: STATUS_COLORS[m.status].bg, color: STATUS_COLORS[m.status].text }}>
                    <StatusIcon size={10} />
                    {m.status}
                  </span>
                </div>
                <div className="flex gap-3 mt-3 text-xs">
                  <span className="px-2 py-0.5 rounded-full" style={{ background: m.plan === 'Yearly' ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)', color: m.plan === 'Yearly' ? '#F59E0B' : '#8B5CF6' }}>{m.plan}</span>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>{m.amount === 0 ? 'Free Trial' : `₫${m.amount.toLocaleString()}`}</span>
                  <span style={{ color: '#666' }}>→ {new Date(m.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}