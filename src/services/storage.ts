import {
  Campaign,
  CoverageArea,
  GalleryItem,
  Offer,
  Reel,
  Review,
  SiteSettings,
  AdminStats,
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_COVERAGE_AREAS,
  INITIAL_GALLERY_ITEMS,
  INITIAL_OFFERS,
  INITIAL_REELS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from '../data/defaultData';

const KEYS = {
  OFFERS: 'hamoksha_offers',
  CAMPAIGNS: 'hamoksha_campaigns',
  REELS: 'hamoksha_reels',
  GALLERY: 'hamoksha_gallery',
  REVIEWS: 'hamoksha_reviews',
  AREAS: 'hamoksha_areas',
  SETTINGS: 'hamoksha_settings',
  ADMIN_AUTH: 'hamoksha_admin_auth',
  ADMIN_TOKEN: 'hamoksha_admin_token',
};

const memoryStorage = new Map<string, string>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string): void {
  memoryStorage.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // fallback already stored in memoryStorage
  }
}

function removeRaw(key: string): void {
  memoryStorage.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore in restricted contexts
  }
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = readRaw(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  try {
    writeRaw(key, JSON.stringify(value));
    window.dispatchEvent(new Event('hamoksha_storage_update'));
    return true;
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
    return false;
  }
}

export class StorageService {
  static init(): void {
    if (!readRaw(KEYS.SETTINGS)) {
      safeSet(KEYS.SETTINGS, INITIAL_SETTINGS);
    } else {
      const existingSettings = safeGet<SiteSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
      if (existingSettings.whatsappNumber === '01207820806') {
        safeSet(KEYS.SETTINGS, { ...existingSettings, whatsappNumber: INITIAL_SETTINGS.whatsappNumber });
      }
    }
    if (!readRaw(KEYS.OFFERS)) {
      safeSet(KEYS.OFFERS, INITIAL_OFFERS);
    }
    if (!readRaw(KEYS.CAMPAIGNS)) {
      safeSet(KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    }
    if (!readRaw(KEYS.REELS)) {
      safeSet(KEYS.REELS, INITIAL_REELS);
    }
    if (!readRaw(KEYS.GALLERY)) {
      safeSet(KEYS.GALLERY, INITIAL_GALLERY_ITEMS);
    }
    if (!readRaw(KEYS.REVIEWS)) {
      safeSet(KEYS.REVIEWS, INITIAL_REVIEWS);
    }
    if (!readRaw(KEYS.AREAS)) {
      safeSet(KEYS.AREAS, INITIAL_COVERAGE_AREAS);
    }
    if (!readRaw(KEYS.ADMIN_AUTH)) {
      safeSet(KEYS.ADMIN_AUTH, {
        password: 'hamoksha2026',
        question: 'ما هي بلدتك أو مدينتك المفضلة؟',
        answer: 'جهينة',
      });
    }
  }

  // --- Settings ---
  static getSettings(): SiteSettings {
    const settings = safeGet<SiteSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
    if (settings.whatsappNumber === '01207820806') {
      return { ...settings, whatsappNumber: INITIAL_SETTINGS.whatsappNumber };
    }
    return settings;
  }

  static updateSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    safeSet(KEYS.SETTINGS, updated);
    return updated;
  }

  // --- Offers ---
  static getOffers(onlyActive = false): Offer[] {
    const offers = safeGet<Offer[]>(KEYS.OFFERS, INITIAL_OFFERS);
    const sorted = [...offers].sort((a, b) => (a.priorityOrder || 0) - (b.priorityOrder || 0));
    if (!onlyActive) return sorted;
    const now = new Date().toISOString().split('T')[0];
    return sorted.filter((offer) => {
      if (!offer.isActive) return false;
      if (offer.endDate && offer.endDate < now) return false;
      return true;
    });
  }

  static saveOffer(offer: Offer): void {
    const offers = this.getOffers();
    const index = offers.findIndex((o) => o.id === offer.id);
    if (index >= 0) {
      offers[index] = offer;
    } else {
      offers.unshift({ ...offer, id: offer.id || `off-${Date.now()}` });
    }
    safeSet(KEYS.OFFERS, offers);
  }

  static deleteOffer(id: string): void {
    const offers = this.getOffers().filter((o) => o.id !== id);
    safeSet(KEYS.OFFERS, offers);
  }

  static toggleOffer(id: string): void {
    const offers = this.getOffers().map((o) =>
      o.id === id ? { ...o, isActive: !o.isActive } : o
    );
    safeSet(KEYS.OFFERS, offers);
  }

  // --- Campaigns ---
  static getCampaigns(onlyActive = false): Campaign[] {
    const campaigns = safeGet<Campaign[]>(KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    if (!onlyActive) return campaigns;
    return campaigns.filter((c) => c.isActive);
  }

  static saveCampaign(campaign: Campaign): void {
    const campaigns = this.getCampaigns();
    const index = campaigns.findIndex((c) => c.id === campaign.id);
    if (index >= 0) {
      campaigns[index] = campaign;
    } else {
      campaigns.unshift({ ...campaign, id: campaign.id || `camp-${Date.now()}` });
    }
    safeSet(KEYS.CAMPAIGNS, campaigns);
  }

  static deleteCampaign(id: string): void {
    const campaigns = this.getCampaigns().filter((c) => c.id !== id);
    safeSet(KEYS.CAMPAIGNS, campaigns);
  }

  static toggleCampaign(id: string): void {
    const campaigns = this.getCampaigns().map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    safeSet(KEYS.CAMPAIGNS, campaigns);
  }

  static incrementCampaignViews(id: string): void {
    const campaigns = this.getCampaigns();
    const index = campaigns.findIndex((c) => c.id === id);
    if (index === -1) return;

    const camp = campaigns[index];
    let count = camp.numericViews;
    if (count === undefined) {
      const match = (camp.viewsCount || '').replace(/[^\d]/g, '');
      const parsed = parseInt(match, 10);
      count = !isNaN(parsed) && parsed > 0 ? (camp.viewsCount?.includes('K') || camp.viewsCount?.includes('ألف') ? parsed * 1000 : parsed) : 25400;
    }
    count += 1;
    camp.numericViews = count;
    camp.viewsCount = count >= 1000 ? `+${(count / 1000).toFixed(1)}K` : `${count}`;
    campaigns[index] = camp;
    safeSet(KEYS.CAMPAIGNS, campaigns);
  }

  // --- Reels ---
  static getReels(onlyActive = false): Reel[] {
    const reels = safeGet<Reel[]>(KEYS.REELS, INITIAL_REELS);
    const sorted = [...reels].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!onlyActive) return sorted;
    return sorted.filter((r) => r.isActive);
  }

  static saveReel(reel: Reel): void {
    const reels = this.getReels();
    const index = reels.findIndex((r) => r.id === reel.id);
    if (index >= 0) {
      reels[index] = reel;
    } else {
      reels.push({ ...reel, id: reel.id || `reel-${Date.now()}` });
    }
    safeSet(KEYS.REELS, reels);
  }

  static deleteReel(id: string): void {
    const reels = this.getReels().filter((r) => r.id !== id);
    safeSet(KEYS.REELS, reels);
  }

  static toggleReel(id: string): void {
    const reels = this.getReels().map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    safeSet(KEYS.REELS, reels);
  }

  static incrementReelViews(id: string): void {
    const reels = this.getReels();
    const index = reels.findIndex((r) => r.id === id);
    if (index === -1) return;

    const reel = reels[index];
    let count = reel.numericViews;
    if (count === undefined) {
      const match = (reel.views || '').replace(/[^\d]/g, '');
      const parsed = parseInt(match, 10);
      count = !isNaN(parsed) && parsed > 0 ? (reel.views?.includes('K') || reel.views?.includes('ألف') ? parsed * 1000 : parsed) : 48200;
    }
    count += 1;
    reel.numericViews = count;
    reel.views = count >= 1000 ? `+${(count / 1000).toFixed(1)}K` : `${count}`;
    reels[index] = reel;
    safeSet(KEYS.REELS, reels);
  }

  // --- Gallery & Posts ---
  static getGalleryItems(onlyActive = false): GalleryItem[] {
    const items = safeGet<GalleryItem[]>(KEYS.GALLERY, INITIAL_GALLERY_ITEMS);
    if (!onlyActive) return items;
    return items.filter((item) => item.isActive !== false);
  }

  static saveGalleryItem(item: GalleryItem): void {
    const items = this.getGalleryItems();
    const index = items.findIndex((g) => g.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift({ ...item, id: item.id || `gal-${Date.now()}` });
    }
    safeSet(KEYS.GALLERY, items);
  }

  static deleteGalleryItem(id: string): void {
    const items = this.getGalleryItems().filter((g) => g.id !== id);
    safeSet(KEYS.GALLERY, items);
  }

  static toggleGalleryItem(id: string): void {
    const items = this.getGalleryItems().map((g) =>
      g.id === id ? { ...g, isActive: g.isActive === false ? true : false } : g
    );
    safeSet(KEYS.GALLERY, items);
  }

  // --- Reviews ---
  static getReviews(filterStatus?: 'pending' | 'approved' | 'rejected'): Review[] {
    const reviews = safeGet<Review[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
    if (!filterStatus) return reviews;
    return reviews.filter((r) => r.status === filterStatus);
  }

  static addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    reviews.unshift(newReview);
    safeSet(KEYS.REVIEWS, reviews);
    return newReview;
  }

  static setReviewStatus(id: string, status: 'approved' | 'rejected'): void {
    const reviews = this.getReviews().map((r) =>
      r.id === id ? { ...r, status } : r
    );
    safeSet(KEYS.REVIEWS, reviews);
  }

  static deleteReview(id: string): void {
    const reviews = this.getReviews().filter((r) => r.id !== id);
    safeSet(KEYS.REVIEWS, reviews);
  }

  // --- Coverage Areas ---
  static getAreas(): CoverageArea[] {
    return safeGet<CoverageArea[]>(KEYS.AREAS, INITIAL_COVERAGE_AREAS);
  }

  static toggleArea(id: string): void {
    const areas = this.getAreas().map((a) =>
      a.id === id ? { ...a, isAvailable: !a.isAvailable } : a
    );
    safeSet(KEYS.AREAS, areas);
  }

  static updateAreaNotes(id: string, notes: string): void {
    const areas = this.getAreas().map((a) =>
      a.id === id ? { ...a, notes } : a
    );
    safeSet(KEYS.AREAS, areas);
  }

  // --- Stats ---
  static getStats(): AdminStats {
    const campaigns = this.getCampaigns();
    const offers = this.getOffers(true);
    const reviews = this.getReviews();
    const reels = this.getReels(true);
    const gallery = this.getGalleryItems(true);

    return {
      totalCampaigns: campaigns.length,
      activeOffers: offers.length,
      pendingReviews: reviews.filter((r) => r.status === 'pending').length,
      totalApprovedReviews: reviews.filter((r) => r.status === 'approved').length,
      totalReels: reels.length,
      totalGalleryItems: gallery.length,
    };
  }

  // --- Auth & Security ---
  static verifyPassword(password: string): boolean {
    const auth = safeGet(KEYS.ADMIN_AUTH, { password: 'hamoksha2026', question: '', answer: '' });
    return auth.password === password;
  }

  static changePassword(oldPass: string, newPass: string): { success: boolean; error?: string } {
    const auth = safeGet(KEYS.ADMIN_AUTH, { password: 'hamoksha2026', question: '', answer: '' });
    if (auth.password !== oldPass) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة.' };
    }
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, error: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف أو أرقام على الأقل.' };
    }
    auth.password = newPass.trim();
    safeSet(KEYS.ADMIN_AUTH, auth);
    return { success: true };
  }

  static getSecurityQuestion(): string {
    const auth = safeGet(KEYS.ADMIN_AUTH, { question: 'ما هي بلدتك أو مدينتك المفضلة؟' });
    return auth.question || 'ما هي بلدتك أو مدينتك المفضلة؟';
  }

  static resetPasswordWithSecurityAnswer(answer: string, newPass: string): { success: boolean; error?: string } {
    const auth = safeGet(KEYS.ADMIN_AUTH, { password: 'hamoksha2026', question: '', answer: 'جهينة' });
    if (auth.answer.trim().toLowerCase() !== answer.trim().toLowerCase()) {
      return { success: false, error: 'إجابة سؤال الأمان غير صحيحة.' };
    }
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, error: 'يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.' };
    }
    auth.password = newPass.trim();
    safeSet(KEYS.ADMIN_AUTH, auth);
    return { success: true };
  }

  static setLoginSession(isLoggedIn: boolean): void {
    if (isLoggedIn) {
      writeRaw(KEYS.ADMIN_TOKEN, `token_${Date.now()}`);
    } else {
      removeRaw(KEYS.ADMIN_TOKEN);
    }
  }

  static isAuthenticated(): boolean {
    return !!readRaw(KEYS.ADMIN_TOKEN);
  }

  // Backup & Restore
  static exportFullBackup(): string {
    return JSON.stringify(
      {
        version: '1.1.0',
        exportedAt: new Date().toISOString(),
        settings: this.getSettings(),
        offers: this.getOffers(),
        campaigns: this.getCampaigns(),
        reels: this.getReels(),
        gallery: this.getGalleryItems(),
        reviews: this.getReviews(),
        areas: this.getAreas(),
      },
      null,
      2
    );
  }

  static importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) safeSet(KEYS.SETTINGS, data.settings);
      if (data.offers) safeSet(KEYS.OFFERS, data.offers);
      if (data.campaigns) safeSet(KEYS.CAMPAIGNS, data.campaigns);
      if (data.reels) safeSet(KEYS.REELS, data.reels);
      if (data.gallery) safeSet(KEYS.GALLERY, data.gallery);
      if (data.reviews) safeSet(KEYS.REVIEWS, data.reviews);
      if (data.areas) safeSet(KEYS.AREAS, data.areas);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  static resetToDefaults(): void {
    safeSet(KEYS.SETTINGS, INITIAL_SETTINGS);
    safeSet(KEYS.OFFERS, INITIAL_OFFERS);
    safeSet(KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
    safeSet(KEYS.REELS, INITIAL_REELS);
    safeSet(KEYS.GALLERY, INITIAL_GALLERY_ITEMS);
    safeSet(KEYS.REVIEWS, INITIAL_REVIEWS);
    safeSet(KEYS.AREAS, INITIAL_COVERAGE_AREAS);
  }
}
