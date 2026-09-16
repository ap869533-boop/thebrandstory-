import React, { useState, useEffect } from 'react';
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
  Star,
  User2,
  FileText,
  Globe,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Save,
  ExternalLink
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CreatorCard } from '../components/common/CreatorCard';
import { ChangePasswordForm } from '../components/common/ChangePasswordForm';
import { apiUrl } from '../config/api';

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
    submitEnquiry,
    updateApplicantStatus,
    setAuthUser,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'briefs' | 'pitches' | 'enquiries' | 'shortlists' | 'profile' | 'settings'>('briefs');

  // Brand Profile State
  const [bpBrandName, setBpBrandName] = useState(authUser?.companyName || '');
  const [bpGstNumber, setBpGstNumber] = useState(authUser?.gstNumber || '');
  const [bpDescription, setBpDescription] = useState('');
  const [bpWebsite, setBpWebsite] = useState('');
  const [bpIndustry, setBpIndustry] = useState('');
  const [bpCity, setBpCity] = useState('');
  const [bpContactPerson, setBpContactPerson] = useState(authUser?.name || '');
  const [bpPhone, setBpPhone] = useState('');
  const [bpLogoUrl, setBpLogoUrl] = useState('');
  const [bpSaving, setBpSaving] = useState(false);
  const [bpSaveMsg, setBpSaveMsg] = useState<string | null>(null);
  const [bpLoaded, setBpLoaded] = useState(false);

  // Fetch brand profile on mount
  useEffect(() => {
    const token = localStorage.getItem('sc_auth_token');
    if (!token || !authUser || authUser.role !== 'BRAND') return;
    fetch(apiUrl('/api/brands/profile'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.profile) {
          setBpBrandName(data.profile.brandName || authUser?.companyName || '');
          setBpGstNumber(data.profile.gstNumber || authUser?.gstNumber || '');
          setBpDescription(data.profile.description || '');
          setBpWebsite(data.profile.website || '');
          setBpIndustry(data.profile.industry || '');
          setBpCity(data.profile.city || '');
          setBpContactPerson(data.profile.contactPerson || authUser?.name || '');
          setBpPhone(data.profile.phone || '');
          setBpLogoUrl(data.profile.logoUrl || '');
        }
        setBpLoaded(true);
      })
      .catch(() => setBpLoaded(true));

    // Refresh authUser status from backend
    fetch(apiUrl('/api/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          if (data.user.approvalStatus !== authUser.approvalStatus || data.user.status !== authUser.status) {
            setAuthUser({ ...authUser, ...data.user });
          }
        }
      })
      .catch(e => console.error('Failed to sync authUser:', e));
  }, [authUser]);

  const handleSaveBrandProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBpSaving(true);
    setBpSaveMsg(null);
    try {
      const token = localStorage.getItem('sc_auth_token');
      const res = await fetch(apiUrl('/api/brands/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          brandName: bpBrandName,
          gstNumber: bpGstNumber,
          description: bpDescription,
          website: bpWebsite,
          industry: bpIndustry,
          city: bpCity,
          contactPerson: bpContactPerson,
          phone: bpPhone,
          logoUrl: bpLogoUrl,
          email: authUser?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBpSaveMsg('✅ Brand profile updated successfully!');
      } else {
        setBpSaveMsg('❌ ' + (data.error || 'Failed to save profile'));
      }
    } catch {
      setBpSaveMsg('❌ Network error. Please try again.');
    } finally {
      setBpSaving(false);
      setTimeout(() => setBpSaveMsg(null), 4000);
    }
  };

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
  const [activePitchesCampaignId, setActivePitchesCampaignId] = useState<string | null>(null);

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

  const brandDisplayName = bpBrandName || authUser?.companyName || authUser?.name || activeBrandName;
  const [pitchScope, setPitchScope] = useState<'my' | 'all'>('my');
  const approvalStatus = authUser?.approvalStatus || (authUser as any)?.status || 'pending';

  const [showApprovedBanner, setShowApprovedBanner] = useState(false);

  useEffect(() => {
    if (approvalStatus === 'approved') {
      const bannerKey = `approval_banner_shown_${authUser?.id || 'default'}`;
      if (!localStorage.getItem(bannerKey)) {
        setShowApprovedBanner(true);
        localStorage.setItem(bannerKey, 'true');
        const timer = setTimeout(() => setShowApprovedBanner(false), 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [approvalStatus, authUser?.id]);

  // Force active tab to profile if pending
  useEffect(() => {
    if (approvalStatus === 'pending' && !['profile', 'settings'].includes(activeTab)) {
      setActiveTab('profile');
    }
  }, [approvalStatus, activeTab]);

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
    setMsgSent(false);
  };

  // Calculate profile completion
  let completedFields = 0;
  const totalFields = 6;
  if (bpBrandName) completedFields++;
  if (bpContactPerson) completedFields++;
  if (bpCity) completedFields++;
  if (bpPhone) completedFields++;
  if (bpWebsite) completedFields++;
  if (bpIndustry) completedFields++;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Approval Status Banner */}
        {approvalStatus === 'pending' && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black">Account Pending Approval</p>
              <p className="text-xs font-medium mt-0.5">Your brand account is under review by our team. You can still set up your brand profile. Once approved, your profile and campaigns will go live.</p>
            </div>
          </div>
        )}
        {approvalStatus === 'rejected' && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black">Account Rejected</p>
              <p className="text-xs font-medium mt-0.5">Your brand account was not approved. Please contact support for more information.</p>
            </div>
          </div>
        )}
        {showApprovedBanner && (
          <div className="fixed top-8 sm:top-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_20px_60px_rgba(16,185,129,0.4)] w-11/12 max-w-md animate-[bounce_1s_ease-in-out_infinite] transition-all duration-500 border border-emerald-400/50">
            <span className="text-3xl animate-pulse">🎉</span>
            <div className="flex-1 pr-4">
              <span className="text-sm font-black tracking-wide block">Congratulations!</span>
              <span className="text-[11px] sm:text-xs font-medium opacity-90 block mt-0.5">Your brand account is approved and fully active.</span>
            </div>
            <span className="text-2xl animate-[spin_4s_linear_infinite] ml-1">🎊</span>
            <button 
              onClick={() => setShowApprovedBanner(false)}
              className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}

        {/* Header - Modern UI Revamp */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Left Card: Brand Profile Details */}
          <div className="bg-gradient-to-br from-white via-[#fcfaf5] to-[#f1e6cc] rounded-[2.5rem] p-5 sm:p-6 md:p-8 flex-1 text-slate-900 shadow-[0_12px_40px_rgba(212,163,56,0.12)] hover:shadow-[0_20px_50px_rgba(212,163,56,0.2)] hover:-translate-y-1.5 transition-all duration-500 ease-out border border-[#D4A338]/30 relative group overflow-hidden">
            
            {/* Elegant Background Accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#D4A338]/10 via-transparent to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none group-hover:scale-125 group-hover:opacity-70 transition-all duration-700"></div>

            <div className="absolute top-5 sm:top-6 right-5 sm:right-8 z-20 flex flex-col sm:flex-row items-end sm:items-center gap-3">
              <button onClick={() => setActiveTab('profile')} className="hidden sm:inline-block text-[10px] sm:text-[11px] font-bold text-slate-400 hover:text-[#D4A338] transition cursor-pointer">Edit Profile</button>
              <button
                onClick={() => navigateTo('post-requirement')}
                disabled={approvalStatus === 'pending'}
                className={`hidden sm:flex px-4 py-2 rounded-xl font-bold text-[10px] shadow-sm transition-all duration-300 items-center justify-center gap-1.5 ${
                  approvalStatus === 'pending'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-gradient-to-r from-[#D4A338] to-[#b88628] hover:from-[#c2912a] hover:to-[#a37521] text-white hover:shadow-md hover:shadow-[#D4A338]/30 hover:-translate-y-0.5 cursor-pointer'
                }`}
                title={approvalStatus === 'pending' ? 'Wait for admin approval to post briefs' : ''}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{approvalStatus === 'pending' ? 'Approval Required' : 'Post New Brief'}</span>
              </button>
            </div>
            
            <div className="flex flex-col relative z-10 h-full justify-center">
              
              <div className="flex flex-row items-center gap-4 sm:gap-5 md:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#D4A338] to-[#996c14] p-[2px] sm:p-[3px] shrink-0 relative shadow-lg shadow-[#D4A338]/20 group-hover:shadow-[#D4A338]/40 transition-shadow duration-500">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 sm:border-[3px] border-white">
                    {bpLogoUrl ? (
                      <img src={bpLogoUrl} alt={brandDisplayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#D4A338] to-[#996c14] tracking-wider">
                        {brandDisplayName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {approvalStatus === 'approved' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-emerald-500 rounded-full border-2 sm:border-[3px] border-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0 pr-2 sm:pr-32">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                    <h1 className="text-[17px] sm:text-2xl md:text-3xl font-bold sm:font-black text-slate-900 tracking-tight leading-tight">
                      {brandDisplayName}
                    </h1>
                    <div>
                      {approvalStatus === 'approved' ? (
                         <span className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider border border-emerald-100">Verified Brand</span>
                      ) : (
                         <span className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-50 text-amber-600 text-[9px] sm:text-[10px] font-bold rounded-lg uppercase tracking-wider border border-amber-200">Pending Approval</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <span className="truncate">{bpContactPerson || 'Profile not setup'}</span> {authUser?.role ? `• ${authUser.role}` : ''}
                  </p>
                  <p className="text-[9px] sm:text-[11px] md:text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    {bpCity || 'Location not added'} • Joined {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mobile Post Button (visible only on small screens below avatar) */}
            <div className="mt-5 sm:hidden relative z-10">
              <button
                onClick={() => navigateTo('post-requirement')}
                disabled={approvalStatus === 'pending'}
                className={`w-full px-4 py-2.5 rounded-xl font-bold text-[11px] shadow-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  approvalStatus === 'pending'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-gradient-to-r from-[#D4A338] to-[#b88628] text-white cursor-pointer'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{approvalStatus === 'pending' ? 'Approval Required' : 'Post New Brief'}</span>
              </button>
            </div>
          </div>

          {/* Right Card: Profile Completion Indicator */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50/50 rounded-[2.5rem] p-4 sm:p-6 shadow-[0_12px_40px_rgba(212,163,56,0.15)] hover:shadow-[0_20px_50px_rgba(212,163,56,0.25)] hover:-translate-y-1.5 transition-all duration-500 ease-out border border-amber-200/50 flex flex-col items-center justify-center relative shrink-0 lg:w-72 overflow-hidden group">
            
            {/* Animated Particles / Bubbles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Soft glows */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-[#D4A338]/10 rounded-full mix-blend-multiply blur-xl animate-[pulse_4s_ease-in-out_infinite]"></div>
              <div className="absolute bottom-4 right-4 w-20 h-20 bg-rose-400/10 rounded-full mix-blend-multiply blur-xl animate-[pulse_5s_ease-in-out_infinite_1s]"></div>
              
              {/* Floating little circles - Moved closer to center */}
              <div className="absolute top-16 right-16 w-2 h-2 bg-orange-400/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="absolute bottom-20 left-16 w-2.5 h-2.5 bg-rose-400/30 rounded-full animate-[bounce_4s_infinite]"></div>
              <div className="absolute top-1/2 left-12 w-1.5 h-1.5 bg-[#D4A338]/40 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
              
              {/* Orbiting circle - Tighter orbit */}
              <div className="absolute top-1/2 left-1/2 w-[100%] h-[100%] -translate-x-1/2 -translate-y-1/2 animate-[spin_15s_linear_infinite]">
                 <div className="absolute top-2 left-1/2 w-2.5 h-2.5 bg-gradient-to-r from-[#D4A338] to-orange-400 rounded-full opacity-40 blur-[1px]"></div>
                 <div className="absolute bottom-6 right-1/4 w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-30 blur-[1px]"></div>
              </div>
            </div>

            <button onClick={() => setActiveTab('profile')} className="absolute top-4 sm:top-6 right-5 sm:right-6 text-[10px] font-bold text-[#D4A338] hover:text-[#b88628] cursor-pointer z-10">Edit</button>
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mb-1 sm:mb-2 z-10">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#ffffff80" strokeWidth="10" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#goldGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4A338" />
                    <stop offset="100%" stopColor="#f3c86b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                {completionPercentage === 100 ? (
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4A338]" />
                ) : (
                  <span className="text-xl sm:text-2xl font-black text-slate-800">{completionPercentage}%</span>
                )}
                <span className="text-[7px] sm:text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 sm:mt-1">Completed</span>
              </div>
            </div>
            <div className={`mt-2 sm:mt-4 px-4 py-2 rounded-xl backdrop-blur-sm border text-[10px] font-bold w-full text-center truncate z-10 shadow-sm transition-colors duration-300 ${
              completionPercentage === 100 
                ? 'bg-emerald-100/80 border-emerald-200 text-emerald-700' 
                : 'bg-white/60 border-white/80 text-slate-700'
            }`}>
              {completionPercentage === 100 ? '🎉 All Set & Ready!' : 'Complete profile to boost trust'}
            </div>
          </div>
          
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-slate-200 gap-4 sm:gap-6 text-xs font-bold text-slate-500 overflow-x-auto">
          {approvalStatus === 'approved' && (
            <>
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
            </>
          )}

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${activeTab === 'profile' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'}`}
          >
            <User2 className="w-3.5 h-3.5" />
            <span>Brand Profile</span>
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
                return (
                  <div key={camp.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 ease-out group">
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
                          onClick={() => setActivePitchesCampaignId(camp.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A338] text-white font-bold rounded-lg shadow-sm hover:bg-[#b88628] transition cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>View Pitches ({campPitches.length})</span>
                        </button>
                      </div>
                    </div>
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

        {/* Tab 5: Profile */}
        {activeTab === 'profile' && (
          <div className="animate-fadeIn max-w-3xl space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900">Brand Profile</h3>
                <p className="text-xs text-slate-500">Manage how your brand appears to creators and the public.</p>
              </div>

              {!bpLoaded ? (
                <div className="text-center text-xs text-slate-500 py-10">Loading profile...</div>
              ) : (
                <form onSubmit={handleSaveBrandProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Brand Name *</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={bpBrandName}
                          onChange={e => setBpBrandName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">GST Number</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={bpGstNumber}
                          onChange={e => setBpGstNumber(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50 uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                      <div className="relative">
                        <User2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={bpContactPerson}
                          onChange={e => setBpContactPerson(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={bpPhone}
                          onChange={e => setBpPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="url"
                          value={bpWebsite}
                          onChange={e => setBpWebsite(e.target.value)}
                          placeholder="https://"
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                      <select
                        value={bpIndustry}
                        onChange={e => setBpIndustry(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50"
                      >
                        <option value="">Select Industry</option>
                        <option value="Fashion">Fashion & Apparel</option>
                        <option value="Beauty">Beauty & Cosmetics</option>
                        <option value="Tech">Tech & Gadgets</option>
                        <option value="Food">Food & Beverage</option>
                        <option value="Travel">Travel & Hospitality</option>
                        <option value="Finance">Finance & Fintech</option>
                        <option value="Education">Education</option>
                        <option value="Health">Health & Wellness</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Description</label>
                    <textarea
                      rows={4}
                      value={bpDescription}
                      onChange={e => setBpDescription(e.target.value)}
                      placeholder="Tell creators a bit about your brand..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Logo URL (Optional)</label>
                    <input
                      type="url"
                      value={bpLogoUrl}
                      onChange={e => setBpLogoUrl(e.target.value)}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-slate-50"
                    />
                    {bpLogoUrl && (
                      <div className="mt-2">
                        <img src={bpLogoUrl} alt="Logo Preview" className="h-12 w-12 object-cover rounded-lg border border-slate-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-semibold">
                      {bpSaveMsg && (
                        <span className={bpSaveMsg.includes('✅') ? 'text-emerald-600' : 'text-rose-600'}>
                          {bpSaveMsg}
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={bpSaving}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {bpSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Settings */}
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
      {/* Pitches Modal */}
      {activePitchesCampaignId && (() => {
        const campaign = campaigns.find(c => c.id === activePitchesCampaignId);
        if (!campaign) return null;
        const campPitches = campaign.applicants || [];
        
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
            onClick={() => setActivePitchesCampaignId(null)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-slate-50 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{campaign.campaignTitle}</h3>
                  <p className="text-xs text-slate-500">{campPitches.length} Creator Pitches</p>
                </div>
                <button
                  onClick={() => setActivePitchesCampaignId(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {campPitches.length === 0 ? (
                  <div className="text-center py-10">
                    <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-700">No Pitches Yet</h4>
                    <p className="text-xs text-slate-500">Wait for creators to discover and pitch to your brief.</p>
                  </div>
                ) : (
                  campPitches.map((applicant, idx) => {
                    const creatorInfo = creators.find(c => c.id === applicant.creatorId || (c as any).userId === applicant.creatorId);
                    const creatorName = applicant.creatorName || creatorInfo?.name || 'Creator';
                    const creatorAvatar = applicant.creatorAvatar || creatorInfo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=e0e7ff&color=4f46e5`;
                    const city = (applicant as any).creatorCity || creatorInfo?.currentCity || 'Pan India';
                    const followers = (applicant as any).creatorFollowers || creatorInfo?.followers || 0;
                    const avgViews = (applicant as any).creatorAvgViews || creatorInfo?.avgViews || 0;
                    const username = (applicant as any).creatorUsername || creatorInfo?.username;

                    const handleViewProfile = () => {
                      setActivePitchesCampaignId(null);
                      navigateTo('creator-detail', { username: username || creatorName, id: applicant.creatorId });
                    };

                    return (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img
                            src={creatorAvatar}
                            alt={creatorName}
                            onClick={handleViewProfile}
                            className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100 cursor-pointer hover:opacity-90 transition shadow-sm"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=e0e7ff&color=4f46e5`; }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <h4 
                                  onClick={handleViewProfile}
                                  className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition flex items-center gap-1.5"
                                >
                                  {creatorName}
                                </h4>
                                {username && (
                                  <span className="text-xs text-slate-400 font-medium">@{username}</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{applicant.appliedAt}</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] font-medium text-slate-500">
                              <span>📍 {city}</span>
                              {Boolean(followers) && <span>👥 {Number(followers).toLocaleString('en-IN')} followers</span>}
                              {Boolean(avgViews) && <span>👁️ {Number(avgViews).toLocaleString('en-IN')} avg views</span>}
                              <button
                                onClick={handleViewProfile}
                                className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 ml-auto text-[11px] cursor-pointer"
                              >
                                View Profile <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-700 italic border border-slate-100">
                              "{applicant.pitch}"
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {applicant.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => updateApplicantStatus(campaign.id, applicant.creatorId, 'Accepted')}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Accept Pitch
                                  </button>
                                  <button
                                    onClick={() => updateApplicantStatus(campaign.id, applicant.creatorId, 'Declined')}
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              <span className={`px-3 py-1.5 text-[11px] font-bold rounded-lg ${
                                applicant.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                                applicant.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                                applicant.status === 'Declined' ? 'bg-red-100 text-red-700' :
                                'hidden'
                              }`}>
                                {applicant.status === 'Accepted' && '✅ Accepted'}
                                {applicant.status === 'Declined' && '❌ Declined'}
                                {applicant.status === 'Shortlisted' && '💬 Messaged'}
                              </span>

                              <button
                                onClick={() => {
                                  setActivePitchesCampaignId(null);
                                  openMessageModal({ ...applicant, campaignTitle: campaign.campaignTitle, campaignId: campaign.id, campaignBudget: campaign.budget, campaignCategory: campaign.category, campaignCompany: campaign.companyName });
                                }}
                                className="ml-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Message Creator
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
