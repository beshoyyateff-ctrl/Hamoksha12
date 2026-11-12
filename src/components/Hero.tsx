import React from 'react';
import { MessageCircle, Play } from 'lucide-react';
import { HAMOKSHA_IMAGES } from '../data/defaultData';
import { SiteSettings } from '../types';
import { buildWhatsAppLink, PRESET_MESSAGES } from '../utils/whatsapp';
import { MediaDisplay } from './common/MediaDisplay';

interface HeroProps {
  settings: SiteSettings;
  onExploreCampaigns: () => void;
  onExploreStartups: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreCampaigns,
  onExploreStartups,
}) => {
  return (
    <section id="hero" className="py-6 bg-[var(--bg-page)] text-[var(--text-on-dark)]">
      <div className="site-container space-y-5">
        {/* Headline & Value Proposition */}
        <div className="space-y-3.5 text-right">
          <p className="text-xs font-bold text-[var(--lemon-gold)] tracking-wide">
            {settings.tagline || 'لو عايز تكبر مشروعك.. تعالا عندنا!'} · محافظة سوهاج
          </p>

          <div className="flex items-start gap-2.5">
            <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[var(--lemon-primary)] shrink-0 mt-0.5 shadow-md bg-[var(--bg-card-elevated)]">
              <MediaDisplay
                src={settings.profileImage || HAMOKSHA_IMAGES.profile}
                mediaType="image"
                alt={settings.ownerName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <h1 className="text-[22px] font-black text-[var(--text-on-dark)] leading-[1.35]">
              إعلانك يوصل لأهل بلدك صح،{' '}
              <span className="text-[var(--lemon-primary)]">
                ومحلك يسمّع في سوهاج كلها!
              </span>
            </h1>
          </div>

          <p className="text-[13px] text-[var(--text-muted-on-dark)] leading-relaxed">
            مع <strong className="text-[var(--lemon-bright)] font-extrabold">{settings.ownerName}</strong>،
            بنحوّل فكرة محلك أو مشروعك الصغير لفيديو إعلاني احترافي وفلوج ميداني واقعي
            يجذب الزباين ويزوّد مبيعاتك في جهينة وطهطا وسوهاج وكل المراكز.
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-1">
            <a
              href={buildWhatsAppLink(settings.whatsappNumber, PRESET_MESSAGES.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lemon-primary w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-black shadow-lg cursor-pointer min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>تواصل واتساب ({settings.whatsappNumber})</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExploreCampaigns}
                className="btn-lemon-secondary inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer min-h-[42px]"
              >
                <Play className="w-3.5 h-3.5 text-[var(--lemon-primary)] shrink-0" />
                <span>نماذج الأعمال</span>
              </button>

              <button
                onClick={onExploreStartups}
                className="btn-lemon-secondary inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer min-h-[42px]"
              >
                <span className="text-[var(--lemon-gold)]">المشروعات الناشئة</span>
              </button>
            </div>
          </div>

          {/* Quantified Proof Strip */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <div className="card-dark rounded-xl p-2.5 text-center">
              <div className="text-base font-black text-[var(--lemon-primary)] tabular-nums">
                13 مركز
              </div>
              <div className="text-[11px] text-[var(--text-muted-on-dark)] font-medium mt-0.5 leading-tight">
                تغطية بسوهاج
              </div>
            </div>
            <div className="card-dark rounded-xl p-2.5 text-center">
              <div className="text-base font-black text-[var(--lemon-primary)] tabular-nums">
                +500K
              </div>
              <div className="text-[11px] text-[var(--text-muted-on-dark)] font-medium mt-0.5 leading-tight">
                مشاهدات وتفاعل
              </div>
            </div>
            <div className="card-dark rounded-xl p-2.5 text-center">
              <div className="text-base font-black text-[var(--lemon-gold)] tabular-nums">
                إبداع 2026
              </div>
              <div className="text-[11px] text-[var(--text-muted-on-dark)] font-medium mt-0.5 leading-tight">
                حضور شبابي
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image / Video Carrier */}
        <div className="space-y-2.5">
          <div className="rounded-2xl overflow-hidden border border-[var(--border-medium)] bg-black aspect-4/3 shadow-xl">
            <MediaDisplay
              src={settings.heroImage}
              mediaType={settings.heroMediaType}
              alt={settings.ownerName}
              className="w-full h-full object-cover object-top"
              videoControls
            />
          </div>

          <div className="card-dark rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <h3 className="font-extrabold text-[var(--lemon-bright)] text-[13px] truncate">
                {settings.ownerName}
              </h3>
              <span className="text-[11px] text-[var(--text-muted-on-dark)] block truncate">
                صانع إعلانات وفلوجات ميدانية
              </span>
            </div>
            <div className="text-[11px] text-[var(--lemon-olive)] font-bold shrink-0">
              {settings.locationCity || 'جهينة الغربية · سوهاج'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
