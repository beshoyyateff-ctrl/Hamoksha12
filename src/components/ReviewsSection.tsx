import React, { useState } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import { Review } from '../types';
import { StorageService } from '../services/storage';

interface ReviewsSectionProps {
  reviews: Review[];
  onReviewSubmitted: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onReviewSubmitted,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const approvedReviews = reviews.filter((r) => r.status === 'approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      StorageService.addReview({
        authorName: authorName.trim(),
        businessName: businessName.trim() || undefined,
        rating,
        comment: comment.trim(),
      });

      setSuccessMessage(
        'شكراً لتقييمك الصادق! سيتم نشر رأيك بعد مراجعته من قبل إدارة حموكشة.'
      );
      setAuthorName('');
      setBusinessName('');
      setRating(5);
      setComment('');
      onReviewSubmitted();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch {
      setErrorMessage('حدث خطأ أثناء حفظ التقييم.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-8 section-dark">
      <div className="site-container space-y-5">
        <div className="space-y-1 text-right">
          <p className="text-xs font-bold text-[var(--lemon-gold)]">
            آراء وتقييمات العملاء
          </p>
          <h2 className="text-lg font-black text-[var(--text-on-dark)] leading-snug">
            رأيك يفرق معانا — قيّم شغلنا
          </h2>
          <p className="text-[13px] text-[var(--text-muted-on-dark)]">
            آراء تجار وأصحاب مشروعات سوهاج وجهينة في إعلانات حموكشة ({approvedReviews.length} تقييم معتمد).
          </p>
        </div>

        <div className="space-y-5">
          {/* Approved Reviews Stack */}
          <div className="space-y-3">
            {approvedReviews.length === 0 ? (
              <div className="card-dark rounded-2xl p-5 text-center text-[13px] text-[var(--text-muted-on-dark)]">
                كن أول من يشارك تقييمه الإيجابي!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {approvedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="card-dark p-3.5 rounded-2xl space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'text-[var(--lemon-gold)] fill-[var(--lemon-gold)]'
                                  : 'text-[var(--lemon-olive-deep)]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-[var(--text-dim-on-dark)] tabular-nums">
                          {rev.createdAt}
                        </span>
                      </div>

                      <p className="text-[13px] text-[var(--text-on-dark)] leading-relaxed">
                        «{rev.comment}»
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)] text-xs font-bold text-[var(--lemon-bright)]">
                      <span>{rev.authorName}</span>
                      {rev.businessName && (
                        <span className="text-[11px] text-[var(--lemon-olive)] font-medium block mt-0.5">
                          {rev.businessName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission Form */}
          <div className="card-dark p-4 rounded-2xl space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-black text-[var(--lemon-bright)]">
              <MessageSquare className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
              <span>أضف تقييمك لخدمات حموكشة</span>
            </div>

            {successMessage && (
              <div className="p-3 rounded-xl bg-[var(--bg-card-elevated)] border border-[var(--lemon-olive)] text-[var(--lemon-bright)] text-xs font-bold">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/75 border border-red-800 text-red-200 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="اسمك الكريم *"
                  required
                  className="input-lemon w-full px-3.5 py-2.5 rounded-xl text-base"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="اسم المحل أو النشاط ومكانه (مثال: كافيه الصفا · طهطا)"
                  className="input-lemon w-full px-3.5 py-2.5 rounded-xl text-base"
                />
              </div>

              <div className="flex items-center gap-3 py-1">
                <span className="text-xs text-[var(--text-muted-on-dark)] font-bold">
                  التقييم:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1.5 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                      aria-label={`تقييم ${star} من 5`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'text-[var(--lemon-gold)] fill-[var(--lemon-gold)]'
                            : 'text-[var(--lemon-olive-deep)]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="اكتب رأيك بصراحة في الشغل والتصوير والمعاملة... *"
                  required
                  className="input-lemon w-full px-3.5 py-2.5 rounded-xl text-base resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-lemon-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
