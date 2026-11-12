import { MediaDB } from '../services/mediaDb';

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg'];

const MAX_IMAGE_MB = 15;
const MAX_VIDEO_MB = 60;

/**
 * Compresses an image file via canvas and saves it persistently in IndexedDB (with DataURL fallback)
 */
export async function processImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<string> {
  const mime = (file.type || '').toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isImageByExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);

  if (!mime.startsWith('image/') && !isImageByExt) {
    throw new Error('صيغة الملف غير مدعومة للصور. الصيغ المدعومة هي: JPG, PNG, WEBP, GIF.');
  }

  if (mime && !SUPPORTED_IMAGE_TYPES.includes(mime) && !isImageByExt) {
    throw new Error(`صيغة الصورة (${mime}) غير مدعومة. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.`);
  }

  const sizeInMb = file.size / (1024 * 1024);
  if (sizeInMb > MAX_IMAGE_MB) {
    throw new Error(`حجم الصورة (${sizeInMb.toFixed(1)} ميجابايت) يتجاوز الحد المسموح (${MAX_IMAGE_MB} ميجابايت).`);
  }

  const compressedBlob = await new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة من الجهاز.'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('تعذر معالجة الصورة المختارة. تأكد من سلامة الملف.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outputType = mime === 'image/png' ? 'image/png' : 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          outputType,
          quality
        );
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  });

  // Persist to IndexedDB so even dozens of high-res photos never overflow localStorage
  try {
    return await MediaDB.saveBlob(compressedBlob, file.name);
  } catch {
    // Fallback to DataURL if IndexedDB is unavailable
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error('فشل حفظ الصورة في الذاكرة المحلية'));
      r.onload = () => resolve(r.result as string);
      r.readAsDataURL(compressedBlob);
    });
  }
}

/**
 * Validates and saves a video file persistently in IndexedDB (MP4, WEBM, MOV)
 */
export async function processVideoFile(file: File, maxMb = MAX_VIDEO_MB): Promise<string> {
  const mime = (file.type || '').toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isVideoByExt = ['mp4', 'webm', 'mov', 'm4v', 'ogg'].includes(ext);

  if (!mime.startsWith('video/') && !isVideoByExt) {
    throw new Error('صيغة الملف غير مدعومة للفيديو. الصيغ المدعومة هي: MP4, WEBM, MOV.');
  }

  if (mime && !SUPPORTED_VIDEO_TYPES.includes(mime) && !isVideoByExt) {
    throw new Error(`صيغة الفيديو (${mime}) غير مدعومة في المتصفح. يفضل استخدام صيغة MP4 أو WEBM.`);
  }

  const sizeInMb = file.size / (1024 * 1024);
  if (sizeInMb > maxMb) {
    throw new Error(
      `حجم الفيديو (${sizeInMb.toFixed(1)} ميجابايت) أكبر من الحد المسموح (${maxMb} ميجابايت). يرجى اختيار مقطع أصغر.`
    );
  }

  // Persist directly to IndexedDB for fast, quota-safe playback across reloads
  try {
    return await MediaDB.saveBlob(file, file.name);
  } catch {
    if (sizeInMb > 3.5) {
      throw new Error('تعذر تخزين الفيديو الكبير في التصفح الخفي. يرجى استخدام متصفح عادي لحفظ الفيديوهات الطويلة.');
    }
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('فشل قراءة ملف الفيديو'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Unified handler: automatically detects Image or Video from the same file input
 */
export async function processMediaFile(
  file: File,
  restrictTo?: 'image' | 'video' | 'both'
): Promise<{ dataUrl: string; type: 'image' | 'video'; name: string }> {
  const mime = (file.type || '').toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isVideo = mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'ogg'].includes(ext);
  const isImage = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);

  if (!isVideo && !isImage) {
    throw new Error('نوع الملف غير مدعوم! يرجى اختيار صورة (JPG, PNG, WEBP) أو فيديو (MP4, WEBM).');
  }

  if (restrictTo === 'image' && isVideo) {
    throw new Error('هذا الحقل مخصص للصور فقط. يرجى اختيار ملف صورة (JPG, PNG, WEBP).');
  }
  if (restrictTo === 'video' && isImage) {
    throw new Error('هذا الحقل مخصص للفيديو فقط. يرجى اختيار ملف فيديو (MP4, WEBM).');
  }

  if (isVideo) {
    const dataUrl = await processVideoFile(file);
    return { dataUrl, type: 'video', name: file.name };
  }

  const dataUrl = await processImageFile(file);
  return { dataUrl, type: 'image', name: file.name };
}

/**
 * Checks if a URL or reference represents a video
 */
export function isVideoSource(url?: string, explicitType?: 'image' | 'video'): boolean {
  if (explicitType === 'video') return true;
  if (explicitType === 'image') return false;
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  const lower = url.toLowerCase();
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.m4v') ||
    lower.includes('/video/')
  );
}
