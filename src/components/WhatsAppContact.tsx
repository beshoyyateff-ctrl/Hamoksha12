import React from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { buildWhatsAppLink } from '../utils/whatsapp';

interface WhatsAppContactProps {
  whatsappNumber: string;
}

export const WhatsAppContact: React.FC<WhatsAppContactProps> = ({ whatsappNumber }) => {
  const promptOptions = [
    {
      title: 'إعلان جديد لمحلي أو مطعمي',
      desc: 'استفسار عن باقات التصوير والفلوجات والأسعار.',
      message:
        'السلام عليكم يا حموكشة، عايز أعمل إعلان لمحلي ومحتاج أعرف تفاصيل الأسعار ومواعيد التصوير المتاحة.',
    },
    {
      title: 'دعم مشروع صغير وناشئ',
      desc: 'خطة إعلانية خفيفة ومناسبة للإمكانيات المحدودة.',
      message:
        'السلام عليكم يا حموكشة، عندي مشروع صغير لسه بادئ ومحتاج دعم وخطة إعلانية تناسب إمكانياتي.',
    },
    {
      title: 'تغطية افتتاح أو مهرجان خصومات',
      desc: 'حجز حضور وتصوير يوم الافتتاح لايف ومسابقات.',
      message:
        'السلام عليكم يا حموكشة، عندي افتتاح قريب وعايزك تيجي تغطي الافتتاح بفلوج وريلز.',
    },
    {
      title: 'استشارة إعلانية سريعة',
      desc: 'ناقش فكرة إعلانك واسمع نصيحة حموكشة للانتشار.',
      message:
        'السلام عليكم يا حموكشة، حابب أخد رأيك واستشارة سريعة في فكرة إعلان لمشروعي.',
    },
  ];

  return (
    <section id="contact" className="py-8 section-soft">
      <div className="site-container space-y-5">
        <div className="space-y-3 text-right">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[var(--lemon-olive-deep)]">
              تواصل مباشر عبر واتساب
            </p>
            <h2 className="text-lg font-black text-[var(--text-on-light)] leading-snug">
              تواصل مباشرة مع حموكشة
            </h2>
            <p className="text-[13px] text-[var(--text-muted-on-light)] font-medium">
              كل الحجوزات والتنسيق يتم حصراً من خلال تطبيق واتساب على الرقم الرسمي.
            </p>
          </div>

          <div className="card-dark px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <span className="text-[var(--text-muted-on-dark)] font-bold">
              الرقم الرسمي:
            </span>
            <span
              dir="ltr"
              className="font-mono text-[var(--lemon-primary)] font-black text-base tabular-nums"
            >
              {whatsappNumber}
            </span>
          </div>
        </div>

        {/* Prompt Options Phone List */}
        <div className="grid grid-cols-1 gap-2.5">
          {promptOptions.map((opt, idx) => (
            <a
              key={idx}
              href={buildWhatsAppLink(whatsappNumber, opt.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="card-dark-interactive p-3.5 rounded-2xl text-right flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-black text-[var(--lemon-bright)] text-[13px] leading-snug">
                  {opt.title}
                </h4>
                <p className="text-[11px] text-[var(--text-muted-on-dark)] leading-relaxed">
                  {opt.desc}
                </p>
              </div>
              <ArrowLeft className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
            </a>
          ))}
        </div>

        <a
          href={buildWhatsAppLink(
            whatsappNumber,
            'السلام عليكم يا حموكشة، حابب استفسر عن خدمات الإعلانات والتصوير.'
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-dark-on-soft w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-black shadow-lg cursor-pointer min-h-[44px]"
        >
          <MessageCircle className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
          <span>فتح محادثة واتساب عامة الآن</span>
        </a>
      </div>
    </section>
  );
};
