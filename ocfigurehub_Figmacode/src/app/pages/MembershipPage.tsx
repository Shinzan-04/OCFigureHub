import { useEffect, useState } from 'react';
import { Check, X, Zap, Star, Crown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import API from '../../api/client';
import { toast } from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  monthlyQuotaDownloads: number;
}

interface CurrentSub {
  planId: string;
  isActive: boolean;
  endAtUtc: string;
  remainingDownloads: number;
  limitDownloads: number;
}

const FEATURE_LISTS: Record<string, { text: string; included: boolean }[]> = {
  'FREE': [
    { text: 'Access free models', included: true },
    { text: 'Download free models', included: true },
    { text: 'Join community', included: true },
    { text: 'Save favorites', included: true },
    { text: 'Access Pro models', included: false },
    { text: 'Original source files', included: false },
  ],
  'PRO': [
    { text: 'All Free features', included: true },
    { text: 'Access Pro models', included: true },
    { text: 'Monthly download quota', included: true },
    { text: '24/7 Priority support', included: true },
    { text: 'Early access to new models', included: true },
    { text: 'Original source files', included: true },
  ],
  'ULTIMATE': [
    { text: 'All Pro features', included: true },
    { text: 'All Exclusive models', included: true },
    { text: 'Unlimited downloads (demo)', included: true },
    { text: 'Personal cloud storage', included: true },
    { text: '1-on-1 Artist support', included: true },
    { text: 'Commercial license', included: true },
  ]
};

export function MembershipPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSub | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, statusRes] = await Promise.all([
          API.get('/subscriptions/plans'),
          isLoggedIn ? API.get('/subscriptions/status').catch(() => ({ data: null })) : Promise.resolve({ data: null })
        ]);

        const rawPlans = Array.isArray(plansRes.data) ? plansRes.data : [];
        const order: Record<string, number> = { 'FREE': 0, 'PRO': 1, 'ULTIMATE': 2 };
        const sortedPlans = (rawPlans as Plan[]).sort((a, b) => {
          const aKey = a.name.toUpperCase();
          const bKey = b.name.toUpperCase();
          return (order[aKey] ?? 99) - (order[bKey] ?? 99);
        });

        setPlans(sortedPlans);
        setCurrentSub(statusRes.data);
      } catch (err) {
        console.error('Failed to fetch membership data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  const handleSelectPlan = async (plan: Plan) => {
    if (!isLoggedIn) {
      navigate('/sign-in');
      return;
    }

    if (currentSub?.planId === plan.id && currentSub.isActive) {
      toast.success('Bạn đang sử dụng gói này!');
      return;
    }

    if (plan.monthlyPrice === 0) {
      // Free plan logic if needed
      return;
    }

    try {
      setProcessingId(plan.id);
      const res = await API.post('/subscriptions/payos-create', {
        planId: plan.id
      });
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err) {
      toast.error('Không thể khởi tạo thanh toán. Vui lòng thử lại sau.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
        <p className="text-[#A1A1A1]">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-16">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
        >
          <Star size={12} />
          Membership
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-4">
          Elevate your experience
        </h1>
        <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: '#A1A1A1' }}>
          Unlock access to premium 3D models and exclusive perks.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto mb-12 sm:mb-16">
        {plans.map((plan) => {
          const isCurrent = currentSub?.planId === plan.id && currentSub.isActive;
          const isPro = plan.name.toUpperCase().includes('PRO');
          const isUltimate = plan.name.toUpperCase().includes('ULTIMATE');
          const features = FEATURE_LISTS[plan.name.toUpperCase()] || FEATURE_LISTS['FREE'];

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-5 sm:p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:translate-y-[-4px] ${isPro ? 'md:scale-105 md:z-10' : ''}`}
              style={{
                backgroundColor: '#111111',
                borderColor: isCurrent ? '#10B981' : (isPro ? '#8B5CF6' : (isUltimate ? '#F59E0B' : '#262626')),
                boxShadow: isPro ? '0 20px 40px -20px #8B5CF640' : 'none'
              }}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-[#10B981] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  CURRENT PLAN
                </div>
              )}

              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase mb-4"
                  style={{ 
                    backgroundColor: isPro ? '#8B5CF6' : (isUltimate ? '#F59E0B' : '#26262660'),
                    color: isUltimate ? '#000' : '#FFF'
                  }}
                >
                  {isPro ? <Zap size={10} /> : (isUltimate ? <Crown size={10} /> : <Check size={10} />)}
                  {plan.name}
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{plan.name}</h2>
                <p className="text-xs" style={{ color: '#A1A1A1' }}>
                  {plan.monthlyQuotaDownloads} downloads per month
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{formatPrice(plan.monthlyPrice)}</span>
                <span className="text-sm font-semibold" style={{ color: '#A1A1A1' }}>₫/month</span>
              </div>

              {isCurrent && (
                <div className="p-3 rounded-lg bg-[#1A1A1A] border border-[#8B5CF640] mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#A1A1A1]">Downloads remaining</span>
                    <span className="text-sm font-bold text-white">
                      {currentSub.remainingDownloads} / {currentSub.limitDownloads}
                    </span>
                  </div>
                  <div className="w-full bg-[#111111] rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-[#8B5CF6] h-1.5 rounded-full" 
                      style={{ width: `${currentSub.limitDownloads > 0 ? (currentSub.remainingDownloads / currentSub.limitDownloads) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrent || processingId === plan.id}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: isCurrent ? '#10B98120' : (isPro ? '#8B5CF6' : (isUltimate ? '#F59E0B' : '#FFF')),
                  color: isCurrent ? '#10B981' : (isUltimate ? '#000' : (isPro ? '#FFF' : '#000')),
                  border: isCurrent ? '1px solid #10B981' : 'none'
                }}
              >
                {processingId === plan.id ? <Loader2 className="animate-spin" size={18} /> : null}
                <span>{isCurrent ? 'Current Plan' : (plan.monthlyPrice === 0 ? 'Get Started' : 'Upgrade Now')}</span>
              </button>

              <ul className="flex flex-col gap-3 mt-4">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: feat.included ? '#10B98120' : '#26262660' }}
                    >
                      {feat.included ? (
                        <Check size={11} style={{ color: '#10B981' }} />
                      ) : (
                        <X size={11} style={{ color: '#A1A1A1' }} />
                      )}
                    </div>
                    <span className="text-xs" style={{ color: feat.included ? '#FFF' : '#A1A1A1' }}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Support text */}
      <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs" style={{ color: '#666' }}>
            By subscribing, you agree to our Terms of Service. 
            Renewal will occur automatically every month unless cancelled.
          </p>
      </div>
    </div>
  );
}

