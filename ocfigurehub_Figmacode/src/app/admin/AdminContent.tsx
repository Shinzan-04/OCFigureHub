import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import toast from 'react-hot-toast';

export function AdminContent() {
  const [hero3d, setHero3d] = useState({
    id: '',
    titleLine1: 'Chào mừng đến với',
    titleLine2: 'OC Figure HUB',
    subtitle: 'Kho tàng mô hình 3D anime chất lượng cao — khám phá, tải về và sáng tạo.',
  });
  
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const slidesData = await adminApi.getCmsByType('hero_3d').catch(() => []);
        if (slidesData && slidesData.length > 0) {
          const s = slidesData[0];
          setHero3d({
            id: s.id,
            titleLine1: s.title || 'Chào mừng đến với',
            titleLine2: s.ctaText || 'OC Figure HUB',
            subtitle: s.subtitle || 'Kho tàng mô hình 3D anime chất lượng cao — khám phá, tải về và sáng tạo.',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        type: 'hero_3d',
        title: hero3d.titleLine1,
        subtitle: hero3d.subtitle,
        ctaText: hero3d.titleLine2,
        ctaLink: '',
        bgColor: '',
        sortOrder: 0,
        isEnabled: true,
      };

      if (hero3d.id) {
        await adminApi.updateCms(hero3d.id, payload);
      } else {
        const res = await adminApi.createCms(payload);
        setHero3d(prev => ({ ...prev, id: res.id }));
      }

      setSaved(true);
      toast.success('Hero content saved!');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Content Management</h2>
          <p style={{ color: '#666', fontSize: 13 }}>Edit homepage hero content</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={loading || saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
          style={{
            background: saved ? '#10B981' : '#8B5CF6',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Content'}
        </button>
      </div>

      {/* Hero 3D Editor */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Homepage Hero Text</h3>
        </div>
        
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 size={24} className="animate-spin text-[#8B5CF6]" />
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Title (Line 1)</label>
                <input
                  value={hero3d.titleLine1}
                  onChange={e => setHero3d(h => ({ ...h, titleLine1: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  placeholder="e.g. Chào mừng đến với"
                />
              </div>
              <div>
                <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Title (Line 2 - Gradient)</label>
                <input
                  value={hero3d.titleLine2}
                  onChange={e => setHero3d(h => ({ ...h, titleLine2: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  placeholder="e.g. OC Figure HUB"
                />
              </div>
              <div className="md:col-span-2">
                <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Subtitle</label>
                <textarea
                  value={hero3d.subtitle}
                  onChange={e => setHero3d(h => ({ ...h, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg outline-none min-h-[80px]"
                  style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  placeholder="Kho tàng mô hình 3D anime chất lượng cao..."
                />
              </div>
            </div>

            {/* Preview Section */}
            <div className="mt-6 p-6 rounded-xl relative overflow-hidden" style={{ background: '#050505', border: '1px solid #262626' }}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #080808 60%, #050505 100%)' }} />
              <div className="relative z-10">
                <p className="text-xs text-[#888] mb-4 uppercase tracking-wider font-semibold">Live Preview</p>
                <div className="flex flex-col gap-3">
                  <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight" style={{ color: '#FFFFFF' }}>
                    {hero3d.titleLine1}{' '}
                    <span
                      className="inline-block"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {hero3d.titleLine2}
                    </span>
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: '#A1A1A1', maxWidth: '400px' }}>
                    {hero3d.subtitle}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
