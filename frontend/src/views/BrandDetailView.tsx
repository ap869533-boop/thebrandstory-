import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  ExternalLink,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  FileText,
  MessageSquare,
  Send,
  Users,
  Bookmark,
  Share2,
  BarChart3,
  TrendingUp,
  Clock,
  Repeat,
  Check
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { BrandProfile, CampaignRequirement } from '../types';
import { apiUrl } from '../config/api';

export const BrandDetailView: React.FC = () => {
  const {
    viewParams,
    campaigns,
    authUser,
    navigateTo,
    applyToCampaign,
    activeCreatorId,
    requireRole,
    isBrandSaved,
    toggleSaveBrand,
    submitBrandInquiry
  } = usePlatform();

  const [brand, setBrand] = useState<Partial<BrandProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'reviews' | 'about'>('campaigns');

  // Modal pitch state
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRequirement | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [hasApplied, setHasApplied] = useState<string | null>(null);

  // Inquiry state
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [hasInquired, setHasInquired] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Fetch featured brands to find matching brand
    fetch(apiUrl('/api/brands/featured'))
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.brands)) {
          const match = d.brands.find(
            (b: any) =>
              (viewParams.id && (b.id === viewParams.id || b.userId === viewParams.id)) ||
              (viewParams.brandName && b.brandName.toLowerCase() === (viewParams.brandName as string).toLowerCase())
          );
          if (match) {
            setBrand(match);
            setLoading(false);
            return;
          }
        }
        
        // Fallback: create brand view object from viewParams
        if (viewParams.brandName || viewParams.companyName) {
          setBrand({
            id: viewParams.id || 'brand_1',
            brandName: viewParams.brandName || viewParams.companyName || 'Brand Partner',
            logoUrl: viewParams.logoUrl || '',
            description: viewParams.description || 'Verified enterprise partner collaborating with top creators on thebrandsstory.',
            industry: viewParams.industry || 'Brand Partner',
            city: viewParams.city || 'Pan India',
            website: viewParams.website || '',
            approvalStatus: 'approved',
            isFeatured: true,
          });
        } else {
          setBrand({
            id: 'brand_default',
            brandName: 'Partner Brand',
            description: 'Verified brand hiring top creators for marketing campaigns.',
            industry: 'General Category',
            city: 'Pan India',
            approvalStatus: 'approved',
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setBrand({
          id: viewParams.id || 'brand_1',
          brandName: viewParams.brandName || viewParams.companyName || 'Brand Partner',
          description: 'Verified brand hiring top creators for marketing campaigns.',
          industry: 'General Category',
          city: 'Pan India',
          approvalStatus: 'approved',
        });
        setLoading(false);
      });
  }, [viewParams]);

  // Filter campaigns posted by this brand
  const brandNameClean = (brand?.brandName || viewParams.brandName || viewParams.companyName || '').toLowerCase().trim();
  const brandCampaigns = campaigns.filter(c => {
    if (!brandNameClean) return true;
    return (
      c.companyName.toLowerCase().includes(brandNameClean) ||
      brandNameClean.includes(c.companyName.toLowerCase()) ||
      (brand?.email && c.email === brand.email)
    );
  });

  const handleApply = (campaign: CampaignRequirement) => {
    if (!requireRole('CREATOR', 'pitch for a brand campaign', 'brand-detail')) return;
    setSelectedCampaign(campaign);
    setPitchText(
      `Hi ${campaign.companyName}! I am excited about this campaign brief. My audience matches your ideal target demographic perfectly.`
    );
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    if (!requireRole('CREATOR', 'submit a pitch proposal', 'brand-detail')) return;
    applyToCampaign(selectedCampaign.id, activeCreatorId, pitchText);
    setHasApplied(selectedCampaign.id);
    setTimeout(() => {
      setSelectedCampaign(null);
      setHasApplied(null);
    }, 1500);
  };

  const brandId = (brand?.id || (viewParams.id as string) || 'brand_1').toString();
  const isSaved = isBrandSaved(brandId);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${brand?.brandName || 'Brand'} Profile | thebrandsstory`,
      text: `Discover ${brand?.brandName || 'this brand'} and pitch for collaborations on thebrandsstory!`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard if share was cancelled or failed
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('Copy profile URL:', shareUrl);
    }
  };

  const handleInquireClick = () => {
    if (!authUser || authUser.role !== 'CREATOR') {
      requireRole('CREATOR', 'inquire with this brand', `brand/${brandId}`);
      return;
    }
    setIsInquiryModalOpen(true);
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || authUser.role !== 'CREATOR') {
      requireRole('CREATOR', 'send an inquiry to a brand', `brand/${brandId}`);
      return;
    }
    if (!inquiryMessage.trim()) return;

    setIsSubmittingInquiry(true);
    try {
      const ok = await submitBrandInquiry({
        creatorId: authUser.id || activeCreatorId || 'c1',
        creatorName: authUser.name || 'Influencer',
        brandId: brandId,
        brandName: brand?.brandName || 'Partner Brand',
        message: inquiryMessage.trim(),
      });
      if (ok) {
        setHasInquired(true);
        setTimeout(() => {
          setIsInquiryModalOpen(false);
          setHasInquired(false);
          setInquiryMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit inquiry', err);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sampleReviews = [
    {
      id: 'rev-1',
      creatorName: 'Priya Sharma',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      rating: 5,
      comment: 'Extremely professional brand! Quick approval on reel concepts, clear brief guidance, and payouts were processed on time.',
      date: '2 weeks ago',
      campaignType: 'Instagram Reel & Story'
    },
    {
      id: 'rev-2',
      creatorName: 'Rohan Verma',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      rating: 5,
      comment: 'Loved working with their team. High creative freedom and excellent collaboration experience!',
      date: '1 month ago',
      campaignType: 'UGC Video Deliverable'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      {/* Top Navigation Back Bar - Placed cleanly above the profile with no overlap */}
      <div className="relative z-10 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition cursor-pointer bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => toggleSaveBrand(brandId)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button 
              onClick={handleInquireClick}
              className="flex items-center gap-1.5 px-4 md:px-5 py-1.5 rounded-full bg-[#D4A338] hover:bg-[#b88628] text-white text-xs font-bold transition cursor-pointer shadow-xs border border-transparent whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquire</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Brand Header / Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 min-w-0 flex-1">
            {/* Logo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-slate-200 p-2 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
              {brand?.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.brandName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand?.brandName || 'Brand')}&background=f1f5f9&color=0f172a&bold=true`;
                  }}
                />
              ) : (
                <Building2 className="w-12 h-12 text-slate-400" />
              )}
            </div>

            {/* Brand Details */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {brand?.brandName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Approved</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {brand?.description || 'Verified partner brand hiring creators on thebrandsstory.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{brand?.industry || 'Brand Partner'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{brand?.city || 'Pan India'}</span>
                </span>
                {brand?.website && (
                  <>
                    <span>•</span>
                    <a
                      href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{brand.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shrink-0 min-w-[200px] text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-amber-500 text-sm font-bold">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="text-slate-900 font-extrabold text-base">4.9 / 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Creator Satisfaction Score</p>
            <div className="pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-800">
              {brandCampaigns.length} Active Campaigns
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'campaigns'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Active Campaigns ({brandCampaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Creator Reviews ({sampleReviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'about'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>About Company</span>
          </button>
        </div>

        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {brandCampaigns.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No Active Briefs Currently</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {brand?.brandName} does not have open briefs right now. Explore other active opportunities on the platform.
                </p>
                <button
                  onClick={() => navigateTo('opportunities')}
                  className="px-5 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5 mt-2"
                >
                  <span>Explore Live Opportunities</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {brandCampaigns.map((camp) => {
                  const isAlreadyPitched = authUser && (camp.applicants || []).some(
                    a => a.creatorId === activeCreatorId || (authUser?.creatorProfile && (a.creatorId === authUser.creatorProfile.id || a.creatorName === authUser.name))
                  );

                  return (
                    <div
                      key={camp.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                            {camp.category}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{camp.createdAt}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base">{camp.campaignTitle}</h3>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {camp.requirements || camp.campaignDescription}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Budget</span>
                            <span className="font-black text-emerald-600 text-xs">{camp.budget}</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                            <span className="font-bold text-slate-800 text-xs truncate block">{camp.city}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500 font-medium">
                          <strong>{(camp.applicants || []).length}</strong> pitches received
                        </span>

                        {isAlreadyPitched ? (
                          <button
                            type="button"
                            disabled
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-not-allowed opacity-90"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Already Pitched</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApply(camp)}
                            className="px-4 py-2 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Pitch My Profile</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Verified Creator Reviews</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Reviews left by creators after completing campaigns with {brand?.brandName}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-bold text-xs border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>5.0 / 5.0 Rating</span>
                </div>
              </div>

              <div className="space-y-4">
                {sampleReviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={rev.creatorAvatar} alt={rev.creatorName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{rev.creatorName}</h4>
                          <span className="text-[10px] text-slate-400">{rev.campaignType} • {rev.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-500 gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: About */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="font-black text-slate-900 text-lg">About {brand?.brandName}</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {brand?.description || 'No detailed company overview provided yet.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Industry</span>
                <span className="font-bold text-slate-900 text-sm block">{brand?.industry || 'Brand Partner'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Headquarters</span>
                <span className="font-bold text-slate-900 text-sm block">{brand?.city || 'Pan India'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Verification Status</span>
                <span className="font-bold text-emerald-600 text-sm block">✓ Admin Approved</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Pitch Modal Popup */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  {selectedCampaign.category}
                </span>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Pitch for "{selectedCampaign.campaignTitle}"
                </h3>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            {hasApplied ? (
              <div className="py-8 text-center space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-black text-slate-900 text-base">Pitch Submitted Successfully!</h4>
                <p className="text-xs text-slate-500">
                  {selectedCampaign.companyName} will review your profile and pitch proposal.
                </p>
              </div>
            ) : (
              <form onSubmit={submitApplication} className="space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{selectedCampaign.companyName}</span>
                    <span className="text-emerald-600">{selectedCampaign.budget}</span>
                  </div>
                  <p className="text-slate-500 line-clamp-2">
                    {selectedCampaign.requirements || selectedCampaign.campaignDescription}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Why are you the right fit for this campaign?
                  </label>
                  <textarea
                    rows={4}
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    required
                    placeholder="Describe your audience, engagement style, or creative ideas for this brief..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Submit Pitch Proposal</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Inquiry Modal Popup */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Direct Message
                </span>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Inquire with {brand?.brandName}
                </h3>
              </div>
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            {hasInquired ? (
              <div className="py-8 text-center space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-black text-slate-900 text-base">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-500">
                  {brand?.brandName} has received your message and will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={submitInquiry} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Your Message
                  </label>
                  <textarea
                    rows={5}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    required
                    placeholder="Hello! I would love to collaborate or learn more about your brand..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{isSubmittingInquiry ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
