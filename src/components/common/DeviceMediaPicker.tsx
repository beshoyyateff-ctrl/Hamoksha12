import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  X,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { processMediaFile, isVideoSource } from '../../utils/fileUpload';
import { HAMOKSHA_IMAGES } from '../../data/defaultData';
import { MediaItem } from '../../types';
import { MediaDisplay } from './MediaDisplay';

export interface DeviceMediaPickerProps {
  label: string;
  mediaType?: 'image' | 'video' | 'both';
  currentValue?: string;
  currentMediaType?: 'image' | 'video';
  onChange: (value: string, detectedType?: 'image' | 'video') => void;
  onMediaTypeChange?: (type: 'image' | 'video') => void;
  allowMultiple?: boolean;
  gallery?: MediaItem[];
  onGalleryChange?: (items: MediaItem[]) => void;
  helperText?: string;
  suggestHamokshaImages?: boolean;
}

export const DeviceMediaPicker: React.FC<DeviceMediaPickerProps> = ({
  label,
  mediaType = 'both',
  currentValue,
  currentMediaType,
  onChange,
  onMediaTypeChange,
  allowMultiple = false,
  gallery = [],
  onGalleryChange,
  helperText,
  suggestHamokshaImages = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const primaryInputRef = useRef<HTMLInputElement | null>(null);
  const multiInputRef = useRef<HTMLInputElement | null>(null);

  const detectedIsVideo = isVideoSource(
    currentValue,
    mediaType === 'both' ? currentMediaType : mediaType
  );

  const acceptAttribute =
    mediaType === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif,image/*'
      : mediaType === 'video'
      ? 'video/mp4,video/webm,video/quicktime,video/*'
      : 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,image/*,video/*';

  const handlePrimaryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const restrict = mediaType === 'both' ? 'both' : mediaType;
      const { dataUrl, type, name } = await processMediaFile(file, restrict);
      if (onMediaTypeChange) onMediaTypeChange(type);
      onChange(dataUrl, type);
      setSuccessMsg(
        type === 'video'
          ? `تم تجهيز وحفظ الفيديو (${name}) بنجاح.`
          : `تم تجهيز وحفظ الصورة (${name}) بنجاح.`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الملف من الجهاز.';
      setError(message);
    } finally {
      setIsLoading(false);
      if (primaryInputRef.current) {
        primaryInputRef.current.value = '';
      }
    }
  };

  const handleAdditionalFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onGalleryChange) return;

    setError(null);
    setSuccessMsg(null);
    setIsAddingExtra(true);

    try {
      const newItems: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const restrict = mediaType === 'both' ? 'both' : mediaType;
        const { dataUrl, type, name } = await processMediaFile(file, restrict);
        newItems.push({
          id: `media-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          url: dataUrl,
          name,
        });
      }
      onGalleryChange([...gallery, ...newItems]);
      setSuccessMsg(`تمت إضافة ${newItems.length} ملف(ات) إضافية للمعرض.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر إضافة أحد الملفات المختارة.';
      setError(message);
    } finally {
      setIsAddingExtra(false);
      if (multiInputRef.current) {
        multiInputRef.current.value = '';
      }
    }
  };

  const handleClearPrimary = () => {
    onChange('', currentMediaType || 'image');
    setError(null);
    setSuccessMsg(null);
  };

  const handleRemoveGalleryItem = (id: string) => {
    if (!onGalleryChange) return;
    onGalleryChange(gallery.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3 text-right">
      {/* Header Label */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs sm:text-sm font-bold text-[var(--text-on-dark)]">
          {label}
        </label>
        <span className="text-[11px] font-medium text-[var(--text-muted-on-dark)]">
          {mediaType === 'both'
            ? 'يدعم الصور (JPG, PNG, WEBP) والفيديو (MP4, WEBM)'
            : mediaType === 'video'
            ? 'يدعم الفيديو (MP4, WEBM)'
            : 'يدعم الصور (JPG, PNG, WEBP)'}
        </span>
      </div>

      {/* Main Upload / Preview Container */}
      <div className="rounded-2xl border border-dashed border-[var(--border-medium)] bg-[var(--bg-section-dark)] p-3 sm:p-4 transition-colors">
        {currentValue ? (
          <div className="space-y-3">
            {/* Live Preview Box */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-16/9 flex items-center justify-center border border-[var(--border-subtle)]">
              <MediaDisplay
                src={currentValue}
                mediaType={detectedIsVideo ? 'video' : 'image'}
                alt="معاينة الملف"
                className={detectedIsVideo ? 'w-full h-full object-contain' : 'w-full h-full object-cover'}
                videoControls
              />
            </div>

            {/* Mobile-friendly Action Bar under Preview (Replace / Remove / File Type) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lemon-bright)]">
                {detectedIsVideo ? (
                  <>
                    <Video className="w-4 h-4 text-[var(--lemon-primary)]" />
                    <span>مقطع فيديو جاهز للنشر</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-[var(--lemon-primary)]" />
                    <span>صورة جاهزة للنشر</span>
                  </>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => primaryInputRef.current?.click()}
                  disabled={isLoading}
                  className="btn-lemon-secondary px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'جاري التبديل...' : 'استبدال الملف'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearPrimary}
                  className="px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-800/70 text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => primaryInputRef.current?.click()}
            disabled={isLoading}
            className="w-full flex flex-col items-center justify-center py-6 px-4 cursor-pointer text-center space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card-elevated)] text-[var(--lemon-primary)] border border-[var(--border-medium)] flex items-center justify-center group-hover:scale-105 transition-transform">
              {mediaType === 'video' ? (
                <Video className="w-6 h-6" />
              ) : mediaType === 'image' ? (
                <ImageIcon className="w-6 h-6" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-[var(--text-on-dark)]">
                {isLoading
                  ? 'جاري معالجة وحفظ الملف من الجهاز...'
                  : mediaType === 'both'
                  ? 'اختر صورة أو فيديو من جهازك'
                  : mediaType === 'video'
                  ? 'اختر مقطع فيديو من جهازك'
                  : 'اختر صورة من جهازك'}
              </p>
              <p className="text-xs text-[var(--text-muted-on-dark)]">
                {mediaType === 'both'
                  ? 'زر واحد يتيح لك رفع صور (JPG, PNG, WEBP) أو فيديو (MP4, WEBM)'
                  : mediaType === 'video'
                  ? 'يدعم MP4, WEBM, MOV حتى 60 ميجابايت'
                  : 'يدعم JPG, PNG, WEBP مع ضغط ذكي تلقائي'}
              </p>
            </div>

            <span className="btn-lemon-primary inline-flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl shadow-sm">
              <Upload className="w-4 h-4" />
              <span>
                {mediaType === 'both'
                  ? 'فتح المعرض لاختيار صورة أو فيديو'
                  : mediaType === 'video'
                  ? 'فتح المعرض لاختيار فيديو'
                  : 'فتح المعرض لاختيار صورة'}
              </span>
            </span>
          </button>
        )}

        {/* Hidden Primary Input */}
        <input
          ref={primaryInputRef}
          type="file"
          accept={acceptAttribute}
          onChange={handlePrimaryFileChange}
          className="hidden"
        />
      </div>

      {/* Multiple Additional Media Support (Images + Videos) */}
      {allowMultiple && onGalleryChange && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-section-dark)] p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h5 className="text-xs font-bold text-[var(--lemon-bright)]">
                وسائط إضافية (صور وفيديوهات متعددة)
              </h5>
              <p className="text-[11px] text-[var(--text-muted-on-dark)]">
                يمكنك إضافة أكثر من صورة أو فيديو للعرض داخل نفس المنشور أو الحملة ({gallery.length})
              </p>
            </div>

            <button
              type="button"
              onClick={() => multiInputRef.current?.click()}
              disabled={isAddingExtra}
              className="btn-lemon-secondary px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingExtra ? 'جاري الرفع...' : 'إضافة صور / فيديوهات'}</span>
            </button>
          </div>

          {gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-xl overflow-hidden bg-black aspect-16/10 border border-[var(--border-subtle)]"
                >
                  <MediaDisplay
                    src={item.url}
                    mediaType={item.type}
                    alt={item.name || 'وسائط إضافية'}
                    previewOnly
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-bold text-[var(--lemon-bright)]">
                    {item.type === 'video' ? 'فيديو' : 'صورة'}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryItem(item.id)}
                    aria-label="حذف هذا الملف"
                    className="absolute top-1.5 left-1.5 w-7 h-7 rounded-lg bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={multiInputRef}
            type="file"
            multiple
            accept={acceptAttribute}
            onChange={handleAdditionalFilesChange}
            className="hidden"
          />
        </div>
      )}

      {/* Quick Archive Selection */}
      {suggestHamokshaImages && mediaType !== 'video' && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted-on-dark)]">
          <span>أو اختر من أرشيف حموكشة:</span>
          <button
            type="button"
            onClick={() => {
              if (onMediaTypeChange) onMediaTypeChange('image');
              onChange(HAMOKSHA_IMAGES.hero, 'image');
            }}
            className="text-[var(--lemon-primary)] hover:text-[var(--lemon-bright)] underline font-bold cursor-pointer"
          >
            صورة الاستوديو
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => {
              if (onMediaTypeChange) onMediaTypeChange('image');
              onChange(HAMOKSHA_IMAGES.stage, 'image');
            }}
            className="text-[var(--lemon-primary)] hover:text-[var(--lemon-bright)] underline font-bold cursor-pointer"
          >
            صورة المسرح
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => {
              if (onMediaTypeChange) onMediaTypeChange('image');
              onChange(HAMOKSHA_IMAGES.profile, 'image');
            }}
            className="text-[var(--lemon-primary)] hover:text-[var(--lemon-bright)] underline font-bold cursor-pointer"
          >
            الصورة الشخصية
          </button>
        </div>
      )}

      {/* Success Feedback */}
      {successMsg && (
        <div className="p-2.5 rounded-xl bg-[var(--bg-card-elevated)] border border-[var(--lemon-olive)] text-[var(--lemon-bright)] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--lemon-primary)]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="p-2.5 rounded-xl bg-red-950/75 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {helperText && <p className="text-xs text-[var(--text-dim-on-dark)]">{helperText}</p>}
    </div>
  );
};
