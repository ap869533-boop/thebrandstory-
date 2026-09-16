import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Heart,
  Scale,
  MessageSquare,
  Sparkles,
  Share2,
  Calendar,
  IndianRupee,
  Star,
  Users,
  Eye,
  TrendingUp,
  Award,
  Video,
  Instagram,
  Youtube,
  Linkedin,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';


export const CreatorDetailModal: React.FC = () => {
  const {
    creatorDetailModalCreator,
    closeCreatorDetailModal,
    openEnquiryModal,
    isCreatorSaved,
    toggleSaveCreator,
    addToCompare,
    removeFromCompare,
    isComparing,
    openTrustScoreModal,
    addCreatorReview,
  } = usePlatform();

  const creator = creatorDetailModalCreator;
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'audience' | 'portfolio' | 'reviews'>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerBrand, setReviewerBrand] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewCampaignType, setReviewCampaignType] = useState('Instagram Reel Campaign');
  const [reviewComment, setReviewComment] = useState('');

  if (!creator) return null;

  const isSaved = isCreatorSaved(creator.id);
  const comparing = isComparing(creator.id);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + '/#creator-' + creator.username);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerBrand || !reviewComment) return;
    addCreatorReview(creator.id, {
      brandName: reviewerBrand,
      rating: reviewRating,
      campaignType: reviewCampaignType,
      reviewText: reviewComment,
      verifiedCollaboration: true,
    });
    setShowReviewForm(false);
    setReviewerBrand('');
    setReviewComment('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={closeCreatorDetailModal}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Close Header */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200/80 transition cursor-pointer"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={closeCreatorDetailModal}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 shadow-md border border-slate-200/80 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {/* Cover & Avatar Header */}
          <div className="relative w-full h-36 sm:h-48 bg-slate-900 overflow-hidden">
            <img
              src={creator.coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80'}
              alt={creator.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
              {/* Avatar & Identifiers */}
              <div className="flex items-end gap-3.5">
                <div className="relative">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                  />
                  {creator.isVerified && (
                    <div
                      className="absolute -bottom-2 -right-2 bg-black text-white p-1 rounded-lg shadow-md border-2 border-white"
                      title="thebrandsstory. Verified"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {creator.name}
                    </h2>
                    <span className={`px-2 py-0.5 font-bold text-[11px] rounded-md border flex items-center gap-1 ${
                      creator.isRising || creator.followers < 10000
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : creator.followers < 50000
                        ? 'bg-blue-50 text-[#b88628] border-blue-200'
                        : creator.followers < 100000
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : creator.followers < 500000
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : creator.followers < 1000000
                        ? 'bg-pink-50 text-pink-700 border-pink-200'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      <span>
                        {creator.isRising || creator.followers < 10000
                          ? '🌱 Rising Star'
                          : creator.followers < 50000
                          ? '⚡ Micro Tier'
                          : creator.followers < 100000
                          ? '🔥 Mid-Tier'
                          : creator.followers < 500000
                          ? '⭐ Macro Tier'
                          : creator.followers < 1000000
                          ? '👑 Mega Influencer'
                          : '💎 Celebrity'}
                      </span>
                    </span>

                    {creator.isVerified && (
                      <span className="px-2 py-0.5 bg-blue-50 text-[#b88628] font-bold text-[11px] rounded-md border border-blue-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#D4A338]" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    @{creator.username} • <span className="text-slate-800 font-bold">{creator.primaryCategory}</span>
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#D4A338]" />
                    <span>Based in <strong>{creator.currentCity}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  onClick={() => toggleSaveCreator(creator.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isSaved
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title={isSaved ? 'Remove from Saved' : 'Save Influencer'}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => (comparing ? removeFromCompare(creator.id) : addToCompare(creator))}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    comparing
                      ? 'bg-blue-50 border-blue-200 text-[#b88628]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title={comparing ? 'Remove from Compare' : 'Add to Compare Matrix'}
                >
                  <Scale className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    closeCreatorDetailModal();
                    openEnquiryModal(creator);
                  }}
                  className="px-5 py-2.5 bg-black hover:bg-zinc-900 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact & Book</span>
                </button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
              {creator.bio}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Followers</span>
                <span className="text-base font-black text-slate-900">
                  {creator.followers >= 1000000 ? `${(creator.followers / 1000000).toFixed(1)}M` : `${(creator.followers / 1000).toFixed(0)}K`}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Views</span>
                <span className="text-base font-black text-emerald-600">
                  {(creator.avgViews || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting Commercial</span>
                <span className="text-base font-black text-[#b88628]">
                  ₹{(creator.startingPrice ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* In-Modal Tab Navigation */}
            <div className="flex border-b border-slate-200 mt-6 gap-4 sm:gap-6 text-xs font-bold text-slate-500 overflow-x-auto">
              {(['overview', 'pricing', 'audience', 'portfolio', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 capitalize transition cursor-pointer shrink-0 ${
                    activeTab === tab
                      ? 'text-[#D4A338] border-b-2 border-blue-600 font-extrabold'
                      : 'hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="pt-5 text-xs text-slate-700 space-y-4">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Social Channels & Authenticity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {creator.socialPlatforms.map((plat, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {plat.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                            {plat.platform === 'youtube' && <Youtube className="w-4 h-4 text-red-600" />}
                            {plat.platform === 'linkedin' && <Linkedin className="w-4 h-4 text-[#b88628]" />}
                            <div>
                              <span className="font-bold text-slate-800 block">@{plat.username}</span>
                              <span className="text-[11px] text-slate-500">{(plat.followers / 1000).toFixed(0)}K Followers • {(plat.avgViews / 1000).toFixed(0)}K Avg Views</span>
                            </div>
                          </div>
                          <a
                            href={plat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#D4A338] hover:text-[#93651f] p-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Collaboration Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {creator.collaborationTypes.map((type, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-[#93651f] rounded-lg font-bold border border-blue-100">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900">Standard Rate Card</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                      <span className="text-slate-500 font-medium block">Instagram Reel</span>
                      <span className="text-lg font-black text-slate-900">₹{(creator.pricing.reelPrice ?? 5000).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 block">30-60s with tag</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                      <span className="text-slate-500 font-medium block">Story Package</span>
                      <span className="text-lg font-black text-slate-900">₹{(creator.pricing.storyPrice ?? 2000).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 block">2x Stories + link</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                      <span className="text-slate-500 font-medium block">UGC Video Creation</span>
                      <span className="text-lg font-black text-slate-900">₹{(creator.pricing.ugcPrice ?? 4000).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 block">Raw usage rights</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audience' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900">Audience Demographics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 block">Top Cities Concentration</span>
                      {creator.audience.topCities.map((c, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span>{c.city}</span>
                          <span className="font-bold text-[#b88628]">{c.percentage}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-800 block">Gender Split</span>
                      {creator.audience.genderSplit.map((g, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span>{g.gender}</span>
                          <span className="font-bold text-emerald-700">{g.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900">Sample Campaign Reels</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {creator.portfolio.map((item) => (
                      <div key={item.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white relative group">
                        <img src={item.thumbnail} alt={item.title} className="w-full h-36 object-cover opacity-80" />
                        <div className="p-2 absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent">
                          <span className="font-bold text-[11px] line-clamp-1">{item.title}</span>
                          <span className="text-[10px] text-slate-300">{(item.views / 1000).toFixed(0)}K views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Verified Brand Reviews</h3>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="text-xs font-bold text-[#D4A338] hover:text-[#93651f] cursor-pointer"
                    >
                      {showReviewForm ? 'Cancel' : '+ Add Brand Review'}
                    </button>
                  </div>

                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Your Brand / Company Name"
                          value={reviewerBrand}
                          onChange={(e) => setReviewerBrand(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5/5 Outstanding)</option>
                          <option value="4">⭐⭐⭐⭐ (4/5 Great)</option>
                          <option value="3">⭐⭐⭐ (3/5 Average)</option>
                        </select>
                      </div>
                      <textarea
                        required
                        placeholder="Write feedback about deliverable quality, turnaround time, communication..."
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button type="submit" className="px-4 py-1.5 bg-black text-white font-bold text-xs rounded-lg">
                        Submit Verified Review
                      </button>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {creator.reviews.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No reviews yet for this creator.</p>
                    ) : (
                      creator.reviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{rev.brandName}</span>
                            <span className="text-amber-500 font-bold text-xs">{'★'.repeat(rev.rating)}</span>
                          </div>
                          <p className="text-xs text-slate-600">{rev.reviewText}</p>
                          <span className="text-[10px] text-slate-400 block">{rev.date} • {rev.campaignType}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Direct booking with <strong>0% platform commission</strong></span>
          </div>
          <button
            onClick={() => {
              closeCreatorDetailModal();
              openEnquiryModal(creator);
            }}
            className="px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Enquire & Book Directly</span>
          </button>
        </div>
      </div>
    </div>
  );
};
