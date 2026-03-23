import { Link } from 'react-router';
import { Heart, Users, Shield, Zap, Globe, Star } from 'lucide-react';

const FEATURES = [
  {
    icon: <Shield size={22} />,
    title: 'Chất lượng đảm bảo',
    desc: 'Mọi file mô hình đều được kiểm duyệt kỹ lưỡng trước khi đăng tải, đảm bảo tương thích với các máy in phổ biến.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Tải xuống nhanh chóng',
    desc: 'Hệ thống CDN tối ưu, tốc độ tải xuống nhanh và ổn định cho dù bạn đang ở đâu tại Việt Nam.',
  },
  {
    icon: <Globe size={22} />,
    title: 'Cộng đồng toàn cầu',
    desc: 'Kết nối với các artists và collectors anime trên toàn thế giới. Chia sẻ đam mê và học hỏi lẫn nhau.',
  },
  {
    icon: <Heart size={22} />,
    title: 'Made with Love',
    desc: 'Được xây dựng bởi những người đam mê anime và 3D printing, cho cộng đồng đam mê anime Việt Nam.',
  },
];

const STATS = [
  { value: '500+', label: 'Models 3D', icon: '🎨' },
  { value: '120+', label: 'Creators', icon: '👨‍🎨' },
  { value: '50K+', label: 'Downloads', icon: '📥' },
  { value: '10K+', label: 'Members', icon: '👥' },
];

export function AboutPage() {
  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Hero */}
      <section className="px-6 md:px-8 py-14 md:py-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
        >
          <Users size={12} />
          About Us
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
          Về{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            OC Figure HUB
          </span>
        </h1>
        <p className="text-base md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#A1A1A1' }}>
          Marketplace 3D figure số 1 Việt Nam — nơi kết nối các designers, printers và collectors trong cộng đồng anime Việt Nam.
        </p>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-8 pb-14 md:pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border p-6 flex flex-col items-center gap-3 text-center"
              style={{ backgroundColor: '#111111', borderColor: '#262626' }}
            >
              <span className="text-3xl">{stat.icon}</span>
              <span
                className="text-3xl font-black"
                style={{ color: '#8B5CF6' }}
              >
                {stat.value}
              </span>
              <span className="text-sm" style={{ color: '#A1A1A1' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="px-6 md:px-8">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* Mission */}
      <section className="px-6 md:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-5"
              style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
            >
              🎯 Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Sứ mệnh của chúng tôi
            </h2>
            <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#A1A1A1' }}>
              OC Figure HUB ra đời với mục tiêu trở thành ngôi nhà số cho những ai đam mê mô hình 3D anime tại Việt Nam. Chúng tôi tin rằng sáng tạo không nên bị giới hạn bởi chi phí hay khó khăn trong việc tìm kiếm tài nguyên.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: '#A1A1A1' }}>
              Chúng tôi kết nối các designers tài năng với cộng đồng người yêu thích in 3D, tạo ra một hệ sinh thái sáng tạo bền vững và phát triển.
            </p>
          </div>
          <div
            className="rounded-2xl border p-8 flex flex-col gap-5"
            style={{ backgroundColor: '#111111', borderColor: '#262626' }}
          >
            {[
              { emoji: '🌟', title: 'Dân chủ hóa sáng tạo', desc: 'Đưa các file 3D chất lượng cao đến tay mọi người với giá cả phải chăng' },
              { emoji: '🤝', title: 'Hỗ trợ creators', desc: 'Tạo thu nhập bền vững cho các designers và artists Việt Nam' },
              { emoji: '🔥', title: 'Xây dựng cộng đồng', desc: 'Kết nối những người có cùng đam mê anime và 3D printing' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="text-2xl shrink-0 mt-0.5">{item.emoji}</span>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-sm" style={{ color: '#A1A1A1' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="px-6 md:px-8">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* Features */}
      <section className="px-6 md:px-8 py-14 md:py-20">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
            style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
          >
            ✨ Features
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Tại sao chọn chúng tôi?
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border p-6 flex gap-4 transition-colors hover:border-[#8B5CF6]"
              style={{ backgroundColor: '#111111', borderColor: '#262626' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}
              >
                {feat.icon}
              </div>
              <div>
                <h3 className="font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A1A1A1' }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="px-6 md:px-8">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* Community */}
      <section className="px-6 md:px-8 py-14 md:py-20">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
            style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
          >
            <Users size={12} />
            Community
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Cộng đồng của chúng tôi
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: '#A1A1A1' }}>
            Hàng nghìn thành viên đang cùng nhau chia sẻ đam mê, học hỏi và phát triển trong cộng đồng OC Figure HUB
          </p>
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              emoji: '🎨',
              title: 'Designers',
              desc: 'Các artists và designers tài năng chia sẻ tác phẩm và kiếm thu nhập từ đam mê',
              count: '120+ creators',
            },
            {
              emoji: '🖨️',
              title: 'Printers',
              desc: 'Cộng đồng người yêu thích 3D printing, từ người mới đến pro',
              count: '5K+ printers',
            },
            {
              emoji: '🏆',
              title: 'Collectors',
              desc: 'Những người sưu tập figures anime với niềm đam mê không giới hạn',
              count: '10K+ collectors',
            },
          ].map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border p-6 text-center"
              style={{ backgroundColor: '#111111', borderColor: '#262626' }}
            >
              <span className="text-4xl block mb-4">{group.emoji}</span>
              <h3 className="font-bold text-white mb-2">{group.title}</h3>
              <p className="text-sm mb-4" style={{ color: '#A1A1A1' }}>{group.desc}</p>
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}
              >
                {group.count}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
          >
            <Star size={16} />
            Tham gia cộng đồng ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
