import React from 'react';
import { Video, MapPin, TrendingUp, MessageCircle, Layers } from 'lucide-react';
import { CoverageArea } from '../types';
import { buildWhatsAppLink, PRESET_MESSAGES } from '../utils/whatsapp';

interface ServicesAndCoverageProps {
  areas: CoverageArea[];
  whatsappNumber: string;
}

export const ServicesAndCoverage: React.FC<ServicesAndCoverageProps> = ({
  areas,
  whatsappNumber,
}) => {
  const services = [
    {
      number: '01',
      icon: Video,
      title: 'صناعة إعلانات الفيديو والريلز',
      description:
        'فيديوهات ريلز وتيك توك عمودية احترافية بتعليق صوتي مشوق وجولات تفاعلية تجذب أنظار المتابعين في سوهاج.',
      tag: 'الأكثر طلباً',
    },
    {
      number: '02',
      icon: TrendingUp,
      title: 'فلوجات المحلات وتغطية الافتتاحات',
      description:
        'نزول ميداني وتصوير كواليس حقيقية للمحل وعرض المنتجات وتفاعل الجمهور بأسلوب عفوي يبني ثقة فورية مع الزبون.',
      tag: 'زيادة مبيعات',
    },
    {
      number: '03',
      icon: Layers,
      title: 'دعم واستشارات المشروعات الناشئة',
      description:
        'جلسة تخطيط تسويقي لتحديد فكرة الإعلان والعرض الأنسب لجمهور منطقتك بميزانية مرنة تناسب بدايتك.',
      tag: 'باقات مخفضة',
    },
  ];

  return (
    <section id="services" className="py-8 section-olive">
      <div className="site-container space-y-6">
        {/* Header */}
        <div className="space-y-1 text-right">
          <p className="text-xs font-bold text-[var(--lemon-gold)]">
            خدماتنا الميدانية
          </p>
          <h2 className="text-lg font-black text-[var(--text-on-dark)] leading-snug">
            كل ما يحتاجه محلك للظهور والانتشار
          </h2>
          <p className="text-[13px] text-[var(--text-muted-on-dark)]">
            حلول متكاملة تضمن وصول رسالتك التسويقية بوضوح لكل بيت في محافظة سوهاج.
          </p>
        </div>

        {/* Services Phone Stack */}
        <div className="grid grid-cols-1 gap-3.5">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.number}
                className="card-dark rounded-2xl p-4 text-right space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-card-elevated)] text-[var(--lemon-primary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[var(--lemon-gold)]">
                      {srv.number}. {srv.tag}
                    </span>
                  </div>

                  <h3 className="font-black text-[var(--text-on-dark)] text-[15px] leading-snug">
                    {srv.title}
                  </h3>

                  <p className="text-[13px] text-[var(--text-muted-on-dark)] leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <a
                  href={buildWhatsAppLink(
                    whatsappNumber,
                    `السلام عليكم يا حموكشة، حابب استفسر عن خدمة: "${srv.title}".`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-lemon-secondary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs cursor-pointer min-h-[42px]"
                >
                  <MessageCircle className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
                  <span>استفسر عن هذه الخدمة</span>
                </a>
              </div>
            );
          })}
        </div>

        {/* 13 Coverage Districts Block */}
        <div className="card-dark rounded-2xl p-4 text-right space-y-4">
          <div className="space-y-1 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 text-[var(--lemon-gold)] font-bold text-xs">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>نطاق الخدمة الرسمي الميداني</span>
            </div>
            <h3 className="text-base font-black text-[var(--text-on-dark)] leading-snug">
              المناطق والمراكز التي نغطيها في سوهاج (13 منطقة)
            </h3>
            <p className="text-[11px] text-[var(--text-muted-on-dark)]">
              اضغط على أي مركز لحجز موعد تصوير لمحلك
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {areas.map((area) => (
              <a
                key={area.id}
                href={buildWhatsAppLink(
                  whatsappNumber,
                  PRESET_MESSAGES.areaInquiry(area.name)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2.5 rounded-xl border text-right block transition-colors ${
                  area.isAvailable
                    ? 'bg-[var(--bg-card-elevated)] border-[var(--border-subtle)] hover:border-[var(--lemon-primary)]'
                    : 'bg-[var(--bg-page)] border-[var(--border-subtle)] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="font-black text-[var(--lemon-bright)] text-xs truncate">
                    {area.name}
                  </h4>
                  <span className="text-[10px] font-bold text-[var(--lemon-olive)] shrink-0">
                    {area.isAvailable ? 'متاح' : 'متوقف'}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted-on-dark)] block truncate mt-1">
                  {area.notes || 'تغطية متاحة'}
                </span>
              </a>
            ))}
          </div>

          <div className="pt-2.5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted-on-dark)] text-center font-medium">
            المقر الدائم:{' '}
            <strong className="text-[var(--lemon-primary)]">
              جهينة الغربية، محافظة سوهاج، مصر
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
};
