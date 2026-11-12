import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../types';
import { buildWhatsAppLink, PRESET_MESSAGES } from '../utils/whatsapp';

interface HeaderProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'الرئيسية', href: '#hero' },
    { label: 'العروض', href: '#offers' },
    { label: 'الحملات', href: '#campaigns' },
    { label: 'المشروعات', href: '#startups' },
    { label: 'الريلز', href: '#reels' },
    { label: 'المعرض', href: '#gallery' },
    { label: 'المراكز', href: '#services' },
    { label: 'تواصل معنا', href: '#contact' },
    { label: 'التقييمات', href: '#reviews' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Optional Announcement Strip (scrolls naturally so sticky header stays minimal on mobile) */}
      {settings.showAnnouncement && settings.announcementText && (
        <div className="bg-[var(--bg-section-olive)] text-[var(--lemon-bright)] border-b border-[var(--border-subtle)] py-2 text-xs font-medium">
          <div className="site-container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            <span className="leading-snug">{settings.announcementText}</span>
            <a
              href={buildWhatsAppLink(
                settings.whatsappNumber,
                PRESET_MESSAGES.offer('عرض الشهر الإعلاني للمشروعات')
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--lemon-primary)] hover:text-[var(--lemon-bright)] underline font-extrabold whitespace-nowrap shrink-0"
            >
              احجز العرض الآن
            </a>
          </div>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b border-[var(--border-subtle)] ${
          isScrolled ? 'shadow-lg' : ''
        }`}
        style={{ backgroundColor: 'var(--header-bg)', backdropFilter: 'blur(14px)' }}
      >
        <div className="site-container py-2.5 flex items-center justify-between gap-2">
          {/* Brand Wordmark */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#hero');
            }}
            className="text-[15px] font-black text-[var(--lemon-primary)] tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
          >
            حموكشة للإعلانات
          </a>

          {/* Actions & Drawer Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAdmin}
              className="btn-lemon-secondary flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
              title="دخول لوحة التحكم"
            >
              <ShieldCheck className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
              <span>{isAdminLoggedIn ? 'الإدارة' : 'لوحة التحكم'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[var(--lemon-primary)] bg-[var(--bg-card-dark)] border border-[var(--border-subtle)] cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="فتح القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Phone Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-center">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-full max-w-[430px] pointer-events-none z-10 h-full">
            <div className="pointer-events-auto mr-0 ml-auto w-[82%] max-w-[320px] h-full bg-[var(--bg-page)] border-l border-[var(--border-medium)] shadow-2xl p-4 flex flex-col justify-between overflow-y-auto text-right">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="font-black text-[var(--lemon-primary)] text-sm">
                      {settings.siteTitle}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted-on-dark)]">
                      جهينة · طهطا · سوهاج
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-[var(--text-on-dark)] bg-[var(--bg-card-dark)] border border-[var(--border-subtle)] cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                    aria-label="إغلاق القائمة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="w-full text-right px-3 py-2.5 text-[13px] font-bold text-[var(--text-on-dark)] hover:text-[var(--lemon-primary)] hover:bg-[var(--bg-card-dark)] rounded-xl transition-colors block cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
                <a
                  href={buildWhatsAppLink(settings.whatsappNumber, PRESET_MESSAGES.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-lemon-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold min-h-[42px]"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>محادثة واتساب: {settings.whatsappNumber}</span>
                </a>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="btn-lemon-secondary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold cursor-pointer min-h-[42px]"
                >
                  <ShieldCheck className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
                  <span>لوحة التحكم والإدارة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
