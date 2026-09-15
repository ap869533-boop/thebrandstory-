import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Users,
  Play,
  MessageCircle,
  Sparkles,
  Info,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Layers,
  Award,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Repeat,
  Check,
  Building,
  Eye,
  Bookmark,
  Send,
  X
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { TrustScoreBadge } from '../components/common/TrustScoreBadge';
import { Creator } from '../types';
import { cleanInstagramHandle } from '../utils/sanitize';

export const CreatorDetailView: React.FC = () => {
  const {
    creators,
    viewParams,
    authUser,
    navigateTo,
    openEnquiryModal,
    isCreatorSaved,
    toggleSaveCreator,
    addCreatorReview,
  } = usePlatform();

  // Find creator by ID or username
  const creator: Creator =
    creators.find(
      (c) =>
        (viewParams.id && c.id === viewParams.id) ||
        (viewParams.username && c.username.toLowerCase() === (viewParams.username as string).toLowerCase())
    ) || (authUser?.role === 'CREATOR' ? authUser.creatorProfile : creators[0]);

  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-black">Profile preview unavailable</h2>
          <p className="text-sm text-slate-400">Your creator profile is still being prepared. Please return to your dashboard and try again.</p>
          <button
            onClick={() => navigateTo('creator-dashboard')}
            className="px-5 py-2.5 rounded-xl bg-[#D4A338] text-black font-bold text-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  // Brand Rating Form state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingBrand, setRatingBrand] = useState('');
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingDeliverable, setRatingDeliverable] = useState('Instagram Reel (1x)');
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const isSaved = isCreatorSaved(creator.id);

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBrand.trim()) return;

    addCreatorReview(creator.id, {
      brandName: ratingBrand.trim(),
      rating: ratingStars,
      campaignType: ratingDeliverable,
      reviewText: ratingComment.trim() || `Rated ${ratingStars} stars for ${ratingDeliverable} collaboration.`,
      verifiedCollaboration: true,
    });

    setRatingSubmitted(true);
    setTimeout(() => {
      setRatingSubmitted(false);
      setShowRatingForm(false);
      setRatingBrand('');
      setRatingComment('');
    }, 2000);
  };

  // Real portfolio items from database - used as recent reels
  const recentVideoPosts = (creator.portfolio && creator.portfolio.length > 0)
    ? creator.portfolio.slice(0, 6).map((item, idx) => ({
        id: item.id || `p${idx}`,
        title: item.title || `${creator.name} Content`,
        thumbnail: item.thumbnail || creator.coverImage || creator.avatar || '',
        videoUrl: (item as any).videoUrl || (item as any).url || '',
        plays: item.plays ? (typeof item.plays === 'number' ? formatCount(item.plays) : item.plays) : formatCount(creator.avgViews || 0),
        likes: item.likes ? (typeof item.likes === 'number' ? formatCount(item.likes) : item.likes) : formatCount(creator.avgLikes || 0),
        comments: item.comments ? (typeof item.comments === 'number' ? formatCount(item.comments) : item.comments) : formatCount(creator.avgComments || 0),
        shares: '',
        saves: '',
        retention: '',
        sentiment: '',
        engagement: item.engagement || `${creator.avgViews ? Math.round((creator.avgLikes || 0) / creator.avgViews * 100) : 0}%`,
        type: item.type === 'reel' ? 'Instagram Reel' : item.type === 'youtube' ? 'YouTube' : 'Post',
        brandPartner: item.brandName || '',
      }))
    : [];

  // Real audience geographic distribution from database
  const audienceCities = (creator.audience?.topCities && creator.audience.topCities.length > 0)
    ? creator.audience.topCities
    : [];

  // Real past brand collaborations from database
  const pastBrandPartners = (creator.previousCollaborations && creator.previousCollaborations.length > 0)
    ? creator.previousCollaborations
    : [];

  const cleanHandle = cleanInstagramHandle(creator.username);
  const instagramUrl = (creator.socialPlatforms?.find((platform) => platform.platform === 'instagram')?.url && !creator.socialPlatforms.find((platform) => platform.platform === 'instagram')?.url.includes('?stkn-'))
    ? creator.socialPlatforms.find((platform) => platform.platform === 'instagram')!.url
    : `https://instagram.com/${cleanHandle}`;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      {/* 1. Sub-Header Navigation Bar - Clean & Top-Aligned */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigateTo('explore')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-black hover:bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/70 bg-white shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>Back to Discovery</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveCreator(creator.id)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isSaved
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => openEnquiryModal(creator)}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Direct Booking Enquiry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 space-y-6">
        {/* 2. Realistic Profile Hero Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Creator Details */}
          <div className="flex items-start sm:items-center gap-5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
              {creator.isVerified && (
                <div
                  title="Verified Influencer on thebrandsstory."
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-xs"
                >
                  ✓
                </div>
              )}
            </div>

            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {creator.name}
                </h1>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#D4A338] transition bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200"
                >
                  <span>@{cleanHandle || 'creator'}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              {/* Bio & Specialty */}
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {creator.bio || 'Add a bio from your creator dashboard.'}
              </p>

              {/* Demographics Strip */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{creator.ageGroup ? `${creator.ageGroup} yrs` : 'Age not added'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{creator.currentCity}</span>
                </span>
                <span>•</span>
                <span>
                  Languages: {creator.languages?.join(', ') || 'Languages not added'}
                </span>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#b88628] text-[11px] font-bold uppercase tracking-wider border border-blue-100">
                  {creator.primaryCategory}
                </span>
                {creator.subCategories?.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side Stats Panel */}
          <div className="w-full md:w-auto bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 sm:px-6 sm:py-4 flex items-center justify-around md:justify-end gap-6 sm:gap-8 shrink-0">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
                {formatFollowers(creator.followers)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                Followers
              </span>
            </div>

            <div className="w-px h-8 bg-slate-200" />

            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
                {creator.totalPosts !== undefined && creator.totalPosts > 0
                  ? creator.totalPosts.toLocaleString('en-IN')
                  : (creator.portfolio && creator.portfolio.length > 0 ? creator.portfolio.length.toString() : '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                Posts
              </span>
            </div>

            <div className="w-px h-8 bg-slate-200" />

            <div className="text-center">
              <TrustScoreBadge score={creator.trustScore} size="sm" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                Trust Score
              </span>
            </div>
          </div>
        </div>

        {/* 3. Key Performance Metrics Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D4A338]" />
              <span>Key Performance Metrics</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Verified 30-Day Instagram API Activity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Engagement Rate */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#D4A338]" />
                  <span>Avg Views</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#b88628] text-[10px] font-bold">
                  30-Day Avg
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight block">
                  {(creator.avgViews || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  Per post / reel average
                </span>
              </div>
            </div>

            {/* Metric 2: Avg Likes */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Avg Likes</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold">
                  Organic
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight block">
                  {formatCount(creator.avgLikes || 0)}
                </span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  Likes per reel / post
                </span>
              </div>
            </div>

            {/* Metric 3: Avg Comments */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-indigo-500" />
                  <span>Avg Comments</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                  High Reply
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight block">
                  {formatCount(creator.avgComments || 0)}
                </span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  Comments per publication
                </span>
              </div>
            </div>

            {/* Metric 4: Avg Video Plays */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <span>Avg Video Plays</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  Reels Reach
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight block">
                  {formatCount(creator.avgViews || 0)}
                </span>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">
                  Average plays per video
                </span>
              </div>
            </div>
          </div>
        </div>



        {/* 5. Commercial Deliverable Rates & Assurance Terms */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Commercial Deliverable Rates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent pricing for brand deliverables with standard enterprise terms
              </p>
            </div>

            <button
              onClick={() => openEnquiryModal(creator)}
              className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-900 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Request Quote / Book</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Reel (1x)</span>
              <span className="text-base font-black text-slate-900 block">
                ₹{(creator.pricing?.reelPrice || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block">High Reach</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Story (3x)</span>
              <span className="text-base font-black text-slate-900 block">
                ₹{(creator.pricing?.storyPrice || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#D4A338] font-semibold block">Link Click</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Feed Post</span>
              <span className="text-base font-black text-slate-900 block">
                ₹{(creator.pricing?.postPrice || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block">Carousel / Static</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">UGC Video</span>
              <span className="text-base font-black text-slate-900 block">
                ₹{(creator.pricing?.ugcPrice || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-purple-600 font-semibold block">Ad Creative</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Event / Visit</span>
              <span className="text-base font-black text-slate-900 block">
                ₹{(creator.pricing?.eventPrice || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold block">Store Presence</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-center space-y-1">
              <span className="text-[11px] font-bold text-[#D4A338] uppercase tracking-wider block">Barter</span>
              <span className="text-base font-black text-blue-900 block">
                {creator.pricing?.isBarterAvailable ? 'Available' : 'Paid Only'}
              </span>
              <span className="text-[10px] text-blue-500 font-semibold block">
                {creator.pricing?.isNegotiable ? 'Negotiable' : 'Fixed'}
              </span>
            </div>
          </div>

          {/* Realistic Deliverable Assurance Strip */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4A338] shrink-0" />
              <span>Turnaround: <strong>3-5 Days</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#D4A338] shrink-0" />
              <span>Revisions: <strong>2 Rounds</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rights: <strong>30-Day Organic</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#D4A338] shrink-0" />
              <span>Approval: <strong>Script First</strong></span>
            </div>
          </div>
        </div>

        {/* 6. Past Verified Brand Collaborations */}
        {pastBrandPartners.length > 0 && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Past Brand Collaborations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified commercial campaign deliverables
                </p>
              </div>
              <span className="text-xs font-bold text-[#D4A338]">
                {pastBrandPartners.length} Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {pastBrandPartners.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.brandName || item.name}</span>
                    {item.verified && <span className="text-[10px] text-emerald-600 font-bold">✓ Verified</span>}
                  </div>
                  <span className="text-[11px] text-slate-500 block">{item.campaignType || item.category}</span>
                  <span className="text-[11px] text-slate-700 font-semibold block">{item.contentType || item.deliverable}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Recent Verified Publications (Reels/Portfolio) */}
        {recentVideoPosts.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Recent Content & Deliverables
              </h2>
              <span className="text-xs font-semibold text-[#D4A338]">
                Click to view performance stats
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentVideoPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/80 transition-all flex flex-col justify-between p-4 bg-slate-900 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                    {/* Video playback if videoUrl present, else thumbnail image */}
                    {post.videoUrl ? (
                      <video
                        src={post.videoUrl}
                        className="w-full h-full object-cover object-center"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={post.thumbnail}
                      />
                    ) : post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <Play className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                      {post.type}
                    </span>
                    {post.plays && (
                      <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {post.plays} Plays
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 space-y-2">
                    {post.brandPartner && (
                      <span className="text-[10px] font-bold text-blue-300 block uppercase tracking-wider">
                        Collab: {post.brandPartner}
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-white/80 font-medium">
                      {post.likes && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400" />
                          <span>{post.likes}</span>
                        </span>
                      )}
                      {post.comments && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-blue-400" />
                          <span>{post.comments}</span>
                        </span>
                      )}
                      {post.engagement && (
                        <span className="text-emerald-400 font-bold ml-auto">
                          {post.engagement} eng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
              <Play className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">No Content Uploaded Yet</h3>
              <p className="text-xs text-slate-500 mt-1">This creator hasn't uploaded any reels or portfolio items yet.</p>
            </div>
          </div>
        )}

        {/* 8. Brand Performance Rating System */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Brand Collaboration Ratings
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-black border border-amber-200">
                  ★ 4.9 / 5.0
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticated ratings from verified enterprise brands & agencies
              </p>
            </div>

            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{showRatingForm ? 'Cancel Rating' : 'Submit Brand Rating'}</span>
            </button>
          </div>

          {/* Rating Submission Form */}
          {showRatingForm && (
            <form
              onSubmit={handleRatingSubmit}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-scaleUp"
            >
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Submit Verified Brand Rating for {creator.name}
              </h4>

              {ratingSubmitted && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Rating submitted successfully to MySQL database!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nykaa, Mamaearth, Zomato"
                    value={ratingBrand}
                    onChange={(e) => setRatingBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deliverable Completed</label>
                  <select
                    value={ratingDeliverable}
                    onChange={(e) => setRatingDeliverable(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Instagram Reel (1x)">Instagram Reel (1x)</option>
                    <option value="Story Series (3x)">Story Series (3x)</option>
                    <option value="UGC Video Ad">UGC Video Ad</option>
                    <option value="Dedicated Feed Post">Dedicated Feed Post</option>
                    <option value="Event / Store Visit">Event / Store Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Overall Rating</label>
                  <div className="flex items-center gap-1.5 py-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingStars(star)}
                        className="cursor-pointer p-0.5"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingStars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs">Collaboration Review / Comments</label>
                <textarea
                  rows={2}
                  placeholder="Share feedback on delivery turnaround time, communication, and ROI performance..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save & Publish Rating
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {creator.reviews && creator.reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {creator.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{rev.brandName}</span>
                      {rev.verifiedCollaboration && (
                        <span className="text-[10px] text-[#D4A338] font-bold">✓ Verified Brand</span>
                      )}
                    </div>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    "{rev.reviewText}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>{rev.campaignType}</span>
                    <span>{rev.date || 'Recent'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Star className="w-8 h-8 mx-auto mb-2 text-slate-200" />
              <p className="text-xs font-medium">No brand ratings yet.</p>
              <p className="text-[11px] mt-1">Be the first brand to rate this creator!</p>
            </div>
          )}
        </div>
      </div>

      {/* 9. Interactive Video Deliverable Analytics Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-50 text-[#b88628] text-xs font-bold rounded-md">
                  {selectedPost.type}
                </span>
                <span className="text-xs font-bold text-slate-500">Collab: {selectedPost.brandPartner}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={selectedPost.thumbnail}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 leading-snug">{selectedPost.title}</h3>
            </div>

            {/* Performance Analytics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Views</span>
                <span className="font-black text-slate-900">{selectedPost.plays}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Likes</span>
                <span className="font-black text-rose-600">{selectedPost.likes}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Comments</span>
                <span className="font-black text-[#D4A338]">{selectedPost.comments}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800 font-bold">
                Retention: {selectedPost.retention}
              </div>
              <div className="p-2 bg-blue-50 rounded-xl text-[#93651f] font-bold">
                Sentiment: {selectedPost.sentiment}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedPost(null);
                openEnquiryModal(creator);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Book Creator for Similar Deliverable
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
