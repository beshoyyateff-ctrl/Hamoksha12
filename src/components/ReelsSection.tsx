import React, { useState } from 'react';
import {
  Play,
  Eye,
  X,
  Volume2,
  VolumeX,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Reel, MediaItem } from '../types';
import { StorageService } from '../services/storage';
import { buildWhatsAppLink, PRESET_MESSAGES } from '../utils/whatsapp';
import { MediaDisplay } from './common/MediaDisplay';

interface ReelsSectionProps {
  reels: Reel[];
  whatsappNumber: string;
}

export const ReelsSection: React.FC<ReelsSectionProps> = ({ reels, whatsappNumber }) => {
  const [activeReel, setActiveReel] = useState<Reel | null>(null);
  const [modalMediaIdx, setModalMediaIdx] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);

  const activeReels = reels.filter((r) => r.isActive);

  if (activeReels.length === 0) return null;

  const handleOpenReel = (reel: Reel) => {
    StorageService.incrementReelViews(reel.id);
    setModalMediaIdx(0);
    setActiveReel(reel);
    setIsMuted(false);
  };

  const handleNextReel = () => {
    if (!activeReel) return;
    const currentIndex = activeReels.findIndex((r) => r.id === activeReel.id);
    const nextIndex = (currentIndex + 1) % activeReels.length;
    const nextReel = activeReels[nextIndex];
    StorageService.incrementReelViews(nextReel.id);
    setModalMediaIdx(0);
    setActiveReel(nextReel);
  };

  const handlePrevReel = () => {
    if (!activeReel) return;
    const currentIndex = activeReels.findIndex((r) => r.id === activeReel.id);
    const prevIndex = (currentIndex - 1 + activeReels.length) % activeReels.length;
    const prevReel = activeReels[prevIndex];
    StorageService.incrementReelViews(prevReel.id);
    setModalMediaIdx(0);
    setActiveReel(prevReel);
  };

  const getReelMediaList = (reel: Reel): MediaItem[] => {
    const items: MediaItem[] = [];
    if (reel.videoUrl) {
      items.push({
        id: 'primary',
        type: reel.mediaType === 'image' ? 'image' : 'video',
        url: reel.videoUrl,
      });
    } else if (reel.thumbnailUrl) {
      items.push({
        id: 'thumb',
        type: 'image',
        url: reel.thumbnailUrl,
      });
    }
    if (reel.mediaGallery && reel.mediaGallery.length > 0) {
      items.push(...reel.mediaGallery);
    }
    return items;
  };

  return (
    <section id="reels" className="py-8 section-olive">
      <div className="site-container space-y-5">
        {/* Section Header */}
        <div className="space-y-1 text-right">
          <p className="text-xs font-bold text-[var(--lemon-gold)]">
            حالات وفلوغات يومية
          </p>
          <h2 className="text-lg font-black text-[var(--text-on-dark)] leading-snug">
            كواليس التصوير وجولات المحلات
          </h2>
          <p className="text-[13px] text-[var(--text-muted-on-dark)]">
            فيديوهات وصور سريعة تنقل نبض الشارع وعروض محلات سوهاج وجهينة.
          </p>
        </div>

        {/* Horizontal Story Rings Tray */}
        <div className="w-full overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-3.5 w-max">
            {activeReels.map((reel) => (
              <button
                key={reel.id}
                onClick={() => handleOpenReel(reel)}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="relative p-0.5 rounded-full border-2 border-[var(--lemon-primary)] bg-[var(--bg-page)]">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-black">
                    <MediaDisplay
                      src={reel.thumbnailUrl || reel.videoUrl}
                      mediaType={reel.thumbnailUrl ? 'image' : reel.mediaType}
                      alt={reel.title}
                      previewOnly
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <span className="text-[11px] font-bold text-[var(--text-on-dark)] max-w-[74px] truncate text-center">
                  {reel.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Phone Reels Grid */}
        <div className="grid grid-cols-2 gap-3">
          {activeReels.map((reel) => (
            <article
              key={reel.id}
              onClick={() => handleOpenReel(reel)}
              className="card-dark-interactive rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group min-w-0"
            >
              <div className="relative aspect-9/12 bg-black overflow-hidden">
                <MediaDisplay
                  src={reel.thumbnailUrl || reel.videoUrl}
                  mediaType={reel.thumbnailUrl ? 'image' : reel.mediaType}
                  alt={reel.title}
                  previewOnly
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--lemon-primary)] text-[#141b05] flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-current mr-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-2.5 text-right space-y-1.5 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-[var(--border-subtle)] font-bold">
                  <span className="flex items-center gap-1 text-[var(--lemon-bright)] tabular-nums">
                    <Eye className="w-3.5 h-3.5 text-[var(--lemon-primary)] shrink-0" />
                    <span>{reel.views || '50K'}</span>
                  </span>
                  <span className="text-[var(--text-muted-on-dark)] tabular-nums">
                    {reel.duration || '0:45'}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-[var(--text-on-dark)] leading-snug line-clamp-2">
                  {reel.title}
                </h4>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-dim-on-dark)]">{reel.uploadDate || 'اليوم'}</span>
                  <span className="text-[var(--lemon-primary)] font-extrabold">تشغيل</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Reel Video & Photo Player Modal */}
      {activeReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-[400px] bg-[var(--bg-card-dark)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-medium)] flex flex-col max-h-[92vh]">
            <div className="p-3 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-page)] text-right gap-2">
              <div className="min-w-0">
                <h4 className="text-xs font-black text-[var(--text-on-dark)] truncate">
                  {activeReel.title}
                </h4>
                <span className="text-[11px] text-[var(--lemon-gold)] font-bold">
                  {activeReel.uploadDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-[var(--bg-card-elevated)] text-[var(--lemon-primary)] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="كتم أو تشغيل الصوت"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveReel(null)}
                  className="p-2 rounded-xl bg-[var(--bg-card-elevated)] text-[var(--text-on-dark)] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(() => {
              const items = getReelMediaList(activeReel);
              const active = items[modalMediaIdx] || items[0];
              return (
                <>
                  <div className="relative bg-black aspect-9/14 max-h-[56vh] flex items-center justify-center overflow-hidden">
                    <MediaDisplay
                      src={active?.url}
                      mediaType={active?.type}
                      poster={activeReel.thumbnailUrl}
                      alt={activeReel.title}
                      autoPlay={active?.type === 'video'}
                      muted={isMuted}
                      loop
                      videoControls
                      className="w-full h-full object-contain"
                    />

                    {activeReels.length > 1 && (
                      <>
                        <button
                          onClick={handleNextReel}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-[var(--lemon-bright)] border border-[var(--border-subtle)] cursor-pointer"
                          aria-label="الريل التالي"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handlePrevReel}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-[var(--lemon-bright)] border border-[var(--border-subtle)] cursor-pointer"
                          aria-label="الريل السابق"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {items.length > 1 && (
                    <div className="px-3 py-2 bg-[var(--bg-page)] border-t border-[var(--border-subtle)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {items.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setModalMediaIdx(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 cursor-pointer border ${
                            modalMediaIdx === idx
                              ? 'bg-[var(--lemon-primary)] text-[#141b05] border-[var(--lemon-bright)]'
                              : 'bg-[var(--bg-card-elevated)] text-[var(--text-muted-on-dark)] border-[var(--border-subtle)]'
                          }`}
                        >
                          {item.type === 'video' ? `فيديو ${idx + 1}` : `صورة ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            <div className="p-3 bg-[var(--bg-page)] border-t border-[var(--border-subtle)] space-y-2 text-right">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[var(--text-muted-on-dark)]">
                  <Eye className="w-4 h-4 text-[var(--lemon-primary)]" />
                  <span>عدد المشاهدات</span>
                </span>
                <span className="text-[var(--lemon-bright)] tabular-nums">
                  {activeReel.views || '50K'} مشاهدة
                </span>
              </div>

              <a
                href={buildWhatsAppLink(whatsappNumber, PRESET_MESSAGES.vlogReel(activeReel.title))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lemon-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-black cursor-pointer min-h-[42px]"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>عايز فلوج زي ده لمحلي؟ كلم حموكشة</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
