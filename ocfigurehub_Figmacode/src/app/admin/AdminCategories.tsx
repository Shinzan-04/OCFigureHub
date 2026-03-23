import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, X, Package } from 'lucide-react';
import { PRODUCTS } from '../data/products';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  resourceCount: number;
}

const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Free',
    slug: 'free',
    description: 'All free resources available to everyone without any cost.',
    color: '#10B981',
    icon: '🎁',
    resourceCount: PRODUCTS.filter(p => p.isFree).length,
  },
  {
    id: '2',
    name: 'Anime',
    slug: 'anime',
    description: 'Anime character 3D models from popular series.',
    color: '#8B5CF6',
    icon: '🌸',
    resourceCount: PRODUCTS.filter(p => p.category === 'anime').length,
  },
  {
    id: '3',
    name: 'Monsters',
    slug: 'monsters',
    description: 'Monster and creature 3D models from various franchises.',
    color: '#F59E0B',
    icon: '👾',
    resourceCount: PRODUCTS.filter(p => p.category === 'monsters').length,
  },
];

const colorOptions = ['#8B5CF6', '#10B981', '#F59E0B', '#06B6D4', '#EF4444', '#EC4899'];

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#8B5CF6', icon: '🏷️' });

  const openAdd = () => {
    setEditingCat(null);
    setForm({ name: '', slug: '', description: '', color: '#8B5CF6', icon: '🏷️' });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, color: cat.color, icon: cat.icon });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingCat) {
      setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ...form } : c));
    } else {
      const newCat: Category = {
        id: Date.now().toString(),
        ...form,
        resourceCount: 0,
      };
      setCategories(prev => [...prev, newCat]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Category Management</h2>
          <p style={{ color: '#666', fontSize: 13 }}>{categories.length} categories total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          style={{ background: '#8B5CF6', color: '#fff', fontSize: 14, fontWeight: 600 }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-xl p-5 relative"
            style={{ background: '#111111', border: '1px solid #262626' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `${cat.color}1A` }}
              >
                {cat.icon}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 rounded-lg"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(cat.id)}
                  className="p-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="mb-1 flex items-center gap-2">
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{cat.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${cat.color}1A`, color: cat.color }}>
                /{cat.slug}
              </span>
            </div>
            <p style={{ color: '#888', fontSize: 13, lineHeight: 1.5 }} className="mb-4">{cat.description}</p>

            <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #1A1A1A' }}>
              <div className="flex items-center gap-1.5">
                <Package size={14} color="#666" />
                <span style={{ color: '#666', fontSize: 13 }}>{cat.resourceCount} resources</span>
              </div>
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: cat.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Category Table (Desktop extra) */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Category Overview</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['Name', 'Slug', 'Resources', 'Color', 'Actions'].map(col => (
                <th key={col} className="text-left px-5 py-3" style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span style={{ color: '#888', fontSize: 13 }}>/{cat.slug}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: `${cat.color}1A`, color: cat.color }}>
                    {cat.resourceCount}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ background: cat.color }} />
                    <span style={{ color: '#888', fontSize: 12 }}>{cat.color}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)} className="px-3 py-1 rounded text-xs" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>Edit</button>
                    <button onClick={() => setDeleteConfirm(cat.id)} className="px-3 py-1 rounded text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#111111', border: '1px solid #262626' }}>
            <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>Delete Category?</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>This will not delete the resources in this category.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg" style={{ background: '#1A1A1A', color: '#ccc', fontSize: 14 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-lg" style={{ background: '#EF4444', color: '#fff', fontSize: 14, fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl w-full max-w-md" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>
                {editingCat ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: '#666' }}><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Category name"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Slug</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s/g, '-') }))}
                    placeholder="url-slug"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
              </div>
              <div>
                <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Icon (emoji)</label>
                <input
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="🏷️"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 20, width: 60 }}
                />
              </div>
              <div>
                <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                  style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 8 }}>Color</label>
                <div className="flex gap-2">
                  {colorOptions.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: c,
                        outline: form.color === c ? `3px solid #fff` : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg" style={{ background: '#1A1A1A', color: '#ccc', fontSize: 14 }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg" style={{ background: '#8B5CF6', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                  {editingCat ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
