import React, { useState, useEffect } from 'react';
import { Crown, Users, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Search, Loader2, Save, Edit3, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import API from '../../api/client';
import { adminApi } from '../../api/admin';
type SubStatus = 'Active' | 'Expired' | 'Cancelled' | 'Trial' | string;

export interface Member {
  id: string;
  username: string;
  email: string;
  plan: string;
  status: SubStatus;
  startDate: string;
  endDate: string;
  amount: number;
  avatar: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  Active: { bg: 'rgba(16,185,129,0.15)', text: '#10B981', icon: CheckCircle },
  Expired: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', icon: XCircle },
  Cancelled: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', icon: XCircle },
  Pending: { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6', icon: Clock },
};

function formatPrice(price: number): string {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

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
  const [members, setMembers] = useState<Member[]>([]);
  const [monthlyRevData, setMonthlyRevData] = useState<{ month: string; revenue: number }[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const [data, plansRes] = await Promise.all([
          adminApi.getMembershipData(),
          API.get('/subscriptions/plans').catch(() => ({ data: [] }))
        ]);
        setMembers(data.members || []);
        setMonthlyRevData(data.monthlyRevenue || []);
        
        // Filter out FREE plan if we only want to manage PRO/ULTIMATE
        const activePlans = (plansRes.data || []).filter((p: any) => p.monthlyPrice > 0);
        setPlans(activePlans);
      } catch (err) {
        console.error('Failed to fetch membership data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembership();
  }, []);

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;
    setSavingPlanId(editingPlan.id);
    try {
      await adminApi.updateSubscriptionPlan(editingPlan.id, {
        monthlyPrice: Number(editingPlan.monthlyPrice),
        monthlyQuotaDownloads: Number(editingPlan.monthlyQuotaDownloads)
      });
      // Update local plans state
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));
      setEditingPlan(null);
      toast.success('Lưu thành công!');
    } catch (err: any) {
      console.error('Failed to update plan', err);
      toast.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setSavingPlanId(null);
    }
  };

  const activeMembers = members.filter(m => m.status === 'Active');
  const totalRevenue = members.filter(m => m.status === 'Active').reduce((s, m) => s + m.amount, 0);
  const ultimateCount = activeMembers.filter(m => m.plan.toLowerCase().includes('ultimate')).length;
  const proCount = activeMembers.filter(m => m.plan.toLowerCase().includes('pro')).length;

  const filtered = members.filter(m => {
    const matchSearch = m.username?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Membership Management</h2>
        <p style={{ color: '#666', fontSize: 13 }}>Pro subscriptions overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Members', value: activeMembers.length, icon: Crown, color: '#F59E0B' },
          { label: 'Pro Plans', value: proCount, icon: Users, color: '#8B5CF6' },
          { label: 'Ultimate Plans', value: ultimateCount, icon: TrendingUp, color: '#10B981' },
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

      {/* Dynamic Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => {
          const count = activeMembers.filter(m => m.plan.toLowerCase() === p.name.toLowerCase()).length;
          const isPro = p.name.toUpperCase() === 'PRO';
          const color = isPro ? '#8B5CF6' : '#F59E0B';
          return (
            <div key={p.id} className="rounded-xl p-5" style={{ background: '#111111', border: '1px solid #262626' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Gói {p.name}</h3>
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                    Overview & Settings
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: `${color}1A`, color }}>
                  {count}
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: '#888' }}>Price (VND / month)</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{new Intl.NumberFormat('vi-VN').format(p.monthlyPrice)}₫</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: '#888' }}>Monthly Download Quota</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{p.monthlyQuotaDownloads}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingPlan({ ...p })}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: `${color}15`, color }}
              >
                <Edit3 size={15} />
                Edit Plan Settings
              </button>
            </div>
          );
        })}
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
      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Sửa cấu hình Gói {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} className="text-[#666] hover:text-[#fff]">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-[#888] mb-2 block font-medium">Price (VND / month)</label>
                <input
                  type="number"
                  value={editingPlan.monthlyPrice}
                  onChange={(e) => setEditingPlan((prev: any) => ({ ...prev, monthlyPrice: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                  style={{ background: '#1A1A1A', border: '1px solid #333', color: '#fff', fontSize: 14 }}
                  onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
              </div>
              <div>
                <label className="text-sm text-[#888] mb-2 block font-medium">Monthly Download Quota</label>
                <input
                  type="number"
                  value={editingPlan.monthlyQuotaDownloads}
                  onChange={(e) => setEditingPlan((prev: any) => ({ ...prev, monthlyQuotaDownloads: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                  style={{ background: '#1A1A1A', border: '1px solid #333', color: '#fff', fontSize: 14 }}
                  onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: '#262626' }}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdatePlan}
                disabled={savingPlanId === editingPlan.id}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50"
                style={{ background: editingPlan.name.toUpperCase() === 'PRO' ? '#8B5CF6' : '#F59E0B' }}
              >
                {savingPlanId === editingPlan.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}