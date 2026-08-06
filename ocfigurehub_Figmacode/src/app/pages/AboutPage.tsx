import { Link } from 'react-router';
import { Heart, Users, Shield, Zap, Globe, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { statsApi, type PlatformStats } from '../../api/stats';

const FEATURES = [
  {
    icon: <Shield size={22} />,
    title: 'Guaranteed Quality',
    desc: 'Every model file is carefully vetted before publication, ensuring compatibility with popular 3D printers.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Fast Downloads',
    desc: 'Optimized CDN system for fast and stable download speeds, no matter where you are.',
  },
  {
    icon: <Globe size={22} />,
    title: 'Global Community',
    desc: 'Connect with anime artists and collectors worldwide. Share your passion and learn from each other.',
  },
  {
    icon: <Heart size={22} />,
    title: 'Made with Love',
    desc: 'Built by anime and 3D printing enthusiasts, for the community.',
  },
];

export function AboutPage() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    statsApi.getPlatformStats().then(setPlatformStats).catch(console.error);
  }, []);

  const statsList = [
    { value: platformStats ? `${platformStats.models}+` : '500+', label: 'Models 3D', icon: '🎨' },
    { value: platformStats ? `${platformStats.creators}+` : '120+', label: 'Creators', icon: '👨‍🎨' },
    { value: platformStats ? (platformStats.downloads >= 1000 ? `${Math.floor(platformStats.downloads / 1000)}K+` : `${platformStats.downloads}+`) : '50K+', label: 'Downloads', icon: '📥' },
    { value: platformStats ? (platformStats.members >= 1000 ? `${Math.floor(platformStats.members / 1000)}K+` : `${platformStats.members}+`) : '10K+', label: 'Members', icon: '👥' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Hero */}
      <section className="px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
        >
          <Users size={12} />
          About Us
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
          About{' '}
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
          Vietnam's #1 3D figure marketplace — connecting designers, printers, and collectors in the community.
        </p>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 md:px-8 pb-10 sm:pb-14 md:pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {statsList.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border p-4 sm:p-6 flex flex-col items-center gap-3 text-center"
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
      <div className="px-4 sm:px-6 md:px-8">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* Mission */}
      <section className="px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-5"
              style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
            >
              🎯 Mission
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Our Mission
            </h2>
            <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#A1A1A1' }}>
              OC Figure HUB was born with the goal of becoming the digital home for 3D anime model enthusiasts. We believe that creativity should not be limited by cost or difficulty in finding resources.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: '#A1A1A1' }}>
              We connect talented designers with the 3D printing community, creating a sustainable and thriving creative ecosystem.
            </p>
          </div>
          <div
            className="rounded-2xl border p-8 flex flex-col gap-5"
            style={{ backgroundColor: '#111111', borderColor: '#262626' }}
          >
            {[
              { emoji: '🌟', title: 'Democratizing Creativity', desc: 'Bringing high-quality 3D files to everyone at affordable prices' },
              { emoji: '🤝', title: 'Supporting Creators', desc: 'Creating sustainable income for designers and artists' },
              { emoji: '🔥', title: 'Building Community', desc: 'Connecting people with a shared passion for anime and 3D printing' },
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
      <div className="px-4 sm:px-6 md:px-8">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* Features */}
      <section className="px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
            style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
          >
            ✨ Features
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Why Choose Us?
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
      <div className="px-4 sm:px-6 md:px-8">
        <div className="border-t" style={{ borderColor: '#262626' }} />
      </div>

      {/* Community */}
      <section className="px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
            style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
          >
            <Users size={12} />
            Community
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Our Community
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: '#A1A1A1' }}>
            Thousands of members are sharing their passion, learning, and growing together in the OC Figure HUB community.
          </p>
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              emoji: '🎨',
              title: 'Designers',
              desc: 'Talented artists and designers share their work and earn income from their passion',
              count: '120+ creators',
            },
            {
              emoji: '🖨️',
              title: 'Printers',
              desc: 'A community of 3D printing enthusiasts, from beginners to pros',
              count: '5K+ printers',
            },
            {
              emoji: '🏆',
              title: 'Collectors',
              desc: 'Anime figure collectors with an unlimited passion',
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
            Join the community now
          </Link>
        </div>
      </section>
    </div>
  );
}
