import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Play } from 'lucide-react';
import { MediaDB, isIdbUri } from '../../services/mediaDb';
import { isVideoSource } from '../../utils/fileUpload';

export function useResolvedMedia(uri?: string): string {
  const [resolved, setResolved] = useState<string>(() => (!uri || isIdbUri(uri) ? '' : uri));

  useEffect(() => {
    let active = true;
    if (!uri) {
      setResolved('');
      return;
    }
    if (!isIdbUri(uri)) {
      setResolved(uri);
      return;
    }

    MediaDB.resolveUri(uri).then((url) => {
      if (active) setResolved(url);
    });

    return () => {
      active = false;
    };
  }, [uri]);

  return resolved;
}

interface MediaDisplayProps {
  src?: string;
  mediaType?: 'image' | 'video';
  poster?: string;
  alt?: string;
  className?: string;
  videoControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  previewOnly?: boolean;
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({
  src,
  mediaType,
  poster,
  alt = 'محتوى مرئي',
  className = 'w-full h-full object-cover',
  videoControls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  previewOnly = false,
}) => {
  const resolvedSrc = useResolvedMedia(src);
  const resolvedPoster = useResolvedMedia(poster);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src, resolvedSrc]);

  const isVideo = isVideoSource(src, mediaType);

  if (!src || (!resolvedSrc && isIdbUri(src))) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-card-elevated)] text-[var(--text-muted-on-dark)] p-4 text-center gap-1.5">
        {isVideo ? <Video className="w-6 h-6 text-[var(--lemon-primary)]" /> : <ImageIcon className="w-6 h-6 text-[var(--lemon-olive)]" />}
        <span className="text-xs font-medium">جاري تحميل الوسائط...</span>
      </div>
    );
  }

  if (hasError) {
    if (isVideo && resolvedPoster) {
      return (
        <div className="relative w-full h-full">
          <img
            src={resolvedPoster}
            alt={alt}
            referrerPolicy="no-referrer"
            className={className}
          />
          <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-[var(--text-on-dark)] p-3 text-center gap-1">
            <Play className="w-7 h-7 text-[var(--lemon-primary)]" />
            <span className="text-xs font-bold">الفيديو متاح عند الاتصال بالإنترنت أو بعد الرفع من جهازك</span>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-card-elevated)] text-[var(--text-muted-on-dark)] p-4 text-center gap-1.5">
        {isVideo ? <Video className="w-7 h-7 text-[var(--lemon-gold)]" /> : <ImageIcon className="w-7 h-7 text-[var(--lemon-olive)]" />}
        <span className="text-xs font-bold text-[var(--text-on-dark)]">{alt}</span>
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={resolvedSrc}
        poster={resolvedPoster || undefined}
        controls={!previewOnly && videoControls}
        autoPlay={autoPlay}
        muted={previewOnly ? true : muted}
        loop={loop}
        playsInline
        preload="metadata"
        onError={() => setHasError(true)}
        className={className}
      />
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
