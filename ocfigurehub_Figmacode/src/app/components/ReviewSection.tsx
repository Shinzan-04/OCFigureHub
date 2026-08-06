import { useState, useEffect, useRef } from 'react';
import { Star, Send, Trash2, Loader2, MessageSquare } from 'lucide-react';
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

const RATING_LABELS = ['', 'Very Bad', 'Bad', 'Average', 'Good', 'Excellent'];

const RatingStars = ({
  value,
  size = 16,
  interactive = false,
  onRate,
  onHover,
  hoverValue,
}: {
  value: number;
  size?: number;
  interactive?: boolean;
  onRate?: (v: number) => void;
  onHover?: (v: number) => void;
  hoverValue?: number;
}) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      const active = interactive ? (hoverValue || value) : value;
      return (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && onHover?.(star)}
          onMouseLeave={() => interactive && onHover?.(0)}
          className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            size={size}
            fill={star <= active ? '#F59E0B' : 'transparent'}
            style={{ color: star <= active ? '#F59E0B' : '#333' }}
          />
        </button>
      );
    })}
  </div>
);

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} months ago`;
};

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
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [hasReviewed, setHasReviewed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchReviews = async () => {
    try {
      const data = await reviewsApi.getByProduct(productId);
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);

      if (user) {
        const myReview = data.reviews?.find((r: Review) => r.userId === user?.userId);
        if (myReview) {
          setRating(myReview.rating);
          setComment(myReview.comment || '');
          setHasReviewed(true);
        } else {
          setHasReviewed(false);
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
      toast.success('Cảm ơn bạn đã đánh giá!');
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
      setHasReviewed(false);
      await fetchReviews();
    } catch {
      toast.error('Không thể xoá');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent: totalReviews > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / totalReviews) * 100) : 0,
  }));

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={18} style={{ color: '#8B5CF6' }} />
        <h2 className="text-lg font-bold text-white">Product Reviews</h2>
        {totalReviews > 0 && (
          <span className="text-sm px-2.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}>
            {totalReviews}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        {/* Left column: Summary + Write form */}
        <div className="flex flex-col gap-5">
          {/* Rating Summary */}
          {totalReviews > 0 && (
            <div className="rounded-2xl border p-5" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
              <div className="flex items-center gap-4 mb-5">
                <div className="text-center">
                  <div className="text-5xl font-black text-white">{averageRating}</div>
                  <RatingStars value={Math.round(averageRating)} size={14} />
                  <div className="text-xs mt-1" style={{ color: '#666' }}>{totalReviews} reviews</div>
                </div>
              </div>

              <div className="space-y-2">
                {ratingCounts.map(({ star, count, percent }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs w-6 text-right" style={{ color: '#A1A1A1' }}>{star}</span>
                    <Star size={10} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#262626' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: '#F59E0B' }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: '#666' }}>{percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write Review */}
          {isLoggedIn ? (
            <div className="rounded-2xl border p-5" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
              <p className="text-sm font-semibold text-white mb-3">
                {hasReviewed ? 'Update Review' : 'Write your review'}
              </p>

              <div
                className="flex items-center gap-2 mb-4 cursor-pointer select-none"
                onMouseLeave={() => setHoverRating(0)}
              >
                <RatingStars
                  value={rating}
                  size={28}
                  interactive
                  onRate={setRating}
                  onHover={setHoverRating}
                  hoverValue={hoverRating}
                />
                {(hoverRating || rating) > 0 && (
                  <span className="text-xs ml-1 font-medium" style={{ color: '#F59E0B' }}>
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product... (optional)"
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-colors focus:border-[#8B5CF6]"
                  style={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #262626',
                    color: '#fff',
                  }}
                />
                <div className="text-right mt-1">
                  <span className="text-[10px]" style={{ color: '#555' }}>{comment.length}/500</span>
                </div>
              </div>

              <div className="flex gap-3">
                {hasReviewed && (
                  <button
                    onClick={() => handleDelete(reviews.find((r) => r.userId === user?.userId)?.id || '')}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-red-500/10"
                    style={{ borderColor: '#EF444440', color: '#EF4444' }}
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: '#8B5CF6', color: '#fff' }}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {hasReviewed ? 'Update' : 'Submit Review'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border p-5 text-center" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
              <p className="text-sm" style={{ color: '#A1A1A1' }}>
                <a href="/sign-in" className="font-semibold hover:underline" style={{ color: '#8B5CF6' }}>Log in</a> to write a review
              </p>
            </div>
          )}
        </div>

        {/* Right column: Reviews list */}
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin" style={{ color: '#8B5CF6' }} />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center" style={{ borderColor: '#262626', backgroundColor: '#111111' }}>
              <div className="text-4xl mb-3 opacity-20">&#9734;</div>
              <p className="text-sm" style={{ color: '#666' }}>No reviews yet.</p>
              <p className="text-xs mt-1" style={{ color: '#555' }}>Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => {
                const isExpanded = expandedReviews.has(review.id);
                const isLongComment = (review.comment?.length || 0) > 180;
                const displayComment = isExpanded || !isLongComment ? review.comment : review.comment?.slice(0, 180) + '...';

                return (
                  <div
                    key={review.id}
                    className="rounded-2xl border p-5 transition-colors hover:border-[#333]"
                    style={{ borderColor: '#262626', backgroundColor: '#111111' }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff' }}
                      >
                        {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{review.userName}</span>
                          <RatingStars value={review.rating} size={13} />
                          <span className="text-xs" style={{ color: '#555' }}>{timeAgo(review.createdAt)}</span>
                          {review.userId === user?.userId && (
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="ml-auto p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete review"
                            >
                              <Trash2 size={13} style={{ color: '#EF4444' }} />
                            </button>
                          )}
                        </div>

                        {review.comment && (
                          <div>
                            <p className="text-sm leading-relaxed" style={{ color: '#A1A1A1' }}>{displayComment}</p>
                            {isLongComment && (
                              <button
                                onClick={() => toggleExpand(review.id)}
                                className="text-xs mt-1 font-medium hover:underline"
                                style={{ color: '#8B5CF6' }}
                              >
                                {isExpanded ? 'Show less' : 'Show more'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
