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
}

const FEATURE_LISTS: Record<string, { text: string; included: boolean }[]> = {
  'FREE': [
    { text: 'Truy cập models miễn phí', included: true },
    { text: 'Tải xuống models free', included: true },
    { text: 'Tham gia cộng đồng', included: true },
    { text: 'Lưu yêu thích', included: true },
    { text: 'Truy cập models Pro', included: false },
    { text: 'Source file gốc', included: false },
  ],
  'PRO': [
    { text: 'Tất cả tính năng Free', included: true },
    { text: 'Truy cập models Pro', included: true },
    { text: 'Tải xuống theo gói tháng', included: true },
    { text: 'Hỗ trợ ưu tiên 24/7', included: true },
    { text: 'Early access models mới', included: true },
    { text: 'Source file gốc', included: true },
  ],
  'ULTIMATE': [
    { text: 'Tất cả tính năng Pro', included: true },
    { text: 'Mọi models Exclusive', included: true },
    { text: 'Tải xuống không giới hạn (demo)', included: true },
    { text: 'Cloud storage cá nhân', included: true },
    { text: 'Hỗ trợ 1-on-1 Artist', included: true },
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
          isLoggedIn ? API.get('/subscriptions/status') : Promise.resolve({ data: null })
        ]);
        setPlans(plansRes.data);
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
      const res = await API.post('/subscriptions/vnpay-create', {
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
        <p className="text-[#A1A1A1]">Đang tải danh sách gói...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-4"
          style={{ borderColor: '#8B5CF640', backgroundColor: '#8B5CF610', color: '#8B5CF6' }}
        >
          <Star size={12} />
          Membership
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
          Nâng tầm trải nghiệm của bạn
        </h1>
        <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: '#A1A1A1' }}>
          Mở khóa quyền truy cập vào các mô hình 3D cao cấp nhất và nhận các ưu đãi đặc quyền.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto mb-16">
        {plans.map((plan) => {
          const isCurrent = currentSub?.planId === plan.id && currentSub.isActive;
          const isPro = plan.name.toUpperCase().includes('PRO');
          const isUltimate = plan.name.toUpperCase().includes('ULTIMATE');
          const features = FEATURE_LISTS[plan.name.toUpperCase()] || FEATURE_LISTS['FREE'];

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:translate-y-[-4px] ${isPro ? 'scale-105 z-10' : ''}`}
              style={{
                backgroundColor: '#111111',
                borderColor: isCurrent ? '#10B981' : (isPro ? '#8B5CF6' : (isUltimate ? '#F59E0B' : '#262626')),
                boxShadow: isPro ? '0 20px 40px -20px #8B5CF640' : 'none'
              }}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-[#10B981] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  GÓI HIỆN TẠI
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
                  {plan.monthlyQuotaDownloads} lượt tải mỗi tháng
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{formatPrice(plan.monthlyPrice)}</span>
                <span className="text-sm font-semibold" style={{ color: '#A1A1A1' }}>₫/tháng</span>
              </div>

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
                {isCurrent ? 'Đang sử dụng' : (plan.monthlyPrice === 0 ? 'Bắt đầu ngay' : 'Nâng cấp ngay')}
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
            Bằng cách đăng ký, bạn đồng ý với các Điều khoản Dịch vụ của chúng tôi. 
            Việc gia hạn sẽ tự động diễn ra mỗi tháng trừ khi bạn hủy bỏ.
          </p>
      </div>
    </div>
  );
}

