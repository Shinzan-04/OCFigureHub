import React, { useState } from 'react';
import { Search, Shield, User, Star, Ban, CheckCircle, Trash2, Filter } from 'lucide-react';

type Role = 'Admin' | 'User' | 'Creator';
type Status = 'Active' | 'Banned' | 'Pending';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  status: Status;
  avatar: string;
  joinDate: string;
  downloads: number;
  purchases: number;
}

const MOCK_USERS: AdminUser[] = [
  { id: '1', username: 'AdminMain', email: 'admin@ocfigurehub.com', role: 'Admin', status: 'Active', avatar: 'AM', joinDate: '2024-01-15', downloads: 0, purchases: 0 },
  { id: '2', username: 'DigiMaster3D', email: 'digimaster@email.com', role: 'Creator', status: 'Active', avatar: 'DM', joinDate: '2024-02-20', downloads: 23, purchases: 8 },
  { id: '3', username: 'HeroSculpts', email: 'herosculpts@email.com', role: 'Creator', status: 'Active', avatar: 'HS', joinDate: '2024-03-01', downloads: 45, purchases: 12 },
  { id: '4', username: 'DarkChainWorks', email: 'darkchain@email.com', role: 'Creator', status: 'Active', avatar: 'DC', joinDate: '2024-01-28', downloads: 67, purchases: 19 },
  { id: '5', username: 'CursedForge', email: 'cursedforge@email.com', role: 'Creator', status: 'Active', avatar: 'CF', joinDate: '2024-04-10', downloads: 89, purchases: 25 },
  { id: '6', username: 'tanaka_kun', email: 'tanaka@gmail.com', role: 'User', status: 'Active', avatar: 'TK', joinDate: '2024-05-12', downloads: 34, purchases: 5 },
  { id: '7', username: 'anime_lover_vn', email: 'animelover@gmail.com', role: 'User', status: 'Active', avatar: 'AL', joinDate: '2024-06-03', downloads: 78, purchases: 9 },
  { id: '8', username: 'spammer123', email: 'spam@fake.com', role: 'User', status: 'Banned', avatar: 'SP', joinDate: '2024-07-14', downloads: 2, purchases: 0 },
  { id: '9', username: 'MahouAtelier', email: 'mahou@email.com', role: 'Creator', status: 'Active', avatar: 'MA', joinDate: '2024-02-14', downloads: 56, purchases: 14 },
  { id: '10', username: 'BeastForge', email: 'beastforge@email.com', role: 'Creator', status: 'Active', avatar: 'BF', joinDate: '2024-03-22', downloads: 34, purchases: 8 },
  { id: '11', username: 'fig_collector', email: 'figcollector@gmail.com', role: 'User', status: 'Active', avatar: 'FC', joinDate: '2024-08-01', downloads: 120, purchases: 18 },
  { id: '12', username: 'new_user_pending', email: 'newuser@gmail.com', role: 'User', status: 'Pending', avatar: 'NU', joinDate: '2025-03-10', downloads: 0, purchases: 0 },
];

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  Admin: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  Creator: { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
  User: { bg: 'rgba(100,100,100,0.15)', text: '#999' },
};

const STATUS_COLORS: Record<Status, { bg: string; text: string }> = {
  Active: { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  Banned: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  Pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
};

const ROLE_ICONS: Record<Role, React.ElementType> = {
  Admin: Shield,
  Creator: Star,
  User: User,
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = users.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleBan = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? {
      ...u,
      status: u.status === 'Banned' ? 'Active' : 'Banned'
    } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const changeRole = (id: string, role: Role) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  const statCounts = {
    all: users.length,
    Active: users.filter(u => u.status === 'Active').length,
    Banned: users.filter(u => u.status === 'Banned').length,
    Admin: users.filter(u => u.role === 'Admin').length,
    Creator: users.filter(u => u.role === 'Creator').length,
  };

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>User Management</h2>
          <p style={{ color: '#666', fontSize: 13 }}>{filtered.length} of {users.length} users</p>
        </div>
      </div>

      {/* Stat Chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All Users', count: statCounts.all, color: '#8B5CF6' },
          { label: 'Active', count: statCounts.Active, color: '#10B981' },
          { label: 'Banned', count: statCounts.Banned, color: '#EF4444' },
          { label: 'Creators', count: statCounts.Creator, color: '#F59E0B' },
          { label: 'Admins', count: statCounts.Admin, color: '#06B6D4' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: '#111111', border: '1px solid #262626' }}>
            <span style={{ color: s.color, fontSize: 14, fontWeight: 700 }}>{s.count}</span>
            <span style={{ color: '#888', fontSize: 12 }}>{s.label}</span>
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
          <option value="User">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg outline-none"
          style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#ccc', fontSize: 13 }}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Banned">Banned</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #262626' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Downloads', 'Actions'].map(col => (
                <th key={col} className="text-left px-4 py-3" style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const RoleIcon = ROLE_ICONS[u.role];
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700 }}
                      >
                        {u.avatar}
                      </div>
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#888', fontSize: 13 }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs"
                      style={{ background: ROLE_COLORS[u.role].bg, color: ROLE_COLORS[u.role].text }}>
                      <RoleIcon size={11} />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: STATUS_COLORS[u.status].bg, color: STATUS_COLORS[u.status].text }}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#666', fontSize: 12 }}>
                    {new Date(u.joinDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#06B6D4', fontSize: 13, fontWeight: 600 }}>
                    {u.downloads}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleBan(u.id)}
                        className="p-1.5 rounded-lg text-xs transition-all"
                        style={{
                          background: u.status === 'Banned' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: u.status === 'Banned' ? '#10B981' : '#EF4444',
                        }}
                        title={u.status === 'Banned' ? 'Activate' : 'Ban'}
                      >
                        {u.status === 'Banned' ? <CheckCircle size={14} /> : <Ban size={14} />}
                      </button>
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value as Role)}
                        className="px-1 py-1 rounded text-xs outline-none"
                        style={{ background: '#1A1A1A', color: '#ccc', border: '1px solid #262626' }}
                      >
                        <option>Admin</option>
                        <option>Creator</option>
                        <option>User</option>
                      </select>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: '#666' }}>No users found</div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.map((u) => {
          const RoleIcon = ROLE_ICONS[u.role];
          return (
            <div key={u.id} className="rounded-xl p-4" style={{ background: '#111111', border: '1px solid #262626' }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700 }}
                >
                  {u.avatar}
                </div>
                <div className="flex-1">
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{u.username}</p>
                  <p style={{ color: '#666', fontSize: 12 }}>{u.email}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                    style={{ background: ROLE_COLORS[u.role].bg, color: ROLE_COLORS[u.role].text }}>
                    <RoleIcon size={10} />
                    {u.role}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: STATUS_COLORS[u.status].bg, color: STATUS_COLORS[u.status].text }}>
                    {u.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleBan(u.id)}
                  className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs"
                  style={{
                    background: u.status === 'Banned' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: u.status === 'Banned' ? '#10B981' : '#EF4444',
                  }}
                >
                  {u.status === 'Banned' ? <CheckCircle size={13} /> : <Ban size={13} />}
                  {u.status === 'Banned' ? 'Activate' : 'Ban'}
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-xs"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
