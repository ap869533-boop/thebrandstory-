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
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  ExternalLink,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Camera,
  MapPin,
  Mail,
  Handshake
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CreatorCard } from '../components/common/CreatorCard';
import { ChangePasswordForm } from '../components/common/ChangePasswordForm';
import { ConversationsPanel } from '../components/common/ConversationsPanel';
import { apiUrl, authHeaders } from '../config/api';

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
    openAuthModal,
    brandInquiries,
    fetchBrandInquiries,
    updateBrandInquiryStatus,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'briefs' | 'enquiries' | 'chat' | 'deals' | 'profile' | 'settings'>('briefs');

  // Brand Profile State
  const [bpBrandName, setBpBrandName] = useState(authUser?.companyName || '');
  const [bpGstNumber, setBpGstNumber] = useState(authUser?.gstNumber || '');
  const [bpDescription, setBpDescription] = useState('');
  const [bpWebsite, setBpWebsite] = useState('');
  const [bpIndustry, setBpIndustry] = useState('');
  const [bpCity, setBpCity] = useState('');
  const [bpContactPerson, setBpContactPerson] = useState(authUser?.name || '');
  const [bpPhone, setBpPhone] = useState(authUser?.phone || '');
  const [bpLogoUrl, setBpLogoUrl] = useState('');
  const [bpFacebookUrl, setBpFacebookUrl] = useState('');
  const [bpInstagramUrl, setBpInstagramUrl] = useState('');
  const [bpYoutubeUrl, setBpYoutubeUrl] = useState('');
  const [bpLinkedinUrl, setBpLinkedinUrl] = useState('');
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
          setBpPhone(data.profile.phone || authUser?.phone || '');
          setBpLogoUrl(data.profile.logoUrl || '');
          setBpFacebookUrl(data.profile.facebookUrl || '');
          setBpInstagramUrl(data.profile.instagramUrl || '');
          setBpYoutubeUrl(data.profile.youtubeUrl || '');
          setBpLinkedinUrl(data.profile.linkedinUrl || '');
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
          if (data.user.approvalStatus !== authUser.approvalStatus || data.user.status !== (authUser as any).status) {
            setAuthUser({ ...authUser, ...data.user });
          }
        }
      })
      .catch(e => console.error('Failed to sync authUser:', e));
  }, [authUser]);

  // Creator-to-brand inquiries are separate from the brand's outgoing creator messages.
  // Fetch them after the brand session is available so the dashboard always shows new inquiries.
  useEffect(() => {
    if (authUser?.role === 'BRAND') {
      void fetchBrandInquiries();
    }
  }, [authUser?.id, authUser?.role]);

  useEffect(() => {
    if (activeTab === 'enquiries' && authUser?.role === 'BRAND') {
      void fetchBrandInquiries();
    }
  }, [activeTab, authUser?.role]);

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem('sc_auth_token');
      const res = await fetch(apiUrl(`/api/campaigns/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || "Failed to delete campaign");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting campaign");
    }
  };

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
          facebookUrl: bpFacebookUrl,
          instagramUrl: bpInstagramUrl,
          youtubeUrl: bpYoutubeUrl,
          linkedinUrl: bpLinkedinUrl,
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
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [openingConversationId, setOpeningConversationId] = useState<string | null>(null);

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
  const myBriefs = myBrandBriefs;

  const myEnquiries = enquiries.filter(
    (e) =>
      e.brandName.toLowerCase() === brandDisplayName.toLowerCase() ||
      e.email?.toLowerCase() === authUser?.email?.toLowerCase() ||
      e.brandName === 'Aura Fashion'
  );
  const incomingCreatorInquiries = brandInquiries;

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

  const openLiveChat = async (applicant: typeof allPitches[0]) => {
    if (!applicant.creatorId || !applicant.campaignId) return;
    setOpeningConversationId(applicant.creatorId);
    try {
      const res = await fetch(apiUrl('/api/conversations/open'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ creatorId: applicant.creatorId, campaignId: applicant.campaignId }),
      });
      const data = await res.json();
      if (!data.success || !data.conversationId) {
        window.alert(data.error || 'Could not open the live chat. Please try again.');
        return;
      }
      setChatConversationId(data.conversationId);
      setActivePitchesCampaignId(null);
      setActiveTab('chat');
    } catch {
      window.alert('Could not open the live chat. Please check your connection and try again.');
    } finally {
      setOpeningConversationId(null);
    }
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
                <span>{approvalStatus === 'pending' ? 'Approval Required' : 'Create Campaign'}</span>
              </button>
            </div>
            
            <div className="flex flex-col relative z-10 h-full justify-center">
              
              <div className="flex flex-row items-center gap-4 sm:gap-5 md:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#D4A338] to-[#996c14] p-[2px] sm:p-[3px] shrink-0 relative shadow-lg shadow-[#D4A338]/20 group-hover:shadow-[#D4A338]/40 transition-shadow duration-500">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 sm:border-[3px] border-white">
                    {bpLogoUrl ? (
                      <img 
                        src={bpLogoUrl.startsWith('/') ? apiUrl(bpLogoUrl) : bpLogoUrl} 
                        alt={brandDisplayName} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { 
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brandDisplayName)}&background=fde68a&color=b45309&font-size=0.4&bold=true`; 
                        }} 
                      />
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
                      {approvalStatus !== 'approved' && (
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
                <span>{approvalStatus === 'pending' ? 'Approval Required' : 'Create Campaign'}</span>
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

        {/* Modern Tab Navigation */}
        <div className="relative mb-6 sm:mb-8">
          {/* Scroll fade masks for mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10 sm:hidden rounded-l-2xl"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10 sm:hidden rounded-r-2xl"></div>
          
          <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1.5 bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl items-center snap-x relative z-0 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {approvalStatus === 'approved' && (
              <>
                <button
                  onClick={() => setActiveTab('briefs')}
                  className={`snap-center shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap cursor-pointer ${
                    activeTab === 'briefs'
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-orange-500/25 -translate-y-0.5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>My Campaign ({myBriefs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('enquiries')}
                  className={`snap-center shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap cursor-pointer ${
                    activeTab === 'enquiries'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 -translate-y-0.5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquiry ({myEnquiries.length + incomingCreatorInquiries.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('deals')}
                  className={`snap-center shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap cursor-pointer ${
                    activeTab === 'deals'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/25 -translate-y-0.5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Handshake className="w-4 h-4" />
                  <span>Deal (0)</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`snap-center shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 -translate-y-0.5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Chat</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('profile')}
              className={`snap-center shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md shadow-purple-500/25 -translate-y-0.5'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <User2 className="w-4 h-4" />
              <span>Brand Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`snap-center shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md shadow-slate-900/25 -translate-y-0.5'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Briefs */}
        {activeTab === 'briefs' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header / Action Bar for Campaigns */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div>
                <h2 className="text-lg font-black text-slate-800">Your Campaigns</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Manage and track all your posted requirements.</p>
              </div>
              <button
                onClick={() => navigateTo('post-requirement')}
                disabled={approvalStatus === 'pending'}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-[11px] sm:text-xs shadow-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  approvalStatus === 'pending'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-gradient-to-r from-rose-500 via-orange-500 to-[#D4A338] text-white cursor-pointer hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{approvalStatus === 'pending' ? 'Approval Required' : 'Create New Campaign'}</span>
              </button>
            </div>
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
                        <div className="flex flex-col items-end gap-2">
                          <button 
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors shadow-sm"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg">{camp.budget}</span>
                            {(() => {
                              const isExpired = camp.validUntil && new Date(camp.validUntil) < new Date(new Date().setHours(0, 0, 0, 0));
                              const displayStatus = isExpired ? `Expired (${new Date(camp.validUntil as string).toLocaleString('en-IN', { day: '2-digit', month: 'short' })})` : camp.status;
                              const statusColor = isExpired ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-[#b88628]';
                              return (
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${statusColor}`}>
                                  {displayStatus}
                                </span>
                              );
                            })()}
                          </div>
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

        {/* Tab: Deals */}
        {activeTab === 'deals' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
              <Handshake className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Deals Yet</h3>
              <p className="text-xs text-slate-500">Your finalized collaborations and deals will appear here.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Direct Bookings / Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4 animate-fadeIn">
            {myEnquiries.length === 0 && incomingCreatorInquiries.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Inquiries Yet</h3>
                <p className="text-xs text-slate-500">Creator inquiries and your direct messages will appear here.</p>
              </div>
            ) : (
              <>
              {incomingCreatorInquiries.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Creator Inquiries</h3>
                      <p className="text-[11px] text-slate-500">Messages received from creators through your brand page.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                      {incomingCreatorInquiries.length} received
                    </span>
                  </div>
                  {incomingCreatorInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {inquiry.creatorAvatar ? (
                          <img src={inquiry.creatorAvatar} alt={inquiry.creatorName} className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black shrink-0">
                            {inquiry.creatorName?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{inquiry.creatorName}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">Creator inquiry</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{inquiry.message}</p>
                          <span className="text-[11px] text-slate-400 font-medium">{inquiry.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          inquiry.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          inquiry.status === 'Declined' ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>{inquiry.status}</span>
                        {inquiry.status === 'New' && (
                          <button
                            onClick={() => void updateBrandInquiryStatus(inquiry.id, 'Read')}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[10px] font-bold transition cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {myEnquiries.length > 0 && (
                <div className="space-y-3 pt-2">
                  {incomingCreatorInquiries.length > 0 && <h3 className="text-sm font-black text-slate-900">Messages Sent to Creators</h3>}
              {myEnquiries.map((lead) => {
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
              })}
                </div>
              )}
              </>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-3 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-slate-800">Live Chat</h2>
              <p className="text-xs text-slate-500">Chat directly with creators after a collaboration inquiry is confirmed.</p>
            </div>
            <ConversationsPanel openConversationId={chatConversationId} />
          </div>
        )}



        {/* Tab 5: Profile */}
        {activeTab === 'profile' && (
          <div className="animate-fadeIn max-w-4xl space-y-6 mx-auto">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              {/* Colorful top border accent */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              
              <div className="mb-8">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Brand Profile</h3>
                <p className="text-sm text-slate-500 mt-1">Manage how your brand appears to creators and the public.</p>
              </div>

              {!bpLoaded ? (
                <div className="text-center text-xs text-slate-500 py-10">Loading profile...</div>
              ) : (
                <form onSubmit={handleSaveBrandProfile} className="space-y-10">
                  {/* Header Section: Logo & Basic Info */}
                  <div className="flex flex-col lg:flex-row gap-10 items-start">
                    {/* Logo Upload area */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <div className="relative group w-36 h-36 rounded-full border-[3px] border-dashed border-indigo-200 hover:border-indigo-400 flex flex-col items-center justify-center bg-indigo-50/30 cursor-pointer overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                        {bpLogoUrl ? (
                          <img 
                            src={bpLogoUrl.startsWith('/') ? apiUrl(bpLogoUrl) : bpLogoUrl} 
                            alt="Brand Logo" 
                            className="w-full h-full object-cover p-1 rounded-full" 
                            onError={(e) => { 
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brandDisplayName)}&background=e0e7ff&color=4338ca&font-size=0.4&bold=true`; 
                            }} 
                          />
                        ) : (
                          <div className="text-center p-2 text-indigo-400 group-hover:text-indigo-500 transition-colors">
                            <span className="text-4xl font-black text-indigo-300 tracking-wider block mb-1">
                              {brandDisplayName.substring(0, 2).toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Upload Logo</span>
                          </div>
                        )}
                        {/* Hidden file input */}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64Image = reader.result as string;
                              setBpLogoUrl(base64Image); // Optimistic preview
                              try {
                                const token = localStorage.getItem('sc_auth_token');
                                const res = await fetch(apiUrl('/api/upload'), {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ image: base64Image, type: 'avatar', creatorId: authUser?.id })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setBpLogoUrl(data.url);
                                }
                              } catch (err) {
                                console.error('Upload failed', err);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        {bpLogoUrl && (
                          <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold tracking-wide">Recommended: 400x400px</span>
                    </div>

                    {/* Basic Info inputs */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                      <div className="group">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Company / Brand Name <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-3 p-0.5 bg-slate-200 text-slate-500 rounded-md">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            readOnly
                            title="Non-changeable"
                            value={bpBrandName}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed shadow-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-3 p-0.5 bg-slate-200 text-slate-500 rounded-md">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="email"
                            readOnly
                            title="Non-changeable"
                            value={authUser?.email || ''}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed shadow-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">GST Number</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-3 p-0.5 bg-slate-200 text-slate-500 rounded-md">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            readOnly
                            title="Non-changeable"
                            value={bpGstNumber}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed shadow-none font-medium uppercase"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Contact Person</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-3 p-0.5 bg-amber-100 text-amber-600 rounded-md group-focus-within:bg-amber-600 group-focus-within:text-white transition-colors">
                            <User2 className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={bpContactPerson}
                            onChange={e => setBpContactPerson(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 bg-slate-50/50 hover:bg-white transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-3 p-0.5 bg-indigo-100 text-indigo-600 rounded-md group-focus-within:bg-indigo-600 group-focus-within:text-white transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={16}
                            value={bpPhone}
                            onChange={e => {
                              const val = e.target.value;
                              const digits = val.replace(/\D/g, '');
                              if (val === '' || digits.length <= 12) {
                                setBpPhone(val);
                              }
                            }}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Description & Industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="md:col-span-2 lg:col-span-3 space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Brand Description</label>
                      <textarea
                        rows={5}
                        value={bpDescription}
                        onChange={e => setBpDescription(e.target.value)}
                        placeholder="Tell creators a bit about your brand, mission, and products. This helps them pitch better ideas..."
                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 bg-slate-50/50 hover:bg-white transition-all resize-none leading-relaxed shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Industry</label>
                      <select
                        value={bpIndustry}
                        onChange={e => setBpIndustry(e.target.value)}
                        className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 bg-slate-50/50 hover:bg-white transition-all appearance-none cursor-pointer shadow-sm font-medium text-slate-700"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%238b5cf6\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2rem' }}
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Sports & Fitness">Sports & Fitness</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Travel & Hospitality">Travel & Hospitality</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance & Banking">Finance & Banking</option>
                        <option value="E-commerce & Retail">E-commerce & Retail</option>
                        <option value="Consumer Electronics">Consumer Electronics</option>
                        <option value="Telecommunications">Telecommunications</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Education">Education</option>
                        <option value="Energy">Energy</option>
                        <option value="Home & Lifestyle">Home & Lifestyle</option>
                        <option value="Media & Publishing">Media & Publishing</option>
                      </select>
                    </div>
                    <div className="md:col-span-1 lg:col-span-2 group">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Location / City</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-3.5 p-0.5 bg-cyan-100 text-cyan-600 rounded-md group-focus-within:bg-cyan-600 group-focus-within:text-white transition-colors">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={bpCity}
                          onChange={e => setBpCity(e.target.value)}
                          placeholder="e.g. Mumbai, Maharashtra"
                          className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-slate-50/50 hover:bg-white transition-all shadow-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Social Links Section */}
                  <div className="bg-slate-50/50 rounded-2xl p-6 sm:p-8 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                          <Globe className="w-5 h-5" />
                        </div>
                        Online Presence & Social Links
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Optional</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="group">
                        <div className="relative">
                          <Globe className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-blue-500 transition-colors" />
                          <input
                            type="url"
                            value={bpWebsite}
                            onChange={e => setBpWebsite(e.target.value)}
                            placeholder="Website URL (e.g. https://...)"
                            className="w-full pl-12 pr-4 py-3.5 border border-white bg-white shadow-sm rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-200 transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <div className="relative">
                          <Instagram className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-pink-500 transition-colors" />
                          <input
                            type="url"
                            value={bpInstagramUrl}
                            onChange={e => setBpInstagramUrl(e.target.value)}
                            placeholder="Instagram Profile URL"
                            className="w-full pl-12 pr-4 py-3.5 border border-white bg-white shadow-sm rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 hover:border-slate-200 transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <div className="relative">
                          <Youtube className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-red-500 transition-colors" />
                          <input
                            type="url"
                            value={bpYoutubeUrl}
                            onChange={e => setBpYoutubeUrl(e.target.value)}
                            placeholder="YouTube Channel URL"
                            className="w-full pl-12 pr-4 py-3.5 border border-white bg-white shadow-sm rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 hover:border-slate-200 transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="group">
                        <div className="relative">
                          <Facebook className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="url"
                            value={bpFacebookUrl}
                            onChange={e => setBpFacebookUrl(e.target.value)}
                            placeholder="Facebook Page URL"
                            className="w-full pl-12 pr-4 py-3.5 border border-white bg-white shadow-sm rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 hover:border-slate-200 transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="group sm:col-span-2 md:col-span-1">
                        <div className="relative">
                          <Linkedin className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-blue-700 transition-colors" />
                          <input
                            type="url"
                            value={bpLinkedinUrl}
                            onChange={e => setBpLinkedinUrl(e.target.value)}
                            placeholder="LinkedIn Company Page URL"
                            className="w-full pl-12 pr-4 py-3.5 border border-white bg-white shadow-sm rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-700/10 focus:border-blue-700 hover:border-slate-200 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-sm font-semibold w-full sm:w-auto">
                      {bpSaveMsg && (
                        <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 w-full sm:w-auto border ${bpSaveMsg.includes('✅') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'} shadow-sm animate-fadeIn`}>
                          {bpSaveMsg.includes('✅') ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                          {bpSaveMsg.replace('✅ ', '').replace('❌ ', '')}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={bpSaving}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wide"
                    >
                      {bpSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving Profile...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
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
                                onClick={() => openLiveChat({ ...applicant, campaignTitle: campaign.campaignTitle, campaignId: campaign.id, campaignBudget: campaign.budget, campaignCategory: campaign.category, campaignCompany: campaign.companyName })}
                                disabled={openingConversationId === applicant.creatorId}
                                className="ml-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {openingConversationId === applicant.creatorId ? 'Opening Chat...' : 'Message Creator'}
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
