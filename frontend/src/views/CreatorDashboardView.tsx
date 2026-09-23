import { apiUrl, authHeaders } from '../config/api';
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
  X,
  Bookmark,
  Building2
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { Creator } from '../types';
import { ChangePasswordForm } from '../components/common/ChangePasswordForm';
import { ConversationsPanel } from '../components/common/ConversationsPanel';
import { CreatorCard } from '../components/common/CreatorCard';
import { cleanInstagramHandle } from '../utils/sanitize';

export const CreatorDashboardView: React.FC = () => {
  const {
    activeCreatorId,
    creators,
    enquiries,
    campaigns,
    updateCreatorProfile,
    updateEnquiryStatus,
    updateApplicantStatus,
    navigateTo,
    authUser,
    openAuthModal,
    savedBrandIds,
    toggleSaveBrand,
    partnerBrands,
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
  const creator: Creator = (() => {
    if (authUser && authUser.role === 'CREATOR') {
      const matched = creators.find(
        (c) =>
          (c.email && c.email.toLowerCase() === authUser.email?.toLowerCase()) ||
          c.id === authUser.id ||
          (authUser.creatorProfile && c.id === authUser.creatorProfile.id) ||
          (c as any).user_id === authUser.id ||
          (authUser.name && c.name?.toLowerCase() === authUser.name.toLowerCase()) ||
          (authUser.name && c.username?.toLowerCase() === authUser.name.toLowerCase().replace(/[^a-z0-9_]/g, ''))
      );
      if (matched) return matched;
      if (authUser.creatorProfile) return authUser.creatorProfile;

      // Safe fallback for authenticated creator — empty profile so user fills it themselves
      return {
        id: authUser.id || 'creator_logged_in',
        name: authUser.name || '',
        username: (authUser.name || 'creator').toLowerCase().replace(/[^a-z0-9_]/g, ''),
        avatar: authUser.avatar || '',
        coverImage: '',
        reelVideoUrl: '',
        bio: '',
        currentCity: '',
        state: '',
        preferredCities: [],
        primaryCategory: '',
        subCategories: [],
        languages: [],
        gender: undefined,
        ageGroup: '',
        followers: 0,
        avgViews: 0,
        avgLikes: 0,
        avgComments: 0,
        brandCollaborationsCount: 0,
        trustScore: 0,
        trustSignals: {
          profileCompleteness: 0,
          phoneVerified: Boolean((authUser as any).phone),
          emailVerified: true,
          socialVerified: false,
          engagementQuality: 0,
          audienceQuality: 0,
          collaborationHistoryScore: 0,
          verifiedReviewsCount: 0,
          responseRate: 0,
          campaignReliability: 0,
          accountActivityScore: 0,
        },
        isVerified: false,
        verificationRequested: false,
        verificationStepsCompleted: [],
        isTop20: false,
        isRising: false,
        isFeatured: false,
        isTrending: false,
        status: 'active',
        startingPrice: 0,
        pricing: {
          reelPrice: 0,
          storyPrice: 0,
          postPrice: 0,
          ugcPrice: 0,
          isNegotiable: true,
          isBarterAvailable: false,
          pricingDisplayType: 'starting',
        },
        collaborationTypes: [],
        socialPlatforms: [],
        audience: {
          topCities: [],
          topCountries: [],
          ageGroups: [],
          genderSplit: [],
          topInterests: [],
          avgReach: 0,
          avgImpressions: 0,
        },
        portfolio: [],
        previousCollaborations: [],
        reviews: [],
        phone: (authUser as any).phone || '',
        email: authUser.email,
        profileViews: 0,
        savedCount: 0,
        createdAt: new Date().toISOString(),
      };
    }

    // Guest / preview fallback
    return (
      creators.find((c) => c.id === activeCreatorId) ||
      creators[0] ||
      ({} as Creator)
    );
  })();

  const [activeTab, setActiveTab] = useState<'leads' | 'chat' | 'profile' | 'pitches' | 'savedBrands' | 'settings'>('leads');

  // Form states synced with creator's database fields
  const [bio, setBio] = useState(creator.bio || '');
  const [reelVideoUrl, setReelVideoUrl] = useState(creator.reelVideoUrl || '');
  const [startingPrice, setStartingPrice] = useState<number | string>(creator.startingPrice || '');
  const [reelPrice, setReelPrice] = useState<number | string>(creator.pricing?.reelPrice || '');
  const [storyPrice, setStoryPrice] = useState<number | string>(creator.pricing?.storyPrice || '');
  const [ugcPrice, setUgcPrice] = useState<number | string>(creator.pricing?.ugcPrice || '');
  const [isBarterAvailable, setIsBarterAvailable] = useState(creator.pricing?.isBarterAvailable ?? false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // === Profile Edit States ===
  const [profileName, setProfileName] = useState(creator.name || '');
  const [profileUsername, setProfileUsername] = useState(cleanInstagramHandle(creator.username));
  const [profileBio, setProfileBio] = useState(creator.bio || '');
  const [profileCity, setProfileCity] = useState(creator.currentCity || '');
  const [profileState, setProfileState] = useState(creator.state || '');
  const [profileGender, setProfileGender] = useState(creator.gender || '');
  const [profileAgeGroup, setProfileAgeGroup] = useState(creator.ageGroup || '');
  const [profileLanguages, setProfileLanguages] = useState((creator.languages || []).join(', '));
  const [profileCategory, setProfileCategory] = useState(creator.primaryCategory || '');
  const [profileSubCats, setProfileSubCats] = useState((creator.subCategories || []).join(', '));
  const [profileFollowers, setProfileFollowers] = useState<number | string>(creator.followers || '');
  const [profileTotalPosts, setProfileTotalPosts] = useState<number | string>(creator.totalPosts ?? creator.portfolio?.length ?? '');
  const [profileAvgViews, setProfileAvgViews] = useState<number | string>(creator.avgViews || '');
  const [profileAvgLikes, setProfileAvgLikes] = useState<number | string>(creator.avgLikes || '');
  const [profileAvgComments, setProfileAvgComments] = useState<number | string>(creator.avgComments || '');
  const [profilePostPrice, setProfilePostPrice] = useState<number | string>(creator.pricing?.postPrice || '');
  const [profileEventPrice, setProfileEventPrice] = useState<number | string>(creator.pricing?.eventPrice || '');
  const [profileNegotiable, setProfileNegotiable] = useState(creator.pricing?.isNegotiable ?? true);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaveNotice, setProfileSaveNotice] = useState<string | null>(null);

  // Sync state whenever creator profile updates from database
  useEffect(() => {
    if (creator) {
      setBio(creator.bio || '');
      setReelVideoUrl(creator.reelVideoUrl || '');
      setStartingPrice(creator.startingPrice || '');
      setReelPrice(creator.pricing?.reelPrice || '');
      setStoryPrice(creator.pricing?.storyPrice || '');
      setUgcPrice(creator.pricing?.ugcPrice || '');
      setIsBarterAvailable(creator.pricing?.isBarterAvailable ?? false);
      // Sync profile edit states
      setProfileName(creator.name || '');
      setProfileUsername(cleanInstagramHandle(creator.username));
      setProfileBio(creator.bio || '');
      setProfileCity(creator.currentCity || '');
      setProfileState(creator.state || '');
      setProfileGender(creator.gender || '');
      setProfileAgeGroup(creator.ageGroup || '');
      setProfileLanguages((creator.languages || []).join(', '));
      setProfileCategory(creator.primaryCategory || '');
      setProfileSubCats((creator.subCategories || []).join(', '));
      setProfileFollowers(creator.followers || '');
      setProfileTotalPosts(creator.totalPosts ?? creator.portfolio?.length ?? '');
      setProfileAvgViews(creator.avgViews || '');
      setProfileAvgLikes(creator.avgLikes || '');
      setProfileAvgComments(creator.avgComments || '');
      setProfilePostPrice(creator.pricing?.postPrice || '');
      setProfileEventPrice(creator.pricing?.eventPrice || '');
      setProfileNegotiable(creator.pricing?.isNegotiable ?? true);
    }
  }, [creator?.id, creator?.startingPrice, creator?.bio, creator?.avatar, creator?.coverImage, creator?.reelVideoUrl, creator?.totalPosts, creator?.followers, creator?.pricing?.reelPrice, creator?.pricing?.storyPrice, creator?.pricing?.postPrice, creator?.pricing?.ugcPrice, creator?.pricing?.eventPrice]);

  // Handle Reel / Video Upload
  const handleReelUpload = async (file: File, type: 'video' | 'thumbnail') => {
    setIsUploadingReel(true);
    setUploadNotice(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          const res = await fetch(apiUrl('/api/upload'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              image: base64Data,
              creatorId: creator.id,
              type: type === 'video' ? 'reel_video' : 'reel_thumbnail',
            }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            if (type === 'video') {
              setUploadedReelUrl(apiUrl(data.url));
              setUploadNotice('Video uploaded successfully!');
            } else {
              setUploadedThumbnailUrl(apiUrl(data.url));
              setUploadNotice('Thumbnail uploaded successfully!');
            }
            setTimeout(() => setUploadNotice(null), 3000);
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        } catch (err: any) {
          console.error('Reel upload error:', err);
          setUploadNotice(err?.message || 'Upload failed. Please try again.');
        } finally {
          setIsUploadingReel(false);
        }
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
      engagement: '0%',
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
        try {
          const base64Data = reader.result;
          const res = await fetch(apiUrl('/api/upload'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              image: base64Data,
              creatorId: creator.id,
              type: 'reel_video',
            }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            updateCreatorProfile(creator.id, { reelVideoUrl: data.url });
            setReelVideoUrl(apiUrl(data.url));
            setUploadNotice('🎬 Card reel uploaded! It will now autoplay on your profile card on the home page.');
            setTimeout(() => setUploadNotice(null), 5000);
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        } catch (err: any) {
          console.error('Card reel upload error:', err);
          setUploadNotice(err?.message || 'Upload failed. Please try again.');
        } finally {
          setIsUploadingCardReel(false);
        }
      };
    } catch (err: any) {
      console.error('Card reel upload error:', err);
      setUploadNotice('Upload failed. Please try again.');
      setIsUploadingCardReel(false);
    }
  };

  // Handle photo upload to local storage and database
  const handlePhotoUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (type === 'avatar') setIsUploadingAvatar(true);
    else setIsUploadingCover(true);
    setUploadNotice(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          const res = await fetch(apiUrl('/api/upload'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              image: base64Image,
              creatorId: creator.id,
              type,
            }),
          });

          const data = await res.json();
          if (data.success && data.url) {
            const uploadedUrl = apiUrl(data.url);
            if (type === 'avatar') {
              updateCreatorProfile(creator.id, { avatar: uploadedUrl });
              setUploadNotice('Profile photo uploaded successfully.');
            } else {
              updateCreatorProfile(creator.id, { coverImage: uploadedUrl });
              setUploadNotice('Display card photo uploaded successfully.');
            }
            setTimeout(() => setUploadNotice(null), 3000);
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        } catch (err: any) {
          console.error('Photo upload error:', err);
          setUploadNotice(err?.message || 'Failed to upload photo. Please sign in again and try.');
        } finally {
          if (type === 'avatar') setIsUploadingAvatar(false);
          else setIsUploadingCover(false);
        }
      };
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setUploadNotice('Failed to upload photo. Please try again.');
      if (type === 'avatar') setIsUploadingAvatar(false);
      else setIsUploadingCover(false);
    }
  };

  const handlePhotoDelete = async (type: 'avatar' | 'cover') => {
    try {
      const res = await fetch(apiUrl(`/api/upload/${creator.id}`), {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Delete failed');
      updateCreatorProfile(creator.id, type === 'avatar' ? { avatar: '' } : { coverImage: '' });
      setUploadNotice(`${type === 'avatar' ? 'Profile photo' : 'Display card photo'} deleted successfully.`);
      setTimeout(() => setUploadNotice(null), 3000);
    } catch (err) {
      console.error('Photo delete error:', err);
      setUploadNotice('Failed to delete photo. Please try again.');
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
              onClick={() => openAuthModal()}
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
  const myEnquiries = enquiries.filter(
    (e) =>
      e.creatorId === creator.id ||
      e.creatorId === 'all' ||
      (creator.username && (e as any).creatorUsername === creator.username) ||
      (creator.name && (e as any).creatorName && (e as any).creatorName.toLowerCase() === creator.name.toLowerCase())
  );

  // Confirm a brand inquiry -> marks enquiry Converted + syncs campaign applicant status to Accepted
  const handleConfirmEnquiry = (lead: typeof myEnquiries[0]) => {
    updateEnquiryStatus(lead.id, 'Converted', undefined, 'Accepted by creator');
    // Try to find a matching campaign and update the applicant status
    const matchedCamp = campaigns.find(
      (c) =>
        (lead.brandName && c.companyName && c.companyName.toLowerCase() === lead.brandName.toLowerCase()) ||
        (lead.campaignDescription && c.id && lead.campaignDescription.includes(c.id)) ||
        (lead.campaignDescription && c.campaignTitle && lead.campaignDescription.includes(c.campaignTitle))
    );
    if (matchedCamp) {
      updateApplicantStatus(matchedCamp.id, creator.id, 'Accepted');
    }
    try {
      // Simple confetti via CSS animation fallback (no npm package needed)
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
      el.innerHTML = '🎉🎊✨🎉🎊✨';
      el.style.fontSize = '3rem';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.opacity = '0.9';
      el.style.transition = 'opacity 1.5s';
      document.body.appendChild(el);
      setTimeout(() => { el.style.opacity = '0'; }, 500);
      setTimeout(() => { el.remove(); }, 2000);
    } catch (_) {}
  };

  // Decline a brand inquiry
  const handleDeclineEnquiry = (lead: typeof myEnquiries[0]) => {
    updateEnquiryStatus(lead.id, 'Closed', undefined, 'Declined by creator');
    const matchedCamp = campaigns.find(
      (c) =>
        (lead.brandName && c.companyName && c.companyName.toLowerCase() === lead.brandName.toLowerCase()) ||
        (lead.campaignDescription && c.id && lead.campaignDescription.includes(c.id)) ||
        (lead.campaignDescription && c.campaignTitle && lead.campaignDescription.includes(c.campaignTitle))
    );
    if (matchedCamp) {
      updateApplicantStatus(matchedCamp.id, creator.id, 'Declined');
    }
  };

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    updateCreatorProfile(creator.id, {
      bio,
      reelVideoUrl,
      startingPrice: Number(startingPrice) || Number(reelPrice) || 0,
      pricing: {
        ...creator.pricing,
        startingPrice: Number(startingPrice) || Number(reelPrice) || 0,
        reelPrice: Number(reelPrice),
        storyPrice: Number(storyPrice),
        postPrice: Number(profilePostPrice),
        ugcPrice: Number(ugcPrice),
        eventPrice: Number(profileEventPrice),
        isBarterAvailable,
        isNegotiable: profileNegotiable,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLanguages = profileLanguages.split(',').map(l => l.trim()).filter(Boolean);
    const parsedSubCats = profileSubCats.split(',').map(s => s.trim()).filter(Boolean);
    const cleanUser = cleanInstagramHandle(profileUsername) || cleanInstagramHandle(creator.username);
    const pendingCompletionFields = [
      Boolean(creator.avatar && !creator.avatar.includes('unsplash')),
      Boolean(creator.coverImage && !creator.coverImage.includes('unsplash')),
      Boolean(profileBio.trim().length > 30),
      Boolean(profileCity.trim()),
      Boolean(profileCategory.trim()),
      Number(profileFollowers) > 0,
      Number(startingPrice) > 0 || Number(reelPrice) > 0,
      Boolean(cleanUser),
      parsedLanguages.length > 0,
    ];
    const pendingCompletionPct = Math.round(
      (pendingCompletionFields.filter(Boolean).length / pendingCompletionFields.length) * 100
    );

    updateCreatorProfile(creator.id, {
      name: profileName.trim(),
      username: cleanUser,
      bio: profileBio.trim(),
      currentCity: profileCity.trim(),
      state: profileState.trim(),
      gender: profileGender as any,
      ageGroup: profileAgeGroup,
      languages: parsedLanguages,
      primaryCategory: profileCategory.trim(),
      subCategories: parsedSubCats,
      followers: Number(profileFollowers),
      totalPosts: Number(profileTotalPosts),
      avgViews: Number(profileAvgViews),
      avgLikes: Number(profileAvgLikes),
      avgComments: Number(profileAvgComments),
      startingPrice: Number(startingPrice) || Number(reelPrice) || 0,
      pricing: {
        ...creator.pricing,
        startingPrice: Number(startingPrice) || Number(reelPrice) || 0,
        reelPrice: Number(reelPrice),
        storyPrice: Number(storyPrice),
        postPrice: Number(profilePostPrice),
        ugcPrice: Number(ugcPrice),
        eventPrice: Number(profileEventPrice),
        isNegotiable: profileNegotiable,
        isBarterAvailable: isBarterAvailable,
      },
      socialPlatforms: [
        {
          platform: 'instagram',
          username: cleanUser,
          url: `https://instagram.com/${cleanUser}`,
          followers: Number(profileFollowers),
          avgViews: Number(profileAvgViews),
          verified: creator.isVerified || false,
        }
      ],
    });
    setProfileSaveNotice(
      pendingCompletionPct < 70
        ? `Profile saved, but it is only ${pendingCompletionPct}% complete. Complete at least 70% to activate your profile.`
        : 'Profile saved. Your profile is 70%+ complete and has been approved automatically.'
    );
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 5000);
    navigateTo('creator-dashboard');
  };

  // === Profile Completion Calculation ===
  const profileFields = [
    { label: 'Profile Photo', done: !!creator.avatar && !creator.avatar.includes('unsplash') },
    { label: 'Display Card Photo', done: !!creator.coverImage && !creator.coverImage.includes('unsplash') },
    { label: 'Bio / About', done: !!creator.bio && creator.bio.trim().length > 30 },
    { label: 'City', done: !!creator.currentCity && creator.currentCity.trim().length > 0 },
    { label: 'Category', done: !!creator.primaryCategory && creator.primaryCategory.trim().length > 0 },
    { label: 'Followers', done: (creator.followers || 0) > 0 },
    { label: 'Starting Rate', done: (creator.startingPrice || 0) > 0 },
    { label: 'Instagram Handle', done: (creator.socialPlatforms || []).some(p => p.platform === 'instagram' && !!p.username) },
    { label: 'Languages', done: (creator.languages || []).length > 0 },
  ];
  const completedCount = profileFields.filter(f => f.done).length;
  const completionPct = Math.round((completedCount / profileFields.length) * 100);
  const incompletedFields = profileFields.filter(f => !f.done).map(f => f.label);
  const isApprovalEligible = completionPct >= 70;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50/60 py-4 sm:py-6 lg:py-8 font-sans">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
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

        <section className="rounded-3xl border border-slate-200 bg-white p-3 sm:rounded-[2rem] sm:p-6 shadow-sm">
          <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-stretch">
            <div className="w-full max-w-[330px] shrink-0 sm:max-w-[360px]">
              <CreatorCard creator={creator} interactive={false} showSaveButton={false} showViewProfile={false} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center rounded-2xl bg-slate-50 p-4 sm:p-7">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#b88628]">Instagram information</span>
              <h1 className="mt-2 text-2xl font-black text-slate-900">@{creator.username || 'creator'}</h1>
              <div className="mt-4 grid max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"><p className="text-[10px] font-bold uppercase text-slate-400">Followers</p><p className="mt-1 text-sm font-black text-slate-800">{(creator.followers || 0).toLocaleString('en-IN')}</p></div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"><p className="text-[10px] font-bold uppercase text-slate-400">Posts</p><p className="mt-1 text-sm font-black text-slate-800">{(creator.totalPosts || 0).toLocaleString('en-IN')}</p></div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"><p className="text-[10px] font-bold uppercase text-slate-400">Avg. views</p><p className="mt-1 text-sm font-black text-slate-800">{(creator.avgViews || 0).toLocaleString('en-IN')}</p></div>
              </div>
              <div className="mt-4 max-w-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bio</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{creator.bio?.trim() || 'Add a short bio to tell brands about your content and audience.'}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-[#D4A338] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#D4A338]/20 transition hover:bg-[#b88628]"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* Replaced dashboard profile header, retained temporarily only to avoid changing unrelated dashboard logic. */}
        <div className="hidden">
        {/* Top Header Profile Card */}
        <div className="w-full flex-1 bg-gradient-to-br from-white via-[#fcfaf5] to-[#f1e6cc] p-6 sm:p-8 rounded-[2.5rem] border border-[#D4A338]/30 shadow-[0_12px_40px_rgba(212,163,56,0.12)] hover:shadow-[0_20px_50px_rgba(212,163,56,0.2)] transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-16 -top-20 w-64 h-64 bg-[#D4A338]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4">
            {/* Interactive Avatar with Camera Upload Overlay */}
            <div className="relative group">
              <img
                src={creator.avatar || undefined}
                alt={creator.name}
                className="w-18 h-18 rounded-full object-cover border-[3px] border-white shadow-lg shadow-[#D4A338]/20 group-hover:opacity-85 transition"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                title="Upload photo"
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
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{creator.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                  creator.isVerified
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {creator.isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {creator.isVerified ? 'Verified Creator' : isApprovalEligible ? 'Approval review' : 'Profile setup'}
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




            <button
              onClick={() => navigateTo('creator-detail', { username: creator.username, id: creator.id })}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4A338] to-[#b88628] hover:from-[#c2912a] hover:to-[#a37521] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4A338]/20"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        </div>

        {/* Profile completion is collected during signup, so this dashboard prompt is intentionally hidden. */}
        {false && completionPct < 100 && (
          <div className={`rounded-[2rem] border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 animate-fadeIn shadow-[0_12px_40px_rgba(212,163,56,0.10)] ${
            completionPct >= 80 ? 'bg-emerald-50 border-emerald-200' :
            completionPct >= 50 ? 'bg-amber-50 border-amber-200' :
            'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={completionPct >= 80 ? 'text-emerald-800' : completionPct >= 50 ? 'text-amber-800' : 'text-rose-800'}>
                  ✦ Profile {completionPct}% Complete
                </span>
                <span className="text-slate-500 font-semibold text-[10px]">{completedCount}/{profileFields.length} sections filled</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/70 border border-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    completionPct >= 80 ? 'bg-emerald-500' :
                    completionPct >= 50 ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              {incompletedFields.length > 0 && (
                <p className="text-[10px] text-slate-500 font-medium">
                  Missing: {incompletedFields.slice(0, 3).join(', ')}{incompletedFields.length > 3 ? ` +${incompletedFields.length - 3} more` : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="shrink-0 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl hover:bg-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Edit3 className="w-3 h-3" />
              Complete Profile
            </button>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="-mx-3 flex touch-pan-x gap-2 overflow-x-auto border border-slate-100 bg-white p-1.5 px-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] sm:mx-0 sm:rounded-2xl sm:px-1.5 text-xs font-bold">
          {[
            { key: 'leads', icon: <MessageSquare className="w-3.5 h-3.5" />, label: `Enquiries (${myEnquiries.length})` },
            { key: 'chat', icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Live Chat' },
            { key: 'profile', icon: <Edit3 className="w-3.5 h-3.5" />, label: 'Edit Profile' },
            { key: 'pitches', icon: <Flame className="w-3.5 h-3.5" />, label: `Briefs (${campaigns.length})` },
            { key: 'savedBrands', icon: <Bookmark className="w-3.5 h-3.5" />, label: `Saved Brands (${savedBrandIds.length})` },
            { key: 'settings', icon: <Settings className="w-3.5 h-3.5" />, label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === tab.key ? 'bg-gradient-to-r from-[#D4A338] to-[#b88628] text-white shadow-md shadow-[#D4A338]/25 -translate-y-0.5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
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
            {profileSaved && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-sm w-full mx-3 shadow-2xl flex flex-col items-center text-center animate-scaleUp">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 border-4 border-emerald-50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Profile Saved</h3>
                  <p className="text-sm text-slate-500 mb-6">{profileSaveNotice || 'Your changes have been successfully updated in the database.'}</p>
                  <button type="button" onClick={() => setProfileSaved(false)} className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Section 1: Photos */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4A338]" />
                Profile Photo, Display Card Photo & Card Reel Video
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Avatar Upload */}
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 cursor-pointer transition group flex items-center gap-3"
                >
                  <div className="relative shrink-0">
                    <img
                      src={creator.avatar || undefined}
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

                {/* Display Card Photo Upload */}
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 cursor-pointer transition group flex items-center gap-3 overflow-hidden"
                >
                  {creator.coverImage && (
                    <div className="absolute inset-0">
                      <img src={creator.coverImage} alt="Display card" className="w-full h-full object-cover opacity-25" />
                    </div>
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                      {isUploadingCover ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Display Card Photo</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">1200×400px ideal</p>
                      <p className="text-[10px] text-blue-500 font-bold mt-1">{isUploadingCover ? 'Uploading...' : 'Click to change'}</p>
                    </div>
                  </div>
                </div>

                {/* Card Reel Video Upload - previews on hover/tap on profile cards */}
                <div className="md:col-span-3 border-2 border-dashed border-violet-300 bg-violet-50/40 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-violet-200/60 pb-3">
                    <div className="flex items-center gap-2 text-violet-900 font-bold text-xs">
                      <Film className="w-4 h-4 text-violet-600" />
                      <span>Card Reel Video (Hover / tap preview on profile cards)</span>
                    </div>
                    {creator.reelVideoUrl && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Live Card Reel Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                    <div className="lg:col-span-2 space-y-3">
                      <p className="text-[11px] text-slate-600">
                        Upload an MP4, MOV, or WebM file. Only uploaded video files are shown on your creator card.
                      </p>
                      <button
                        type="button"
                        onClick={() => cardReelInputRef.current?.click()}
                        disabled={isUploadingCardReel}
                        className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>{isUploadingCardReel ? 'Uploading video...' : 'Choose video file'}</span>
                      </button>
                    </div>

                    {/* Live Card Preview Box */}
                    <div className="relative h-28 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                      {reelVideoUrl ? (
                        <>
                          <video
                            src={reelVideoUrl}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold rounded">
                            Preview
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 text-slate-400">
                          <Play className="w-6 h-6 mx-auto opacity-50 mb-1" />
                          <span className="text-[10px] block">Card Reel Preview</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {creator.reelVideoUrl && (
                    <div className="flex flex-col gap-2 pt-2 text-xs sm:flex-row sm:items-center sm:justify-between border-t border-violet-200/60">
                      <span className="min-w-0 break-all text-violet-700 text-[11px] font-semibold">
                        Uploaded video: <code className="bg-white/80 px-2 py-0.5 rounded text-[10px] text-slate-700">{creator.reelVideoUrl.split('/').pop()}</code>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          updateCreatorProfile(creator.id, { reelVideoUrl: '' });
                          setReelVideoUrl('');
                        }}
                        className="text-rose-600 hover:text-rose-800 font-bold text-[11px] cursor-pointer"
                      >
                        Remove Card Reel
                      </button>
                    </div>
                  )}
                </div>
              </div>

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
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
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
                  <label className="block text-slate-600 font-bold mb-1">Instagram Username / Handle *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                    <input
                      type="text"
                      value={profileUsername}
                      onChange={e => setProfileUsername(cleanInstagramHandle(e.target.value))}
                      placeholder="e.g. your_instagram_handle"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">WhatsApp / Contact Number</label>
                  <input
                    type="tel"
                    value={creator.phone || authUser?.phone || ''}
                    readOnly
                    title="Saved during signup"
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Primary Category *</label>
                  <select
                    value={profileCategory}
                    onChange={e => setProfileCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  >
                    <option value="" disabled>Select a category</option>
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
                    <option value="" disabled>Select a city</option>
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
                    onChange={e => setProfileGender(e.target.value as 'Female' | 'Male' | 'Non-binary')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Age</label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={profileAgeGroup}
                    onChange={e => setProfileAgeGroup(e.target.value)}
                    placeholder="Enter age"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-medium outline-none"
                  />
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
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4A338]" />
                Performance Metrics
                <span className="text-[10px] font-medium text-slate-400 ml-1">Shown on your public profile</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Followers</label>
                  <input
                    type="number"
                    value={profileFollowers}
                    onChange={e => setProfileFollowers(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="165000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Total Posts</label>
                  <input
                    type="number"
                    value={profileTotalPosts}
                    onChange={e => setProfileTotalPosts(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="120"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Avg Video Views</label>
                  <input
                    type="number"
                    value={profileAvgViews}
                    onChange={e => setProfileAvgViews(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="120000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Avg Likes</label>
                  <input
                    type="number"
                    value={profileAvgLikes}
                    onChange={e => setProfileAvgLikes(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="7400"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Avg Comments</label>
                  <input
                    type="number"
                    value={profileAvgComments}
                    onChange={e => setProfileAvgComments(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="910"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Commercial Deliverable Pricing */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#D4A338]" />
                Commercial Deliverable Rates (Shown on Public Profile)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Reel (1x) (₹)</label>
                  <input
                    type="number"
                    value={reelPrice}
                    onChange={e => setReelPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="15000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Story (3x) (₹)</label>
                  <input
                    type="number"
                    value={storyPrice}
                    onChange={e => setStoryPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="6000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Feed Post (₹)</label>
                  <input
                    type="number"
                    value={profilePostPrice}
                    onChange={e => setProfilePostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="10000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">UGC Video (₹)</label>
                  <input
                    type="number"
                    value={ugcPrice}
                    onChange={e => setUgcPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="12000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Event / Visit (₹)</label>
                  <input
                    type="number"
                    value={profileEventPrice}
                    onChange={e => setProfileEventPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="20000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={startingPrice}
                    onChange={e => setStartingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="5000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileNegotiable}
                    onChange={e => setProfileNegotiable(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="font-bold text-slate-700">Prices are Negotiable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBarterAvailable}
                    onChange={e => setIsBarterAvailable(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="font-bold text-slate-700">Available for Barter / Product Collab</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#D4A338] to-[#b88628] hover:from-[#c2912a] hover:to-[#a37521] text-white font-black text-sm rounded-2xl shadow-lg shadow-[#D4A338]/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save All Profile Changes to Database</span>
            </button>
          </form>
        )}

        {/* Tab 2: Direct Brand Enquiries */}
        {activeTab === 'leads' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Summary header */}
            {myEnquiries.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  {myEnquiries.length} enquir{myEnquiries.length !== 1 ? 'ies' : 'y'} received •{' '}
                  <span className="text-emerald-600 font-bold">
                    {myEnquiries.filter(e => e.status === 'Converted').length} confirmed
                  </span>
                </p>
                {myEnquiries.filter(e => e.status !== 'Converted' && e.status !== 'Closed').length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                    {myEnquiries.filter(e => e.status !== 'Converted' && e.status !== 'Closed').length} awaiting action
                  </span>
                )}
              </div>
            )}

            {myEnquiries.length === 0 ? (
              <div className="bg-white p-6 sm:p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Enquiries Yet</h3>
                <p className="text-xs text-slate-500">When brands pitch or send you collaboration requests, they will appear here for you to accept or decline.</p>
              </div>
            ) : (
              myEnquiries.map((lead) => {
                const isConfirmed = lead.status === 'Converted';
                const isDeclined = lead.status === 'Closed';
                const isPending = !isConfirmed && !isDeclined;
                return (
                  <div
                    key={lead.id}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      isConfirmed
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-sm'
                        : isDeclined
                        ? 'border-slate-200 opacity-60'
                        : 'border-indigo-200 hover:border-indigo-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Brand Initial Avatar */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-base border ${
                        isConfirmed ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                      }`}>
                        {lead.brandName?.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Brand name + type badge + status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{lead.brandName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lead.campaignType === 'Brand Pitch Response'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-blue-50 text-[#b88628]'
                          }`}>
                            {lead.campaignType === 'Brand Pitch Response' ? '📩 Brand replied to your pitch' : (lead.campaignType || lead.collaborationType || 'Direct Enquiry')}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ml-auto ${
                            isConfirmed ? 'bg-emerald-100 text-emerald-700' :
                            isDeclined ? 'bg-slate-200 text-slate-500' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {isConfirmed ? '✅ Confirmed' : isDeclined ? 'Declined' : lead.status || 'New'}
                          </span>
                        </div>

                        {/* Campaign context */}
                        {lead.campaignDescription && lead.campaignDescription !== lead.message && (
                          <p className="text-[11px] text-slate-400 font-medium">{lead.campaignDescription}</p>
                        )}

                        {/* Message */}
                        <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-slate-700 leading-relaxed">&ldquo;{lead.message}&rdquo;</p>
                        </div>

                        {/* Budget / contact / time */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          {lead.budget && <span>💰 Budget: <strong className="text-slate-600">{lead.budget}</strong></span>}
                          {lead.email && <span>📧 {lead.email}</span>}
                          <span>🕒 {lead.createdAt}</span>
                        </div>

                        {/* Status Banners */}
                        {isConfirmed && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>🎉 Collaboration Confirmed! Your acceptance has been sent to the brand.</span>
                          </div>
                        )}

                        {isPending && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Brand is awaiting your confirmation. Accept or decline this collaboration request.</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {isPending && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              onClick={() => handleConfirmEnquiry(lead)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirm & Accept Collaboration
                            </button>
                            <button
                              onClick={() => handleDeclineEnquiry(lead)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-800">Live Chat</h2>
              <p className="text-xs text-slate-500">Chat directly with brands after you confirm a collaboration.</p>
            </div>
            <ConversationsPanel />
          </div>
        )}

        {/* Tab 3: My Pitches */}
        {activeTab === 'pitches' && (() => {
          const myPitchedCampaigns = campaigns.filter(camp => 
            (camp.applicants || []).some(a => a.creatorId === creator.id || a.creatorName === creator.name)
          );

          return (
            <div className="space-y-4 animate-fadeIn">
              {myPitchedCampaigns.length === 0 ? (
                <div className="bg-white p-6 sm:p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                  <Flame className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">No Pitches Yet</h3>
                  <p className="text-xs text-slate-500">When you pitch for a campaign, you can track its status here.</p>
                  <button
                    onClick={() => navigateTo('opportunities')}
                    className="mt-2 px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Find Live Campaigns
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myPitchedCampaigns.map((camp) => {
                    const myPitch = (camp.applicants || []).find(a => a.creatorId === creator.id || a.creatorName === creator.name);
                    const isConfirmed = myPitch?.status === 'Accepted';
                    const isDeclined = myPitch?.status === 'Declined';
                    const isPending = myPitch?.status === 'Pending';
                    
                    return (
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
                          <span className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 ${
                            isConfirmed ? 'bg-emerald-100 text-emerald-800' : 
                            isDeclined ? 'bg-red-100 text-red-700' : 
                            isPending ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {isConfirmed ? '✅ Confirmed by Brand' :
                             isDeclined ? '❌ Pitch Declined' :
                             isPending ? '⏳ Pitch Pending Review' :
                             '🔄 Shortlisted (Check Messages)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab 3.5: Saved Brands */}
        {activeTab === 'savedBrands' && (
          <div className="space-y-4 animate-fadeIn">
            {savedBrandIds.length === 0 ? (
              <div className="bg-white p-6 sm:p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Saved Brands Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Bookmark partner brands on their profile page to easily track and pitch collaborations.
                </p>
                <button
                  onClick={() => navigateTo('home')}
                  className="mt-3 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black transition cursor-pointer"
                >
                  Explore Featured Brands
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedBrandIds.map((brandId) => {
                  const matchedPartner = partnerBrands.find((b) => b.id === brandId);
                  const bName = matchedPartner?.name || `Brand (${brandId})`;
                  return (
                    <div
                      key={brandId}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {matchedPartner?.logoUrl ? (
                            <img src={matchedPartner.logoUrl} alt={bName} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Building2 className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-slate-900 text-sm truncate">{bName}</h4>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                            Verified Brand
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => navigateTo('brand-detail', { id: brandId, brandName: matchedPartner?.name })}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>View Brand Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleSaveBrand(brandId)}
                          title="Remove from saved"
                          className="p-2 text-rose-500 hover:bg-rose-50 border border-rose-100 rounded-xl transition cursor-pointer"
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
