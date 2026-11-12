import React from 'react';
import { MessageCircle, Lightbulb, Users, Video, DollarSign } from 'lucide-react';
import { SiteSettings } from '../types';
import { buildWhatsAppLink, PRESET_MESSAGES } from '../utils/whatsapp';
import { MediaDisplay } from './common/MediaDisplay';

interface StartupsSupportSectionProps {
  settings: SiteSettings;
}

export const StartupsSupportSection: React.FC<StartupsSupportSectionProps> = ({ settings }) => {
  const supportPillars = [
    {
      icon: DollarSign,
      title: 'باقات تناسب ميزانيتك',
      desc: 'باقات خفيفة تناسب بدايات المشروعات وتجيب نتائج ملموسة من أول أسبوع.',
    },
    {
      icon: Video,
      title: 'فلوج وجولة داخل محلك',
      desc: 'حموكشة بيزورك بنفسه في المحل ويصور جولة عفوية مع صاحب المشروع.',
    },
    {
      icon: Lightbulb,
      title: 'أفكار عروض تجذب الزباين',
      desc: 'بنساعدك تبتكر عروض افتتاح تشجع الناس تزور محلك وتجرب منتجاتك.',
    },
    {
      icon: Users,
      title: 'استهداف دقيق لأهل بلدك',
      desc: 'إعلانك يوصل لأهل جهينة وطهطا وسوهاج وكل المراكز القريبة منك.',
    },
  ];

  return (
    <section id="startups" className="py-8 section-soft">
      <div className="site-container space-y-5">
        {/* Header */}
        <div className="space-y-1 text-right">
          <p className="text-xs font-bold text-[var(--lemon-olive-deep)]">
            دعم المشروعات الناشئة
          </p>
          <h2 className="text-lg font-black text-[var(--text-on-light)] leading-snug">
            عندك محل جديد أو مشروع صغير؟ هنكبره معاك
          </h2>
          <p className="text-[13px] text-[var(--text-muted-on-light)] font-medium leading-relaxed">
            إعلانات وفلوجات واقعية بتكلفة مريحة تناسب بداية كل تاجر وشاب طموح.
          </p>
        </div>

        {/* Media + Pillars + Quote */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-[var(--border-on-light)] bg-black aspect-16/10 shadow-lg">
            <MediaDisplay
              src={settings.coverStartupsImage || settings.heroImage}
              mediaType={settings.coverStartupsMediaType}
              alt="دعم المشروعات الصغيرة"
              className="w-full h-full object-cover"
              videoControls
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {supportPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="card-dark p-3.5 rounded-2xl text-right space-y-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-card-elevated)] text-[var(--lemon-primary)] border border-[var(--border-subtle)] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-black text-[var(--lemon-bright)] text-[13px] leading-snug">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted-on-dark)] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="card-dark p-3.5 rounded-2xl text-right space-y-1">
            <span className="text-[var(--lemon-primary)] font-black text-xs block">
              نصيحة حموكشة
            </span>
            <p className="text-[13px] text-[var(--text-on-dark)] leading-relaxed">
              «أهم حاجة في الإعلان هي الصدق في تصوير منتجك وطاقتك الإيجابية.»
            </p>
          </div>

          <a
            href={buildWhatsAppLink(settings.whatsappNumber, PRESET_MESSAGES.startup)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark-on-soft w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-black shadow-lg cursor-pointer min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 shrink-0 text-[var(--lemon-primary)]" />
            <span>احكي لحموكشة عن مشروعك على واتساب</span>
          </a>
        </div>
      </div>
    </section>
  );
};
