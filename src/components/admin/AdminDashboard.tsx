import React, { useState, useEffect } from 'react';
import {
  Tag,
  Video,
  Film,
  Star,
  Settings,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Eye,
  LogOut,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import {
  AdminStats,
  Campaign,
  CoverageArea,
  GalleryItem,
  Offer,
  Reel,
  Review,
  SiteSettings,
} from '../../types';
import { StorageService } from '../../services/storage';
import { HAMOKSHA_IMAGES } from '../../data/defaultData';
import { DeviceMediaPicker } from '../common/DeviceMediaPicker';
import { MediaDisplay } from '../common/MediaDisplay';
import { isVideoSource } from '../../utils/fileUpload';

interface AdminDashboardProps {
  onClose: () => void;
  onLogout: () => void;
  initialTab?: TabType;
  autoOpenNewCampaign?: boolean;
}

type TabType =
  | 'overview'
  | 'offers'
  | 'campaigns'
  | 'reels'
  | 'gallery'
  | 'reviews'
  | 'content'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onLogout,
  initialTab = 'overview',
  autoOpenNewCampaign = false,
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>(initialTab);

  const [stats, setStats] = useState<AdminStats>(StorageService.getStats());
  const [offers, setOffers] = useState<Offer[]>(StorageService.getOffers());
  const [campaigns, setCampaigns] = useState<Campaign[]>(StorageService.getCampaigns());
  const [reels, setReels] = useState<Reel[]>(StorageService.getReels());
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(StorageService.getGalleryItems());
  const [reviews, setReviews] = useState<Review[]>(StorageService.getReviews());
  const [areas, setAreas] = useState<CoverageArea[]>(StorageService.getAreas());
  const [settings, setSettings] = useState<SiteSettings>(StorageService.getSettings());

  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Modals state
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(
    autoOpenNewCampaign
      ? {
          category: 'محلات تجارية',
          isActive: true,
          featured: true,
          mediaType: 'image',
          mediaUrl: HAMOKSHA_IMAGES.hero,
          location: 'جهينة الغربية',
        }
      : null
  );
  const [editingReel, setEditingReel] = useState<Partial<Reel> | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<Partial<GalleryItem> | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: string;
    id: string;
    name: string;
  } | null>(null);

  const [actionToast, setActionToast] = useState<string | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Settings form state
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const refreshData = () => {
    setStats(StorageService.getStats());
    setOffers(StorageService.getOffers());
    setCampaigns(StorageService.getCampaigns());
    setReels(StorageService.getReels());
    setGalleryItems(StorageService.getGalleryItems());
    setReviews(StorageService.getReviews());
    setAreas(StorageService.getAreas());
    const s = StorageService.getSettings();
    setSettings(s);
    setTempSettings(s);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Offers Handlers ---
  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer || !editingOffer.title || !editingOffer.description) return;

    const media = editingOffer.mediaUrl || editingOffer.image || '';
    const mType = editingOffer.mediaType || (isVideoSource(media) ? 'video' : 'image');

    StorageService.saveOffer({
      id: editingOffer.id || `off-${Date.now()}`,
      title: editingOffer.title,
      description: editingOffer.description,
      discountBadge: editingOffer.discountBadge || '',
      image: media,
      mediaUrl: media,
      mediaType: mType,
      mediaGallery: editingOffer.mediaGallery || [],
      startDate: editingOffer.startDate || '',
      endDate: editingOffer.endDate || '',
      isActive: editingOffer.isActive ?? true,
      priorityOrder: editingOffer.priorityOrder || offers.length + 1,
      whatsappMessage: editingOffer.whatsappMessage,
    });
    setEditingOffer(null);
    refreshData();
    showToast('تم حفظ العرض الترويجي بنجاح');
  };

  // --- Campaigns Handlers ---
  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign || !editingCampaign.title || !editingCampaign.clientName) return;

    const chosenMedia = editingCampaign.mediaUrl || HAMOKSHA_IMAGES.hero;
    const detectedType = editingCampaign.mediaType || (isVideoSource(chosenMedia) ? 'video' : 'image');

    StorageService.saveCampaign({
      id: editingCampaign.id || `camp-${Date.now()}`,
      title: editingCampaign.title,
      clientName: editingCampaign.clientName,
      category: editingCampaign.category || 'محلات تجارية',
      description: editingCampaign.description || '',
      location: editingCampaign.location || 'جهينة الغربية',
      mediaType: detectedType,
      mediaUrl: chosenMedia,
      thumbnailUrl: editingCampaign.thumbnailUrl,
      mediaGallery: editingCampaign.mediaGallery || [],
      viewsCount: editingCampaign.viewsCount || '+50 ألف',
      date: editingCampaign.date || 'نوفمبر 2026',
      featured: editingCampaign.featured ?? true,
      isActive: editingCampaign.isActive ?? true,
    });
    setEditingCampaign(null);
    refreshData();
    showToast('تم حفظ الحملة الإعلانية بنجاح');
  };

  // --- Reels Handlers ---
  const handleSaveReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel || !editingReel.title) return;

    const mainUrl = editingReel.videoUrl || editingReel.thumbnailUrl || HAMOKSHA_IMAGES.profile;
    const mType = editingReel.mediaType || (editingReel.videoUrl ? 'video' : 'image');

    StorageService.saveReel({
      id: editingReel.id || `reel-${Date.now()}`,
      title: editingReel.title,
      description: editingReel.description || '',
      mediaType: mType,
      videoUrl: mainUrl,
      thumbnailUrl: editingReel.thumbnailUrl || HAMOKSHA_IMAGES.profile,
      mediaGallery: editingReel.mediaGallery || [],
      duration: editingReel.duration || '0:45',
      views: editingReel.views || '50K',
      uploadDate: editingReel.uploadDate || 'اليوم',
      isActive: editingReel.isActive ?? true,
      order: editingReel.order || reels.length + 1,
    });
    setEditingReel(null);
    refreshData();
    showToast('تم حفظ الريل بنجاح');
  };

  // --- Gallery & Posts Handlers ---
  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem || !editingGalleryItem.title) return;

    const chosenMedia = editingGalleryItem.mediaUrl || HAMOKSHA_IMAGES.stage;
    const detectedType = editingGalleryItem.mediaType || (isVideoSource(chosenMedia) ? 'video' : 'image');

    StorageService.saveGalleryItem({
      id: editingGalleryItem.id || `gal-${Date.now()}`,
      title: editingGalleryItem.title,
      category: editingGalleryItem.category || 'منشورات وإعلانات',
      mediaType: detectedType,
      mediaUrl: chosenMedia,
      mediaGallery: editingGalleryItem.mediaGallery || [],
      description: editingGalleryItem.description || '',
      createdAt: editingGalleryItem.createdAt || new Date().toISOString().split('T')[0],
      isActive: editingGalleryItem.isActive ?? true,
    });
    setEditingGalleryItem(null);
    refreshData();
    showToast('تم حفظ المنشور في المعرض بنجاح');
  };

  // --- Review Handlers ---
  const handleReviewStatus = (id: string, status: 'approved' | 'rejected') => {
    StorageService.setReviewStatus(id, status);
    refreshData();
  };

  // --- Delete Handler ---
  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    const { type, id } = deleteConfirmation;
    if (type === 'offer') StorageService.deleteOffer(id);
    if (type === 'campaign') StorageService.deleteCampaign(id);
    if (type === 'reel') StorageService.deleteReel(id);
    if (type === 'gallery') StorageService.deleteGalleryItem(id);
    if (type === 'review') StorageService.deleteReview(id);
    setDeleteConfirmation(null);
    refreshData();
    showToast('تم الحذف بنجاح');
  };

  // --- Settings Save ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSettings(tempSettings);
    refreshData();
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // --- Password Change ---
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'كلمة المرور الجديدة غير متطابقة مع التأكيد.' });
      return;
    }
    const res = StorageService.changePassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordStatus({ success: 'تم تحديث كلمة المرور بنجاح!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({ error: res.error || 'تعذر تغيير كلمة المرور.' });
    }
  };

  // --- Backup Export / Import ---
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hamoksha-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && StorageService.importFullBackup(content)) {
        refreshData();
        showToast('تم استيراد البيانات والنسخة الاحتياطية بنجاح!');
      } else {
        showToast('فشل استيراد الملف، تأكد من صحة تنسيق JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-page)] text-right text-[var(--text-on-dark)]">
      <div className="max-w-[430px] mx-auto w-full min-h-screen bg-[var(--bg-section-dark)] flex flex-col justify-start border-x border-[var(--border-subtle)]">
        {/* Top Admin Header Bar */}
        <div className="sticky top-0 z-20 bg-[var(--bg-page)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] px-3.5 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--lemon-primary)] text-[#141b05] flex items-center justify-center font-black shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-[var(--text-on-dark)] truncate">
                لوحة تحكم حموكشة
              </h2>
              <p className="text-[11px] text-[var(--text-muted-on-dark)] truncate">
                رفع الصور والفيديوهات والإدارة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onClose}
              className="btn-lemon-secondary flex items-center gap-1 text-xs px-2.5 py-2 rounded-xl cursor-pointer min-h-[38px]"
            >
              <Eye className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
              <span>الموقع</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/80 text-xs font-bold px-2.5 py-2 rounded-xl cursor-pointer min-h-[38px]"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 bg-[var(--bg-section-dark)]">
          <div className="site-container py-4 space-y-5">
            {actionToast && (
              <div className="p-3 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--lemon-primary)] text-[var(--lemon-bright)] text-xs font-bold flex items-center justify-between gap-2">
                <span>{actionToast}</span>
                <button onClick={() => setActionToast(null)} className="cursor-pointer shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="w-full overflow-x-auto pb-2 border-b border-[var(--border-subtle)] no-scrollbar">
              <div className="flex items-center gap-1.5 w-max">
                {[
                  { id: 'overview', label: 'نظرة عامة', icon: Star },
                  { id: 'campaigns', label: `الحملات (${campaigns.length})`, icon: Video },
                  { id: 'reels', label: `الريلز (${reels.length})`, icon: Film },
                  { id: 'offers', label: `العروض (${offers.length})`, icon: Tag },
                  { id: 'gallery', label: `المعرض (${galleryItems.length})`, icon: ImageIcon },
                  {
                    id: 'reviews',
                    label: `التقييمات (${reviews.length})${
                      stats.pendingReviews > 0 ? ` · ${stats.pendingReviews}` : ''
                    }`,
                    icon: Star,
                  },
                  { id: 'content', label: 'المحتوى والمناطق', icon: Settings },
                  { id: 'security', label: 'الأمان والنسخ', icon: Shield },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id as TabType)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border min-h-[40px] ${
                        currentTab === tab.id
                          ? 'btn-lemon-primary'
                          : 'bg-[var(--bg-card-dark)] text-[var(--text-muted-on-dark)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:text-[var(--text-on-dark)]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {currentTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-dark p-3.5 rounded-2xl text-right space-y-1">
                    <span className="text-xs font-bold text-[var(--text-muted-on-dark)] block">
                      الحملات
                    </span>
                    <div className="text-2xl font-black text-[var(--text-on-dark)] tabular-nums">
                      {stats.totalCampaigns}
                    </div>
                    <span className="text-[11px] text-[var(--lemon-olive)] font-medium block">
                      حملة مسجلة
                    </span>
                  </div>

                  <div className="card-dark p-3.5 rounded-2xl text-right space-y-1">
                    <span className="text-xs font-bold text-[var(--text-muted-on-dark)] block">
                      العروض النشطة
                    </span>
                    <div className="text-2xl font-black text-[var(--lemon-primary)] tabular-nums">
                      {stats.activeOffers}
                    </div>
                    <span className="text-[11px] text-[var(--lemon-olive)] font-medium block">
                      ظاهرة للزوار
                    </span>
                  </div>

                  <div className="card-dark p-3.5 rounded-2xl text-right space-y-1">
                    <span className="text-xs font-bold text-[var(--text-muted-on-dark)] block">
                      الريلز والفلوغات
                    </span>
                    <div className="text-2xl font-black text-[var(--lemon-primary)] tabular-nums">
                      {stats.totalReels}
                    </div>
                    <span className="text-[11px] text-[var(--lemon-olive)] font-medium block">
                      مقطع وحالة
                    </span>
                  </div>

                  <div className="card-dark p-3.5 rounded-2xl text-right space-y-1">
                    <span className="text-xs font-bold text-[var(--text-muted-on-dark)] block">
                      المعرض والمنشورات
                    </span>
                    <div className="text-2xl font-black text-[var(--lemon-gold)] tabular-nums">
                      {stats.totalGalleryItems}
                    </div>
                    <span className="text-[11px] text-[var(--lemon-olive)] font-medium block">
                      صورة وفيديو
                    </span>
                  </div>

                  <div className="col-span-2 card-dark p-3.5 rounded-2xl border-[var(--border-medium)] text-right flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[var(--lemon-bright)] block">
                        تقييمات قيد المراجعة: {stats.pendingReviews}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted-on-dark)]">
                        لا تظهر للزوار إلا بعد الموافقة
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentTab('reviews');
                        setReviewFilter('pending');
                      }}
                      className="btn-lemon-secondary text-xs px-3 py-2 rounded-xl font-extrabold shrink-0 cursor-pointer"
                    >
                      مراجعة الآن
                    </button>
                  </div>
                </div>

                <div className="card-dark p-4 rounded-3xl space-y-3.5">
                  <div className="space-y-1">
                    <h3 className="font-black text-[var(--text-on-dark)] text-base">
                      إجراءات سريعة (صور أو فيديوهات)
                    </h3>
                    <p className="text-xs text-[var(--text-muted-on-dark)]">
                      كل الأقسام تدعم رفع الصور والفيديوهات من جهازك مع الحفظ الدائم
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => {
                      setCurrentTab('campaigns');
                      setEditingCampaign({
                        category: 'محلات تجارية',
                        isActive: true,
                        featured: true,
                        location: 'جهينة الغربية',
                        mediaType: 'image',
                      });
                    }}
                    className="p-4 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--lemon-primary)] transition-colors text-right flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-[var(--lemon-bright)] text-sm">
                        إضافة حملة إعلانية
                      </h4>
                      <p className="text-xs text-[var(--text-muted-on-dark)] mt-0.5">
                        رفع صورة أو فيديو للمحل
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-[var(--lemon-primary)] shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('reels');
                      setEditingReel({
                        isActive: true,
                        mediaType: 'video',
                        order: reels.length + 1,
                        duration: '0:45',
                        views: '50K',
                        uploadDate: 'اليوم',
                      });
                    }}
                    className="p-4 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--lemon-primary)] transition-colors text-right flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-[var(--lemon-bright)] text-sm">
                        إضافة ريلز / فلوج
                      </h4>
                      <p className="text-xs text-[var(--text-muted-on-dark)] mt-0.5">
                        رفع فيديو أو صورة ستوري
                      </p>
                    </div>
                    <Film className="w-5 h-5 text-[var(--lemon-primary)] shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('offers');
                      setEditingOffer({ isActive: true, priorityOrder: offers.length + 1 });
                    }}
                    className="p-4 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--lemon-primary)] transition-colors text-right flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-[var(--lemon-bright)] text-sm">
                        إضافة عرض خصم
                      </h4>
                      <p className="text-xs text-[var(--text-muted-on-dark)] mt-0.5">
                        مع إمكانية إرفاق صورة أو فيديو
                      </p>
                    </div>
                    <Tag className="w-5 h-5 text-[var(--lemon-primary)] shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab('gallery');
                      setEditingGalleryItem({
                        category: 'منشورات وإعلانات',
                        mediaType: 'image',
                        isActive: true,
                      });
                    }}
                    className="p-4 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--border-subtle)] hover:border-[var(--lemon-primary)] transition-colors text-right flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-[var(--lemon-bright)] text-sm">
                        إضافة للمعرض والمنشورات
                      </h4>
                      <p className="text-xs text-[var(--text-muted-on-dark)] mt-0.5">
                        كواليس أو منشورات بوسائط متعددة
                      </p>
                    </div>
                    <ImageIcon className="w-5 h-5 text-[var(--lemon-primary)] shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFERS */}
          {currentTab === 'offers' && (
            <div className="space-y-4">
              <div className="card-dark p-4 rounded-3xl space-y-3">
                <div>
                  <h3 className="font-black text-[var(--text-on-dark)] text-base">
                    العروض والتخفيضات الترويجية
                  </h3>
                  <p className="text-xs text-[var(--text-muted-on-dark)]">
                    يمكنك إرفاق صورة أو فيديو توضيحي لكل عرض من جهازك
                  </p>
                </div>
                <button
                  onClick={() => setEditingOffer({ isActive: true, priorityOrder: offers.length + 1 })}
                  className="btn-lemon-primary w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs cursor-pointer min-h-[42px]"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>إضافة عرض جديد</span>
                </button>
              </div>

              {offers.length === 0 ? (
                <div className="card-dark p-8 rounded-3xl text-center text-[var(--text-muted-on-dark)] text-sm">
                  لا توجد عروض حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {offers.map((offer) => {
                    const offerMedia = offer.mediaUrl || offer.image;
                    return (
                      <div
                        key={offer.id}
                        className={`card-dark p-5 rounded-3xl text-right space-y-3 flex flex-col justify-between ${
                          offer.isActive ? '' : 'opacity-65'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {offerMedia && (
                            <div className="rounded-2xl overflow-hidden aspect-16/9 bg-black border border-[var(--border-subtle)]">
                              <MediaDisplay
                                src={offerMedia}
                                mediaType={offer.mediaType}
                                alt={offer.title}
                                previewOnly
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[var(--lemon-gold)]">
                              {offer.discountBadge || 'عرض خاص'}
                            </span>
                            <span className="text-[var(--lemon-bright)]">
                              {offer.isActive ? 'مفعل' : 'معطل'}
                            </span>
                          </div>

                          <h4 className="font-black text-[var(--text-on-dark)] text-base">
                            {offer.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-[var(--text-muted-on-dark)] leading-relaxed">
                            {offer.description}
                          </p>

                          {offer.endDate && (
                            <span className="text-xs text-[var(--text-dim-on-dark)] block tabular-nums">
                              ساري حتى: {offer.endDate}
                            </span>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingOffer(offer)}
                              className="btn-lemon-secondary p-2 rounded-xl cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                              title="تعديل"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                StorageService.toggleOffer(offer.id);
                                refreshData();
                              }}
                              className="btn-lemon-secondary text-xs px-3 py-2 rounded-xl cursor-pointer"
                            >
                              {offer.isActive ? 'تعطيل' : 'تفعيل'}
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'offer',
                                id: offer.id,
                                name: offer.title,
                              })
                            }
                            className="p-2 text-red-400 hover:bg-red-950/60 rounded-xl cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAMPAIGNS */}
          {currentTab === 'campaigns' && (
            <div className="space-y-4">
              <div className="card-dark p-4 rounded-3xl space-y-3">
                <div>
                  <h3 className="font-black text-[var(--text-on-dark)] text-base">
                    الحملات التسويقية ونماذج الأعمال
                  </h3>
                  <p className="text-xs text-[var(--text-muted-on-dark)]">
                    ارفع صورة أو فيديو (أو أكثر من ملف) مباشرة من معرض جهازك
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingCampaign({
                      category: 'محلات تجارية',
                      isActive: true,
                      featured: true,
                      mediaType: 'image',
                      mediaUrl: HAMOKSHA_IMAGES.hero,
                      location: 'جهينة الغربية',
                    })
                  }
                  className="btn-lemon-primary w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs cursor-pointer min-h-[42px]"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>إضافة حملة (صورة أو فيديو)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className={`card-dark rounded-3xl overflow-hidden text-right flex flex-col justify-between ${
                      camp.isActive ? '' : 'opacity-65'
                    }`}
                  >
                    <div>
                      <div className="aspect-16/10 bg-black relative">
                        <MediaDisplay
                          src={camp.mediaUrl}
                          mediaType={camp.mediaType}
                          poster={camp.thumbnailUrl}
                          alt={camp.title}
                          previewOnly
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-black/75 text-[var(--lemon-bright)] text-xs font-bold px-2.5 py-1 rounded-lg">
                          {isVideoSource(camp.mediaUrl, camp.mediaType) ? 'فيديو' : 'صورة'} ·{' '}
                          {camp.category}
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-[var(--lemon-olive)] font-bold">
                          <span>
                            {camp.clientName} · {camp.location}
                          </span>
                          <span className="text-[var(--lemon-primary)] tabular-nums">
                            {camp.viewsCount || '0'}
                          </span>
                        </div>
                        <h4 className="font-black text-[var(--text-on-dark)] text-sm leading-snug">
                          {camp.title}
                        </h4>
                        <p className="text-xs text-[var(--text-muted-on-dark)] line-clamp-2">
                          {camp.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingCampaign(camp)}
                          className="btn-lemon-secondary p-2 rounded-xl cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            StorageService.toggleCampaign(camp.id);
                            refreshData();
                          }}
                          className="btn-lemon-secondary text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          {camp.isActive ? 'نشط' : 'موقف'}
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            type: 'campaign',
                            id: camp.id,
                            name: camp.title,
                          })
                        }
                        className="p-2 text-red-400 hover:bg-red-950/60 rounded-xl cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REELS & VLOGS */}
          {currentTab === 'reels' && (
            <div className="space-y-4">
              <div className="card-dark p-4 rounded-3xl space-y-3">
                <div>
                  <h3 className="font-black text-[var(--text-on-dark)] text-base">
                    الريلز والفلوغات اليومية
                  </h3>
                  <p className="text-xs text-[var(--text-muted-on-dark)]">
                    ارفع مقاطع الفيديو أو الصور القصيرة وصور الأغلفة مباشرة من جهازك
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingReel({
                      isActive: true,
                      mediaType: 'video',
                      order: reels.length + 1,
                      thumbnailUrl: HAMOKSHA_IMAGES.profile,
                      duration: '0:50',
                      views: '50K',
                      uploadDate: 'اليوم',
                    })
                  }
                  className="btn-lemon-primary w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs cursor-pointer min-h-[42px]"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>إضافة ريل جديد (فيديو أو صورة)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {reels.map((reel) => (
                  <div
                    key={reel.id}
                    className={`card-dark rounded-3xl overflow-hidden text-right flex flex-col justify-between ${
                      reel.isActive ? '' : 'opacity-65'
                    }`}
                  >
                    <div>
                      <div className="aspect-9/12 bg-black relative">
                        <MediaDisplay
                          src={reel.thumbnailUrl || reel.videoUrl}
                          mediaType={reel.thumbnailUrl ? 'image' : reel.mediaType}
                          alt={reel.title}
                          previewOnly
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-[var(--lemon-gold)] font-bold">
                          <span>{reel.uploadDate}</span>
                          <span className="tabular-nums">{reel.views || '0'}</span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-[var(--text-on-dark)] line-clamp-2">
                          {reel.title}
                        </h4>
                      </div>
                    </div>

                    <div className="p-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingReel(reel)}
                          className="btn-lemon-secondary p-1.5 rounded-lg cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            StorageService.toggleReel(reel.id);
                            refreshData();
                          }}
                          className="btn-lemon-secondary text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          {reel.isActive ? 'نشط' : 'معطل'}
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          setDeleteConfirmation({ type: 'reel', id: reel.id, name: reel.title })
                        }
                        className="p-1.5 text-red-400 hover:bg-red-950/60 rounded-lg cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY & POSTS */}
          {currentTab === 'gallery' && (
            <div className="space-y-4">
              <div className="card-dark p-4 rounded-3xl space-y-3">
                <div>
                  <h3 className="font-black text-[var(--text-on-dark)] text-base">
                    معرض الأعمال والمنشورات والإعلانات
                  </h3>
                  <p className="text-xs text-[var(--text-muted-on-dark)]">
                    أضف صوراً أو فيديوهات جديدة للمعرض مع دعم تعدد الوسائط داخل المنشور
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingGalleryItem({
                      category: 'منشورات وإعلانات',
                      mediaType: 'image',
                      isActive: true,
                    })
                  }
                  className="btn-lemon-primary w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs cursor-pointer min-h-[42px]"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>إضافة منشور / وسائط للمعرض</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`card-dark rounded-3xl overflow-hidden text-right flex flex-col justify-between ${
                      item.isActive === false ? 'opacity-65' : ''
                    }`}
                  >
                    <div>
                      <div className="aspect-4/3 bg-black relative">
                        <MediaDisplay
                          src={item.mediaUrl}
                          mediaType={item.mediaType}
                          alt={item.title}
                          previewOnly
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/75 text-[var(--lemon-bright)] text-[11px] font-bold px-2 py-0.5 rounded-lg">
                          {item.mediaType === 'video' ? 'فيديو' : 'صورة'} · {item.category}
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-[var(--text-on-dark)] line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-xs text-[var(--text-muted-on-dark)] line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingGalleryItem(item)}
                          className="btn-lemon-secondary p-1.5 rounded-lg cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            StorageService.toggleGalleryItem(item.id);
                            refreshData();
                          }}
                          className="btn-lemon-secondary text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          {item.isActive === false ? 'مخفي' : 'ظاهر'}
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            type: 'gallery',
                            id: item.id,
                            name: item.title,
                          })
                        }
                        className="p-1.5 text-red-400 hover:bg-red-950/60 rounded-lg cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS MODERATION */}
          {currentTab === 'reviews' && (
            <div className="space-y-4">
              <div className="card-dark p-4 rounded-3xl flex flex-col gap-3">
                <div>
                  <h3 className="font-black text-[var(--text-on-dark)] text-base">
                    مراجعة واعتماد تقييمات العملاء
                  </h3>
                  <p className="text-xs text-[var(--text-muted-on-dark)]">
                    التقييمات الجديدة لا تظهر للعامة إلا بعد موافقتك هنا
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1 bg-[var(--bg-section-dark)] p-1.5 rounded-xl border border-[var(--border-subtle)]">
                  {[
                    { id: 'pending', label: 'بانتظار الموافقة' },
                    { id: 'approved', label: 'مقبولة' },
                    { id: 'rejected', label: 'مرفوضة' },
                    { id: 'all', label: 'الكل' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setReviewFilter(f.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        reviewFilter === f.id
                          ? 'bg-[var(--lemon-primary)] text-[#141b05] font-black'
                          : 'text-[var(--text-muted-on-dark)] hover:text-[var(--text-on-dark)]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const list = reviews.filter((r) => {
                  if (reviewFilter === 'all') return true;
                  return r.status === reviewFilter;
                });

                if (list.length === 0) {
                  return (
                    <div className="card-dark p-8 rounded-3xl text-center text-[var(--text-muted-on-dark)] text-sm">
                      لا توجد تقييمات مطابقة لهذا الفلتر حالياً.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {list.map((rev) => (
                      <div
                        key={rev.id}
                        className="card-dark p-4 rounded-3xl text-right flex flex-col gap-3"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className={`font-black ${
                                rev.status === 'approved'
                                  ? 'text-[var(--lemon-primary)]'
                                  : rev.status === 'pending'
                                  ? 'text-[var(--lemon-gold)]'
                                  : 'text-red-400'
                              }`}
                            >
                              {rev.status === 'approved'
                                ? 'معتمد ومنشور'
                                : rev.status === 'pending'
                                ? 'بانتظار المراجعة'
                                : 'مرفوض'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[var(--text-dim-on-dark)] tabular-nums">
                              {rev.createdAt}
                            </span>
                          </div>

                          <div>
                            <span className="font-extrabold text-[var(--text-on-dark)] text-sm">
                              {rev.authorName}
                            </span>
                            {rev.businessName && (
                              <span className="text-xs text-[var(--lemon-olive)] mr-2">
                                ({rev.businessName})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= rev.rating
                                    ? 'text-[var(--lemon-gold)] fill-[var(--lemon-gold)]'
                                    : 'text-[var(--lemon-olive-deep)]'
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-xs sm:text-sm text-[var(--text-on-dark)] leading-relaxed bg-[var(--bg-section-dark)] p-3 rounded-2xl border border-[var(--border-subtle)]">
                            «{rev.comment}»
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {rev.status !== 'approved' && (
                            <button
                              onClick={() => handleReviewStatus(rev.id, 'approved')}
                              className="btn-lemon-primary flex items-center gap-1 text-xs px-3.5 py-2 rounded-xl cursor-pointer min-h-[40px]"
                            >
                              <Check className="w-4 h-4" />
                              <span>قبول ونشر</span>
                            </button>
                          )}

                          {rev.status !== 'rejected' && (
                            <button
                              onClick={() => handleReviewStatus(rev.id, 'rejected')}
                              className="btn-lemon-secondary flex items-center gap-1 text-xs px-3 py-2 rounded-xl cursor-pointer min-h-[40px]"
                            >
                              <X className="w-4 h-4" />
                              <span>رفض</span>
                            </button>
                          )}

                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'review',
                                id: rev.id,
                                name: `تقييم ${rev.authorName}`,
                              })
                            }
                            className="p-2 text-red-400 hover:bg-red-950/60 rounded-xl cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 7: CONTENT, MEDIA & COVERAGE AREAS */}
          {currentTab === 'content' && (
            <div className="space-y-5">
              <form
                onSubmit={handleSaveSettings}
                className="card-dark p-4 rounded-3xl text-right space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="font-black text-[var(--text-on-dark)] text-base">
                      تعديل بيانات الموقع والوسائط
                    </h3>
                    <p className="text-xs text-[var(--text-muted-on-dark)]">
                      العناوين، رقم الواتساب، وصورة أو فيديو الواجهة
                    </p>
                  </div>
                  {settingsSavedMessage && (
                    <span className="text-xs font-black text-[var(--lemon-primary)]">
                      تم حفظ التغييرات بنجاح ✓
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                      اسم الموقع أو العلامة:
                    </label>
                    <input
                      type="text"
                      value={tempSettings.siteTitle}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, siteTitle: e.target.value })
                      }
                      className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                      رقم الواتساب الرسمي:
                    </label>
                    <input
                      type="text"
                      value={tempSettings.whatsappNumber}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })
                      }
                      className="input-lemon w-full text-base px-4 py-2.5 rounded-xl text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                      الشعار الرئيسي:
                    </label>
                    <input
                      type="text"
                      value={tempSettings.tagline}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, tagline: e.target.value })
                      }
                      className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                      المدينة والمقر:
                    </label>
                    <input
                      type="text"
                      value={tempSettings.locationCity}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, locationCity: e.target.value })
                      }
                      className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    النبذة التعريفية (Bio):
                  </label>
                  <textarea
                    rows={2}
                    value={tempSettings.bioText}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, bioText: e.target.value })
                    }
                    className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    شريط الإعلان العلوي:
                  </label>
                  <input
                    type="text"
                    value={tempSettings.announcementText || ''}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, announcementText: e.target.value })
                    }
                    className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                  />
                </div>

                {/* Unified Media Upload for Hero & Startups Cover */}
                <div className="grid grid-cols-1 gap-4 pt-2">
                  <DeviceMediaPicker
                    label="صورة أو فيديو الواجهة الرئيسية (Hero):"
                    mediaType="both"
                    currentValue={tempSettings.heroImage}
                    currentMediaType={tempSettings.heroMediaType}
                    onChange={(val, detectedType) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        heroImage: val,
                        heroMediaType: detectedType || 'image',
                      }))
                    }
                  />

                  <DeviceMediaPicker
                    label="صورة أو فيديو قسم دعم المشروعات:"
                    mediaType="both"
                    currentValue={tempSettings.coverStartupsImage || tempSettings.heroImage}
                    currentMediaType={tempSettings.coverStartupsMediaType}
                    onChange={(val, detectedType) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        coverStartupsImage: val,
                        coverStartupsMediaType: detectedType || 'image',
                      }))
                    }
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-lemon-primary w-full px-6 py-3 rounded-xl text-sm cursor-pointer min-h-[44px]"
                  >
                    حفظ تعديلات الموقع
                  </button>
                </div>
              </form>

              {/* Coverage Areas Manager */}
              <div className="card-dark p-4 rounded-3xl text-right space-y-3.5">
                <div>
                  <h3 className="font-black text-[var(--text-on-dark)] text-base">
                    إدارة مناطق التغطية الميدانية (13 منطقة)
                  </h3>
                  <p className="text-xs text-[var(--text-muted-on-dark)]">
                    يمكنك تفعيل أو إيقاف الخدمة في أي مركز
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {areas.map((area) => (
                    <div
                      key={area.id}
                      className="p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-section-dark)] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-[var(--text-on-dark)] truncate">
                          {area.name}
                        </h4>
                        <span className="text-xs text-[var(--text-muted-on-dark)] block truncate">
                          {area.notes}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          StorageService.toggleArea(area.id);
                          refreshData();
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer shrink-0 ${
                          area.isAvailable
                            ? 'bg-[var(--lemon-primary)] text-[#141b05] font-black'
                            : 'bg-[var(--bg-card-elevated)] text-[var(--text-dim-on-dark)]'
                        }`}
                      >
                        {area.isAvailable ? 'مفعل' : 'معطل'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY & BACKUP */}
          {currentTab === 'security' && (
            <div className="grid grid-cols-1 gap-5">
              <form
                onSubmit={handleChangePassword}
                className="card-dark p-4 rounded-3xl text-right space-y-4"
              >
                <div className="border-b border-[var(--border-subtle)] pb-3">
                  <h3 className="font-black text-[var(--text-on-dark)] text-base">
                    تغيير كلمة مرور المدير
                  </h3>
                  <p className="text-xs text-[var(--text-muted-on-dark)]">
                    حافظ على سرية كلمة المرور لتأمين لوحة التحكم
                  </p>
                </div>

                {passwordStatus?.success && (
                  <div className="p-3 bg-[var(--bg-card-elevated)] border border-[var(--lemon-olive)] text-[var(--lemon-bright)] rounded-xl text-xs font-bold">
                    {passwordStatus.success}
                  </div>
                )}
                {passwordStatus?.error && (
                  <div className="p-3 bg-red-950/75 border border-red-800 text-red-200 rounded-xl text-xs font-bold">
                    {passwordStatus.error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    كلمة المرور الحالية:
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    كلمة المرور الجديدة:
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    تأكيد كلمة المرور الجديدة:
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-lemon-primary w-full py-3 rounded-xl text-sm cursor-pointer min-h-[44px]"
                >
                  حفظ كلمة المرور الجديدة
                </button>
              </form>

              <div className="card-dark p-4 rounded-3xl text-right space-y-4">
                <div className="border-b border-[var(--border-subtle)] pb-3">
                  <h3 className="font-black text-[var(--text-on-dark)] text-base">
                    النسخ الاحتياطي واستعادة البيانات
                  </h3>
                  <p className="text-xs text-[var(--text-muted-on-dark)]">
                    حفظ نسخة كاملة من بيانات الموقع أو استعادتها
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleExportBackup}
                    className="btn-lemon-secondary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm cursor-pointer min-h-[44px]"
                  >
                    <Download className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
                    <span>تنزيل نسخة احتياطية (JSON)</span>
                  </button>

                  <div>
                    <label className="btn-lemon-secondary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm cursor-pointer border-dashed min-h-[44px]">
                      <Upload className="w-4 h-4 text-[var(--lemon-primary)] shrink-0" />
                      <span>استيراد نسخة احتياطية من ملف</span>
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    <button
                      onClick={() => {
                        StorageService.resetToDefaults();
                        refreshData();
                        showToast('تمت استعادة البيانات الافتراضية الأصلية لحموكشة.');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-red-300 hover:bg-red-950/60 border border-red-900/50 text-xs font-bold py-3 rounded-xl cursor-pointer min-h-[44px]"
                    >
                      <RefreshCw className="w-4 h-4 shrink-0" />
                      <span>استعادة البيانات الافتراضية الأصلية لحموكشة</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: EDIT / ADD OFFER (Image + Video + Multi-media!) */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[var(--bg-card-dark)] rounded-3xl max-w-[400px] w-full p-5 text-right max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--border-medium)] text-[var(--text-on-dark)]">
            <h3 className="font-black text-base text-[var(--text-on-dark)] mb-4">
              {editingOffer.id ? 'تعديل العرض الترويجي' : 'إضافة عرض ترويجي جديد'}
            </h3>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                  عنوان العرض:
                </label>
                <input
                  type="text"
                  required
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                  شارة الخصم:
                </label>
                <input
                  type="text"
                  placeholder="مثال: خصم 30% أو باقة المشروعات"
                  value={editingOffer.discountBadge || ''}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, discountBadge: e.target.value })
                  }
                  className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                  تفاصيل العرض:
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingOffer.description || ''}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, description: e.target.value })
                  }
                  className="input-lemon w-full text-base px-4 py-2.5 rounded-xl resize-none"
                />
              </div>

              <DeviceMediaPicker
                label="صورة أو فيديو العرض الترويجي (اختياري):"
                mediaType="both"
                currentValue={editingOffer.mediaUrl || editingOffer.image || ''}
                currentMediaType={editingOffer.mediaType}
                onChange={(val, detectedType) =>
                  setEditingOffer((prev) =>
                    prev
                      ? {
                          ...prev,
                          mediaUrl: val,
                          image: val,
                          mediaType: detectedType || (isVideoSource(val) ? 'video' : 'image'),
                        }
                      : prev
                  )
                }
                allowMultiple
                gallery={editingOffer.mediaGallery || []}
                onGalleryChange={(items) =>
                  setEditingOffer((prev) => (prev ? { ...prev, mediaGallery: items } : prev))
                }
              />

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    تاريخ البدء:
                  </label>
                  <input
                    type="date"
                    value={editingOffer.startDate || ''}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, startDate: e.target.value })
                    }
                    className="input-lemon w-full text-base px-3 py-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    تاريخ الانتهاء:
                  </label>
                  <input
                    type="date"
                    value={editingOffer.endDate || ''}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, endDate: e.target.value })
                    }
                    className="input-lemon w-full text-base px-3 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className="btn-lemon-secondary px-4 py-2.5 text-xs rounded-xl cursor-pointer min-h-[42px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-lemon-primary px-5 py-2.5 text-xs rounded-xl cursor-pointer min-h-[42px]"
                >
                  حفظ العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD CAMPAIGN (Image + Video + Multi-media!) */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[var(--bg-card-dark)] rounded-3xl max-w-[400px] w-full p-5 text-right max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--border-medium)] text-[var(--text-on-dark)]">
            <h3 className="font-black text-base text-[var(--text-on-dark)] mb-4">
              {editingCampaign.id ? 'تعديل الحملة الإعلانية' : 'إضافة حملة إعلانية جديدة'}
            </h3>

            <form onSubmit={handleSaveCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                  عنوان الحملة:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تغطية وافتتاح كافيه البرنس"
                  value={editingCampaign.title || ''}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, title: e.target.value })
                  }
                  className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    اسم المحل / العميل:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كافيه البرنس"
                    value={editingCampaign.clientName || ''}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, clientName: e.target.value })
                    }
                    className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    التصنيف:
                  </label>
                  <select
                    value={editingCampaign.category || 'محلات تجارية'}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, category: e.target.value as any })
                    }
                    className="input-lemon w-full text-base px-3 py-2.5 rounded-xl"
                  >
                    <option value="مطاعم وكافيهات">مطاعم وكافيهات</option>
                    <option value="محلات تجارية">محلات تجارية</option>
                    <option value="ملابس وموضة">ملابس وموضة</option>
                    <option value="مشروعات ناشئة">مشروعات ناشئة</option>
                    <option value="خدمات ومهن">خدمات ومهن</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    المنطقة (سوهاج/جهينة):
                  </label>
                  <input
                    type="text"
                    value={editingCampaign.location || 'جهينة الغربية'}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, location: e.target.value })
                    }
                    className="input-lemon w-full text-base px-3 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    عدد المشاهدات:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: +85 ألف"
                    value={editingCampaign.viewsCount || ''}
                    onChange={(e) =>
                      setEditingCampaign({ ...editingCampaign, viewsCount: e.target.value })
                    }
                    className="input-lemon w-full text-base px-3 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              {/* Unified Image OR Video + Multi-media Picker */}
              <DeviceMediaPicker
                label="صورة أو فيديو الحملة الإعلانية (من الجهاز):"
                mediaType="both"
                currentValue={editingCampaign.mediaUrl || ''}
                currentMediaType={editingCampaign.mediaType}
                onChange={(val, detectedType) =>
                  setEditingCampaign((prev) =>
                    prev
                      ? {
                          ...prev,
                          mediaUrl: val,
                          mediaType: detectedType || (isVideoSource(val) ? 'video' : 'image'),
                        }
                      : prev
                  )
                }
                allowMultiple
                gallery={editingCampaign.mediaGallery || []}
                onGalleryChange={(items) =>
                  setEditingCampaign((prev) => (prev ? { ...prev, mediaGallery: items } : prev))
                }
                helperText="ارفع صورة أو فيديو إعلان المحل مباشرة من جهازك، ويمكنك إضافة صور وفيديوهات إضافية."
              />

              <div>
                <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                  وصف الحملة وتفاصيلها:
                </label>
                <textarea
                  rows={3}
                  value={editingCampaign.description || ''}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, description: e.target.value })
                  }
                  placeholder="اكتب نبذة عن التغطية وتأثيرها على مبيعات وإقبال الزبائن..."
                  className="input-lemon w-full text-base px-4 py-2.5 rounded-xl resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="btn-lemon-secondary px-4 py-2.5 text-xs rounded-xl cursor-pointer min-h-[42px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-lemon-primary px-5 py-2.5 text-xs rounded-xl cursor-pointer min-h-[42px]"
                >
                  حفظ الحملة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD REEL (Video + Image + Multi-media!) */}
      {editingReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[var(--bg-card-dark)] rounded-3xl max-w-[400px] w-full p-5 text-right max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--border-medium)] text-[var(--text-on-dark)]">
            <h3 className="font-black text-base text-[var(--text-on-dark)] mb-4">
              {editingReel.id ? 'تعديل الريلز والفلوج' : 'إضافة ريلز / فلوج جديد'}
            </h3>

            <form onSubmit={handleSaveReel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                  عنوان الريل / الفلوج:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جولة سريعة في سوق جهينة"
                  value={editingReel.title || ''}
                  onChange={(e) => setEditingReel({ ...editingReel, title: e.target.value })}
                  className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                />
              </div>

              <DeviceMediaPicker
                label="ملف الريل الرئيسي (فيديو أو صورة ستوري من جهازك):"
                mediaType="both"
                currentValue={editingReel.videoUrl || ''}
                currentMediaType={editingReel.mediaType}
                onChange={(val, detectedType) =>
                  setEditingReel((prev) =>
                    prev
                      ? {
                          ...prev,
                          videoUrl: val,
                          mediaType: detectedType || (isVideoSource(val) ? 'video' : 'image'),
                        }
                      : prev
                  )
                }
                allowMultiple
                gallery={editingReel.mediaGallery || []}
                onGalleryChange={(items) =>
                  setEditingReel((prev) => (prev ? { ...prev, mediaGallery: items } : prev))
                }
                helperText="ارفع فيديو (MP4, WEBM) أو صورة ستوري مع إمكانية إضافة مقاطع وصور متتابعة."
              />

              <DeviceMediaPicker
                label="صورة الغلاف المصغرة للريل (اختياري):"
                mediaType="image"
                currentValue={editingReel.thumbnailUrl || ''}
                onChange={(val) =>
                  setEditingReel((prev) => (prev ? { ...prev, thumbnailUrl: val } : prev))
                }
                helperText="صورة الغلاف التي تظهر في شبكة الريلز قبل الضغط للتشغيل."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    مدة المقطع:
                  </label>
                  <input
                    type="text"
                    value={editingReel.duration || '0:45'}
                    onChange={(e) => setEditingReel({ ...editingReel, duration: e.target.value })}
                    className="input-lemon w-full text-base px-3 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    عدد المشاهدات:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 65K"
                    value={editingReel.views || '65K'}
                    onChange={(e) => setEditingReel({ ...editingReel, views: e.target.value })}
                    className="input-lemon w-full text-base px-3 py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                  وصف الريل (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={editingReel.description || ''}
                  onChange={(e) => setEditingReel({ ...editingReel, description: e.target.value })}
                  placeholder="وصف إضافي للمقطع..."
                  className="input-lemon w-full text-base px-4 py-2.5 rounded-xl resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingReel(null)}
                  className="btn-lemon-secondary px-4 py-2.5 text-xs rounded-xl cursor-pointer min-h-[42px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-lemon-primary px-5 py-2.5 text-xs rounded-xl cursor-pointer min-h-[42px]"
                >
                  حفظ الريل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD GALLERY & POST ITEM (Image + Video + Multi-media!) */}
      {editingGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[var(--bg-card-dark)] rounded-3xl max-w-[400px] w-full p-5 text-right max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--border-medium)] text-[var(--text-on-dark)]">
            <h3 className="font-black text-base text-[var(--text-on-dark)] mb-4">
              {editingGalleryItem.id ? 'تعديل منشور المعرض' : 'إضافة منشور / وسائط جديدة للمعرض'}
            </h3>

            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    عنوان المنشور أو اللقطة:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كواليس تصوير إعلان جديد"
                    value={editingGalleryItem.title || ''}
                    onChange={(e) =>
                      setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })
                    }
                    className="input-lemon w-full text-base px-4 py-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                    التصنيف:
                  </label>
                  <select
                    value={editingGalleryItem.category || 'منشورات وإعلانات'}
                    onChange={(e) =>
                      setEditingGalleryItem({
                        ...editingGalleryItem,
                        category: e.target.value as any,
                      })
                    }
                    className="input-lemon w-full text-base px-3 py-2.5 rounded-xl"
                  >
                    <option value="منشورات وإعلانات">منشورات وإعلانات</option>
                    <option value="فعاليات ومهرجانات">فعاليات ومهرجانات</option>
                    <option value="كواليس وتصوير">كواليس وتصوير</option>
                    <option value="صور إعلانية">صور إعلانية</option>
                  </select>
                </div>
              </div>

              <DeviceMediaPicker
                label="صورة أو فيديو المنشور (من جهازك):"
                mediaType="both"
                currentValue={editingGalleryItem.mediaUrl || ''}
                currentMediaType={editingGalleryItem.mediaType}
                onChange={(val, detectedType) =>
                  setEditingGalleryItem((prev) =>
                    prev
                      ? {
                          ...prev,
                          mediaUrl: val,
                          mediaType: detectedType || (isVideoSource(val) ? 'video' : 'image'),
                        }
                      : prev
                  )
                }
                allowMultiple
                gallery={editingGalleryItem.mediaGallery || []}
                onGalleryChange={(items) =>
                  setEditingGalleryItem((prev) =>
                    prev ? { ...prev, mediaGallery: items } : prev
                  )
                }
                helperText="يمكنك رفع صورة أو فيديو رئيسي وإضافة أكثر من صورة أو فيديو داخل نفس المنشور."
              />

              <div>
                <label className="block text-xs font-bold text-[var(--lemon-bright)] mb-1">
                  وصف المنشور:
                </label>
                <textarea
                  rows={3}
                  value={editingGalleryItem.description || ''}
                  onChange={(e) =>
                    setEditingGalleryItem({
                      ...editingGalleryItem,
                      description: e.target.value,
                    })
                  }
                  placeholder="اكتب تفاصيل اللقطة أو الحدث..."
                  className="input-lemon w-full text-base px-4 py-2.5 rounded-xl resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setEditingGalleryItem(null)}
                  className="btn-lemon-secondary px-4 py-2.5 text-xs rounded-xl cursor-pointer min-h-[42px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-lemon-primary px-5 py-2.5 text-xs rounded-xl cursor-pointer min-h-[42px]"
                >
                  حفظ في المعرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[var(--bg-card-dark)] rounded-3xl max-w-[360px] w-full p-5 text-right shadow-2xl border border-red-800/80 space-y-4 text-[var(--text-on-dark)]">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-[var(--text-on-dark)] text-base">تأكيد الحذف</h3>
              <p className="text-xs text-[var(--text-muted-on-dark)]">
                هل أنت متأكد من حذف «{deleteConfirmation.name}»؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="btn-lemon-secondary flex-1 py-2.5 rounded-xl text-xs cursor-pointer min-h-[42px]"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer min-h-[42px]"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
