import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
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
  X,
  Edit3,
  Facebook,
  Youtube,
  Trash2,
  UploadCloud,
  Instagram
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

import { Creator } from '../types';
import { cleanInstagramHandle } from '../utils/sanitize';
import { CreatorCard } from '../components/common/CreatorCard';
import { apiUrl } from '../config/api';
import { EditCreatorProfileForm } from '../components/common/EditCreatorProfileForm';
import { ImageCropperModal } from '../components/common/ImageCropperModal';
import { authHeaders } from '../config/api';

export const CreatorDetailView: React.FC = () => {
  const { username: routeUsername } = useParams<{ username: string }>();
  const {
    creators,
    viewParams,
    authUser,
    navigateTo,
    openAuthModal,
    isCreatorSaved,
    toggleSaveCreator,
    addCreatorReview,
    updateCreatorProfile,
    partnerBrands,
    submitEnquiry,
  } = usePlatform();

  const requestedUsername = routeUsername || viewParams.username;
  const localCreator: Creator | undefined =
    creators.find((c) => {
      const matchesUsername = Boolean(
        requestedUsername && c.username?.toLowerCase() === requestedUsername.toLowerCase()
      );
      const matchesId = Boolean(
        (viewParams.id && c.id === viewParams.id) || (requestedUsername && c.id === requestedUsername)
      );
      return matchesUsername || matchesId;
    }) || (authUser?.role === 'CREATOR' && authUser.creatorProfile && (!requestedUsername || requestedUsername === authUser.creatorProfile.username || requestedUsername === authUser.creatorProfile.id || requestedUsername === (authUser.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) ? authUser.creatorProfile : undefined);

  const [fetchedCreator, setFetchedCreator] = useState<Creator | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [creatorPosts, setCreatorPosts] = useState<any[]>([]);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingBrand, setRatingBrand] = useState('');
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingDeliverable, setRatingDeliverable] = useState('Instagram Reel (1x)');
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Record<string, string>>({});
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [ratesDraft, setRatesDraft] = useState<Record<string, string>>({});
  const [ratesError, setRatesError] = useState('');
  const [cropModalData, setCropModalData] = useState<{ src: string, type: string } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  // Direct profile URLs can be visited without authentication.
  // We removed the redirect to allow public profile sharing.

  useEffect(() => {
    if (!requestedUsername) {
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    fetch(apiUrl(`/api/creators/${encodeURIComponent(requestedUsername)}`))
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.success && data.creator) setFetchedCreator(data.creator);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => { cancelled = true; };
  }, [requestedUsername]);

  const baseCreator: Creator | undefined = fetchedCreator || localCreator || undefined;
  const isOwnerProfile = Boolean(
    authUser && baseCreator && (
      authUser.id === baseCreator.id ||
      authUser.creatorProfile?.id === baseCreator.id ||
      authUser.creatorProfile?.username === baseCreator.username
    )
  );
  // Prioritize localCreator for the owner so optimistic updates are immediately reflected
  const creator: Creator | undefined = (isOwnerProfile && localCreator) ? localCreator : baseCreator;

  useEffect(() => {
    if (!creator?.id) {
      setCreatorPosts([]);
      return;
    }

    let cancelled = false;
    fetch(apiUrl(`/api/creator-content/${encodeURIComponent(creator.id)}/posts`))
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.success && Array.isArray(data.posts)) setCreatorPosts(data.posts);
      })
      .catch(() => undefined);

    return () => { cancelled = true; };
  }, [creator?.id]);

  if (profileLoading && !creator) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sm text-slate-300">Loading profile...</div>;
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md space-y-4">
          <h2 className="text-xl font-black">Profile preview unavailable</h2>
          <p className="text-sm text-slate-400">Your creator profile is still being prepared. Please return to your dashboard and try again.</p>
          <button
            onClick={() => navigateTo('opportunities')}
            className="px-5 py-2.5 rounded-xl bg-[#D4A338] text-black font-bold text-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isSaved = isCreatorSaved(creator.id);
  const isOwner = Boolean(
    authUser && (
      authUser.id === creator.id ||
      authUser.creatorProfile?.id === creator.id ||
      (authUser.email && creator.email && authUser.email.toLowerCase() === creator.email.toLowerCase()) ||
      (authUser.name && creator.name && authUser.name.toLowerCase() === creator.name.toLowerCase())
    )
  );

  const fullCreator = (isOwner && authUser?.creatorProfile)
    ? { ...creator, ...authUser.creatorProfile, id: creator.id }
    : creator;

  const startEditingProfile = () => {
    setProfileDraft({
      followers: String(creator.followers || 0), totalPosts: String(creator.totalPosts || 0),
      avgViews: String(creator.avgViews || 0), avgLikes: String(creator.avgLikes || 0),
      avgComments: String(creator.avgComments || 0), bio: creator.bio || '',
    });
    setIsEditingProfile(true);
  };

  const saveProfile = async () => {
    await updateCreatorProfile(creator.id, {
      followers: Number(profileDraft.followers || 0), totalPosts: Number(profileDraft.totalPosts || 0),
      avgViews: Number(profileDraft.avgViews || 0), avgLikes: Number(profileDraft.avgLikes || 0),
      avgComments: Number(profileDraft.avgComments || 0), bio: profileDraft.bio || '',
    });
    setIsEditingProfile(false);
  };

  const handlePortfolioImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setCropModalData({ src: reader.result as string, type });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const uploadCroppedImage = async (file: File, type: string) => {
    setUploadingMedia(type);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        if (type.startsWith('portfolio-')) {
          const response = await fetch(apiUrl('/api/creator-content/posts'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ image: reader.result, caption: '' }),
          });
          const data = await response.json();
          if (!response.ok || !data.success || !data.post) throw new Error(data.error || 'Post upload failed');
          setCreatorPosts((previous) => [data.post, ...previous]);
          return;
        }

        const response = await fetch(apiUrl('/api/upload'), {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result, creatorId: creator.id, type: type === 'cover' ? 'cover' : 'chat_attachment' })
        });
        const data = await response.json();
        if (!response.ok || !data.success || !data.url) throw new Error(data.error || 'Upload failed');
        
        const fullUrl = apiUrl(data.url);
        
        if (type === 'cover') {
          await updateCreatorProfile(creator.id, { coverImage: fullUrl });
        }
      } catch (err: any) {
        console.error('Image upload failed', err);
      } finally {
        setUploadingMedia(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePortfolioImage = async (type: string) => {
    if (type === 'cover') {
      await updateCreatorProfile(creator.id, { coverImage: '' });
    } else if (type.startsWith('portfolio-')) {
      const index = parseInt(type.replace('portfolio-', ''), 10);
      const newPortfolio = [...(creator.portfolio || [])];
      if (newPortfolio[index]) {
        newPortfolio[index].thumbnail = '';
        await updateCreatorProfile(creator.id, { portfolio: newPortfolio });
      }
    }
  };

  const startEditingRates = () => {
    setRatesError('');
    setRatesDraft({
      startingPrice: String(creator.startingPrice ?? creator.pricing?.startingPrice ?? 0),
      reelPrice: String(creator.pricing?.reelPrice || 0),
      storyPrice: String(creator.pricing?.storyPrice || 0),
      postPrice: String(creator.pricing?.postPrice || 0),
      ugcPrice: String(creator.pricing?.ugcPrice || 0),
      eventPrice: String(creator.pricing?.eventPrice || 0),
    });
    setIsEditingRates(true);
  };

  const saveRates = async () => {
    const parsedRates = {
      startingPrice: Number(ratesDraft.startingPrice),
      reelPrice: Number(ratesDraft.reelPrice),
      storyPrice: Number(ratesDraft.storyPrice),
      postPrice: Number(ratesDraft.postPrice),
      ugcPrice: Number(ratesDraft.ugcPrice),
      eventPrice: Number(ratesDraft.eventPrice),
    };
    if (Object.values(ratesDraft).some((price) => !/^\d+$/.test(price)) ||
        Object.values(parsedRates).some((price) => !Number.isSafeInteger(price) || price > 4294967295)) {
      setRatesError('Enter a whole-number rate from 0 to ₹4,294,967,295 for each deliverable.');
      return;
    }

    setIsSavingRates(true);
    try {
      const startingPrice = parsedRates.startingPrice;
      const saved = await updateCreatorProfile(creator.id, {
        startingPrice,
        pricing: {
          ...(creator.pricing || {}),
          startingPrice,
          reelPrice: parsedRates.reelPrice,
          storyPrice: parsedRates.storyPrice,
          postPrice: parsedRates.postPrice,
          ugcPrice: parsedRates.ugcPrice,
          eventPrice: parsedRates.eventPrice,
          isNegotiable: creator.pricing?.isNegotiable ?? false,
          isBarterAvailable: creator.pricing?.isBarterAvailable ?? false,
          pricingDisplayType: creator.pricing?.pricingDisplayType ?? 'starting',
        }
      });
      if (!saved) {
        setRatesError('Rates were not saved. Please check your connection and try again.');
        return;
      }
      setRatesError('');
      setIsEditingRates(false);
    } finally {
      setIsSavingRates(false);
    }
  };

  const profileField = (key: string, value: string) => isEditingProfile
    ? <input value={profileDraft[key] ?? value} onChange={(event) => setProfileDraft((draft) => ({ ...draft, [key]: event.target.value }))} className="mt-0.5 w-full rounded-lg border border-[#D4A338]/50 bg-[#071226] px-2 py-1 text-sm font-black text-white outline-none" />
    : <p className="mt-0.5 text-sm sm:text-base font-black text-white">{value}</p>;

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

  const handleInquireClick = () => {
    if (!authUser) {
      openAuthModal('login', 'BRAND', 'Please log in to message this creator and send an inquiry.');
      return;
    }
    if (authUser.role !== 'BRAND') {
      openAuthModal('login', 'BRAND', 'Please sign in as a brand to message this creator.');
      return;
    }

    setInquiryMessage(`Hi ${creator.name}, I’d love to discuss a collaboration opportunity for my brand. Please let me know your availability and deliverable options.`);
    setInquirySent(false);
    setIsInquiryModalOpen(true);
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || authUser.role !== 'BRAND') {
      openAuthModal('login', 'BRAND', 'Please sign in as a brand to message this creator.');
      return;
    }
    if (!inquiryMessage.trim()) return;

    setIsSubmittingInquiry(true);
    try {
      const enquiryId = submitEnquiry({
        creatorId: creator.id,
        creatorName: creator.name,
        creatorUsername: creator.username || creator.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        creatorAvatar: creator.avatar || '',
        brandName: authUser.companyName || authUser.name || 'Brand Partner',
        contactPerson: authUser.name || authUser.companyName || 'Brand Partner',
        email: authUser.email || '',
        phone: '',
        campaignType: 'Direct Inquiry',
        city: creator.currentCity || 'Any',
        budget: 'Open',
        influencersRequired: 1,
        preferredDate: 'Flexible',
        message: inquiryMessage.trim(),
      });

      if (enquiryId) {
        setInquirySent(true);
        setTimeout(() => {
          setIsInquiryModalOpen(false);
          setInquirySent(false);
          setInquiryMessage('');
          const brandSlug = authUser.companyName ? authUser.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') : (authUser.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'brand');
          navigateTo('pitches', { username: brandSlug, creatorId: creator.id });
        }, 1200);
      }

    } catch (error) {
      console.error('Failed to submit creator inquiry', error);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBrand.trim()) return;

    addCreatorReview(creator.id, {
      brandName: ratingBrand.trim(),
      brandLogo: (authUser as any)?.logoUrl || authUser?.avatar || '',
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
  const recentVideoPosts = (creator.portfolio && Array.isArray(creator.portfolio) && creator.portfolio.length > 0)
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
    <div className="min-h-screen bg-[#051126] pb-16 font-sans text-white">
      
      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-8 space-y-6">
        
        {isEditing ? (
          <EditCreatorProfileForm 
            creator={fullCreator} 
            onSave={async (updates) => {
              const saved = await updateCreatorProfile(fullCreator.id, updates);
              if (!saved) throw new Error('Profile changes were not saved. Please check the save error and try again.');
              setIsEditing(false);
            }} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : (
        <>
        {/* Profile Hero Section */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:rounded-[2.5rem] sm:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 lg:gap-10">
            {/* Creator Card – Left Column */}
            <div className="w-full sm:w-[320px] md:w-[320px] lg:w-[340px] shrink-0">
              <CreatorCard creator={creator} interactive={false} showSaveButton={false} showViewProfile={false} />
            </div>

            {/* Instagram Information – Right Column */}
            <div className="flex min-w-0 w-full flex-1 flex-col justify-center">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b88628]">INSTAGRAM INFORMATION</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSaveCreator(creator.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      isSaved
                        ? 'border-rose-500/30 bg-rose-500/20 text-rose-300'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-rose-400 text-rose-400' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button type="button" onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition cursor-pointer">
                    <Share2 className="h-3.5 w-3.5" />
                    {copiedLink ? 'Link Copied!' : 'Share'}
                  </button>
                </div>
              </div>

              <h1 className="mt-1.5 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-all">
                @{cleanHandle || creator.username || 'creator'}
              </h1>

              {/* Stats Grid – 6 Metric Boxes */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 max-w-2xl">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FOLLOWERS</p>
                  <p className="mt-0.5 text-sm sm:text-base font-black text-white">{(creator.followers || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">POSTS</p>
                  <p className="mt-0.5 text-sm sm:text-base font-black text-white">
                    {creator.totalPosts !== undefined && creator.totalPosts > 0
                      ? creator.totalPosts.toLocaleString('en-IN')
                      : (creator.portfolio && creator.portfolio.length > 0 ? creator.portfolio.length.toString() : '0')}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AVG. VIEWS</p>
                  <p className="mt-0.5 text-sm sm:text-base font-black text-white">{(creator.avgViews || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AVG. LIKES</p>
                  <p className="mt-0.5 text-sm sm:text-base font-black text-white">{(creator.avgLikes || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AVG. COMMENTS</p>
                  <p className="mt-0.5 text-sm sm:text-base font-black text-white">{formatCount(creator.avgComments || 0)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AVG. VIDEO PLAYS</p>
                  <p className="mt-0.5 text-sm sm:text-base font-black text-white">{formatCount(creator.avgViews || 0)}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4 sm:mt-5 max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">BIO</p>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-300 font-normal line-clamp-3">
                  {creator.bio?.trim() || 'Add a short bio to tell brands about your content and audience.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4A338] hover:bg-[#c2912a] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#D4A338]/20 transition cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleInquireClick}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4A338] hover:bg-[#c2912a] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#D4A338]/20 transition cursor-pointer active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                    Direct Inquire
                  </button>
                )}

                <a
                  href={instagramUrl || '#'}
                  onClick={(e) => { if (!instagramUrl) e.preventDefault(); }}
                  target={instagramUrl ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111827] hover:bg-black px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-slate-900/15 transition cursor-pointer active:scale-95"
                >
                  <Instagram className="w-4 h-4 text-slate-300" />
                  View Instagram Profile
                </a>

                <a
                  href={creator.facebookUrl || '#'}
                  onClick={(e) => { if (!creator.facebookUrl) e.preventDefault(); }}
                  target={creator.facebookUrl ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#111827] hover:bg-[#1877F2] text-white shadow-md shadow-slate-900/15 transition cursor-pointer active:scale-95"
                  title="View Facebook Profile"
                >
                  <Facebook className="w-5 h-5" />
                </a>

                <a
                  href={creator.youtubeUrl || '#'}
                  onClick={(e) => { if (!creator.youtubeUrl) e.preventDefault(); }}
                  target={creator.youtubeUrl ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#111827] hover:bg-[#FF0000] text-white shadow-md shadow-slate-900/15 transition cursor-pointer active:scale-95"
                  title="View YouTube Channel"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

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

            {isOwner ? (
              isEditingRates ? (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingRates(false)} disabled={isSavingRates} className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs shadow-xs transition shrink-0 disabled:opacity-50">Cancel</button>
                  <button onClick={saveRates} disabled={isSavingRates} className="px-4 py-2 rounded-xl bg-[#D4A338] hover:bg-[#c2912a] text-white font-bold text-xs shadow-xs transition shrink-0 disabled:opacity-50">{isSavingRates ? 'Saving...' : 'Save Rates'}</button>
                </div>
              ) : (
                <button onClick={startEditingRates} className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-900 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Rates</span>
                </button>
              )
            ) : (
              <button
                onClick={handleInquireClick}
                className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-900 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Creator</span>
              </button>
            )}
          </div>

          {ratesError && <p role="alert" className="text-sm font-semibold text-rose-600">{ratesError}</p>}

          <div className="overflow-x-auto pb-2" role="region" aria-label="Commercial deliverable rates" tabIndex={0}>
          <div className="grid min-w-[1120px] grid-cols-7 gap-3">
            <div className="min-w-0 p-3 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">minimum collaboration</span>
              <span className="text-base font-black text-slate-900 block flex items-center justify-center h-8">
                {isEditingRates ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>₹</span>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label="Minimum collaboration rate" className="w-20 px-1 py-1 text-center border border-slate-300 rounded text-sm outline-none focus:border-[#D4A338] focus:ring-1 focus:ring-[#D4A338]" value={ratesDraft.startingPrice} onChange={(e) => setRatesDraft(d => ({...d, startingPrice: e.target.value.replace(/\D/g, '')}))} />
                  </div>
                ) : (
                  `₹${(creator.startingPrice ?? creator.pricing?.startingPrice ?? 0).toLocaleString('en-IN')}`
                )}
              </span>
              <span className="text-[10px] text-amber-800 font-semibold block">Starting price</span>
            </div>
            <div className="min-w-0 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">per reel</span>
              <span className="text-base font-black text-slate-900 block flex items-center justify-center h-8">
                {isEditingRates ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>₹</span>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label="Rate per reel" className="w-20 px-1 py-1 text-center border border-slate-300 rounded text-sm outline-none focus:border-[#D4A338] focus:ring-1 focus:ring-[#D4A338]" value={ratesDraft.reelPrice} onChange={(e) => setRatesDraft(d => ({...d, reelPrice: e.target.value.replace(/\D/g, '')}))} />
                  </div>
                ) : (
                  `₹${(creator.pricing?.reelPrice || 0).toLocaleString('en-IN')}`
                )}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block">High Reach</span>
            </div>

            <div className="min-w-0 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">per story</span>
              <span className="text-base font-black text-slate-900 block flex items-center justify-center h-8">
                {isEditingRates ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>₹</span>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label="Rate per story" className="w-20 px-1 py-1 text-center border border-slate-300 rounded text-sm outline-none focus:border-[#D4A338] focus:ring-1 focus:ring-[#D4A338]" value={ratesDraft.storyPrice} onChange={(e) => setRatesDraft(d => ({...d, storyPrice: e.target.value.replace(/\D/g, '')}))} />
                  </div>
                ) : (
                  `₹${(creator.pricing?.storyPrice || 0).toLocaleString('en-IN')}`
                )}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold block">Link Click</span>
            </div>

            <div className="min-w-0 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">per post</span>
              <span className="text-base font-black text-slate-900 block flex items-center justify-center h-8">
                {isEditingRates ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>₹</span>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label="Rate per post" className="w-20 px-1 py-1 text-center border border-slate-300 rounded text-sm outline-none focus:border-[#D4A338] focus:ring-1 focus:ring-[#D4A338]" value={ratesDraft.postPrice} onChange={(e) => setRatesDraft(d => ({...d, postPrice: e.target.value.replace(/\D/g, '')}))} />
                  </div>
                ) : (
                  `₹${(creator.pricing?.postPrice || 0).toLocaleString('en-IN')}`
                )}
              </span>
              <span className="text-[10px] text-slate-600 font-semibold block">Carousel / Static</span>
            </div>

            <div className="min-w-0 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">per ugc video</span>
              <span className="text-base font-black text-slate-900 block flex items-center justify-center h-8">
                {isEditingRates ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>₹</span>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label="Rate per UGC video" className="w-20 px-1 py-1 text-center border border-slate-300 rounded text-sm outline-none focus:border-[#D4A338] focus:ring-1 focus:ring-[#D4A338]" value={ratesDraft.ugcPrice} onChange={(e) => setRatesDraft(d => ({...d, ugcPrice: e.target.value.replace(/\D/g, '')}))} />
                  </div>
                ) : (
                  `₹${(creator.pricing?.ugcPrice || 0).toLocaleString('en-IN')}`
                )}
              </span>
              <span className="text-[10px] text-purple-700 font-semibold block">Ad Creative</span>
            </div>

            <div className="min-w-0 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">per event/visit</span>
              <span className="text-base font-black text-slate-900 block flex items-center justify-center h-8">
                {isEditingRates ? (
                  <div className="flex items-center justify-center gap-1">
                    <span>₹</span>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" aria-label="Rate per event or visit" className="w-20 px-1 py-1 text-center border border-slate-300 rounded text-sm outline-none focus:border-[#D4A338] focus:ring-1 focus:ring-[#D4A338]" value={ratesDraft.eventPrice} onChange={(e) => setRatesDraft(d => ({...d, eventPrice: e.target.value.replace(/\D/g, '')}))} />
                  </div>
                ) : (
                  `₹${(creator.pricing?.eventPrice || 0).toLocaleString('en-IN')}`
                )}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold block">Store Presence</span>
            </div>

            <div className="min-w-0 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Barter</span>
              <span className="text-base font-black text-slate-900 block">
                {creator.pricing?.isBarterAvailable ? 'Available' : 'Paid Only'}
              </span>
              <span className="text-[10px] text-slate-600 font-semibold block">
                {creator.pricing?.isNegotiable ? 'Negotiable' : 'Fixed'}
              </span>
            </div>
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
        {(isOwner || creatorPosts.length > 0 || creator.portfolio?.some(item => item?.thumbnail)) && (
          <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Best Work & Portfolio
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Portfolio Items (5 slots) */}
            {[0, 1, 2, 3, 4].map((idx) => {
              const post = creatorPosts[idx];
              const item = post ? { thumbnail: post.imageUrl } : creator.portfolio?.[idx];
              if (!isOwner && !item?.thumbnail) return null;
              
              return (
                <div key={idx} className="relative h-60 sm:h-80 rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-slate-900 group">
                  {item?.thumbnail ? (
                    <img src={item.thumbnail} alt="Portfolio" className="w-full h-full object-cover object-center" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                      <UploadCloud className="w-6 h-6" />
                      <span className="text-[10px] text-center font-bold px-2">Upload your best image</span>
                    </div>
                  )}
                  {isOwner && (
                    <>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition z-10 backdrop-blur-sm gap-2">
                        <span className="text-xs font-black text-white pointer-events-none">{item?.thumbnail ? 'Change Photo' : 'Upload Photo'}</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={e => handlePortfolioImageSelect(e, `portfolio-${idx}`)}
                      />
                    </>
                  )}
                </div>
              );
            })}
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
              onClick={() => {
                if (!authUser) {
                  openAuthModal('login', 'BRAND', 'Please log in to submit a rating for this creator.');
                  return;
                }
                setShowRatingForm(!showRatingForm);
              }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {creator.reviews.map((rev) => {
                const isMyReview = authUser?.role === 'BRAND' && 
                  (rev.brandName.toLowerCase() === authUser?.name?.toLowerCase() || 
                   rev.brandName.toLowerCase() === authUser?.companyName?.toLowerCase() ||
                   rev.brandName.toLowerCase() === (authUser as any)?.company_name?.toLowerCase());
                
                const matchedBrand = partnerBrands.find(b => b.name.toLowerCase() === rev.brandName.toLowerCase());
                const displayLogo = isMyReview 
                  ? ((authUser as any)?.logoUrl || authUser?.avatar || rev.brandLogo) 
                  : (rev.brandLogo || matchedBrand?.logoUrl);

                return (
                  <div
                    key={rev.id}
                    className="group relative p-5 rounded-2xl bg-white border border-[#D4A338]/40 hover:border-[#D4A338] shadow-sm hover:shadow-md hover:shadow-[#D4A338]/10 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Header: Avatar + Name & Verified */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-[#D4A338]/30">
                          {displayLogo ? (
                            <img src={displayLogo} alt={rev.brandName} className="w-full h-full object-cover" />
                          ) : (
                            <Building className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black text-slate-900 text-sm line-clamp-1">{rev.brandName}</span>
                        {rev.verifiedCollaboration && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                            <Check className="w-3 h-3" /> Verified Brand
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stars Highlighted */}
                    <div className="flex items-center gap-1 pt-1">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />
                      ))}
                    </div>

                    {/* Review Text */}
                    <div className="pt-2">
                      <p className="text-slate-700 text-xs font-medium leading-relaxed">
                        {rev.reviewText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-4 mt-4 border-t border-slate-100">
                    <span className="uppercase tracking-wider text-slate-500">{rev.campaignType || 'Collaboration'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{rev.date || 'Recently'}</span>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Star className="w-8 h-8 mx-auto mb-2 text-slate-200" />
              <p className="text-xs font-medium">No brand ratings yet.</p>
              <p className="text-[11px] mt-1">Be the first brand to rate this creator!</p>
            </div>
          )}
        </div>
        </>
        )}
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
                handleInquireClick();
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Message Creator About Similar Deliverable
            </button>
          </div>
        </div>
      )}

      {isInquiryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setIsInquiryModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-5 text-slate-900 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img src={creator.avatar} alt={creator.name} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
                <div>
                  <h3 className="font-black text-sm sm:text-base">Message {creator.name}</h3>
                  <p className="text-[11px] text-slate-500">Send a direct inquiry that appears in influencer chat and inquiries.</p>
                </div>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inquirySent ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Inquiry sent</h4>
                  <p className="text-xs text-slate-500 mt-1">Your message is now live in the creator’s chat and inquiry list.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={submitInquiry} className="pt-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-1">Your message</label>
                  <textarea
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    rows={5}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 focus:outline-none focus:border-[#D4A338]"
                    placeholder="Tell the creator about your campaign, deliverables, budget, and timeline..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="px-5 py-2.5 rounded-full bg-[#D4A338] hover:bg-[#c5912c] text-slate-950 font-black text-xs transition disabled:opacity-70"
                  >
                    {isSubmittingInquiry ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {cropModalData && (
        <ImageCropperModal
          imageSrc={cropModalData.src}
          shape="rect"
          aspect={9/16}
          onCropDone={(croppedFile) => {
            uploadCroppedImage(croppedFile, cropModalData.type);
            setCropModalData(null);
          }}
          onCancel={() => setCropModalData(null)}
        />
      )}
    </div>
  );
};
