import React from 'react';
import { MapPin, Shield } from 'lucide-react';
import { SiteSettings, CoverageArea } from '../types';
import { MediaDisplay } from './common/MediaDisplay';

interface FooterProps {
  settings: SiteSettings;
  areas: CoverageArea[];
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, areas, onOpenAdmin }) => {
  return (
    <footer className="bg-[var(--bg-page)] text-[var(--text-on-dark)] py-8 border-t border-[var(--border-subtle)] text-right">
      <div className="site-container space-y-6">
        <div className="space-y-6">
          {/* Brand Summary */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-[var(--border-medium)] bg-black shrink-0">
                <MediaDisplay
                  src={settings.heroImage}
                  mediaType={settings.heroMediaType}
                  alt={settings.ownerName}
                  previewOnly
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-black text-[var(--lemon-primary)] truncate">
                  {settings.siteTitle}
                </h3>
                <p className="text-xs text-[var(--lemon-gold)] font-bold truncate">
                  {settings.tagline}
                </p>
              </div>
            </div>
            <p className="text-[13px] text-[var(--text-muted-on-dark)] leading-relaxed">
              {settings.bioText}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-[var(--lemon-bright)]">
              أقسام الموقع
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted-on-dark)] font-medium">
              <a href="#hero" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                الرئيسية
              </a>
              <a href="#offers" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                العروض والتخفيضات
              </a>
              <a href="#campaigns" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                الحملات التسويقية
              </a>
              <a href="#startups" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                دعم المشروعات
              </a>
              <a href="#reels" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                الريلز والفلوغات
              </a>
              <a href="#gallery" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                معرض الأعمال
              </a>
              <a href="#services" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                الخدمات والمناطق
              </a>
              <a href="#contact" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                تواصل واتساب
              </a>
              <a href="#reviews" className="hover:text-[var(--lemon-primary)] transition-colors py-0.5">
                تقييمات العملاء
              </a>
            </div>
          </div>

          {/* Coverage & Admin Access */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-[var(--lemon-bright)]">
              <MapPin className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
              <span>تغطية {areas.filter((a) => a.isAvailable).length} مركز بمحافظة سوهاج</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted-on-dark)] leading-relaxed">
              {areas.map((a) => a.name).join(' · ')}
            </p>

            <div className="pt-1">
              <button
                onClick={onOpenAdmin}
                className="btn-lemon-secondary w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs cursor-pointer min-h-[42px]"
              >
                <Shield className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
                <span>دخول لوحة التحكم</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-dim-on-dark)]">
          <span>
            © {new Date().getFullYear()} {settings.siteTitle}
          </span>
          <span>جهينة الغربية · محافظة سوهاج</span>
        </div>
      </div>
    </footer>
  );
};
