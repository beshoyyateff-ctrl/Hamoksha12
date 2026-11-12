import React, { useState } from 'react';
import { ZoomIn, Play, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { GalleryItem, MediaItem } from '../types';
import { isVideoSource } from '../utils/fileUpload';
import { MediaDisplay } from './common/MediaDisplay';

interface GallerySectionProps {
  items: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ items }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('الكل');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [modalMediaIdx, setModalMediaIdx] = useState<number>(0);

  const visibleItems = items.filter((item) => item.isActive !== false);

  const filteredItems = visibleItems.filter((item) => {
    if (selectedFilter === 'الكل') return true;
    return item.category === selectedFilter;
  });

  const activeItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  const handleOpenItem = (idx: number) => {
    setModalMediaIdx(0);
    setActiveLightboxIndex(idx);
  };

  const handleNext = () => {
    if (activeLightboxIndex === null) return;
    setModalMediaIdx(0);
    setActiveLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    if (activeLightboxIndex === null) return;
    setModalMediaIdx(0);
    setActiveLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  };

  const getMediaList = (item: GalleryItem): MediaItem[] => {
    const list: MediaItem[] = [];
    if (item.mediaUrl) {
      list.push({
        id: 'primary',
        type: isVideoSource(item.mediaUrl, item.mediaType) ? 'video' : 'image',
        url: item.mediaUrl,
      });
    }
    if (item.mediaGallery && item.mediaGallery.length > 0) {
      list.push(...item.mediaGallery);
    }
    return list;
  };

  return (
    <section id="gallery" className="py-8 section-dark">
      <div className="site-container space-y-5">
        {/* Header */}
        <div className="space-y-1 text-right">
          <p className="text-xs font-bold text-[var(--lemon-gold)]">
            معرض الصور والمنشورات
          </p>
          <h2 className="text-lg font-black text-[var(--text-on-dark)] leading-snug">
            كواليس العمل والفعاليات الشبابية
          </h2>
          <p className="text-[13px] text-[var(--text-muted-on-dark)]">
            صور وفيديوهات ومنشورات من حضور ومشاركات حموكشة الميدانية.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="w-full overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2 w-max">
            {['الكل', 'فعاليات ومهرجانات', 'كواليس وتصوير', 'صور إعلانية', 'منشورات وإعلانات'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer min-h-[38px] border ${
                    selectedFilter === cat
                      ? 'bg-[var(--lemon-primary)] text-[#141b05] border-[var(--lemon-bright)] font-black'
                      : 'bg-[var(--bg-card-dark)] text-[var(--text-muted-on-dark)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:text-[var(--text-on-dark)]'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* 2-Column Mobile Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="card-dark rounded-2xl p-6 text-center text-[13px] text-[var(--text-muted-on-dark)]">
            لا توجد عناصر في هذا التصنيف حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item, idx) => {
              const isVideo = isVideoSource(item.mediaUrl, item.mediaType);
              return (
                <article
                  key={item.id}
                  onClick={() => handleOpenItem(idx)}
                  className="card-dark-interactive rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group min-w-0"
                >
                  <div className="aspect-4/3 bg-black relative overflow-hidden">
                    <MediaDisplay
                      src={item.mediaUrl}
                      mediaType={item.mediaType}
                      alt={item.title}
                      previewOnly
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-[var(--lemon-primary)] text-[#141b05] flex items-center justify-center shadow-md">
                        {isVideo ? (
                          <Play className="w-4 h-4 fill-current mr-0.5" />
                        ) : (
                          <ZoomIn className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1 text-right">
                    <div className="flex items-center justify-between text-[11px] text-[var(--lemon-olive)] font-bold gap-1">
                      <span className="truncate">{item.category}</span>
                      <span className="shrink-0">{isVideo ? 'فيديو' : 'صورة'}</span>
                    </div>
                    <h4 className="font-bold text-xs text-[var(--text-on-dark)] leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeItem && activeLightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-[400px] w-full bg-[var(--bg-card-dark)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-medium)] p-4 text-right space-y-3.5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <div className="min-w-0">
                <span className="text-[var(--lemon-gold)] text-[11px] font-bold block">
                  {activeItem.category}
                </span>
                <h3 className="font-black text-sm text-[var(--text-on-dark)] truncate">
                  {activeItem.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveLightboxIndex(null)}
                className="p-2 rounded-xl bg-[var(--bg-card-elevated)] text-[var(--text-on-dark)] border border-[var(--border-subtle)] cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const mediaList = getMediaList(activeItem);
              const active = mediaList[modalMediaIdx] || mediaList[0];
              if (!active) return null;
              return (
                <div className="space-y-2.5 relative">
                  <div className="rounded-xl overflow-hidden aspect-16/10 bg-black border border-[var(--border-subtle)] relative flex items-center justify-center">
                    <MediaDisplay
                      src={active.url}
                      mediaType={active.type}
                      alt={activeItem.title}
                      className={
                        active.type === 'video'
                          ? 'w-full h-full object-contain'
                          : 'w-full h-full object-cover'
                      }
                      videoControls
                      autoPlay={active.type === 'video'}
                    />

                    {filteredItems.length > 1 && (
                      <>
                        <button
                          onClick={handlePrev}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-[var(--lemon-primary)] border border-[var(--border-subtle)] cursor-pointer"
                          aria-label="السابق"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNext}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-[var(--lemon-primary)] border border-[var(--border-subtle)] cursor-pointer"
                          aria-label="التالي"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {mediaList.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {mediaList.map((m, i) => (
                        <button
                          key={m.id}
                          onClick={() => setModalMediaIdx(i)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 cursor-pointer border ${
                            modalMediaIdx === i
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
              );
            })()}

            <p className="text-[13px] text-[var(--text-muted-on-dark)] leading-relaxed">
              {activeItem.description}
            </p>

            <button
              onClick={() => setActiveLightboxIndex(null)}
              className="btn-lemon-secondary w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer min-h-[40px]"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
