import { apiUrl, authHeaders } from '../config/api';
import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Users,
  Building,
  Flame,
  Settings,
  TrendingUp,
  MapPin,
  Save,
  Trash2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Upload,
  Plus,
  ExternalLink,
  Layers,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  Phone,
  Mail,
  Instagram,
  RefreshCw,
  LayoutDashboard,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

import { Creator } from '../types';
import { ChangePasswordForm } from '../components/common/ChangePasswordForm';
import AdminHelpSupport from '../components/admin/AdminHelpSupport';

export const AdminDashboardView: React.FC = () => {
  const {
    creators,
    setCreators,
    campaigns,
    deleteCampaign,
    platformStats,
    updatePlatformStats,
    updateCreatorProfile,
    authUser,
    navigateTo,
    partnerBrands,
    addPartnerBrand,
    deletePartnerBrand,
    adminUpdateCreatorStatus,
    adminDeleteCreator,
    categories,
    addCategory,
        deleteCategory,
    industries,
  } = usePlatform();

  // Industry management state
  const [newIndustryName, setNewIndustryName] = useState('');
  const [industryLoading, setIndustryLoading] = useState(false);
  const [industrySuccessMsg, setIndustrySuccessMsg] = useState(false);
  const [industryError, setIndustryError] = useState('');
  const [localIndustries, setLocalIndustries] = useState<any[]>([]);
  const [industrySearch, setIndustrySearch] = useState('');

  useEffect(() => {
    setLocalIndustries(industries || []);
  }, [industries]);

  const handleAddIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndustryName.trim()) return;
    setIndustryLoading(true); setIndustryError('');
    try {
      const token = localStorage.getItem('sc_auth_token');
      const res = await fetch(apiUrl('/api/industries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newIndustryName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalIndustries(prev => [...prev, data.industry].sort((a, b) => a.name.localeCompare(b.name)));
        setNewIndustryName('');
        setIndustrySuccessMsg(true);
        setTimeout(() => setIndustrySuccessMsg(false), 2500);
      } else {
        setIndustryError(data.error || 'Failed to add industry');
      }
    } catch {
      setIndustryError('Network error');
    } finally {
      setIndustryLoading(false);
    }
  };

  const handleDeleteIndustry = async (id: string, name: string) => {
    if (!window.confirm(`Delete industry "${name}"?`)) return;
    try {
      const token = localStorage.getItem('sc_auth_token');
      await fetch(apiUrl(`/api/industries/${id}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setLocalIndustries(prev => prev.filter(i => i.id !== id));
    } catch {
      alert('Failed to delete industry');
    }
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'creators' | 'stats' | 'campaigns' | 'brands' | 'categories' | 'industries' | 'settings' | 'brand-approvals' | 'help_support'>('overview');
  const [adminBrands, setAdminBrands] = useState<any[]>([]);
  const [adminPendingCampaigns, setAdminPendingCampaigns] = useState<any[]>([]);
  const [openSupportTicketsCount, setOpenSupportTicketsCount] = useState<number>(0);

  // Fetch admin brands & pending campaigns
  useEffect(() => {
    const token = localStorage.getItem('sc_auth_token');
    if (!token || (authUser?.role !== 'ADMIN' && authUser?.role !== 'SALES')) return;

    fetch(apiUrl('/api/brands/admin/list'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setAdminBrands(d.brands || []) })
      .catch(e => console.error(e));

    fetch(apiUrl('/api/brands/admin/campaigns/pending'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setAdminPendingCampaigns(d.campaigns || []) })
      .catch(e => console.error(e));

    fetch(apiUrl('/api/support/admin/tickets'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          const openTickets = (d.tickets || []).filter((t: any) => t.status === 'Open');
          setOpenSupportTicketsCount(openTickets.length);
        }
      })
      .catch(e => console.error(e));
  }, [authUser]);

  const handleBrandApproval = async (id: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('sc_auth_token');
    try {
      const res = await fetch(apiUrl(`/api/brands/admin/${id}/approve`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        setAdminBrands(prev => prev.map(b => b.id === id ? { ...b, approvalStatus: data.approvalStatus } : b));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBrand = async (id: string, brandName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the brand "${brandName}" and their user account?`)) return;

    const token = localStorage.getItem('sc_auth_token');
    try {
      const res = await fetch(apiUrl(`/api/brands/admin/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      if (data.success) {
        setAdminBrands(prev => prev.filter(b => b.id !== id));
      } else {
        alert('Failed to delete brand: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting brand');
    }
  };

  const handleCampaignApproval = async (id: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('sc_auth_token');
    try {
      const res = await fetch(apiUrl(`/api/brands/admin/campaigns/${id}/approve`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        setAdminPendingCampaigns(prev => prev.filter(c => c.id !== id));
        // Force refresh campaigns logic would go here ideally
        window.location.reload(); 
      }
    } catch (e) {
      console.error(e);
    }
  };
  const [creatorFilterTab, setCreatorFilterTab] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [creatorSearch, setCreatorSearch] = useState('');
  const [creatorPage, setCreatorPage] = useState(0);
  const [creatorTotal, setCreatorTotal] = useState(0);
  const [creatorStatusCounts, setCreatorStatusCounts] = useState({ pending: 0, active: 0, suspended: 0, newToday: 0 });
  const creatorPageSize = 10;
  const [emailMenuCreatorId, setEmailMenuCreatorId] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<{ creatorId: string; type: 'complete_profile' | 'information_warning' } | null>(null);
  const [brandSearch, setBrandSearch] = useState('');
  const [isRefreshingCreators, setIsRefreshingCreators] = useState(false);

  const refreshCreators = async () => {
    setIsRefreshingCreators(true);
    try {
      const params = new URLSearchParams({
        includePending: 'true',
        limit: String(creatorPageSize),
        offset: String(creatorPage * creatorPageSize),
        _refresh: String(Date.now()),
      });
      if (creatorFilterTab !== 'all') params.set('status', creatorFilterTab);
      if (creatorSearch.trim()) params.set('searchQuery', creatorSearch.trim());
      const response = await fetch(apiUrl(`/api/creators?${params.toString()}`));
      if (!response.ok) throw new Error('Unable to refresh creators');
      const data = await response.json();
      if (!Array.isArray(data.creators)) throw new Error('Invalid creators response');
      setCreators(data.creators);
      setCreatorTotal(Number(data.total) || 0);
      if (data.statusCounts) setCreatorStatusCounts(data.statusCounts);
    } finally {
      setIsRefreshingCreators(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshCreators().catch((error) => {
        console.error('Failed to refresh admin creators:', error);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [creatorFilterTab, creatorSearch, creatorPage]);

  useEffect(() => setCreatorPage(0), [creatorFilterTab, creatorSearch]);

  // Selected Creator for Detailed Review Modal
  const [reviewModalCreator, setReviewModalCreator] = useState<Creator | null>(null);

  // New Brand Form State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCategory, setNewBrandCategory] = useState('Brand Partner');
  const [newBrandLogo, setNewBrandLogo] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [brandAddedSuccess, setBrandAddedSuccess] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catSuccessMsg, setCatSuccessMsg] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const handleDeleteCreator = async (creator: Creator) => {
    if (!window.confirm(`Delete influencer "${creator.name}" permanently?`)) return;
    try {
      await adminDeleteCreator(creator.id);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to delete influencer');
    }
  };

  const sendCreatorReviewEmail = async (creator: Creator, type: 'complete_profile' | 'information_warning') => {
    setSendingEmail({ creatorId: creator.id, type });
    try {
      const response = await fetch(apiUrl(`/api/creators/${creator.id}/review-email`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ type }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to send email');
      setEmailMenuCreatorId(null);
      window.alert(`${type === 'complete_profile' ? 'Complete-profile reminder' : 'Profile-information warning'} sent to ${creator.name}.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string, campaignTitle: string) => {
    if (!window.confirm(`Delete campaign "${campaignTitle}" permanently?`)) return;
    try {
      await deleteCampaign(campaignId);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to delete campaign');
    }
  };

  // RBAC Strict Admin Protection: Only ADMIN / SALES role
  if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'SALES')) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Admin Access Restricted</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This master control panel is restricted to authorized thebrandsstory. system administrators. Influencers and Brand accounts cannot access this portal.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                if (authUser?.role === 'CREATOR') navigateTo('opportunities');
                else if (authUser?.role === 'BRAND') navigateTo('brand-campaigns', { slug: 'account' });
                else navigateTo('home');
              }}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Your Role Dashboard</span>
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

  // Stats Form state
  const [statsForm, setStatsForm] = useState({ ...platformStats });
  const [statsSaved, setStatsSaved] = useState(false);

  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformStats(statsForm);
    setStatsSaved(true);
    setTimeout(() => setStatsSaved(false), 2000);
  };

  // Approval Handlers
  const handleApproveCreator = (creatorId: string, verify: boolean = true) => {
    const creator = creators.find((item) => item.id === creatorId);
    if (verify && creator) {
      const completed = [
        Boolean(creator.avatar && !creator.avatar.includes('unsplash')),
        Boolean(creator.coverImage && !creator.coverImage.includes('unsplash')),
        Boolean(creator.bio && creator.bio.trim().length > 30),
        Boolean(creator.currentCity?.trim()),
        Boolean(creator.primaryCategory?.trim()),
        creator.followers > 0,
        creator.startingPrice > 0,
        creator.socialPlatforms.some((platform) => platform.platform === 'instagram' && platform.username),
        creator.languages.length > 0,
      ];
      const completion = Math.round((completed.filter(Boolean).length / completed.length) * 100);
      if (completion < 70) {
        window.alert(`This profile is ${completion}% complete. At least 70% is required before approval.`);
        return;
      }
    }
    updateCreatorProfile(creatorId, {
      status: 'active',
      isVerified: verify,
      verificationRequested: false,
    });
    if (adminUpdateCreatorStatus) {
      adminUpdateCreatorStatus(creatorId, 'active');
    }
    if (reviewModalCreator && reviewModalCreator.id === creatorId) {
      setReviewModalCreator(null);
    }
  };

  const handleRejectCreator = (creatorId: string) => {
    updateCreatorProfile(creatorId, {
      status: 'suspended',
      isVerified: false,
      verificationRequested: false,
    });
    if (adminUpdateCreatorStatus) {
      adminUpdateCreatorStatus(creatorId, 'suspended');
    }
    if (reviewModalCreator && reviewModalCreator.id === creatorId) {
      setReviewModalCreator(null);
    }
  };

  const toggleFeatured = (creatorId: string, current: boolean) => {
    updateCreatorProfile(creatorId, { isFeatured: !current });
  };

  const toggleTop20 = (creatorId: string, current: boolean) => {
    updateCreatorProfile(creatorId, { isTop20: !current });
  };

  const toggleRising = (creatorId: string, current: boolean) => {
    updateCreatorProfile(creatorId, { isRising: !current });
  };

  const toggleVerify = (creatorId: string, current: boolean) => {
    updateCreatorProfile(creatorId, { isVerified: !current, verificationRequested: false });
  };

  // Logo file upload handler
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch(apiUrl('/api/upload'), {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ image: base64, type: 'avatar' }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setNewBrandLogo(data.url);
        } else {
          setNewBrandLogo(base64);
        }
      } catch {
        setNewBrandLogo(base64);
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim() || !newBrandLogo.trim()) return;

    await addPartnerBrand({
      name: newBrandName.trim(),
      category: newBrandCategory.trim() || 'Brand Partner',
      logoUrl: newBrandLogo.trim(),
      website: newBrandWebsite.trim() || '',
      sortOrder: partnerBrands.length + 1,
      isActive: true,
    });

    setBrandAddedSuccess(true);
    setNewBrandName('');
    setNewBrandCategory('Brand Partner');
    setNewBrandLogo('');
    setNewBrandWebsite('');
    setTimeout(() => setBrandAddedSuccess(false), 2500);
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmittingCat(true);
    await addCategory({
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      iconName: newCatIcon.trim() || 'Sparkles',
      image: newCatImage.trim() || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=80',
      description: newCatDesc.trim() || `${newCatName.trim()} influencers and content creators`,
    });
    setIsSubmittingCat(false);
    setCatSuccessMsg(true);
    setNewCatName('');
    setNewCatSlug('');
    setNewCatIcon('Sparkles');
    setNewCatImage('');
    setNewCatDesc('');
    setTimeout(() => setCatSuccessMsg(false), 2500);
  };

  // Filtered Creators calculation
  const pendingCreators = { length: creatorStatusCounts.pending };
  const activeCreators = { length: creatorStatusCounts.active };
  const suspendedCreators = { length: creatorStatusCounts.suspended };
  const allCreatorsCount = pendingCreators.length + activeCreators.length + suspendedCreators.length;
  const displayedCreators = creators;
  const creatorCategoryBreakdown = creators.reduce<Record<string, number>>((totals, creator) => {
    const category = creator.primaryCategory?.trim() || 'Other';
    totals[category] = (totals[category] || 0) + 1;
    return totals;
  }, {});
  const topCreatorCategories = Object.entries(creatorCategoryBreakdown)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .slice(0, 5);
  const categoryMaximum = Math.max(1, ...topCreatorCategories.map(([, count]) => count));

  return (
    <div className="admin-dashboard-page min-h-screen bg-[#080d17] py-5 sm:py-8 font-sans">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="bg-[#0e1726] text-white p-5 sm:p-6 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/20 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#d4a338]/10 border border-[#d4a338]/25 text-[#e2bd68] flex items-center justify-center font-bold text-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">thebrandsstory. Admin</h1>
                <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-300/20">
                  Admin Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Platform operations, creator approvals and partner performance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-xs xl:min-w-[760px]">
            <div className="p-3 sm:p-3.5 bg-gradient-to-br from-[#202b3c] to-[#141e2e] rounded-2xl border border-slate-700/80">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold block">Total Creators</span>
              <span className="text-lg sm:text-xl font-black text-white">{allCreatorsCount}</span>
              <Users className="float-right -mt-6 w-4 h-4 text-slate-400" />
            </div>
            <div className="p-3 sm:p-3.5 bg-gradient-to-br from-[#46391e] to-[#241f19] rounded-2xl border border-amber-300/20">
              <span className="text-[9px] sm:text-[10px] text-amber-200/70 uppercase font-bold block">Awaiting Review</span>
              <span className="text-lg sm:text-xl font-black text-amber-200">{pendingCreators.length}</span>
              <AlertCircle className="float-right -mt-6 w-4 h-4 text-amber-300" />
            </div>
            <div className="p-3 sm:p-3.5 bg-gradient-to-br from-[#173c3a] to-[#132a2b] rounded-2xl border border-emerald-300/15">
              <span className="text-[9px] sm:text-[10px] text-emerald-100/70 uppercase font-bold block">Active Profiles</span>
              <span className="text-lg sm:text-xl font-black text-emerald-200">{activeCreators.length}</span>
              <CheckCircle2 className="float-right -mt-6 w-4 h-4 text-emerald-300" />
            </div>
            <div className="p-3 sm:p-3.5 bg-gradient-to-br from-[#29345a] to-[#19243d] rounded-2xl border border-indigo-300/20">
              <span className="text-[9px] sm:text-[10px] text-indigo-100/75 uppercase font-bold block">New Today</span>
              <span className="text-lg sm:text-xl font-black text-indigo-200">{creatorStatusCounts.newToday}</span>
              <Users className="float-right -mt-6 w-4 h-4 text-indigo-300" />
            </div>
            <div className="p-3 sm:p-3.5 bg-gradient-to-br from-[#1d3150] to-[#172239] rounded-2xl border border-blue-300/15">
              <span className="text-[9px] sm:text-[10px] text-blue-100/70 uppercase font-bold block">Brand Partners</span>
              <span className="text-lg sm:text-xl font-black text-blue-200">{partnerBrands.length}</span>
              <Building className="float-right -mt-6 w-4 h-4 text-blue-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-5 lg:gap-6 items-start">
        <aside className="lg:sticky lg:top-24 rounded-3xl border border-slate-800 bg-[#0d1522] p-3 sm:p-4 shadow-xl shadow-black/10">
        <div className="px-3 pt-2 pb-3 text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">Workspace</div>
        {/* Admin navigation */}
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 text-xs font-bold text-slate-400 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'overview' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('creators')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'creators' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-left">Influencers</span>
            {pendingCreators.length > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-200 text-[10px] font-black">
                {pendingCreators.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'brands' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span className="text-left">Brand Partners</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'categories' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-left">Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'stats' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-left">Platform Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'campaigns' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span className="text-left">Campaigns</span>
            <span className="ml-auto text-[10px] text-slate-500">{campaigns.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('brand-approvals')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'brand-approvals' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span className="text-left">Brand Approvals</span>
            {adminBrands.filter(b => b.approvalStatus === 'pending').length > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-200 text-[10px] font-black">
                {adminBrands.filter(b => b.approvalStatus === 'pending').length}
              </span>
            )}
          </button>

          {authUser.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('industries')}
              className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'industries' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-left">Industries</span>
            </button>
          )}

          <div className="hidden lg:block border-t border-slate-800 my-2" />
          <button
            onClick={() => setActiveTab('settings')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-left">Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('help_support')}
            className={`shrink-0 lg:w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'help_support' ? 'bg-[#d4a338]/15 text-[#edc96e] ring-1 ring-[#d4a338]/20' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-left">Help & Support</span>
            {openSupportTicketsCount > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-200 text-[10px] font-black">
                {openSupportTicketsCount}
              </span>
            )}
          </button>
        </div>
        </aside>

        <section aria-label="Admin dashboard content" className="min-w-0 space-y-5">
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a338]">Admin workspace</p>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">Dashboard Overview</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">A live snapshot of creator and partner activity.</p>
              </div>
              <div className="text-xs text-slate-400 bg-[#0d1522] border border-slate-800 rounded-xl px-3 py-2">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-4">
              <div className="rounded-3xl border border-slate-800 bg-[#0d1522] p-5 sm:p-6 shadow-lg shadow-black/10">
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-sm font-black text-white">Creator Directory</h3>
                    <p className="text-xs text-slate-500 mt-1">Current account status distribution</p>
                  </div>
                  <span className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold text-slate-300">Live totals</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Active', value: activeCreators.length, color: 'text-emerald-300', bar: 'bg-emerald-400' },
                    { label: 'Pending', value: pendingCreators.length, color: 'text-amber-200', bar: 'bg-amber-300' },
                    { label: 'Suspended', value: suspendedCreators.length, color: 'text-rose-300', bar: 'bg-rose-400' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-800 bg-[#111c2c] p-3 sm:p-4">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{item.label}</span>
                      <div className={`mt-1 text-xl sm:text-2xl font-black ${item.color}`}>{item.value}</div>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${item.bar}`} style={{ width: `${allCreatorsCount ? Math.max(item.value ? 5 : 0, (item.value / allCreatorsCount) * 100) : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-around gap-3 h-36 px-2 border-b border-slate-800">
                  {[
                    { label: 'Active', value: activeCreators.length, color: 'from-emerald-400 to-teal-600' },
                    { label: 'Pending', value: pendingCreators.length, color: 'from-amber-300 to-orange-500' },
                    { label: 'Suspended', value: suspendedCreators.length, color: 'from-rose-400 to-rose-700' },
                  ].map((item) => (
                    <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{item.value}</span>
                      <div
                        className={`w-full max-w-16 rounded-t-xl bg-gradient-to-t ${item.color} transition-all duration-700`}
                        style={{ height: `${allCreatorsCount ? Math.max(item.value ? 12 : 3, (item.value / allCreatorsCount) * 100) : 3}%` }}
                      />
                      <span className="text-[10px] text-slate-500 pb-2">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-[#0d1522] p-5 sm:p-6 shadow-lg shadow-black/10">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-sm font-black text-white">Top Creator Categories</h3>
                    <p className="text-xs text-slate-500 mt-1">From the currently loaded directory</p>
                  </div>
                  <BarChart3 className="w-4 h-4 text-[#d4a338]" />
                </div>
                {topCreatorCategories.length ? (
                  <div className="space-y-4">
                    {topCreatorCategories.map(([category, count], index) => (
                      <div key={category}>
                        <div className="flex justify-between gap-3 text-xs mb-1.5">
                          <span className="font-semibold text-slate-300 truncate">{category}</span>
                          <span className="text-slate-500 font-bold">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${['bg-[#d4a338]', 'bg-sky-400', 'bg-emerald-400', 'bg-violet-400', 'bg-rose-400'][index]}`}
                            style={{ width: `${(count / categoryMaximum) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-8 text-center">Creator category data is not available yet.</p>
                )}
                <button onClick={() => setActiveTab('creators')} className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#e3bd65] hover:text-amber-200">
                  Open creator directory <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Creator approvals', description: `${pendingCreators.length} profiles waiting for review`, action: () => setActiveTab('creators'), icon: Users, color: 'text-amber-200', bg: 'bg-amber-300/10' },
                { title: 'Brand approvals', description: `${adminBrands.filter((brand) => brand.approvalStatus === 'pending').length} brands waiting for review`, action: () => setActiveTab('brand-approvals'), icon: Building, color: 'text-sky-200', bg: 'bg-sky-300/10' },
                { title: 'Campaign management', description: `${campaigns.length} campaigns on the platform`, action: () => setActiveTab('campaigns'), icon: Flame, color: 'text-rose-200', bg: 'bg-rose-300/10' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.title} onClick={item.action} className="text-left rounded-2xl border border-slate-800 bg-[#0d1522] p-4 hover:border-slate-600 hover:bg-[#111c2c] transition group">
                    <span className={`inline-flex w-9 h-9 items-center justify-center rounded-xl ${item.bg} ${item.color}`}><Icon className="w-4 h-4" /></span>
                    <span className="mt-3 flex items-center justify-between text-sm font-black text-white">{item.title}<ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-[#d4a338]" /></span>
                    <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 1: Creators Management & Approvals */}
        {activeTab === 'creators' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Filter Sub-Tabs & Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCreatorFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    creatorFilterTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Influencers ({allCreatorsCount})
                </button>

                <button
                  onClick={() => setCreatorFilterTab('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    creatorFilterTab === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pending Approval ({pendingCreators.length})</span>
                </button>

                <button
                  onClick={() => setCreatorFilterTab('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    creatorFilterTab === 'active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active & Verified ({activeCreators.length})</span>
                </button>

                <button
                  onClick={() => setCreatorFilterTab('suspended')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    creatorFilterTab === 'suspended'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Suspended ({suspendedCreators.length})</span>
                </button>
              </div>

              {/* Creator Search */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, handle, city..."
                  value={creatorSearch}
                  onChange={(e) => setCreatorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <button
                type="button"
                onClick={() => void refreshCreators().catch((error) => {
                  console.error('Failed to refresh admin creators:', error);
                })}
                disabled={isRefreshingCreators}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingCreators ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Creators Table */}
            <div className="admin-creator-table bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Influencer</th>
                      <th className="p-4">Niche / City</th>
                      <th className="p-4">Audience & Metrics</th>
                      <th className="p-4">Pricing</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Badges</th>
                      <th className="p-4 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {displayedCreators.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No influencers found under this filter.
                        </td>
                      </tr>
                    ) : (
                      displayedCreators.map((c) => {
                        const isPending = c.status === 'pending' || c.verificationRequested;
                        const isSuspended = c.status === 'suspended';

                        return (
                          <tr
                            key={c.id}
                            className={`admin-creator-row ${
                              isPending ? 'bg-amber-50/25' : isSuspended ? 'bg-rose-50/20' : ''
                            }`}
                          >
                            {/* 1. Influencer Name & Photo */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                  alt={c.name}
                                  className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900">{c.name}</span>
                                    {c.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-medium">@{c.username}</span>
                                </div>
                              </div>
                            </td>

                            {/* 2. Category & City */}
                            <td className="p-4">
                              <span className="font-bold text-slate-900 block">{c.primaryCategory}</span>
                              <span className="text-[11px] text-slate-400">{c.currentCity}</span>
                            </td>

                            {/* 3. Metrics */}
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 block">
                                  {c.followers.toLocaleString('en-IN')} followers
                                </span>
                                <span className="text-[11px] text-emerald-600 font-semibold block">
                                  {c.followers.toLocaleString('en-IN')} followers
                                </span>
                              </div>
                            </td>

                            {/* 4. Pricing */}
                            <td className="p-4">
                              <span className="font-bold text-slate-900 block">
                                {c.pricing?.isBarterAvailable && c.startingPrice === 0
                                  ? 'Barter'
                                  : `₹${(c.startingPrice || 0).toLocaleString('en-IN')}`}
                              </span>
                              <span className="text-[10px] text-slate-400">Starting Rate</span>
                            </td>

                            {/* 5. Status */}
                            <td className="p-4">
                              <div className="space-y-1">
                                {isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Pending Approval</span>
                                  </span>
                                ) : isSuspended ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                    <XCircle className="w-3 h-3" />
                                    <span>Suspended</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Live Active</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 6. Badges */}
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => toggleVerify(c.id, c.isVerified)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                                    c.isVerified
                                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                      : 'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}
                                >
                                  {c.isVerified ? '✓ Verified' : '+ Verify'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleTop20(c.id, c.isTop20)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                                    c.isTop20
                                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                      : 'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}
                                >
                                  Top 20
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleFeatured(c.id, c.isFeatured)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 ${
                                    c.isFeatured
                                      ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                      : 'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}
                                >
                                  Featured
                                </button>
                              </div>
                            </td>

                            {/* 7. Action Buttons */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Inspection Modal button */}
                                <button
                                  type="button"
                                  onClick={() => setReviewModalCreator(c)}
                                  title="Inspect Application"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {isPending ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveCreator(c.id, true)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => setEmailMenuCreatorId((current) => current === c.id ? null : c.id)}
                                        title="Send profile review email"
                                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                                      >
                                        <Mail className="w-3.5 h-3.5" />
                                      </button>
                                      {emailMenuCreatorId === c.id && (
                                        <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg">
                                          <button
                                            type="button"
                                            disabled={sendingEmail?.creatorId === c.id}
                                            onClick={() => void sendCreatorReviewEmail(c, 'complete_profile')}
                                            className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            {sendingEmail?.creatorId === c.id && sendingEmail.type === 'complete_profile'
                                              ? 'Sending…'
                                              : 'Send complete-profile reminder'}
                                          </button>
                                          <button
                                            type="button"
                                            disabled={sendingEmail?.creatorId === c.id}
                                            onClick={() => void sendCreatorReviewEmail(c, 'information_warning')}
                                            className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                            {sendingEmail?.creatorId === c.id && sendingEmail.type === 'information_warning'
                                              ? 'Sending…'
                                              : 'Send information-correction warning'}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectCreator(c.id)}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : isSuspended ? (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveCreator(c.id, false)}
                                    className="px-2.5 py-1 bg-black hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                  >
                                    Reactivate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRejectCreator(c.id)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                  >
                                    Suspend
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteCreator(c)}
                                  title="Delete influencer permanently"
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {creatorTotal > creatorPageSize && (
              <div className="flex items-center justify-center gap-3 py-3">
                <button type="button" onClick={() => setCreatorPage((current) => Math.max(0, current - 1))} disabled={creatorPage === 0 || isRefreshingCreators} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold disabled:opacity-40">Previous</button>
                <span className="text-xs font-medium text-slate-500">Page {creatorPage + 1} of {Math.ceil(creatorTotal / creatorPageSize)}</span>
                <button type="button" onClick={() => setCreatorPage((current) => current + 1)} disabled={(creatorPage + 1) * creatorPageSize >= creatorTotal || isRefreshingCreators} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold disabled:opacity-40">Next</button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Industries Management */}
        {activeTab === 'industries' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Add Industry Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Add Brand Industry</h3>
                    <p className="text-xs text-slate-400">Add new industries to the database. Brands select from these during signup.</p>
                  </div>
                </div>
                {industrySuccessMsg && (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Industry Added!
                  </span>
                )}
              </div>
              <form onSubmit={handleAddIndustry} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry Name *</label>
                  <input
                    type="text"
                    value={newIndustryName}
                    onChange={e => setNewIndustryName(e.target.value)}
                    placeholder="e.g. Technology, Fashion, Food & Beverage"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                  {industryError && <p className="text-xs text-rose-600 mt-1 font-semibold">{industryError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={industryLoading || !newIndustryName.trim()}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {industryLoading ? 'Adding...' : 'Add Industry'}
                </button>
              </form>
            </div>

            {/* Industry List */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">All Industries ({localIndustries.length})</h3>
                  <p className="text-xs text-slate-400">Industries available in brand signup dropdown</p>
                </div>
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search industries..."
                    value={industrySearch}
                    onChange={e => setIndustrySearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
              {localIndustries.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                  <p className="text-slate-400 text-sm font-semibold">No industries yet. Add one above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {localIndustries
                    .filter(ind => !industrySearch.trim() || ind.name.toLowerCase().includes(industrySearch.toLowerCase()))
                    .map(ind => (
                      <div key={ind.id} className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 transition flex items-center justify-between group">
                        <span className="font-semibold text-slate-800 text-sm">{ind.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteIndustry(ind.id, ind.name)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Brand Approvals */}
        {activeTab === 'brand-approvals' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-base font-black text-slate-900">Brand Registrations</h3>
                <span className="text-xs text-slate-500">Approve or reject brand accounts before they go live</span>
              </div>

              {adminBrands.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">No brand accounts found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Brand/Company</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">GST Number</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 rounded-r-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminBrands.map((brand) => (
                        <tr key={brand.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 text-sm">{brand.brandName || brand.companyName}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{brand.industry} • {brand.city}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{brand.contactPerson || brand.userName}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{brand.userEmail}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] tracking-wider text-slate-500">
                            {brand.gstNumber || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              brand.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              brand.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {brand.approvalStatus?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 items-center">
                              {brand.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleBrandApproval(brand.id, 'approve')}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition"
                                    title="Approve Brand"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBrandApproval(brand.id, 'reject')}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                    title="Reject Brand"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteBrand(brand.id, brand.brandName || brand.companyName)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                title="Delete Brand Permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Brand Partners & Logo Slider Management */}
        {activeTab === 'brands' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Add New Brand Partner Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#D4A338] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Add Brand Partner to Homepage Slider</h3>
                    <p className="text-[11px] text-slate-500">Upload brand logo or provide image URL to display on the homepage slider</p>
                  </div>
                </div>

                {brandAddedSuccess && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Brand Added Successfully!</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddBrandSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nykaa, Boat, Mamaearth"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Industry Vertical</label>
                  <input
                    type="text"
                    placeholder="e.g. Beauty & Cosmetics, D2C"
                    value={newBrandCategory}
                    onChange={(e) => setNewBrandCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Website URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://brand.com"
                    value={newBrandWebsite}
                    onChange={(e) => setNewBrandWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Brand Logo Image *</label>
                  <label className={`flex items-center justify-center w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed rounded-xl cursor-pointer transition text-slate-500 hover:text-slate-700 ${newBrandLogo ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-300 hover:border-blue-300'}`}>
                    <Upload className={`w-4 h-4 mr-2 ${newBrandLogo ? 'text-emerald-500' : ''}`} />
                    <span className={`font-semibold ${newBrandLogo ? 'text-emerald-700' : ''}`}>
                      {newBrandLogo ? 'Change Image' : 'Upload Photo'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileUpload} />
                  </label>
                </div>

                <div className="md:col-span-4 flex items-center justify-between pt-2">
                  {newBrandLogo && (
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">Logo Preview:</span>
                      <div className="w-24 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                        <img src={newBrandLogo} alt="Preview" className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUploadingLogo || !newBrandName.trim() || !newBrandLogo.trim()}
                    className="ml-auto px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingLogo ? 'Uploading...' : '+ Add Brand to Slider'}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Brand Partners List */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">All Partner Brands ({partnerBrands.length})</h3>
                  <p className="text-[11px] text-slate-400">Every active brand currently available in the partner list</p>
                </div>
                <input
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Search brands..."
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <span className="text-[11px] text-slate-400">Displayed in continuous 100% full-width marquee slider</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {partnerBrands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase())).map((brand) => (
                  <div
                    key={brand.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-between space-y-2 group hover:border-blue-300 transition"
                  >
                    <div className="w-full h-16 bg-white rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center p-1">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">{brand.name}</span>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <span className="text-xs font-bold text-slate-800 block truncate">{brand.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{brand.category || 'Brand Partner'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deletePartnerBrand(brand.id)}
                      className="w-full py-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Platform Stats */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Platform Homepage Credibility Counters</h3>
                <p className="text-[11px] text-slate-500">Override public counters displayed across the top credibility strip</p>
              </div>

              {statsSaved && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Stats Updated Successfully!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveStats} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Total Verified Creators Counter</label>
                <input
                  type="text"
                  value={statsForm.creatorsDisplay}
                  onChange={(e) => setStatsForm({ ...statsForm, creatorsDisplay: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Pan-India Cities Covered</label>
                <input
                  type="text"
                  value={statsForm.citiesDisplay}
                  onChange={(e) => setStatsForm({ ...statsForm, citiesDisplay: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Content Categories Count</label>
                <input
                  type="text"
                  value={statsForm.categoriesDisplay}
                  onChange={(e) => setStatsForm({ ...statsForm, categoriesDisplay: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Brand Connections & Active Briefs</label>
                <input
                  type="text"
                  value={statsForm.brandConnectionsDisplay}
                  onChange={(e) => setStatsForm({ ...statsForm, brandConnectionsDisplay: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Platform Metrics
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Live Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-8 animate-fadeIn">
            {/* Pending Campaign Approvals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">Pending Campaign Approvals</h3>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">{adminPendingCampaigns.length}</span>
                </div>
              </div>
              
              {adminPendingCampaigns.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                  No campaigns pending approval
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminPendingCampaigns.map((camp) => (
                    <div key={camp.id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{camp.campaignTitle}</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{camp.companyName} • {camp.email}</p>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{camp.campaignDescription}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleCampaignApproval(camp.id, 'approve')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                        >
                          Approve & Live
                        </button>
                        <button
                          onClick={() => handleCampaignApproval(camp.id, 'reject')}
                          className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg transition border border-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Campaigns Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Live Brand Requirements & Opportunities ({campaigns.length})</h3>
                <span className="text-[11px] text-slate-400">Total pitches received across active briefs</span>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{camp.campaignTitle}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold">{camp.companyName} • {camp.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
                        {camp.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleDeleteCampaign(camp.id, camp.campaignTitle)}
                        title="Delete campaign permanently"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{camp.requirements}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                    <span className="font-bold text-[#D4A338]">Budget: {camp.budget}</span>
                    <span className="text-slate-500 font-semibold">{camp.applicantsCount || 0} Pitches Received</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Tab 5: Category Management */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Create Category Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Create New Influencer Category</h3>
                    <p className="text-xs text-slate-400">Add custom categories to MySQL database and platform filter dropdowns</p>
                  </div>
                </div>

                {catSuccessMsg && (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Category Created!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Podcast & Audio"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Slug (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. podcast-audio (auto-generated if empty)"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Icon Name
                    </label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white transition cursor-pointer"
                    >
                      <option value="Sparkles">Sparkles (General / Beauty)</option>
                      <option value="Shirt">Shirt (Fashion)</option>
                      <option value="Utensils">Utensils (Food / Dining)</option>
                      <option value="Compass">Compass (Travel / Adventure)</option>
                      <option value="Heart">Heart (Lifestyle / Wellness)</option>
                      <option value="Dumbbell">Dumbbell (Fitness / Gym)</option>
                      <option value="Laptop">Laptop (Tech / Gadgets)</option>
                      <option value="Gamepad2">Gamepad2 (Gaming / Esports)</option>
                      <option value="TrendingUp">TrendingUp (Finance / Business)</option>
                      <option value="Camera">Camera (Photography)</option>
                      <option value="Mic">Mic (Podcast / Music)</option>
                      <option value="Film">Film (Entertainment)</option>
                      <option value="Building2">Building2 (Real Estate)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newCatImage}
                      onChange={(e) => setNewCatImage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Brief description of the category"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingCat || !newCatName.trim()}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmittingCat ? 'Creating...' : 'Create Category'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Categories Directory Table / Grid */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Active Categories Directory ({categories.length})</h3>
                  <p className="text-xs text-slate-400">All registered influencer categories available across the platform</p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories
                  .filter((cat) => !categorySearch.trim() || cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200/80 transition flex flex-col justify-between space-y-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=80'}
                          alt={cat.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{cat.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block">/{cat.slug}</span>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{cat.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <span className="text-[11px] font-bold text-slate-500">
                          {cat.count ? `${cat.count} Creators` : 'Active'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Influencer Review & Detailed Inspection Modal */}
        {reviewModalCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={reviewModalCreator.avatar}
                    alt={reviewModalCreator.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{reviewModalCreator.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">@{reviewModalCreator.username}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReviewModalCreator(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Influencer Profile Information */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                  <span className="font-bold text-slate-800">{reviewModalCreator.primaryCategory}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">City & State</span>
                  <span className="font-bold text-slate-800">{reviewModalCreator.currentCity}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Followers</span>
                  <span className="font-bold text-slate-800">{reviewModalCreator.followers.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Views</span>
                  <span className="font-bold text-emerald-600">{(reviewModalCreator.avgViews || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Contact & Social Links */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">Contact & Verification Details</span>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{reviewModalCreator.phone || 'Phone verified via OTP'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{reviewModalCreator.email || 'Email verified'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#D4A338] font-semibold">
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <a
                    href={`https://instagram.com/${reviewModalCreator.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>instagram.com/{reviewModalCreator.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">Commercial Rates</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Reel</span>
                    <span className="font-bold text-slate-900">₹{reviewModalCreator.pricing?.reelPrice || reviewModalCreator.startingPrice}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Story</span>
                    <span className="font-bold text-slate-900">₹{reviewModalCreator.pricing?.storyPrice || 2000}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Barter</span>
                    <span className="font-bold text-emerald-600">{reviewModalCreator.pricing?.isBarterAvailable ? 'Available' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRejectCreator(reviewModalCreator.id)}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer"
                >
                  Reject / Suspend
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveCreator(reviewModalCreator.id, true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Verify Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn max-w-2xl">
            <ChangePasswordForm />
          </div>
        )}

        {/* Help & Support Tab */}
        {activeTab === 'help_support' && (
          <div className="animate-fadeIn">
            <AdminHelpSupport />
          </div>
        )}
        </section>
        </div>
      </div>
    </div>
  );
};
