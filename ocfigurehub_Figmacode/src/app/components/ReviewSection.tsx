import { useState, useEffect } from 'react';
import { Star, Send, Trash2, Loader2 } from 'lucide-react';
import { reviewsApi } from '../../api/reviews';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userId: string;
  userName: string;
}

interface Props {
  productId: string;
}

export function ReviewSection({ productId }: Props) {
  const { user, isLoggedIn } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const data = await reviewsApi.getByProduct(productId);
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);

      // If user already reviewed, prefill
      if (user) {
        const myReview = data.reviews?.find((r: Review) => r.userId === user.id);
        if (myReview) {
          setRating(myReview.rating);
          setComment(myReview.comment || '');
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.addReview(productId, { rating, comment: comment.trim() || undefined });
      toast.success('Đánh giá thành công!');
      await fetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewsApi.deleteReview(reviewId);
      toast.success('Đã xoá đánh giá');
      setRating(0);
      setComment('');
      await fetchReviews();
    } catch {
      toast.error('Không thể xoá');
    }
  };

  const StarRating = ({ value, size = 16, interactive = false }: { value: number; size?: number; interactive?: boolean }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            size={size}
            fill={star <= (interactive ? (hoverRating || value) : value) ? '#F59E0B' : 'transparent'}
            style={{ color: star <= (interactive ? (hoverRating || value) : value) ? '#F59E0B' : '#333' }}
          />
        </button>
      ))}
    </div>
  );

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Hôm nay';
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    return `${months} tháng trước`;
  };

  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Star size={16} style={{ color: '#F59E0B' }} />
          Đánh giá ({totalReviews})
        </h3>
        {totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(averageRating)} size={14} />
            <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>{averageRating}</span>
          </div>
        )}
      </div>

      {/* Write Review */}
      {isLoggedIn ? (
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#1A1A1A' }}>
          <p className="text-xs font-medium text-white mb-3">
            {reviews.some((r) => r.userId === user?.id) ? 'Cập nhật đánh giá của bạn' : 'Viết đánh giá'}
          </p>
          <div className="flex items-center gap-3 mb-3">
            <StarRating value={rating} size={22} interactive />
            {rating > 0 && (
              <span className="text-xs" style={{ color: '#A1A1A1' }}>
                {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][rating]}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhận xét (tuỳ chọn)..."
              maxLength={500}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-colors focus:border-[#8B5CF6]"
              style={{ backgroundColor: '#111111', border: '1px solid #262626', color: '#fff' }}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
              style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Gửi
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl text-center" style={{ backgroundColor: '#1A1A1A' }}>
          <p className="text-xs" style={{ color: '#A1A1A1' }}>
            <a href="/sign-in" className="font-semibold" style={{ color: '#8B5CF6' }}>Đăng nhập</a> để viết đánh giá
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin" style={{ color: '#8B5CF6' }} />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-xs py-6" style={{ color: '#666' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-[#1A1A1A]"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff' }}
              >
                {review.userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white">{review.userName}</span>
                  <StarRating value={review.rating} size={11} />
                  <span className="text-[10px]" style={{ color: '#555' }}>{timeAgo(review.createdAt)}</span>
                </div>
                {review.comment && (
                  <p className="text-xs" style={{ color: '#A1A1A1' }}>{review.comment}</p>
                )}
              </div>
              {review.userId === user?.id && (
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-1 rounded hover:bg-[#262626] transition-colors shrink-0"
                  title="Xoá đánh giá"
                >
                  <Trash2 size={12} style={{ color: '#EF4444' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
