import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  ShieldCheck,
  IndianRupee,
  MessageSquare,
  Flame,
  CheckCircle2,
  Clock,
  Settings,
  Eye,
  Sparkles,
  Save,
  MapPin,
  Camera,
  ExternalLink,
  Lock,
  ArrowRight,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  Film,
  Trash2,
  Play,
  Plus,
  Edit3,
  Globe,
  Users,
  TrendingUp,
  X
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { TrustScoreBadge } from '../components/common/TrustScoreBadge';
import { ChangePasswordForm } from '../components/common/ChangePasswordForm';

export const CreatorDashboardView: React.FC = () => {
  const {
    activeCreatorId,
    creators,
    enquiries,
    campaigns,
    updateCreatorProfile,
    updateEnquiryStatus,
    navigateTo,
    openTrustScoreModal,
    authUser,
    openAuthModal,
  } = usePlatform();

  // File input refs for photo uploads
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const reelVideoInputRef = useRef<HTMLInputElement>(null);
  const reelThumbnailInputRef = useRef<HTMLInputElement>(null);
  const cardReelInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingCardReel, setIsUploadingCardReel] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Reel upload states
  const [isUploadingReel, setIsUploadingReel] = useState(false);
  const [reelTitle, setReelTitle] = useState('');
  const [reelBrandName, setReelBrandName] = useState('');
  const [uploadedReelUrl, setUploadedReelUrl] = useState('');
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState('');
  const [reelUploadSuccess, setReelUploadSuccess] = useState(false);

  // Find the exact creator profile matching the logged-in influencer
  const creator =
    creators.find(
      (c) =>
        (authUser && c.email?.toLowerCase() === authUser.email?.toLowerCase()) ||
        (authUser && c.id === authUser.id) ||
        (authUser?.creatorProfile && c.id === authUser.creatorProfile.id) ||
        (authUser?.name && c.username?.toLowerCase() === authUser.name.toLowerCase().replace(/[^a-z0-9_]/g, '')) ||
        c.id === activeCreatorId
    ) || authUser?.creatorProfile || creators[0];

  const [activeTab, setActiveTab] = useState<'leads' | 'rates' | 'reels' | 'profile' | 'pitches' | 'settings'>('leads');

  // Form states synced with creator's database fields
  const [bio, setBio] = useState(creator.bio || '');
  const [reelVideoUrl, setReelVideoUrl] = useState(creator.reelVideoUrl || '');
  const [startingPrice, setStartingPrice] = useState(creator.startingPrice || 5000);
  const [reelPrice, setReelPrice] = useState(creator.pricing?.reelPrice || 6000);
  const [storyPrice, setStoryPrice] = useState(creator.pricing?.storyPrice || 2500);
  const [ugcPrice, setUgcPrice] = useState(creator.pricing?.ugcPrice || 5000);
  const [isBarterAvailable, setIsBarterAvailable] = useState(creator.pricing?.isBarterAvailable ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // === Profile Edit States ===
  const [profileName, setProfileName] = useState(creator.name || '');
  const [profileBio, setProfileBio] = useState(creator.bio || '');
  const [profileCity, setProfileCity] = useState(creator.currentCity || '');
  const [profileState, setProfileState] = useState(creator.state || '');
  const [profileGender, setProfileGender] = useState(creator.gender || 'Female');
  const [profileAgeGroup, setProfileAgeGroup] = useState(creator.ageGroup || '22-29');
  const [profileLanguages, setProfileLanguages] = useState((creator.languages || []).join(', '));
  const [profileCategory, setProfileCategory] = useState(creator.primaryCategory || '');
  const [profileSubCats, setProfileSubCats] = useState((creator.subCategories || []).join(', '));
  const [profileFollowers, setProfileFollowers] = useState(creator.followers || 0);
  const [profileEngagement, setProfileEngagement] = useState(creator.engagementRate || 0);
  const [profileAvgViews, setProfileAvgViews] = useState(creator.avgViews || 0);
  const [profileAvgLikes, setProfileAvgLikes] = useState(creator.avgLikes || 0);
  const [profileAvgComments, setProfileAvgComments] = useState(creator.avgComments || 0);
  const [profilePostPrice, setProfilePostPrice] = useState(creator.pricing?.postPrice || 0);
  const [profileEventPrice, setProfileEventPrice] = useState(creator.pricing?.eventPrice || 0);
  const [profileNegotiable, setProfileNegotiable] = useState(creator.pricing?.isNegotiable ?? true);
  const [profileSaved, setProfileSaved] = useState(false);

  // Sync state whenever creator profile updates from database
  useEffect(() => {
    if (creator) {
      setBio(creator.bio || '');
      setReelVideoUrl(creator.reelVideoUrl || '');
      setStartingPrice(creator.startingPrice || 5000);
      setReelPrice(creator.pricing?.reelPrice || 6000);
      setStoryPrice(creator.pricing?.storyPrice || 2500);
      setUgcPrice(creator.pricing?.ugcPrice || 5000);
      setIsBarterAvailable(creator.pricing?.isBarterAvailable ?? true);
      // Sync profile edit states
      setProfileName(creator.name || '');
      setProfileBio(creator.bio || '');
      setProfileCity(creator.currentCity || '');
      setProfileState(creator.state || '');
      setProfileGender(creator.gender || 'Female');
      setProfileAgeGroup(creator.ageGroup || '22-29');
      setProfileLanguages((creator.languages || []).join(', '));
      setProfileCategory(creator.primaryCategory || '');
      setProfileSubCats((creator.subCategories || []).join(', '));
      setProfileFollowers(creator.followers || 0);
      setProfileEngagement(creator.engagementRate || 0);
      setProfileAvgViews(creator.avgViews || 0);
      setProfileAvgLikes(creator.avgLikes || 0);
      setProfileAvgComments(creator.avgComments || 0);
      setProfilePostPrice(creator.pricing?.postPrice || 0);
      setProfileEventPrice(creator.pricing?.eventPrice || 0);
      setProfileNegotiable(creator.pricing?.isNegotiable ?? true);
    }
  }, [creator?.id, creator?.startingPrice, creator?.bio, creator?.avatar, creator?.coverImage, creator?.reelVideoUrl]);

  // Handle Reel / Video Upload
  const handleReelUpload = async (file: File, type: 'video' | 'thumbnail') => {
    setIsUploadingReel(true);
    setUploadNotice(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            creatorId: creator.id,
            type: type === 'video' ? 'reel_video' : 'reel_thumbnail',
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          if (type === 'video') {
            setUploadedReelUrl(data.url);
            setUploadNotice('Video uploaded successfully!');
          } else {
            setUploadedThumbnailUrl(data.url);
            setUploadNotice('Thumbnail uploaded successfully!');
          }
          setTimeout(() => setUploadNotice(null), 3000);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
        setIsUploadingReel(false);
      };
    } catch (err: any) {
      console.error('Reel upload error:', err);
      setUploadNotice('Upload failed. Please try again.');
      setIsUploadingReel(false);
    }
  };

  // Save reel to portfolio in DB
  const handleSaveReel = () => {
    if (!reelTitle.trim() && !uploadedReelUrl && !uploadedThumbnailUrl) return;
    const newPortfolioItem = {
      id: `p_${Date.now()}`,
      type: 'reel' as const,
      title: reelTitle.trim() || 'My Reel',
      thumbnail: uploadedThumbnailUrl || creator.avatar || '',
      videoUrl: uploadedReelUrl || '',
      url: uploadedReelUrl || '',
      plays: 0,
      likes: 0,
      comments: 0,
      engagement: `${creator.engagementRate || 0}%`,
      brandName: reelBrandName.trim() || '',
    };
    const updatedPortfolio = [newPortfolioItem, ...(creator.portfolio || [])];
    updateCreatorProfile(creator.id, { portfolio: updatedPortfolio });
    setReelUploadSuccess(true);
    setReelTitle('');
    setReelBrandName('');
    setUploadedReelUrl('');
    setUploadedThumbnailUrl('');
    setTimeout(() => setReelUploadSuccess(false), 3000);
  };

  // Delete a reel from portfolio
  const handleDeleteReel = (itemId: string) => {
    const updatedPortfolio = (creator.portfolio || []).filter(p => p.id !== itemId);
    updateCreatorProfile(creator.id, { portfolio: updatedPortfolio });
  };

  // Handle Card Reel Video Upload (saves to reelVideoUrl -> autoplays on creator card)
  const handleCardReelUpload = async (file: File) => {
    setIsUploadingCardReel(true);
    setUploadNotice(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            creatorId: creator.id,
            type: 'reel_video',
          }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          // Save to reelVideoUrl - this shows on creator card homepage
          updateCreatorProfile(creator.id, { reelVideoUrl: data.url });
          setReelVideoUrl(data.url);
          setUploadNotice('🎬 Card reel uploaded! It will now autoplay on your profile card on the home page.');
          setTimeout(() => setUploadNotice(null), 5000);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
        setIsUploadingCardReel(false);
      };
    } catch (err: any) {
      console.error('Card reel upload error:', err);
      setUploadNotice('Upload failed. Please try again.');
      setIsUploadingCardReel(false);
    }
  };

  // Handle Photo Upload to Cloudinary & Database
  const handlePhotoUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (type === 'avatar') setIsUploadingAvatar(true);
    else setIsUploadingCover(true);
    setUploadNotice(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            creatorId: creator.id,
            type,
          }),
        });

        const data = await res.json();
        if (data.success && data.url) {
          if (type === 'avatar') {
            updateCreatorProfile(creator.id, { avatar: data.url });
            setUploadNotice('Profile avatar uploaded to Cloudinary & updated in database!');
          } else {
            updateCreatorProfile(creator.id, { coverImage: data.url });
            setUploadNotice('Cover banner uploaded to Cloudinary & updated in database!');
          }
          setTimeout(() => setUploadNotice(null), 3000);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      };
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setUploadNotice('Failed to upload photo. Please try again.');
    } finally {
      if (type === 'avatar') setIsUploadingAvatar(false);
      else setIsUploadingCover(false);
    }
  };

  // RBAC Access Guard: If not signed in as a Creator / Admin
  if (!authUser || (authUser.role !== 'CREATOR' && authUser.role !== 'ADMIN')) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xl space-y-5 animate-scaleUp">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Creator Portal Restricted
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This private dashboard is only accessible to verified Indian Creators & Influencers. Please sign in or register your creator account to continue.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={openAuthModal}
              className="w-full py-3 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In / Create Creator Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hidden File Inputs for photos & card reel
  const hiddenFileInputs = (
    <>
      <input type="file" ref={avatarInputRef} accept="image/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0], 'avatar'); }} />
      <input type="file" ref={coverInputRef} accept="image/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0], 'cover'); }} />
      <input type="file" ref={cardReelInputRef} accept="video/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleCardReelUpload(e.target.files[0]); }} />
    </>
  );
  const myEnquiries = enquiries.filter((e) => e.creatorId === creator.id || e.creatorId === 'all');

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    updateCreatorProfile(creator.id, {
      bio,
      reelVideoUrl,
      startingPrice: Number(startingPrice),
      pricing: {
        ...creator.pricing,
        startingPrice: Number(startingPrice),
        reelPrice: Number(reelPrice),
        storyPrice: Number(storyPrice),
        ugcPrice: Number(ugcPrice),
        isBarterAvailable,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLanguages = profileLanguages.split(',').map(l => l.trim()).filter(Boolean);
    const parsedSubCats = profileSubCats.split(',').map(s => s.trim()).filter(Boolean);
    updateCreatorProfile(creator.id, {
      name: profileName.trim(),
      bio: profileBio.trim(),
      currentCity: profileCity.trim(),
      state: profileState.trim(),
      gender: profileGender as any,
      ageGroup: profileAgeGroup,
      languages: parsedLanguages,
      primaryCategory: profileCategory.trim(),
      subCategories: parsedSubCats,
      followers: Number(profileFollowers),
      engagementRate: Number(profileEngagement),
      avgViews: Number(profileAvgViews),
      avgLikes: Number(profileAvgLikes),
      avgComments: Number(profileAvgComments),
      pricing: {
        ...creator.pricing,
        postPrice: Number(profilePostPrice),
        eventPrice: Number(profileEventPrice),
        isNegotiable: profileNegotiable,
      },
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Hidden File Inputs */}
        <input type="file" ref={avatarInputRef} accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0], 'avatar'); }} />
        <input type="file" ref={coverInputRef} accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0], 'cover'); }} />
        <input type="file" ref={cardReelInputRef} accept="video/mp4,video/mov,video/avi,video/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleCardReelUpload(e.target.files[0]); }} />

        {/* Upload Notification Banner */}
        {uploadNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{uploadNotice}</span>
            </div>
          </div>
        )}

        {/* Top Header Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Interactive Avatar with Camera Upload Overlay */}
            <div className="relative group">
              <img
                src={creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt={creator.name}
                className="w-18 h-18 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:opacity-85 transition"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                title="Upload Photo to Cloudinary"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Change</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{creator.name}</h1>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md flex items-center gap-1 border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3" />
                  Live in Database
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">@{creator.username} • {creator.primaryCategory}</p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {creator.currentCity}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cloudinary Photo Change Buttons */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#b88628] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-blue-200"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              <span>Upload Avatar</span>
            </button>

            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              {isUploadingCover ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>Change Cover</span>
            </button>

            <div
              className="flex items-center gap-2 p-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
              onClick={openTrustScoreModal}
            >
              <TrustScoreBadge score={creator.trustScore || 89} size="sm" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-slate-500 block leading-tight">TrustScore</span>
                <span className="text-xs font-black text-slate-900">Verified</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('creator-detail', { username: creator.username, id: creator.id })}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-bold gap-1 overflow-x-auto">
          {[
            { key: 'leads', icon: <MessageSquare className="w-3.5 h-3.5" />, label: `Enquiries (${myEnquiries.length})` },
            { key: 'profile', icon: <Edit3 className="w-3.5 h-3.5" />, label: 'Edit Profile' },
            { key: 'rates', icon: <IndianRupee className="w-3.5 h-3.5" />, label: 'Rate Card' },
            { key: 'reels', icon: <Film className="w-3.5 h-3.5" />, label: `Reels (${(creator.portfolio || []).length})` },
            { key: 'pitches', icon: <Flame className="w-3.5 h-3.5" />, label: `Briefs (${campaigns.length})` },
            { key: 'settings', icon: <Settings className="w-3.5 h-3.5" />, label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-3 flex items-center gap-1.5 transition cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === tab.key ? 'border-blue-600 text-[#D4A338]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* === Edit Profile Tab === */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-5 animate-fadeIn">
            {/* Success Banner */}
            {profileSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully in database!</span>
              </div>
            )}

            {/* Section 1: Photos */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4A338]" />
                Profile Photos & Card Reel Video
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Avatar Upload */}
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 cursor-pointer transition group flex items-center gap-3"
                >
                  <div className="relative shrink-0">
                    <img
                      src={creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                      alt="Avatar"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      {isUploadingAvatar ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Profile Photo</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP</p>
                    <p className="text-[10px] text-blue-500 font-bold mt-1">{isUploadingAvatar ? 'Uploading...' : 'Click to change'}</p>
                  </div>
                </div>

                {/* Cover Photo Upload */}
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 cursor-pointer transition group flex items-center gap-3 overflow-hidden"
                >
                  {creator.coverImage && (
                    <div className="absolute inset-0">
                      <img src={creator.coverImage} alt="Cover" className="w-full h-full object-cover opacity-25" />
                    </div>
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                      {isUploadingCover ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Cover / Banner</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">1200×400px ideal</p>
                      <p className="text-[10px] text-blue-500 font-bold mt-1">{isUploadingCover ? 'Uploading...' : 'Click to change'}</p>
                    </div>
                  </div>
                </div>

                {/* Card Reel Video Upload - autoplays on homepage card */}
                <div
                  onClick={() => cardReelInputRef.current?.click()}
                  className="relative border-2 border-dashed border-violet-300 hover:border-violet-500 bg-violet-50/50 hover:bg-violet-50 rounded-2xl p-4 cursor-pointer transition group overflow-hidden"
                >
                  {creator.reelVideoUrl ? (
                    <>
                      <video
                        src={creator.reelVideoUrl}
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                        autoPlay muted loop playsInline
                      />
                      <div className="relative z-10 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-md">
                          {isUploadingCardReel ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Play className="w-5 h-5 text-white fill-white" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-violet-900">Card Reel ✓ Active</p>
                          <p className="text-[10px] text-violet-600 mt-0.5">Autoplays on home card</p>
                          <p className="text-[10px] text-violet-500 font-bold mt-1">{isUploadingCardReel ? 'Uploading...' : 'Click to replace'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center border-2 border-dashed border-violet-300 shrink-0 group-hover:bg-violet-200 transition">
                        {isUploadingCardReel ? <Loader2 className="w-5 h-5 animate-spin text-violet-600" /> : <Film className="w-5 h-5 text-violet-400" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-violet-900">Card Reel Video</p>
                        <p className="text-[10px] text-violet-500 mt-0.5">Autoplays on home page card</p>
                        <p className="text-[10px] text-violet-600 font-bold mt-1">{isUploadingCardReel ? 'Uploading...' : '+ Upload MP4 / MOV'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Current card reel status */}
              {creator.reelVideoUrl && (
                <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-violet-700">
                    <Play className="w-3.5 h-3.5 fill-violet-600 text-violet-600" />
                    <span className="font-bold">Card reel is live on your profile card</span>
                    <span className="text-violet-400">• Brands can see it auto-playing on home page</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCreatorProfile(creator.id, { reelVideoUrl: '' });
                      setReelVideoUrl('');
                    }}
                    className="text-red-500 hover:text-red-700 font-bold text-[10px] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {uploadNotice && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  uploadNotice.includes('failed') || uploadNotice.includes('Failed')
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{uploadNotice}</span>
                </div>
              )}
            </div>

            {/* Section 2: Basic Info */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#D4A338]" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Your full display name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Primary Category *</label>
                  <select
                    value={profileCategory}
                    onChange={e => setProfileCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  >
                    {['Fashion', 'Beauty', 'Food', 'Travel', 'Lifestyle', 'Fitness', 'Technology', 'Gaming', 'Finance', 'Education', 'Automotive', 'Comedy', 'Entertainment', 'Luxury', 'Photography', 'Business', 'Healthcare', 'Motivation', 'Jewellery', 'Home & Interiors', 'Wedding', 'Events', 'Parenting', 'Real Estate'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Sub-Categories <span className="text-slate-400 font-normal">(comma separated)</span></label>
                  <input
                    type="text"
                    value={profileSubCats}
                    onChange={e => setProfileSubCats(e.target.value)}
                    placeholder="e.g. Skincare, Makeup, Wellness"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Current City *</label>
                  <select
                    value={profileCity}
                    onChange={e => setProfileCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  >
                    {['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune', 'Noida', 'Gurgaon', 'Jaipur', 'Chandigarh', 'Lucknow', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Vadodara', 'Indore', 'Bhopal', 'Nagpur', 'Patna', 'Ranchi', 'Guwahati', 'Kochi', 'Coimbatore', 'Mysore'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">State</label>
                  <input
                    type="text"
                    value={profileState}
                    onChange={e => setProfileState(e.target.value)}
                    placeholder="e.g. Maharashtra, Delhi, Karnataka"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Languages <span className="text-slate-400 font-normal">(comma separated)</span></label>
                  <input
                    type="text"
                    value={profileLanguages}
                    onChange={e => setProfileLanguages(e.target.value)}
                    placeholder="e.g. Hindi, English, Marathi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Gender</label>
                  <select
                    value={profileGender}
                    onChange={e => setProfileGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Age Group</label>
                  <select
                    value={profileAgeGroup}
                    onChange={e => setProfileAgeGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  >
                    {['18-21', '22-29', '25-34', '30-39', '35-44', '40+'].map(ag => (
                      <option key={ag} value={ag}>{ag} yrs</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1 text-xs">Creator Bio / About You *</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={e => setProfileBio(e.target.value)}
                  placeholder="Describe yourself, your niche, and what brands you love working with..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs font-medium outline-none resize-none"
                />
              </div>
            </div>

            {/* Section 3: Performance Metrics */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4A338]" />
                Performance Metrics
                <span className="text-[10px] font-medium text-slate-400 ml-1">Shown on your public profile</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Followers</label>
                  <input
                    type="number"
                    value={profileFollowers}
                    onChange={e => setProfileFollowers(Number(e.target.value))}
                    placeholder="165000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Engagement % </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profileEngagement}
                    onChange={e => setProfileEngagement(Number(e.target.value))}
                    placeholder="4.8"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Avg Video Views</label>
                  <input
                    type="number"
                    value={profileAvgViews}
                    onChange={e => setProfileAvgViews(Number(e.target.value))}
                    placeholder="120000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Avg Likes</label>
                  <input
                    type="number"
                    value={profileAvgLikes}
                    onChange={e => setProfileAvgLikes(Number(e.target.value))}
                    placeholder="7400"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Avg Comments</label>
                  <input
                    type="number"
                    value={profileAvgComments}
                    onChange={e => setProfileAvgComments(Number(e.target.value))}
                    placeholder="910"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Extra Pricing */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#D4A338]" />
                Additional Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Feed Post Price (₹)</label>
                  <input
                    type="number"
                    value={profilePostPrice}
                    onChange={e => setProfilePostPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Event / Visit Price (₹)</label>
                  <input
                    type="number"
                    value={profileEventPrice}
                    onChange={e => setProfileEventPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <label className="block text-slate-600 font-bold mb-1">Pricing Mode</label>
                  <div className="flex flex-col gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileNegotiable}
                        onChange={e => setProfileNegotiable(e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-700">Prices are Negotiable</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBarterAvailable}
                        onChange={e => setIsBarterAvailable(e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-700">Barter / Product Collab Available</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save All Profile Changes to Database</span>
            </button>
          </form>
        )}

        {/* Tab 1: Commercial Rate Card */}
        {activeTab === 'rates' && (

          <form onSubmit={handleSaveRates} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Manage Commercial Rate Card</h3>
                <p className="text-xs text-slate-500">Update your pricing. Changes are directly saved to the MySQL database.</p>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save to Database</span>
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Rate card & bio successfully updated in MySQL database!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Starting Price (₹)</label>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Instagram Reel (₹)</label>
                <input
                  type="number"
                  value={reelPrice}
                  onChange={(e) => setReelPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Story with Link (₹)</label>
                <input
                  type="number"
                  value={storyPrice}
                  onChange={(e) => setStoryPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">UGC Video Ad (₹)</label>
                <input
                  type="number"
                  value={ugcPrice}
                  onChange={(e) => setUgcPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">Creator Bio & Collaboration Pitch</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="barterAvailable"
                checked={isBarterAvailable}
                onChange={(e) => setIsBarterAvailable(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="barterAvailable" className="text-xs font-bold text-slate-700 cursor-pointer">
                Available for Barter / Product Collaborations
              </label>
            </div>
          </form>
        )}

        {/* Tab: Reels & Portfolio Upload */}
        {activeTab === 'reels' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={reelVideoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleReelUpload(e.target.files[0], 'video');
              }}
            />
            <input
              type="file"
              ref={reelThumbnailInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleReelUpload(e.target.files[0], 'thumbnail');
              }}
            />

            {/* Upload New Reel */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Film className="w-5 h-5 text-[#D4A338]" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Upload New Reel / Portfolio Content</h3>
                  <p className="text-xs text-slate-500">Uploaded reels appear on your public profile for brands to see</p>
                </div>
              </div>

              {uploadNotice && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  uploadNotice.includes('failed') || uploadNotice.includes('Failed')
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{uploadNotice}</span>
                </div>
              )}

              {reelUploadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reel saved to your profile & database successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-xs">Reel Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. My Summer Collection Look"
                    value={reelTitle}
                    onChange={(e) => setReelTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-xs">Brand Name (if collab)</label>
                  <input
                    type="text"
                    placeholder="e.g. Nykaa, Myntra, Zomato"
                    value={reelBrandName}
                    onChange={(e) => setReelBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video Upload */}
                <div
                  onClick={() => reelVideoInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition group"
                >
                  {isUploadingReel ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="text-xs text-slate-500 font-medium">Uploading...</span>
                    </div>
                  ) : uploadedReelUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <Play className="w-8 h-8 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-bold">Video Uploaded ✓</span>
                      <span className="text-[10px] text-slate-400 break-all">{uploadedReelUrl.substring(0, 40)}...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Film className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition" />
                      <span className="text-xs font-bold text-slate-600">Upload Reel Video</span>
                      <span className="text-[10px] text-slate-400">MP4, MOV, AVI • Max 100MB</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div
                  onClick={() => reelThumbnailInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition group overflow-hidden relative"
                >
                  {uploadedThumbnailUrl ? (
                    <div className="absolute inset-0">
                      <img src={uploadedThumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Change Thumbnail</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition" />
                      <span className="text-xs font-bold text-slate-600">Upload Thumbnail</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveReel}
                disabled={!reelTitle.trim() && !uploadedReelUrl && !uploadedThumbnailUrl}
                className="w-full py-3 bg-black hover:bg-zinc-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save Reel to Profile & Database</span>
              </button>
            </div>

            {/* Existing Portfolio Items */}
            {creator.portfolio && creator.portfolio.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900">Your Portfolio ({creator.portfolio.length} items)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creator.portfolio.map((item) => (
                    <div key={item.id} className="relative group rounded-2xl overflow-hidden bg-slate-900 h-48 border border-slate-200">
                      {(item as any).videoUrl ? (
                        <video
                          src={(item as any).videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          autoPlay
                          loop
                          playsInline
                          poster={item.thumbnail}
                        />
                      ) : item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <Film className="w-8 h-8 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs font-bold line-clamp-1">{item.title}</p>
                        {item.brandName && <p className="text-blue-300 text-[10px]">{item.brandName}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteReel(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!creator.portfolio || creator.portfolio.length === 0) && (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
                <Film className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Portfolio Items Yet</h3>
                <p className="text-xs text-slate-500">Upload your first reel above to show brands your content quality.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Direct Brand Enquiries */}
        {activeTab === 'leads' && (
          <div className="space-y-4 animate-fadeIn">
            {myEnquiries.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Enquiries Yet</h3>
                <p className="text-xs text-slate-500">When brands submit direct booking requests from your profile, they will appear here.</p>
              </div>
            ) : (
              myEnquiries.map((lead) => (
                <div key={lead.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{lead.brandName}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#b88628] text-[10px] font-bold">
                        {lead.collaborationType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{lead.message}</p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Budget: {lead.budget} • Contact: {lead.email} ({lead.phone})
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Live Opportunities */}
        {activeTab === 'pitches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#D4A338] uppercase">{camp.companyName}</span>
                    <h4 className="font-black text-slate-900 text-sm">{camp.campaignTitle}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black">
                    {camp.budget}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{camp.campaignDescription}</p>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">{camp.city} • {camp.category}</span>
                  <button
                    onClick={() => navigateTo('opportunities')}
                    className="px-3 py-1.5 bg-black text-white rounded-lg font-bold hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Submit Pitch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Account Settings */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn max-w-2xl">
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </div>
  );
};
