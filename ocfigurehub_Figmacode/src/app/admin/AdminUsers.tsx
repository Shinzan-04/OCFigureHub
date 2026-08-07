import { useState, useEffect } from 'react';
import { Search, Shield, User, Star, Ban, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { adminApi, type AdminUser } from '../../api/admin';
import { toast } from 'react-hot-toast';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Admin: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  Creator: { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
  Customer: { bg: 'rgba(100,100,100,0.15)', text: '#999' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Active: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  Locked: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  Pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  Admin: Shield,
  Creator: Star,
  Customer: User,
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(page, 20, debouncedSearch || undefined);
      setUsers(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch {
      toast.error('Không tải được danh sách users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  const toggleBan = async (u: AdminUser) => {
    const newStatus = u.status === 'Locked' ? 'Active' : 'Locked';
    try {
      await adminApi.updateUserStatus(u.id, newStatus);
      toast.success(`User ${u.displayName} → ${newStatus}`);
      fetchUsers();
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchRole && matchStatus;
  });


  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>User Management</h2>
          <p style={{ color: '#666', fontSize: 13 }}>{totalItems} users total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#666' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 rounded-lg outline-none"
            style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg outline-none"
          style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#ccc', fontSize: 13 }}
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Creator">Creator</option>
          <option value="Customer">Customer</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg outline-none"
          style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#ccc', fontSize: 13 }}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Locked">Locked</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #262626' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(col => (
                <th key={col} className="text-left px-4 py-3" style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <Loader2 className="animate-spin mx-auto" size={24} style={{ color: '#8B5CF6' }} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center" style={{ color: '#666', fontSize: 13 }}>
                  Không tìm thấy user nào
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const RoleIcon = ROLE_ICONS[u.role] || User;
                const roleColor = ROLE_COLORS[u.role] || ROLE_COLORS.Customer;
                const statusColor = STATUS_COLORS[u.status] || STATUS_COLORS.Active;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                          style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700 }}
                        >
                          {u.displayName.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{u.displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#888', fontSize: 13 }}>{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs"
                        style={{ background: roleColor.bg, color: roleColor.text }}>
                        <RoleIcon size={11} />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: statusColor.bg, color: statusColor.text }}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#666', fontSize: 12 }}>
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleBan(u)}
                        className="p-1.5 rounded-lg text-xs transition-all"
                        style={{
                          background: u.status === 'Locked' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: u.status === 'Locked' ? '#10B981' : '#EF4444',
                        }}
                        title={u.status === 'Locked' ? 'Activate' : 'Lock'}
                      >
                        {u.status === 'Locked' ? <CheckCircle size={14} /> : <Ban size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="animate-spin mx-auto" size={24} style={{ color: '#8B5CF6' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center" style={{ color: '#666', fontSize: 13 }}>
            Không tìm thấy user nào
          </div>
        ) : (
          filtered.map((u) => {
            const RoleIcon = ROLE_ICONS[u.role] || User;
            const roleColor = ROLE_COLORS[u.role] || ROLE_COLORS.Customer;
            const statusColor = STATUS_COLORS[u.status] || STATUS_COLORS.Active;
            return (
              <div key={u.id} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700 }}
                  >
                    {u.displayName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{u.displayName}</p>
                    <p style={{ color: '#666', fontSize: 12 }}>{u.email}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: roleColor.bg, color: roleColor.text }}>
                      <RoleIcon size={10} />
                      {u.role}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: statusColor.bg, color: statusColor.text }}>
                      {u.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleBan(u)}
                  className="w-full py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs"
                  style={{
                    background: u.status === 'Locked' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: u.status === 'Locked' ? '#10B981' : '#EF4444',
                  }}
                >
                  {u.status === 'Locked' ? <CheckCircle size={13} /> : <Ban size={13} />}
                  {u.status === 'Locked' ? 'Activate' : 'Lock'}
                </button>
              </div>
            );
          })
        )}
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
