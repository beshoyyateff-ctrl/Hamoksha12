import React, { useState } from 'react';
import { Tag, MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Offer, MediaItem } from '../types';
import { buildWhatsAppLink, PRESET_MESSAGES } from '../utils/whatsapp';
import { isVideoSource } from '../utils/fileUpload';
import { MediaDisplay } from './common/MediaDisplay';

interface OffersBannerProps {
  offers: Offer[];
  whatsappNumber: string;
}

export const OffersBanner: React.FC<OffersBannerProps> = ({ offers, whatsappNumber }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);

  if (!offers || offers.length === 0) {
    return null;
  }

  const currentOffer = offers[currentIndex] || offers[0];

  const allMedia: MediaItem[] = [];
  const primaryUrl = currentOffer.mediaUrl || currentOffer.image;
  if (primaryUrl) {
    allMedia.push({
      id: 'primary',
      type: currentOffer.mediaType || (isVideoSource(primaryUrl) ? 'video' : 'image'),
      url: primaryUrl,
    });
  }
  if (currentOffer.mediaGallery && currentOffer.mediaGallery.length > 0) {
    allMedia.push(...currentOffer.mediaGallery);
  }

  const safeMediaIdx = mediaIndex < allMedia.length ? mediaIndex : 0;
  const activeMedia = allMedia[safeMediaIdx];

  const handleNext = () => {
    setMediaIndex(0);
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  const handlePrev = () => {
    setMediaIndex(0);
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  return (
    <section id="offers" className="py-7 section-soft">
      <div className="site-container space-y-4">
        {/* Header & Carousel Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-black text-base text-[var(--text-on-light)]">
            <Tag className="w-4 h-4 text-[var(--lemon-olive-deep)] shrink-0" />
            <h2>عروض وخصومات حصرية</h2>
          </div>

          {offers.length > 1 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-[#1c2509] text-[var(--lemon-primary)] hover:bg-[#2a380d] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="العرض السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-[var(--text-on-light)] tabular-nums px-1">
                {currentIndex + 1} / {offers.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-[#1c2509] text-[var(--lemon-primary)] hover:bg-[#2a380d] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="العرض التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Offer Showcase Card */}
        <div className="card-dark rounded-2xl overflow-hidden shadow-lg p-4 space-y-4">
          {activeMedia && (
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden aspect-16/10 bg-black border border-[var(--border-subtle)]">
                <MediaDisplay
                  src={activeMedia.url}
                  mediaType={activeMedia.type}
                  alt={currentOffer.title}
                  className={
                    activeMedia.type === 'video'
                      ? 'w-full h-full object-contain'
                      : 'w-full h-full object-cover'
                  }
                  videoControls
                />
              </div>

              {allMedia.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {allMedia.map((m, i) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMediaIndex(i)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 cursor-pointer border ${
                        safeMediaIdx === i
                          ? 'bg-[var(--lemon-primary)] text-[#141b05] border-[var(--lemon-bright)]'
                          : 'bg-[var(--bg-card-elevated)] text-[var(--text-muted-on-dark)] border-[var(--border-subtle)]'
                      }`}
                    >
                      {m.type === 'video' ? `فيديو ${i + 1}` : `صورة ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2.5 text-right">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--lemon-gold)]">
              {currentOffer.discountBadge && <span>{currentOffer.discountBadge}</span>}
              {currentOffer.discountBadge && currentOffer.endDate && (
                <span aria-hidden="true">·</span>
              )}
              {currentOffer.endDate && (
                <span className="text-[var(--text-muted-on-dark)] tabular-nums">
                  ساري حتى {currentOffer.endDate}
                </span>
              )}
            </div>

            <h3 className="font-black text-[var(--lemon-bright)] text-base leading-snug">
              {currentOffer.title}
            </h3>

            <p className="text-[13px] text-[var(--text-muted-on-dark)] leading-relaxed">
              {currentOffer.description}
            </p>

            <div className="pt-1.5">
              <a
                href={buildWhatsAppLink(
                  whatsappNumber,
                  currentOffer.whatsappMessage || PRESET_MESSAGES.offer(currentOffer.title)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lemon-primary w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-black cursor-pointer min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>احجز هذا العرض عبر واتساب</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
