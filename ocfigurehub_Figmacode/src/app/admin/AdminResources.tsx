import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../api/products';
import { adminApi } from '../../api/admin';
import type { Product } from '../../types/product';
import { Plus, Search, Edit2, Trash2, X, Upload, Loader2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['anime', 'monsters'] as const;

interface ResourceFormData {
  name: string;
  creator: string;
  category: string;
  price: number;
  isFree: boolean;
  isPro: boolean;
  tags: string;
  description: string;
}

const defaultForm: ResourceFormData = {
  name: '',
  creator: '',
  category: 'anime',
  price: 0,
  isFree: false,
  isPro: false,
  tags: '',
  description: '',
};

export function AdminResources() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ResourceFormData>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: productsApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: (newProduct) => {
      handleFileUploads(newProduct.id);
    },
    onError: () => toast.error('Failed to create product')
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, req: any }) => adminApi.updateProduct(data.id, data.req),
    onSuccess: (updatedProduct) => {
      handleFileUploads(updatedProduct.id);
    },
    onError: () => toast.error('Failed to update product')
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => {
      toast.success('Deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Failed to delete product')
  });

  const handleFileUploads = async (productId: string) => {
    if (!modelFile && !thumbnailFile) {
      toast.success(editingProduct ? 'Updated successfully' : 'Created successfully');
      finishSave();
      return;
    }

    setIsUploading(true);
    try {
      if (modelFile) {
        const ext = modelFile.name.split('.').pop() || 'STL';
        await adminApi.uploadFile(productId, 1, ext, modelFile); 
      }
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split('.').pop() || 'JPG';
        await adminApi.uploadFile(productId, 3, ext, thumbnailFile);
      }
      toast.success('Completed successfully');
    } catch (err) {
      toast.error('Product saved but file upload failed');
    } finally {
      setIsUploading(false);
      finishSave();
    }
  };

  const finishSave = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    setShowModal(false);
    setForm(defaultForm);
    setModelFile(null);
    setThumbnailFile(null);
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.creator.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter || (categoryFilter === 'free' && p.price === 0);
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setModelFile(null);
    setThumbnailFile(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      creator: p.creator,
      category: p.category,
      price: p.price,
      isFree: p.price === 0,
      isPro: p.isPro,
      tags: p.tags || '',
      description: '', 
    });
    setModelFile(null);
    setThumbnailFile(null);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Name is required');

    const req = {
      ...form,
      price: form.isFree ? 0 : form.price,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, req: { ...req, isEnabled: editingProduct.isEnabled } });
    } else {
      createMutation.mutate(req);
    }
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" stroke="#8B5CF6" /></div>;

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Resource Management</h2>
          <p style={{ color: '#666', fontSize: 13 }}>{filtered.length} of {products.length} resources</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90"
          style={{ background: '#8B5CF6', color: '#fff', fontSize: 14, fontWeight: 600 }}
        >
          <Plus size={16} />
          Add New Resource
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#666' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-9 pr-4 py-2 rounded-lg outline-none"
            style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'anime', 'monsters', 'free'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-3 py-2 rounded-lg capitalize transition-all"
              style={{
                background: categoryFilter === cat ? '#8B5CF6' : '#1A1A1A',
                color: categoryFilter === cat ? '#fff' : '#999',
                fontSize: 13,
                border: '1px solid #262626',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: '#111111', border: '1px solid #262626' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              {['Thumbnail', 'Title', 'Creator', 'Category', 'Price', 'Pro', 'Actions'].map(col => (
                <th key={col} className="text-left px-4 py-3" style={{ color: '#666', fontSize: 12, fontWeight: 600 }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="transition-all" style={{ borderBottom: '1px solid #1A1A1A' }}>
                <td className="px-4 py-3">
                  {p.thumbnailUrl ? (
                    <img src={p.thumbnailUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center"><Tag size={16} color="#444" /></div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 500 }} className="max-w-xs truncate">{p.name}</p>
                </td>
                <td className="px-4 py-3" style={{ color: '#ccc', fontSize: 13 }}>{p.creator}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs capitalize"
                    style={{
                      background: p.category === 'anime' ? 'rgba(139,92,246,0.2)' : 'rgba(16,185,129,0.2)',
                      color: p.category === 'anime' ? '#8B5CF6' : '#10B981',
                    }}
                  >
                    {p.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: p.price === 0 ? '#10B981' : '#F59E0B', fontSize: 13, fontWeight: 600 }}>
                    {p.price === 0 ? 'Free' : `₫${(p.price / 1000).toFixed(0)}k`}
                  </span>
                </td>
                <td className="px-4 py-3">
                   <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      background: p.isPro ? 'rgba(245,158,11,0.15)' : 'rgba(100,100,100,0.15)',
                      color: p.isPro ? '#F59E0B' : '#666',
                    }}
                  >
                    {p.isPro ? 'PRO' : 'Basic'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-all" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg transition-all" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
           <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#111111', border: '1px solid #262626' }}>
             <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>Delete Resource?</h3>
             <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>This action cannot be undone.</p>
             <div className="flex gap-3">
               <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg" style={{ background: '#1A1A1A', color: '#ccc', fontSize: 14 }}>Cancel</button>
               <button 
                 disabled={deleteMutation.isPending}
                 onClick={() => deleteMutation.mutate(deleteConfirm)} 
                 className="flex-1 py-2 rounded-lg" 
                 style={{ background: '#EF4444', color: '#fff', fontSize: 14, fontWeight: 600 }}
               >
                 {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
               </button>
             </div>
           </div>
         </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: '#111111', border: '1px solid #262626' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>
                {editingProduct ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: '#666' }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Resource name"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Creator</label>
                  <input
                    value={form.creator}
                    onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}
                    placeholder="Creator name"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Price (VND)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    disabled={form.isFree}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: form.isFree ? '#555' : '#fff', fontSize: 13 }}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={e => setForm(f => ({ ...f, isFree: e.target.checked }))}
                    className="rounded"
                  />
                  <span style={{ color: '#ccc', fontSize: 13 }}>Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPro}
                    onChange={e => setForm(f => ({ ...f, isPro: e.target.checked }))}
                    className="rounded"
                  />
                  <span style={{ color: '#ccc', fontSize: 13 }}>Pro Only</span>
                </label>
              </div>
              <div>
                <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Anime, Action, 3D..."
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 6 }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Resource description..."
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                  style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center gap-2 cursor-pointer p-4 rounded-lg bg-zinc-900/50 border-2 border-dashed border-zinc-800 hover:border-violet-500 transition-all">
                  <Upload size={20} className={modelFile ? 'text-violet-500' : 'text-zinc-600'} />
                  <span className="text-[10px] text-zinc-500 text-center truncate w-full">
                    {modelFile ? modelFile.name : 'Upload File (.stl, .obj)'}
                  </span>
                  <input type="file" className="hidden" accept=".stl,.obj,.zip" onChange={e => setModelFile(e.target.files?.[0] || null)} />
                </label>
                
                <label className="flex flex-col items-center gap-2 cursor-pointer p-4 rounded-lg bg-zinc-900/50 border-2 border-dashed border-zinc-800 hover:border-violet-500 transition-all">
                  <Upload size={20} className={thumbnailFile ? 'text-violet-500' : 'text-zinc-600'} />
                  <span className="text-[10px] text-zinc-500 text-center truncate w-full">
                    {thumbnailFile ? thumbnailFile.name : 'Thumbnail Image'}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg" style={{ background: '#1A1A1A', color: '#ccc', fontSize: 14 }}>
                  Cancel
                </button>
                <button 
                  disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                  onClick={handleSave} 
                  className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2" 
                  style={{ background: '#8B5CF6', color: '#fff', fontSize: 14, fontWeight: 600 }}
                >
                  {(createMutation.isPending || updateMutation.isPending || isUploading) && <Loader2 size={16} className="animate-spin" />}
                  {isUploading ? 'Uploading...' : editingProduct ? 'Save Changes' : 'Add Resource'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
