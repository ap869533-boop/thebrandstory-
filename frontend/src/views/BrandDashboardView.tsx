import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  Folder,
  MessageSquare,
  Users,
  Flame,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Lock,
  Settings,
  Send,
  X,
  Inbox,
  Clock,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CreatorCard } from '../components/common/CreatorCard';
import { ChangePasswordForm } from '../components/common/ChangePasswordForm';

export const BrandDashboardView: React.FC = () => {
  const {
    activeBrandName,
    campaigns,
    enquiries,
    savedFolders,
    creators,
    deleteFolder,
    navigateTo,
    authUser,
    openAuthModal,
    submitEnquiry,
    updateApplicantStatus,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'briefs' | 'pitches' | 'enquiries' | 'shortlists' | 'settings'>('briefs');

  // Message Modal State
  const [msgModalCreator, setMsgModalCreator] = useState<{
    creatorId: string;
    creatorName: string;
    creatorAvatar: string;
    creatorUsername: string;
    campaignTitle: string;
    campaignId: string;
  } | null>(null);
  const [msgText, setMsgText] = useState('');
  const [msgBudget, setMsgBudget] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null);

  // RBAC Access Guard
  if (!authUser || (authUser.role !== 'BRAND' && authUser.role !== 'ADMIN')) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xl space-y-5 animate-scaleUp">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Brand Dashboard Restricted</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This dashboard is exclusive for Brands, Agencies, and Marketing Teams. Please sign in to your Brand account.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => openAuthModal()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In as Brand / Agency</span>
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

  const brandDisplayName = authUser?.companyName || authUser?.name || activeBrandName;
  const [pitchScope, setPitchScope] = useState<'my' | 'all'>('my');

  // Match briefs belonging to the brand
  const myBrandBriefs = campaigns.filter(
    (c) =>
      (c.companyName && brandDisplayName && c.companyName.toLowerCase().trim() === brandDisplayName.toLowerCase().trim()) ||
      (c.companyName && brandDisplayName && c.companyName.toLowerCase().includes(brandDisplayName.toLowerCase().trim())) ||
      (c.companyName && brandDisplayName && brandDisplayName.toLowerCase().includes(c.companyName.toLowerCase().trim())) ||
      (c.email && authUser?.email && c.email.toLowerCase() === authUser.email.toLowerCase()) ||
      c.companyName === 'thebrandsstory. Client'
  );

  // If brand has no direct briefs yet, or selected 'all', show all campaigns with pitches so nothing is ever missed
  const myBriefs = (pitchScope === 'all' || myBrandBriefs.length === 0) ? campaigns : myBrandBriefs;

  const myEnquiries = enquiries.filter(
    (e) =>
      e.brandName.toLowerCase() === brandDisplayName.toLowerCase() ||
      e.email?.toLowerCase() === authUser?.email?.toLowerCase() ||
      e.brandName === 'Aura Fashion'
  );

  // All creator pitches across my campaigns
  const allPitches = myBriefs.flatMap((camp) =>
    (camp.applicants || []).map((applicant) => ({
      ...applicant,
      campaignTitle: camp.campaignTitle,
      campaignId: camp.id,
      campaignBudget: camp.budget,
      campaignCategory: camp.category,
      campaignCompany: camp.companyName,
    }))
  );

  // Send message / inquiry to creator -> shows in creator's Inquiries & updates pitch status
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgModalCreator || !msgText.trim()) return;

    submitEnquiry({
      creatorId: msgModalCreator.creatorId,
      creatorName: msgModalCreator.creatorName,
      creatorUsername: msgModalCreator.creatorUsername,
      creatorAvatar: msgModalCreator.creatorAvatar,
      brandName: brandDisplayName,
      contactPerson: authUser?.name || brandDisplayName,
      email: authUser?.email || '',
      phone: (authUser as any)?.phone || '',
      campaignType: 'Brand Pitch Response',
      campaignDescription: `Campaign: ${msgModalCreator.campaignTitle}`,
      city: 'Pan India',
      budget: msgBudget || 'Open to discuss',
      influencersRequired: 1,
      preferredDate: 'Immediate',
      message: msgText.trim(),
    });

    // Mark applicant status as Shortlisted (Inquiry Sent)
    if (msgModalCreator.campaignId) {
      updateApplicantStatus(msgModalCreator.campaignId, msgModalCreator.creatorId, 'Shortlisted');
    }

    setMsgSent(true);
    setTimeout(() => {
      setMsgModalCreator(null);
      setMsgText('');
      setMsgBudget('');
      setMsgSent(false);
    }, 1800);
  };

  const openMessageModal = (applicant: typeof allPitches[0]) => {
    const creator = creators.find((c) => c.id === applicant.creatorId);
    setMsgModalCreator({
      creatorId: applicant.creatorId,
      creatorName: applicant.creatorName,
      creatorAvatar: applicant.creatorAvatar,
      creatorUsername: creator?.username || applicant.creatorId,
      campaignTitle: applicant.campaignTitle,
      campaignId: applicant.campaignId,
    });
    setMsgText(`Hi ${applicant.creatorName}! We loved your pitch for "${applicant.campaignTitle}". We'd love to discuss further collaboration.`);
    setMsgBudget('');
    setMsgSent(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#D4A338] flex items-center justify-center font-bold text-xl border border-blue-100">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{brandDisplayName}</h1>
                <span className="px-2 py-0.5 bg-blue-50 text-[#b88628] text-[10px] font-bold rounded-md">Verified Brand</span>
              </div>
              <p className="text-xs text-slate-500">Manage campaign briefs, creator pitches, shortlists, and bookings</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('post-requirement')}
            className="px-4 py-2 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post New Brief</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-slate-200 gap-4 sm:gap-6 text-xs font-bold text-slate-500 overflow-x-auto">
          <button
            onClick={() => setActiveTab('briefs')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${activeTab === 'briefs' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>My Posted Briefs ({myBriefs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pitches')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${activeTab === 'pitches' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Creator Pitches ({allPitches.length})</span>
            {allPitches.filter(p => p.status === 'Pending').length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-400 text-white text-[9px] font-black rounded-full">
                {allPitches.filter(p => p.status === 'Pending').length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${activeTab === 'enquiries' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Bookings ({myEnquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shortlists')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${activeTab === 'shortlists' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Saved Shortlists ({savedFolders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${activeTab === 'settings' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Tab 1: Briefs */}
        {activeTab === 'briefs' && (
          <div className="space-y-4 animate-fadeIn">
            {myBriefs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
                <Flame className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Active Briefs</h3>
                <p className="text-xs text-slate-500">Post a campaign brief to get curated pitches from creators across India.</p>
                <button
                  onClick={() => navigateTo('post-requirement')}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-zinc-900 transition cursor-pointer"
                >
                  Post Your First Campaign Brief
                </button>
              </div>
            ) : (
              myBriefs.map((camp) => {
                const campPitches = camp.applicants || [];
                const isExpanded = expandedBrief === camp.id;
                return (
                  <div key={camp.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#D4A338] uppercase tracking-wider">{camp.category}</span>
                          <h3 className="text-base font-black text-slate-900">{camp.campaignTitle}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg">{camp.budget}</span>
                          <span className="px-2.5 py-1 bg-blue-50 text-[#b88628] text-xs font-bold rounded-lg">{camp.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{camp.campaignDescription}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span>Target: {camp.city} • {camp.followerRange} followers</span>
                        <button
                          onClick={() => setExpandedBrief(isExpanded ? null : camp.id)}
                          className="flex items-center gap-1 font-bold text-[#D4A338] hover:text-[#b88628] transition cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{campPitches.length} Creator Pitches</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Inline pitch previews */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-3">
                        {campPitches.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">No creator pitches yet for this brief.</p>
                        ) : (
                          campPitches.map((applicant, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                              <img
                                src={applicant.creatorAvatar}
                                alt={applicant.creatorName}
                                className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.creatorName)}&background=e0e7ff&color=4f46e5`; }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-slate-900 text-sm">{applicant.creatorName}</span>
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                    applicant.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                                    applicant.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
                                    applicant.status === 'Declined' ? 'bg-red-100 text-red-600' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>{applicant.status}</span>
                                  <span className="text-[10px] text-slate-400 ml-auto">{applicant.appliedAt}</span>
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{applicant.pitch}</p>
                              </div>
                              <button
                                onClick={() => openMessageModal({ ...applicant, campaignTitle: camp.campaignTitle, campaignId: camp.id, campaignBudget: camp.budget, campaignCategory: camp.category, campaignCompany: camp.companyName })}
                                className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                <MessageSquare className="w-3 h-3" />
                                Message
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Creator Pitches (aggregated across all briefs) */}
        {activeTab === 'pitches' && (
          <div className="space-y-4 animate-fadeIn">
            {allPitches.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Creator Pitches Yet</h3>
                <p className="text-xs text-slate-500">
                  When creators pitch their profile to your campaign briefs, they'll appear here. You can review their pitch and message them directly.
                </p>
                <button
                  onClick={() => navigateTo('post-requirement')}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-zinc-900 transition cursor-pointer"
                >
                  Post a Campaign Brief
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500 font-medium">
                      {allPitches.length} pitch{allPitches.length !== 1 ? 'es' : ''} received across {myBriefs.length} brief{myBriefs.length !== 1 ? 's' : ''}
                    </p>
                    {myBrandBriefs.length > 0 && (
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setPitchScope('my')}
                          className={`px-2 py-0.5 rounded-md transition ${pitchScope === 'my' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          My Briefs ({myBrandBriefs.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPitchScope('all')}
                          className={`px-2 py-0.5 rounded-md transition ${pitchScope === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          All Briefs ({campaigns.length})
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {allPitches.filter(p => p.status === 'Accepted').length > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">
                        {allPitches.filter(p => p.status === 'Accepted').length} Confirmed
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200">
                      {allPitches.filter(p => p.status === 'Pending').length} Pending Review
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {allPitches.map((applicant, idx) => {
                    const creator = creators.find(c => c.id === applicant.creatorId);
                    const isConfirmed = applicant.status === 'Accepted';
                    const isInquired = applicant.status === 'Shortlisted';
                    return (
                      <div
                        key={idx}
                        className={`bg-white p-5 rounded-2xl border transition-all ${
                          isConfirmed
                            ? 'border-emerald-300 shadow-xs bg-emerald-50/10'
                            : isInquired
                            ? 'border-blue-200 shadow-xs'
                            : 'border-slate-200 hover:border-[#D4A338] hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <img
                            src={applicant.creatorAvatar}
                            alt={applicant.creatorName}
                            className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.creatorName)}&background=e0e7ff&color=4f46e5`; }}
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-slate-900 text-sm">{applicant.creatorName}</span>
                                {creator && (
                                  <span className="text-[10px] text-slate-500">
                                    {creator.followers?.toLocaleString('en-IN')} followers • {(creator.avgViews || 0).toLocaleString('en-IN')} avg views
                                  </span>
                                )}
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                                  isConfirmed
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : isInquired
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : applicant.status === 'Declined'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {isConfirmed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                  {isInquired && <Clock className="w-3 h-3 text-blue-600" />}
                                  {isConfirmed
                                    ? 'Confirmed by Creator'
                                    : isInquired
                                    ? 'Inquiry Sent (Awaiting Confirmation)'
                                    : applicant.status === 'Declined'
                                    ? 'Declined'
                                    : 'New Pitch'}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                {applicant.appliedAt}
                              </span>
                            </div>

                            {/* Campaign badge */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-[10px] text-slate-400">Pitched for:</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-[#b88628] rounded">
                                {applicant.campaignTitle}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600">{applicant.campaignBudget}</span>
                            </div>

                            {/* Pitch text */}
                            <div className="bg-slate-50 rounded-xl p-3 mb-3">
                              <p className="text-xs text-slate-700 leading-relaxed">"{applicant.pitch}"</p>
                            </div>

                            {/* Creator metrics */}
                            {creator && (
                              <div className="flex flex-wrap gap-3 mb-3 text-[11px] text-slate-500">
                                <span>📍 {creator.currentCity}</span>
                                <span>🏷️ {creator.primaryCategory}</span>
                                <span>⭐ Trust: {creator.trustScore}/100</span>
                                <span>💰 From ₹{creator.startingPrice?.toLocaleString('en-IN')}</span>
                              </div>
                            )}

                            {/* Status Banners */}
                            {isConfirmed && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Collaboration Confirmed! The influencer has accepted your collaboration proposal.</span>
                              </div>
                            )}

                            {isInquired && (
                              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium flex items-center gap-2 mb-3">
                                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>Inquiry sent to creator. Waiting for creator to confirm on their dashboard.</span>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => openMessageModal(applicant)}
                                className={`px-4 py-2 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                                  isConfirmed
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs'
                                    : isInquired
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-xs'
                                    : 'bg-black hover:bg-[#D4A338] hover:text-black shadow-xs'
                                }`}
                              >
                                <Send className="w-3.5 h-3.5" />
                                {isConfirmed
                                  ? 'Message Confirmed Creator'
                                  : isInquired
                                  ? 'Send Follow-up Inquiry'
                                  : 'Inquire & Invite Creator'}
                              </button>
                              {creator && (
                                <button
                                  onClick={() => navigateTo('influencer-detail', { username: creator.username })}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  View Full Profile
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 3: Direct Bookings / Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4 animate-fadeIn">
            {myEnquiries.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Direct Bookings Yet</h3>
                <p className="text-xs text-slate-500">When you send direct messages to creators, they will be tracked here.</p>
              </div>
            ) : (
              myEnquiries.map((lead) => {
                const creator = creators.find(c => c.id === lead.creatorId);
                return (
                  <div key={lead.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {creator && (
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=e0e7ff&color=4f46e5`; }}
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{lead.creatorName}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-[#b88628] text-[10px] font-bold">{lead.campaignType}</span>
                        </div>
                        <p className="text-xs text-slate-600">{lead.message}</p>
                        <span className="text-[11px] text-slate-400 font-medium">Budget: {lead.budget} • {lead.createdAt}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                      lead.status === 'Converted' ? 'bg-emerald-100 text-emerald-700' :
                      lead.status === 'New' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 4: Shortlists */}
        {activeTab === 'shortlists' && (
          <div className="space-y-6 animate-fadeIn">
            {savedFolders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                <Folder className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Saved Shortlists</h3>
                <p className="text-xs text-slate-500">Save creator profiles to shortlists while browsing the platform.</p>
              </div>
            ) : (
              savedFolders.map((folder) => {
                const folderCreators = creators.filter((c) => folder.creatorIds.includes(c.id));
                return (
                  <div key={folder.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-amber-500" />
                          <span>{folder.name}</span>
                        </h3>
                        <p className="text-xs text-slate-500">{folderCreators.length} Creators Shortlisted</p>
                      </div>
                      {deleteFolder && (
                        <button
                          onClick={() => deleteFolder(folder.id)}
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                          title="Delete List"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {folderCreators.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No creators added to this shortlist yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {folderCreators.map((creator) => (
                          <CreatorCard key={creator.id} creator={creator} variant="grid" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn max-w-2xl">
            <ChangePasswordForm />
          </div>
        )}
      </div>

      {/* Message Creator Modal */}
      {msgModalCreator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => { setMsgModalCreator(null); setMsgSent(false); }}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setMsgModalCreator(null); setMsgSent(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {msgSent ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h3 className="font-black text-lg text-slate-900">Message Sent!</h3>
                <p className="text-xs text-slate-500">
                  {msgModalCreator.creatorName} will see your message in their <strong>Inquiries</strong> tab on their dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* Creator info */}
                <div className="flex items-center gap-3">
                  <img
                    src={msgModalCreator.creatorAvatar}
                    alt={msgModalCreator.creatorName}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msgModalCreator.creatorName)}&background=e0e7ff&color=4f46e5`; }}
                  />
                  <div>
                    <p className="text-[10px] font-bold text-[#D4A338] uppercase tracking-wider">Message Creator</p>
                    <h3 className="font-black text-base text-slate-900">{msgModalCreator.creatorName}</h3>
                    <p className="text-[11px] text-slate-500">Re: {msgModalCreator.campaignTitle}</p>
                  </div>
                </div>

                {/* Budget field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Budget (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹15,000 per reel"
                    value={msgBudget}
                    onChange={(e) => setMsgBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Write your message to the creator..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50 resize-none"
                  />
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  This message will appear in the creator's <strong>Inquiries</strong> tab on their dashboard.
                </p>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setMsgModalCreator(null); setMsgSent(false); }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
