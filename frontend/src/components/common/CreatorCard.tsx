import React, { useEffect, useRef, useState } from 'react';
import { Heart, ArrowRight, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { Creator } from '../../types';
import { usePlatform } from '../../context/PlatformContext';

interface CreatorCardProps {
  creator: Creator;
  variant?: 'grid' | 'carousel' | 'compact';
  interactive?: boolean;
  showSaveButton?: boolean;
  showViewProfile?: boolean;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  variant = 'grid',
  interactive = true,
  showSaveButton = true,
  showViewProfile = true,
}) => {
  const {
    navigateTo,
    isCreatorSaved,
    toggleSaveCreator,
  } = usePlatform();

  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isSaved = isCreatorSaved(creator.id);

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const handleCardClick = (event: React.MouseEvent) => {
    if (!interactive) return;
    // Touch devices do not have hover: the first tap previews the reel and the
    // next tap keeps the original card-navigation behaviour.
    const isTouchLayout = typeof window !== 'undefined'
      && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isTouchLayout && isUploadedVideo && !videoError && !isPreviewing) {
      event.stopPropagation();
      setIsPreviewing(true);
      return;
    }
    navigateTo('creator-detail', { username: creator.username, id: creator.id });
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveCreator(creator.id);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => {
      if (videoRef.current) videoRef.current.muted = !prev;
      return !prev;
    });
  };

  const displayImage = (creator as any).reelThumbnailUrl || creator.coverImage || creator.portfolio?.[0]?.thumbnail || creator.avatar;
  const isUploadedVideo = Boolean(creator.reelVideoUrl && !/instagram\.com/i.test(creator.reelVideoUrl));

  const stopPreview = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // Some streams cannot seek until metadata is available.
      }
    }
    setIsMuted(true);
    setIsPreviewing(false); // Unmounting removes the source and stops further fetching.
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!isPreviewing || !video) return;

    video.muted = true;
    setIsMuted(true);
    video.play().catch(() => {
      // Autoplay may be blocked; retain the poster instead of leaving a broken frame.
      setIsPreviewing(false);
    });

    return () => video.pause();
  }, [isPreviewing]);

  const initials = creator.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CR';
  const categoryLabel = creator.primaryCategory || 'Creator';
  const cityLabel = creator.currentCity || 'India';

  return (
    <div
      id={`creator-card-${creator.id}`}
      onClick={interactive ? handleCardClick : undefined}
      onPointerEnter={(event) => {
        if (interactive && event.pointerType === 'mouse' && isUploadedVideo && !videoError) setIsPreviewing(true);
      }}
      onPointerLeave={(event) => {
        if (interactive && event.pointerType === 'mouse') stopPreview();
      }}
      className={`group relative rounded-[1.75rem] overflow-hidden ${interactive ? 'cursor-pointer hover:shadow-2xl' : 'cursor-default'} shadow-sm transition-all duration-300 border border-slate-300/70 flex flex-col justify-between bg-slate-950 ${
        variant === 'carousel'
          ? 'w-[210px] sm:w-[220px] md:w-[230px] h-[350px] sm:h-[390px] md:h-[420px] shrink-0'
          : 'w-full h-[350px] sm:h-[390px] md:h-[420px]'
      }`}
    >
      {/* Poster is always rendered first. The video source is mounted only for an active preview. */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <img
          src={displayImage}
          alt={creator.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          decoding="async"
        />
        {isUploadedVideo && !videoError && isPreviewing && (
          <video
            ref={videoRef}
            src={creator.reelVideoUrl}
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            poster={displayImage}
            onError={() => {
              setVideoError(true);
              setIsPreviewing(false);
            }}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 p-4 sm:p-5 flex items-start justify-between">
        <span className="backdrop-blur-md bg-slate-950/55 text-white border border-white/25 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-sm truncate max-w-[150px]">
          {categoryLabel}
        </span>

        <div className="flex flex-col gap-2">
          {showSaveButton && <button
            id={`save-creator-btn-${creator.id}`}
            onClick={handleSaveClick}
            title={isSaved ? 'Remove from Saved' : 'Save Creator'}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-md cursor-pointer border ${
              isSaved
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-black/35 hover:bg-black/60 text-white/80 hover:text-white border-white/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>}

          {isUploadedVideo && !videoError && isPreviewing && (
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-md cursor-pointer border bg-black/35 hover:bg-black/60 text-white/80 hover:text-white border-white/20"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="relative z-10 p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center gap-3">
            {creator.avatar ? (
              <img src={creator.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/70 shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#D4A338] text-slate-950 flex items-center justify-center font-black text-xs border-2 border-white/70 shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-white text-sm sm:text-base leading-tight group-hover:text-[#D4A338] transition truncate">
                  {creator.name || 'Creator'}
                </h3>
                {creator.isVerified && (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#0095F6" />
                    <path d="M8.5 12.5L11 15L16 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                @{creator.username || 'creator'} <span className="text-white/60">·</span> {cityLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/20 pt-2.5 text-[10px] sm:text-xs">
            <span className="font-bold text-white">{formatFollowers(creator.followers)} followers</span>
            <span className="font-bold text-white">From ₹{(creator.startingPrice || 0).toLocaleString('en-IN')}</span>
          </div>

          {showViewProfile && <div className="w-full rounded-full bg-white text-slate-900 group-hover:bg-[#D4A338] px-3 py-0 max-h-0 opacity-0 overflow-hidden flex items-center justify-center gap-2 text-xs sm:text-sm font-bold group-hover:py-2.5 group-hover:max-h-12 group-hover:opacity-100 transition-all duration-200">
            <span>View Profile</span>
            <ArrowRight className="w-4 h-4" />
          </div>}
        </div>
    </div>
  );
};
