import { apiUrl } from '../config/api';
import React, { useState } from 'react';
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
  Instagram
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { TrustScoreBadge } from '../components/common/TrustScoreBadge';
import { Creator } from '../types';
import { ChangePasswordForm } from '../components/common/ChangePasswordForm';

export const AdminDashboardView: React.FC = () => {
  const {
    creators,
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
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'creators' | 'stats' | 'campaigns' | 'brands' | 'categories' | 'settings'>('creators');
  const [creatorFilterTab, setCreatorFilterTab] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [creatorSearch, setCreatorSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

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
                if (authUser?.role === 'CREATOR') navigateTo('creator-dashboard');
                else if (authUser?.role === 'BRAND') navigateTo('brand-dashboard');
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, folder: 'brand_logos' }),
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
  const pendingCreators = creators.filter((c) => c.status === 'pending' || c.verificationRequested);
  const activeCreators = creators.filter((c) => c.status === 'active' && !c.verificationRequested);
  const suspendedCreators = creators.filter((c) => c.status === 'suspended');

  const displayedCreators = creators.filter((c) => {
    if (creatorFilterTab === 'pending') {
      if (c.status !== 'pending' && !c.verificationRequested) return false;
    } else if (creatorFilterTab === 'active') {
      if (c.status !== 'active') return false;
    } else if (creatorFilterTab === 'suspended') {
      if (c.status !== 'suspended') return false;
    }

    if (creatorSearch.trim()) {
      const q = creatorSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.currentCity.toLowerCase().includes(q) ||
        c.primaryCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">thebrandsstory. Super Admin</h1>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-md border border-blue-400/30">
                  Master Control
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage creator verification & approvals, brand partners slider, platform stats and campaigns</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Creators</span>
              <span className="text-base font-black text-white">{creators.length}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Pending Approval</span>
              <span className="text-base font-black text-amber-400">{pendingCreators.length}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Partner Brands</span>
              <span className="text-base font-black text-blue-400">{partnerBrands.length}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('creators')}
            className={`pb-3 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'creators' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Influencer Approvals & Directory ({creators.length})</span>
            {pendingCreators.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {pendingCreators.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'brands' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Brand Partners & Slider ({partnerBrands.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'categories' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'stats' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Stats Overrides</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'campaigns' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Live Campaigns ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'settings' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account Settings</span>
          </button>
        </div>

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
                  All Influencers ({creators.length})
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
            </div>

            {/* Creators Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Influencer</th>
                      <th className="p-4">Niche / City</th>
                      <th className="p-4">Audience & Metrics</th>
                      <th className="p-4">Pricing</th>
                      <th className="p-4">Status & Trust</th>
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
                            className={`hover:bg-slate-50/70 transition ${
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
                                  {c.engagementRate}% Engagement
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

                            {/* 5. Status & Trust */}
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
                                <div>
                                  <TrustScoreBadge score={c.trustScore} size="sm" />
                                </div>
                              </div>
                            </td>

                            {/* 6. Badges */}
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => toggleVerify(c.id, c.isVerified)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${
                                    c.isVerified
                                      ? 'bg-blue-50 text-[#b88628] border-blue-200'
                                      : 'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}
                                >
                                  {c.isVerified ? '✓ Verified' : '+ Verify'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleTop20(c.id, c.isTop20)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${
                                    c.isTop20
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-slate-100 text-slate-400 border-slate-200'
                                  }`}
                                >
                                  Top 20
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleFeatured(c.id, c.isFeatured)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${
                                    c.isFeatured
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
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
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 animate-fadeIn">
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
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Engagement</span>
                  <span className="font-bold text-emerald-600">{reviewModalCreator.engagementRate}%</span>
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
      </div>
    </div>
  );
};

