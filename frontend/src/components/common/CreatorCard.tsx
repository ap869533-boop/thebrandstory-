import React, { useState, useRef } from 'react';
import { Heart, ArrowUpRight, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { Creator } from '../../types';
import { usePlatform } from '../../context/PlatformContext';

interface CreatorCardProps {
  creator: Creator;
  variant?: 'grid' | 'carousel' | 'compact';
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, variant = 'grid' }) => {
  const {
    navigateTo,
    isCreatorSaved,
    toggleSaveCreator,
  } = usePlatform();

  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isSaved = isCreatorSaved(creator.id);

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const handleCardClick = () => {
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

  const displayImage = creator.coverImage || creator.portfolio?.[0]?.thumbnail || creator.avatar;
  const instagramReelId = creator.reelVideoUrl?.match(/instagram\.com\/(?:reel|p)\/([^/?#]+)/i)?.[1];
  const isInstagramReel = Boolean(instagramReelId);

  const getFollowerBadge = (count?: number) => {
    const f = count || 0;
    if (f < 1000) return { label: 'Starter', style: 'bg-slate-600/80 border-slate-400/50 text-slate-100' };
    if (f < 10000) return { label: 'Rising', style: 'bg-indigo-600/80 border-indigo-400/50 text-indigo-100' };
    if (f < 50000) return { label: 'Emerging', style: 'bg-sky-600/80 border-sky-400/50 text-sky-100' };
    if (f < 100000) return { label: 'Influential', style: 'bg-emerald-600/80 border-emerald-400/50 text-emerald-100' };
    if (f < 500000) return { label: 'Creator', style: 'bg-black/80 border-blue-400/50 text-blue-100' };
    if (f < 1000000) return { label: 'Elite', style: 'bg-violet-600/80 border-violet-400/50 text-violet-100' };
    return { label: 'Icon', style: 'bg-fuchsia-600/80 border-fuchsia-400/50 text-fuchsia-100' };
  };

  const badge = getFollowerBadge(creator.followers);

  return (
    <div
      id={`creator-card-${creator.id}`}
      onClick={handleCardClick}
      className={`group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200/60 hover:border-slate-400/50 flex flex-col justify-between bg-slate-900 ${
        variant === 'carousel'
          ? 'w-[165px] sm:w-[240px] md:w-[270px] h-[255px] sm:h-[350px] md:h-[380px] shrink-0'
          : 'w-full h-[255px] sm:h-[350px] md:h-[380px]'
      }`}
    >
      {/* Background: Video (direct URL) or Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {isInstagramReel ? (
          <iframe
            src={`https://www.instagram.com/reel/${instagramReelId}/embed`}
            title={`${creator.name} Instagram Reel`}
            allow="autoplay; encrypted-media"
            className="w-full h-full border-0"
          />
        ) : creator.reelVideoUrl && !videoError ? (
          <video
            ref={videoRef}
            src={creator.reelVideoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <img
            src={displayImage}
            alt={creator.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 p-2 sm:p-3 flex items-start justify-between">
        <div className="flex flex-col gap-1.5 items-start">
          <span className={`backdrop-blur-md text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded shadow-xs uppercase tracking-wider border ${badge.style}`}>
            {badge.label}
          </span>
          <span className="backdrop-blur-md bg-black/40 text-white/95 border border-white/20 text-[9px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs truncate max-w-[110px] sm:max-w-none">
            {creator.primaryCategory} • {creator.currentCity.split(' ')[0]}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            id={`save-creator-btn-${creator.id}`}
            onClick={handleSaveClick}
            title={isSaved ? 'Remove from Saved' : 'Save Creator'}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-md cursor-pointer border ${
              isSaved
                ? 'bg-rose-600 text-white border-rose-400'
                : 'bg-black/35 hover:bg-black/60 text-white/80 hover:text-white border-white/20'
            }`}
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {creator.reelVideoUrl && !isInstagramReel && !videoError && (
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-md cursor-pointer border bg-black/35 hover:bg-black/60 text-white/80 hover:text-white border-white/20"
            >
              {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="relative z-10 p-2.5 sm:p-3.5 space-y-1 sm:space-y-1.5">
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-white text-xs sm:text-base leading-tight group-hover:text-[#D4A338] transition truncate">
              {creator.name}
            </h3>
            {creator.isVerified && (
              <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-[#D4A338] shrink-0" />
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
            @{creator.username}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-200">
          <span className="font-bold text-white">
            {formatFollowers(creator.followers)} <span className="text-[9px] sm:text-[10px] font-normal text-slate-300">foll.</span>
          </span>
          <span className="text-white/30">•</span>
          <span className="font-bold text-emerald-400">
            {creator.engagementRate}% <span className="text-[9px] sm:text-[10px] font-normal text-slate-300">eng.</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 sm:pt-1.5 border-t border-white/15">
          <div>
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-semibold block leading-none">Starts</span>
            <span className="text-[11px] sm:text-sm font-bold text-white leading-tight">
              {creator.pricing.isBarterAvailable && creator.startingPrice === 0
                ? 'Barter'
                : `₹${(creator.startingPrice ?? 0).toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/15 group-hover:bg-[#D4A338] group-hover:text-black text-white text-[10px] sm:text-xs font-bold transition flex items-center gap-0.5 sm:gap-1">
            <span>View</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
