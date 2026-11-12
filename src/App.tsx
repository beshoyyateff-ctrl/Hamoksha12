/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { Campaign, CoverageArea, GalleryItem, Offer, Reel, Review, SiteSettings } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OffersBanner } from './components/OffersBanner';
import { CampaignsSection } from './components/CampaignsSection';
import { StartupsSupportSection } from './components/StartupsSupportSection';
import { ReelsSection } from './components/ReelsSection';
import { GallerySection } from './components/GallerySection';
import { ServicesAndCoverage } from './components/ServicesAndCoverage';
import { WhatsAppContact } from './components/WhatsAppContact';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(StorageService.getSettings());
  const [offers, setOffers] = useState<Offer[]>(StorageService.getOffers(true));
  const [campaigns, setCampaigns] = useState<Campaign[]>(StorageService.getCampaigns(true));
  const [reels, setReels] = useState<Reel[]>(StorageService.getReels(true));
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(StorageService.getGalleryItems(true));
  const [reviews, setReviews] = useState<Review[]>(StorageService.getReviews());
  const [areas, setAreas] = useState<CoverageArea[]>(StorageService.getAreas());

  // Admin portal state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(StorageService.isAuthenticated());
  const [adminLaunchConfig, setAdminLaunchConfig] = useState<{
    tab: 'overview' | 'campaigns';
    autoOpenNewCampaign: boolean;
  }>({ tab: 'overview', autoOpenNewCampaign: false });

  // Sync state from storage
  const syncData = () => {
    setSettings(StorageService.getSettings());
    setOffers(StorageService.getOffers(true));
    setCampaigns(StorageService.getCampaigns(true));
    setReels(StorageService.getReels(true));
    setGalleryItems(StorageService.getGalleryItems(true));
    setReviews(StorageService.getReviews());
    setAreas(StorageService.getAreas());
    setIsAdminLoggedIn(StorageService.isAuthenticated());
  };

  useEffect(() => {
    StorageService.init();
    syncData();

    const handleStorageUpdate = () => {
      syncData();
    };
    window.addEventListener('hamoksha_storage_update', handleStorageUpdate);

    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setIsAdminOpen(true);
      } else if (hash && hash.length > 1) {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHashNavigation();

    const handleHashChange = () => {
      handleHashNavigation();
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hamoksha_storage_update', handleStorageUpdate);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleOpenAdmin = () => {
    setAdminLaunchConfig({ tab: 'overview', autoOpenNewCampaign: false });
    setIsAdminOpen(true);
  };

  const handleOpenAddCampaign = () => {
    setAdminLaunchConfig({ tab: 'campaigns', autoOpenNewCampaign: true });
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    setAdminLaunchConfig({ tab: 'overview', autoOpenNewCampaign: false });
    if (window.location.hash === '#admin') {
      try {
        if (window.location.protocol === 'file:') {
          window.location.hash = '';
        } else {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch {
        window.location.hash = '';
      }
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    StorageService.setLoginSession(false);
    setIsAdminLoggedIn(false);
    handleCloseAdmin();
  };

  const scrollToCampaigns = () => {
    const el = document.getElementById('campaigns');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStartups = () => {
    const el = document.getElementById('startups');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="phone-shell text-[var(--text-on-dark)] font-sans selection:bg-[var(--lemon-primary)] selection:text-[var(--text-on-lemon)] flex flex-col justify-between relative">
      {/* Header & Sticky Navigation */}
      <Header
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Sections */}
      <main className="w-full flex-1">
        {/* 1. Hero Section */}
        <Hero
          settings={settings}
          onExploreCampaigns={scrollToCampaigns}
          onExploreStartups={scrollToStartups}
        />

        {/* 2. Offers & Promotions Banner */}
        <OffersBanner
          offers={offers}
          whatsappNumber={settings.whatsappNumber}
        />

        {/* 3. Marketing Campaigns Showcase */}
        <CampaignsSection
          campaigns={campaigns}
          whatsappNumber={settings.whatsappNumber}
          onAddCampaign={handleOpenAddCampaign}
        />

        {/* 4. Small Businesses & Startups Support */}
        <StartupsSupportSection settings={settings} />

        {/* 5. Reels & Daily Vlogs Stories Bar */}
        <ReelsSection
          reels={reels}
          whatsappNumber={settings.whatsappNumber}
        />

        {/* 6. Media Gallery & Events */}
        <GallerySection items={galleryItems} />

        {/* 7. Services & Coverage Areas (13 Sohag districts) */}
        <ServicesAndCoverage
          areas={areas}
          whatsappNumber={settings.whatsappNumber}
        />

        {/* 8. WhatsApp Exclusive Contact Prompts */}
        <WhatsAppContact whatsappNumber={settings.whatsappNumber} />

        {/* 9. Reviews Section */}
        <ReviewsSection
          reviews={reviews}
          onReviewSubmitted={syncData}
        />
      </main>

      {/* 10. Footer */}
      <Footer
        settings={settings}
        areas={areas}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Admin Portal Modal / Dashboard */}
      {isAdminOpen && (
        <>
          {!isAdminLoggedIn ? (
            <AdminLogin
              onSuccess={handleAdminLoginSuccess}
              onCancel={handleCloseAdmin}
            />
          ) : (
            <AdminDashboard
              onClose={handleCloseAdmin}
              onLogout={handleAdminLogout}
              initialTab={adminLaunchConfig.tab}
              autoOpenNewCampaign={adminLaunchConfig.autoOpenNewCampaign}
            />
          )}
        </>
      )}
    </div>
  );
}
