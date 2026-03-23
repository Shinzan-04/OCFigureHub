import React, { useState } from 'react';
import { Save, Eye, RefreshCw, Image, Plus, Trash2, Star } from 'lucide-react';
import { PRODUCTS } from '../data/products';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
}

const initialSlides: HeroSlide[] = [
  { id: '1', title: 'Khám Phá Thế Giới 3D Figures', subtitle: 'Hàng nghìn mô hình 3D anime chất lượng cao chờ bạn khám phá', ctaText: 'Khám phá ngay', ctaLink: '/anime', bgColor: '#8B5CF6' },
  { id: '2', title: 'PRO Members Get More', subtitle: 'Truy cập không giới hạn toàn bộ thư viện mô hình PRO', ctaText: 'Nâng cấp PRO', ctaLink: '/upgrade', bgColor: '#06B6D4' },
  { id: '3', title: 'Free Models Mỗi Tuần', subtitle: 'Tải miễn phí các mô hình được tuyển chọn mỗi tuần', ctaText: 'Tải miễn phí', ctaLink: '/free', bgColor: '#10B981' },
];

const featuredIds = PRODUCTS.filter(p => p.isFeatured).map(p => p.id);

export function AdminContent() {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [featured, setFeatured] = useState<string[]>(featuredIds);
  const [newsletter, setNewsletter] = useState({
    title: 'Đăng ký nhận thông báo',
    subtitle: 'Nhận thông báo ngay khi có mô hình mới được thêm vào thư viện.',
    buttonText: 'Đăng ký ngay',
    backgroundColor: '#8B5CF6',
  });
  const [saved, setSaved] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  const handleSaveAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSlide = (id: string, field: keyof HeroSlide, value: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSlide = (id: string) => {
    setSlides(prev => prev.filter(s => s.id !== id));
  };

  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      title: 'New Slide Title',
      subtitle: 'Slide subtitle here',
      ctaText: 'Click here',
      ctaLink: '/',
      bgColor: '#8B5CF6',
    };
    setSlides(prev => [...prev, newSlide]);
  };

  const toggleFeatured = (id: string) => {
    setFeatured(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Content Management</h2>
          <p style={{ color: '#666', fontSize: 13 }}>Edit homepage content and layout</p>
        </div>
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
          style={{
            background: saved ? '#10B981' : '#8B5CF6',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save All'}
        </button>
      </div>

      {/* Hero Carousel Editor */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Hero Carousel Slides</h3>
          <button
            onClick={addSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', fontWeight: 600 }}
          >
            <Plus size={14} />
            Add Slide
          </button>
        </div>
        <div className="p-5 space-y-4">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid #262626' }}>
              {/* Preview bar */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ background: `${slide.bgColor}22` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: slide.bgColor }} />
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Slide {idx + 1}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSlide(editingSlide?.id === slide.id ? null : slide)}
                    className="px-3 py-1 rounded text-xs"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    className="px-3 py-1 rounded text-xs"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Edit fields */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>Title</label>
                  <input
                    value={slide.title}
                    onChange={e => updateSlide(slide.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>CTA Text</label>
                  <input
                    value={slide.ctaText}
                    onChange={e => updateSlide(slide.id, 'ctaText', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>Subtitle</label>
                  <input
                    value={slide.subtitle}
                    onChange={e => updateSlide(slide.id, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>CTA Link</label>
                  <input
                    value={slide.ctaLink}
                    onChange={e => updateSlide(slide.id, 'ctaLink', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: 11, display: 'block', marginBottom: 4 }}>Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={slide.bgColor}
                      onChange={e => updateSlide(slide.id, 'bgColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer"
                      style={{ border: '1px solid #262626', background: 'transparent', padding: 2 }}
                    />
                    <span style={{ color: '#888', fontSize: 12 }}>{slide.bgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Resources */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <Star size={16} color="#F59E0B" />
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Featured Resources</h3>
          <span style={{ color: '#666', fontSize: 12 }}>({featured.length} selected)</span>
        </div>
        <div className="p-5">
          <p style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
            Select resources to feature on the homepage hero section.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRODUCTS.map(p => {
              const isFeatured = featured.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleFeatured(p.id)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: isFeatured ? 'rgba(139,92,246,0.1)' : '#1A1A1A',
                    border: `1px solid ${isFeatured ? '#8B5CF6' : '#262626'}`,
                  }}
                >
                  <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p style={{ color: '#fff', fontSize: 12, fontWeight: 500 }} className="truncate">{p.title}</p>
                    <p style={{ color: '#888', fontSize: 11 }}>{p.creator}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isFeatured ? '#8B5CF6' : '#262626',
                    }}
                  >
                    {isFeatured && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="rounded-xl" style={{ background: '#111111', border: '1px solid #262626' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #262626' }}>
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Newsletter Section</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Title</label>
              <input
                value={newsletter.title}
                onChange={e => setNewsletter(n => ({ ...n, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Button Text</label>
              <input
                value={newsletter.buttonText}
                onChange={e => setNewsletter(n => ({ ...n, buttonText: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
              />
            </div>
            <div className="sm:col-span-2">
              <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Subtitle</label>
              <input
                value={newsletter.subtitle}
                onChange={e => setNewsletter(n => ({ ...n, subtitle: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{ background: '#1A1A1A', border: '1px solid #262626', color: '#fff', fontSize: 13 }}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl p-5 mt-4" style={{ background: `${newsletter.backgroundColor}15`, border: `1px solid ${newsletter.backgroundColor}40` }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{newsletter.title}</p>
            <p style={{ color: '#aaa', fontSize: 13, marginBottom: 12 }}>{newsletter.subtitle}</p>
            <div className="flex gap-2">
              <input
                disabled
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-lg"
                style={{ background: '#0B0B0B', border: '1px solid #262626', color: '#888', fontSize: 13 }}
              />
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: newsletter.backgroundColor, color: '#fff', fontWeight: 600 }}
              >
                {newsletter.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
