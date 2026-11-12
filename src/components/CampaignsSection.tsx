import React, { useState } from 'react';
import { Eye, MapPin, MessageCircle, Play, Plus, X, Search } from 'lucide-react';
import { Campaign, MediaItem } from '../types';
import { StorageService } from '../services/storage';
import { buildWhatsAppLink, PRESET_MESSAGES } from '../utils/whatsapp';
import { isVideoSource } from '../utils/fileUpload';
import { MediaDisplay } from './common/MediaDisplay';

interface CampaignsSectionProps {
  campaigns: Campaign[];
  whatsappNumber: string;
  onAddCampaign?: () => void;
}

const CATEGORIES = [
  'الكل',
  'مطاعم وكافيهات',
  'محلات تجارية',
  'ملابس وموضة',
  'مشروعات ناشئة',
  'خدمات ومهن',
] as const;

export const CampaignsSection: React.FC<CampaignsSectionProps> = ({
  campaigns,
  whatsappNumber,
  onAddCampaign,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalCampaign, setActiveModalCampaign] = useState<Campaign | null>(null);
  const [modalMediaIdx, setModalMediaIdx] = useState<number>(0);

  const filteredCampaigns = campaigns.filter((camp) => {
    if (!camp.isActive) return false;
    const matchesCategory = selectedCategory === 'الكل' || camp.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      camp.title.toLowerCase().includes(q) ||
      camp.clientName.toLowerCase().includes(q) ||
      camp.location.toLowerCase().includes(q) ||
      camp.description.toLowerCase().includes(q)
    );
  });

  const handleOpenCampaign = (camp: Campaign) => {
    StorageService.incrementCampaignViews(camp.id);
    setModalMediaIdx(0);
    setActiveModalCampaign(camp);
  };

  const getModalMediaList = (camp: Campaign): MediaItem[] => {
    const list: MediaItem[] = [];
    if (camp.mediaUrl) {
      list.push({
        id: 'main',
        type: isVideoSource(camp.mediaUrl, camp.mediaType) ? 'video' : 'image',
        url: camp.mediaUrl,
      });
    }
    if (camp.mediaGallery && camp.mediaGallery.length > 0) {
      list.push(...camp.mediaGallery);
    }
    return list;
  };

  return (
    <section id="campaigns" className="py-8 section-dark">
      <div className="site-container space-y-4">
        {/* Section Header + Search & Quick Add Media */}
        <div className="space-y-3">
          <div className="space-y-1 text-right">
            <p className="text-xs font-bold text-[var(--lemon-gold)]">
              حملات وإعلانات ناجحة
            </p>
            <h2 className="text-lg font-black text-[var(--text-on-dark)] leading-snug">
              أعمال ونماذج إعلانات حقيقية للمحلات
            </h2>
            <p className="text-[13px] text-[var(--text-muted-on-dark)]">
              نماذج تصوير وفيديوهات من حملات حموكشة للمحلات والمطاعم في مراكز سوهاج.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[var(--lemon-olive)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المحل أو المركز..."
                className="input-lemon w-full pr-10 pl-3 py-2.5 rounded-xl text-base"
              />
            </div>

            {onAddCampaign && (
              <button
                type="button"
                onClick={onAddCampaign}
                className="btn-lemon-secondary w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap cursor-pointer min-h-[42px]"
              >
                <Plus className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
                <span>إضافة حملة (فيديو أو صورة)</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Category Tabs */}
        <div className="w-full overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2 w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer min-h-[38px] border ${
                  selectedCategory === cat
                    ? 'bg-[var(--lemon-primary)] text-[#141b05] border-[var(--lemon-bright)] font-black'
                    : 'bg-[var(--bg-card-dark)] text-[var(--text-muted-on-dark)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:text-[var(--text-on-dark)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns Single-Column Mobile Feed */}
        {filteredCampaigns.length === 0 ? (
          <div className="card-dark rounded-2xl p-6 text-center text-[13px] text-[var(--text-muted-on-dark)]">
            لا توجد حملات مطابقة لبحثك حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.map((camp) => {
              const isVideo = isVideoSource(camp.mediaUrl, camp.mediaType);
              const extraCount = camp.mediaGallery?.length || 0;
              return (
                <article
                  key={camp.id}
                  className="card-dark-interactive rounded-2xl overflow-hidden flex flex-col justify-between min-w-0"
                >
                  {/* Media Top */}
                  <div>
                    <div
                      className="relative aspect-16/10 bg-black overflow-hidden cursor-pointer group"
                      onClick={() => handleOpenCampaign(camp)}
                    >
                      <MediaDisplay
                        src={camp.mediaUrl}
                        mediaType={camp.mediaType}
                        poster={camp.thumbnailUrl}
                        alt={camp.title}
                        previewOnly
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

                      <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-[11px] font-bold text-[var(--lemon-bright)] pointer-events-none">
                        <span>
                          {isVideo ? 'مقطع فيديو' : 'صورة إعلانية'}
                          {extraCount > 0 ? ` · +${extraCount} ملفات` : ''}
                        </span>
                        <span className="tabular-nums">{camp.viewsCount || '+50K'}</span>
                      </div>

                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-11 h-11 rounded-full bg-[var(--lemon-primary)]/95 text-[#141b05] flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current mr-0.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Body */}
                    <div className="p-3.5 space-y-2 text-right">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--lemon-olive)] font-bold">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{camp.clientName}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{camp.location}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[var(--lemon-gold)]">{camp.category}</span>
                      </div>

                      <h3 className="font-black text-[var(--text-on-dark)] text-[15px] leading-snug">
                        {camp.title}
                      </h3>

                      <p className="text-[13px] text-[var(--text-muted-on-dark)] leading-relaxed line-clamp-2">
                        {camp.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-3.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenCampaign(camp)}
                      className="btn-lemon-secondary px-3 py-2 rounded-xl text-xs cursor-pointer min-h-[38px]"
                    >
                      {isVideo ? 'تشغيل والتفاصيل' : 'عرض التفاصيل'}
                    </button>

                    <a
                      href={buildWhatsAppLink(
                        whatsappNumber,
                        PRESET_MESSAGES.campaign(camp.title, camp.clientName)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-lemon-primary inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs cursor-pointer min-h-[38px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>فكرة زي دي لمحلي</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Campaign Details & Multi-Media Player Modal */}
      {activeModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[var(--bg-card-dark)] rounded-2xl max-w-[400px] w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--border-medium)] p-4 text-right text-[var(--text-on-dark)] space-y-3.5 relative">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <div className="min-w-0">
                <div className="text-[11px] text-[var(--lemon-gold)] font-bold truncate">
                  {activeModalCampaign.clientName} · {activeModalCampaign.location}
                </div>
                <h3 className="font-black text-sm text-[var(--text-on-dark)] leading-snug">
                  {activeModalCampaign.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalCampaign(null)}
                className="p-2 rounded-xl bg-[var(--bg-card-elevated)] text-[var(--text-on-dark)] border border-[var(--border-subtle)] cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const items = getModalMediaList(activeModalCampaign);
              const active = items[modalMediaIdx] || items[0];
              if (!active) return null;
              return (
                <div className="space-y-2.5">
                  <div className="rounded-xl overflow-hidden aspect-16/9 bg-black border border-[var(--border-subtle)] flex items-center justify-center">
                    <MediaDisplay
                      src={active.url}
                      mediaType={active.type}
                      alt={activeModalCampaign.title}
                      className={
                        active.type === 'video'
                          ? 'w-full h-full object-contain'
                          : 'w-full h-full object-cover'
                      }
                      videoControls
                      autoPlay={active.type === 'video'}
                    />
                  </div>

                  {items.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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
                </div>
              );
            })()}

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold pb-2 border-b border-[var(--border-subtle)]">
              <span className="inline-flex items-center gap-1.5 text-[var(--lemon-bright)]">
                <Eye className="w-4 h-4 text-[var(--lemon-primary)]" />
                <span className="tabular-nums">
                  {activeModalCampaign.viewsCount || '+50K مشاهدة'}
                </span>
              </span>
              <span className="text-[var(--lemon-olive)]">
                {activeModalCampaign.category} · {activeModalCampaign.date}
              </span>
            </div>

            <p className="text-[13px] text-[var(--text-muted-on-dark)] leading-relaxed">
              {activeModalCampaign.description}
            </p>

            <div className="pt-1 flex flex-col gap-2">
              <a
                href={buildWhatsAppLink(
                  whatsappNumber,
                  PRESET_MESSAGES.campaign(
                    activeModalCampaign.title,
                    activeModalCampaign.clientName
                  )
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lemon-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black cursor-pointer min-h-[42px]"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>طلب إعلان وتصوير مماثل</span>
              </a>

              <button
                onClick={() => setActiveModalCampaign(null)}
                className="btn-lemon-secondary w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer min-h-[40px]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
