/**
 * Data structures and types for Hamoksha Advertising Platform
 */

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountBadge?: string;
  image?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  mediaGallery?: MediaItem[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priorityOrder: number;
  whatsappMessage?: string;
}

export interface Campaign {
  id: string;
  title: string;
  clientName: string;
  category: 'محلات تجارية' | 'مطاعم وكافيهات' | 'ملابس وموضة' | 'مشروعات ناشئة' | 'خدمات ومهن' | 'أخرى';
  description: string;
  location: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaGallery?: MediaItem[];
  viewsCount?: string;
  numericViews?: number;
  date: string;
  featured: boolean;
  isActive: boolean;
}

export interface Reel {
  id: string;
  title: string;
  description?: string;
  mediaType?: 'image' | 'video';
  videoUrl: string;
  thumbnailUrl: string;
  mediaGallery?: MediaItem[];
  duration?: string;
  views?: string;
  numericViews?: number;
  uploadDate: string;
  isActive: boolean;
  order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'صور إعلانية' | 'فعاليات ومهرجانات' | 'كواليس وتصوير' | 'منشورات وإعلانات';
  mediaType: 'image' | 'video';
  mediaUrl: string;
  mediaGallery?: MediaItem[];
  description: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  businessName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CoverageArea {
  id: string;
  name: string;
  isAvailable: boolean;
  notes?: string;
  icon?: string;
}

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  bioText: string;
  whatsappNumber: string;
  ownerName: string;
  locationCity: string;
  heroImage: string;
  heroMediaType?: 'image' | 'video';
  stageImage: string;
  profileImage: string;
  coverCampaignsImage?: string;
  coverStartupsImage?: string;
  coverStartupsMediaType?: 'image' | 'video';
  coverReelsImage?: string;
  announcementText?: string;
  showAnnouncement: boolean;
}

export interface AdminStats {
  totalCampaigns: number;
  activeOffers: number;
  pendingReviews: number;
  totalApprovedReviews: number;
  totalReels: number;
  totalGalleryItems: number;
}
