import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  MapPin,
  Layers,
  IndianRupee,
  ShieldCheck,
  Heart,
  Scale,
  Folder,
  X,
  Plus,
  Zap,
  TrendingUp,
  Check
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CreatorCard } from '../components/common/CreatorCard';
import { CATEGORIES_LIST, CITIES_LIST } from '../data/initialData';
import { apiUrl } from '../config/api';
import { SubPageHeader } from '../components/common/SubPageHeader';

const CREATOR_PAGE_SIZE = 12;

export const ExploreView: React.FC = () => {
  const {
    creators,
    filters,
    setFilters,
    resetFilters,
    savedFolders,
    savedCreatorIds,
    createFolder,
    navigateTo,
    categories,
    cities,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageCreators, setPageCreators] = useState<any[]>([]);
  const [totalCreators, setTotalCreators] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [matchingBrands, setMatchingBrands] = useState<any[]>([]);
  const [brandPage, setBrandPage] = useState(0);
  const [brandTotal, setBrandTotal] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(CREATOR_PAGE_SIZE), offset: String(page * CREATOR_PAGE_SIZE) });
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.city !== 'all') params.set('city', filters.city);
    if (filters.searchQuery.trim()) params.set('searchQuery', filters.searchQuery.trim());
    if (filters.verifiedOnly) params.set('isVerified', 'true');
    if (filters.risingOnly) params.set('isRising', 'true');
    if (filters.sortBy !== 'recommended') params.set('sortBy', filters.sortBy);
    const followerBounds: Record<string, [number, number?]> = {
      '1k-10k': [1000, 10000], '10k-50k': [10000, 50000], '50k-100k': [50000, 100000],
      '100k-500k': [100000, 500000], '500k-1m': [500000, 1000000], '1m+': [1000000],
    };
    const bounds = followerBounds[filters.followerRange];
    if (bounds) {
      params.set('minFollowers', String(bounds[0]));
      if (bounds[1]) params.set('maxFollowers', String(bounds[1]));
    }
    const priceBounds: Record<string, [number?, number?]> = {
      'under-5k': [undefined, 5000], '5k-10k': [5000, 10000], '10k-25k': [10000, 25000],
      '25k-50k': [25000, 50000], '50k+': [50000],
    };
    const price = priceBounds[filters.priceRange];
    if (price?.[0]) params.set('minPrice', String(price[0]));
    if (price?.[1]) params.set('maxPrice', String(price[1]));
    if (filters.collaborationType !== 'all') params.set('collaborationType', filters.collaborationType);

    let cancelled = false;
    setPageLoading(true);
    const timer = window.setTimeout(() => fetch(apiUrl(`/api/creators?${params.toString()}`))
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        const results = Array.isArray(data.creators) ? data.creators : [];
        setPageCreators(results.map((creator: any) => ({ ...creator, avatar: creator.avatar ? apiUrl(creator.avatar) : creator.avatar })));
        setTotalCreators(Number(data.total) || 0);
      })
      .catch(() => {
        if (!cancelled) { setPageCreators([]); setTotalCreators(0); }
      })
      .finally(() => { if (!cancelled) setPageLoading(false); }), 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [filters, page]);

  useEffect(() => {
    const query = filters.searchQuery.trim();
    const selectedCity = filters.city !== 'all' ? filters.city : '';
    if (!query && !selectedCity) {
      setMatchingBrands([]);
      setBrandTotal(0);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({ limit: '8', offset: String(brandPage * 8) });
    if (query) params.set('searchQuery', query);
    if (selectedCity) params.set('city', selectedCity);
    fetch(apiUrl(`/api/brands?${params.toString()}`))
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setMatchingBrands(Array.isArray(data.brands) ? data.brands : []);
        setBrandTotal(Number(data.total) || 0);
      })
      .catch(() => {
        if (!cancelled) { setMatchingBrands([]); setBrandTotal(0); }
      });
    return () => { cancelled = true; };
  }, [filters.searchQuery, filters.city, brandPage]);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [filters.category, filters.city, filters.followerRange, filters.priceRange, filters.collaborationType, filters.verifiedOnly, filters.risingOnly, filters.sortBy]);

  // Dynamic counts
  const totalTalentCount = totalCreators;
  const highEngagementCount = pageCreators.filter((c) => (c.engagementRate || 0) >= 4.5).length;
  const risingStarsCount = pageCreators.filter((c) => c.isRisingStar).length;
  const verifiedCount = pageCreators.filter((c) => c.isVerified).length;

  const isAnyQuickFilterActive = filters.highEngagementOnly || filters.risingOnly || filters.verifiedOnly;

  const toggleHighEngagement = () => {
    setFilters((prev) => ({
      ...prev,
      highEngagementOnly: !prev.highEngagementOnly,
    }));
  };

  const toggleRisingStars = () => {
    setFilters((prev) => ({
      ...prev,
      risingOnly: !prev.risingOnly,
    }));
  };

  const toggleVerifiedOnly = () => {
    setFilters((prev) => ({
      ...prev,
      verifiedOnly: !prev.verifiedOnly,
    }));
  };

  const clearQuickPills = () => {
    setFilters((prev) => ({
      ...prev,
      highEngagementOnly: false,
      risingOnly: false,
      verifiedOnly: false,
    }));
  };

  // Compute creators to display
  let displayedCreators = pageCreators;
  if (activeTab === 'saved') {
    if (selectedFolderId === 'all') {
      displayedCreators = pageCreators.filter((c) => savedCreatorIds.includes(c.id));
    } else {
      const folder = savedFolders.find((f) => f.id === selectedFolderId);
      displayedCreators = pageCreators.filter((c) => folder?.creatorIds.includes(c.id));
    }
  }

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051126] text-white">
      {/* Top Header */}
      <SubPageHeader title="Discovery" subtitle="50,000+ Verified Creators" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header & Search Banner */}
        <div className="bg-[#081838] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Influencer Discovery Marketplace
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Explore 50,000+ verified creators across 500+ Indian cities with direct contact.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <div className="bg-[#051126] p-1 rounded-xl flex items-center text-xs font-bold border border-white/10">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    activeTab === 'all' ? 'bg-[#D4A338] text-slate-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  All Directory
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                    activeTab === 'saved' ? 'bg-white text-rose-600 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Saved ({savedCreatorIds.length})</span>
                </button>
              </div>

              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-white/15 text-white bg-[#051126] cursor-pointer"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Search & Natural Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search Influencers by name, username, city, or niche..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-24 py-3 bg-[#051126] border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#D4A338] transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Simplified Pill-Based Quick Filters Bar */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">
                Quick Criteria:
              </span>

              {/* 1. All Directory Pill */}
              <button
                type="button"
                id="pill-filter-all"
                onClick={clearQuickPills}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  !isAnyQuickFilterActive
                    ? 'bg-[#D4A338] text-slate-950 border-[#D4A338] shadow-xs'
                    : 'bg-[#051126] hover:bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                <span>All Talent</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    !isAnyQuickFilterActive
                      ? 'bg-black/20 text-slate-950'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {totalTalentCount}
                </span>
              </button>

              {/* 2. High Engagement Pill */}
              <button
                type="button"
                id="pill-filter-high-engagement"
                onClick={toggleHighEngagement}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  filters.highEngagementOnly
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-[#051126] hover:bg-amber-500/10 text-slate-300 border-white/10 hover:border-amber-500/30'
                }`}
              >
                <Zap
                  className={`w-3.5 h-3.5 ${
                    filters.highEngagementOnly
                      ? 'text-slate-950 fill-slate-950'
                      : 'text-amber-400 fill-amber-400'
                  }`}
                />
                <span>High Engagement</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    filters.highEngagementOnly
                      ? 'bg-black/20 text-slate-950'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {highEngagementCount}
                </span>
                {filters.highEngagementOnly && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
              </button>

              {/* 3. Rising Stars Pill */}
              <button
                type="button"
                id="pill-filter-rising-stars"
                onClick={toggleRisingStars}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  filters.risingOnly
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                    : 'bg-[#051126] hover:bg-emerald-500/10 text-slate-300 border-white/10 hover:border-emerald-500/30'
                }`}
              >
                <TrendingUp
                  className={`w-3.5 h-3.5 ${
                    filters.risingOnly ? 'text-slate-950' : 'text-emerald-400'
                  }`}
                />
                <span>Rising Stars</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    filters.risingOnly
                      ? 'bg-black/20 text-slate-950'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {risingStarsCount}
                </span>
                {filters.risingOnly && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
              </button>

              {/* 4. Verified Only Pill */}
              <button
                type="button"
                id="pill-filter-verified-only"
                onClick={toggleVerifiedOnly}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  filters.verifiedOnly
                    ? 'bg-[#759BF6] text-slate-950 border-[#759BF6] shadow-sm shadow-blue-500/20 ring-2 ring-blue-400/30'
                    : 'bg-[#051126] hover:bg-blue-500/10 text-slate-300 border-white/10 hover:border-blue-500/30'
                }`}
              >
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${
                    filters.verifiedOnly ? 'text-slate-950' : 'text-[#759BF6]'
                  }`}
                />
                <span>Verified Only</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    filters.verifiedOnly
                      ? 'bg-black/20 text-slate-950'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {verifiedCount}
                </span>
                {filters.verifiedOnly && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
              </button>
            </div>

            {/* Clear Quick Pills Button */}
            {isAnyQuickFilterActive && (
              <button
                type="button"
                id="btn-clear-quick-pills"
                onClick={clearQuickPills}
                className="text-[11px] font-bold text-[#D4A338] hover:text-[#f3c156] flex items-center gap-1 cursor-pointer transition shrink-0 self-start sm:self-center"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset criteria</span>
              </button>
            )}
          </div>

          {/* Saved Folders Sub-bar (if in saved tab) */}
          {activeTab === 'saved' && (
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedFolderId('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    selectedFolderId === 'all' ? 'bg-[#D4A338] text-slate-950 font-bold' : 'bg-[#051126] text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  All Saved ({savedCreatorIds.length})
                </button>
                {savedFolders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      selectedFolderId === f.id ? 'bg-[#D4A338] text-slate-950 font-bold' : 'bg-[#051126] text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>{f.name} ({f.creatorIds.length})</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNewFolderModal(true)}
                className="text-xs font-bold text-[#D4A338] hover:text-[#f3c156] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Folder
              </button>
            </div>
          )}
        </div>

        {matchingBrands.length > 0 && (
          <section className="mb-8 rounded-3xl border border-white/10 bg-[#081838] p-4 sm:p-6 shadow-xl">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Matching Brands</h2>
                <p className="text-xs text-slate-300">{filters.searchQuery.trim() ? `Brand name, industry, and city matches for “${filters.searchQuery}”.` : `Approved brands in ${filters.city}.`}</p>
              </div>
              <span className="text-xs text-[#D4A338] font-bold">{brandTotal} found</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {matchingBrands.map((brand) => (
                <button key={brand.id} type="button" onClick={() => navigateTo('brand-detail', { id: brand.id, brandName: brand.brandName, companyName: brand.brandName, logoUrl: brand.logoUrl, description: brand.description, industry: brand.industry, city: brand.city, website: brand.website })} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#051126] p-3 text-left transition hover:border-[#D4A338] hover:shadow-md cursor-pointer">
                  <img src={brand.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brandName || 'Brand')}`} alt="" loading="lazy" className="h-12 w-12 rounded-xl border border-white/10 object-contain p-1 bg-white/5" />
                  <span className="min-w-0"><span className="block truncate text-sm font-bold text-white">{brand.brandName}</span><span className="block truncate text-xs text-slate-400">{brand.industry || 'Brand'} · {brand.city || 'India'}</span></span>
                </button>
              ))}
            </div>
            {brandTotal > 8 && <div className="mt-4 flex items-center justify-center gap-3 text-xs"><button type="button" disabled={brandPage === 0} onClick={() => setBrandPage((p) => Math.max(0, p - 1))} className="rounded-lg border border-white/15 bg-[#051126] px-3 py-1.5 disabled:opacity-40 text-white cursor-pointer">Previous</button><span className="text-slate-400">Page {brandPage + 1} of {Math.ceil(brandTotal / 8)}</span><button type="button" disabled={(brandPage + 1) * 8 >= brandTotal} onClick={() => setBrandPage((p) => p + 1)} className="rounded-lg border border-white/15 bg-[#051126] px-3 py-1.5 disabled:opacity-40 text-white cursor-pointer">Next</button></div>}
          </section>
        )}

        {/* Main 2-Column Marketplace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Faceted Filters Sidebar */}
          <div
            className={`lg:block ${
              mobileFilterOpen
                ? 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex justify-end'
                : 'hidden'
            }`}
          >
            <div
              className={`bg-[#081838] rounded-3xl border border-white/10 p-5 space-y-6 text-xs max-h-[88vh] overflow-y-auto ${
                mobileFilterOpen ? 'w-full max-w-xs shadow-2xl animate-fadeIn' : 'w-full shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#D4A338]" />
                  <span>Marketplace Filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-[#D4A338] hover:text-[#f3c156] flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                  {mobileFilterOpen && (
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 1. Category Filter */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">Niche / Vertical</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-white/15 rounded-xl bg-[#051126] text-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all" className="bg-[#051126] text-white">All Categories</option>
                  {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map((c, idx) => (
                    <option key={idx} value={c.name} className="bg-[#051126] text-white">{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. City Filter */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">City / Geography</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-white/15 rounded-xl bg-[#051126] text-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all" className="bg-[#051126] text-white">All Indian Cities</option>
                  {(cities && cities.length > 0 ? cities : CITIES_LIST).map((c, idx) => (
                    <option key={idx} value={c.name} className="bg-[#051126] text-white">{c.name} ({c.state})</option>
                  ))}
                </select>
              </div>

              {/* 3. Follower Tiers */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">Follower Tier</label>
                <select
                  value={filters.followerRange}
                  onChange={(e) => setFilters({ ...filters, followerRange: e.target.value })}
                  className="w-full px-3 py-2.5 border border-white/15 rounded-xl bg-[#051126] text-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all" className="bg-[#051126] text-white">Any Audience Size</option>
                  <option value="1k-10k" className="bg-[#051126] text-white">🌱 Rising / Nano (1K – 10K)</option>
                  <option value="10k-50k" className="bg-[#051126] text-white">⚡ Micro (10K – 50K)</option>
                  <option value="50k-100k" className="bg-[#051126] text-white">🔥 Mid-Tier (50K – 100K)</option>
                  <option value="100k-500k" className="bg-[#051126] text-white">⭐ Macro (100K – 500K)</option>
                  <option value="500k-1m" className="bg-[#051126] text-white">👑 Mega (500K – 1M)</option>
                  <option value="1m+" className="bg-[#051126] text-white">💎 Celebrity (1M+)</option>
                </select>
              </div>

              {/* 4. Commercial Price Range */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">Commercial Budget Tier</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-3 py-2.5 border border-white/15 rounded-xl bg-[#051126] text-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all" className="bg-[#051126] text-white">All Rates</option>
                  <option value="barter" className="bg-[#051126] text-white">Barter / Gifting Only</option>
                  <option value="under-5k" className="bg-[#051126] text-white">Under ₹5,000</option>
                  <option value="5k-10k" className="bg-[#051126] text-white">₹5,000 – ₹10,000</option>
                  <option value="10k-25k" className="bg-[#051126] text-white">₹10,000 – ₹25,000</option>
                  <option value="25k-50k" className="bg-[#051126] text-white">₹25,000 – ₹50,000</option>
                  <option value="50k+" className="bg-[#051126] text-white">₹50,000+</option>
                </select>
              </div>

              {/* 5. Engagement Rate */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">Min. Engagement Rate</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 3, 5, 8].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFilters({ ...filters, minEngagement: rate })}
                      className={`py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        filters.minEngagement === rate
                          ? 'bg-[#D4A338] text-slate-950 font-bold'
                          : 'bg-[#051126] text-slate-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {rate === 0 ? 'Any' : `${rate}%+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Collaboration Format */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">Deliverable Format</label>
                <select
                  value={filters.collaborationType}
                  onChange={(e) => setFilters({ ...filters, collaborationType: e.target.value })}
                  className="w-full px-3 py-2.5 border border-white/15 rounded-xl bg-[#051126] text-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all" className="bg-[#051126] text-white">All Formats</option>
                  <option value="Paid" className="bg-[#051126] text-white">Paid Commercials</option>
                  <option value="Barter" className="bg-[#051126] text-white">Barter / Product Exchange</option>
                  <option value="UGC" className="bg-[#051126] text-white">User Generated Content (UGC)</option>
                  <option value="Event" className="bg-[#051126] text-white">Event Attendance & Store Visit</option>
                  <option value="Product Review" className="bg-[#051126] text-white">Product Review & Unboxing</option>
                  <option value="Brand Ambassador" className="bg-[#051126] text-white">Brand Ambassador</option>
                </select>
              </div>

              {/* 7. Quick Criteria Toggles */}
              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <label className="font-bold text-slate-200 block">Quick Toggles</label>
                
                {/* Verified Only */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-[#D4A338] focus:ring-[#D4A338] bg-[#051126] border-white/20"
                  />
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4A338]" />
                    <span>Verified Only</span>
                  </span>
                </label>

                {/* High Engagement */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.highEngagementOnly}
                    onChange={(e) => setFilters({ ...filters, highEngagementOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-[#051126] border-white/20"
                  />
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>High Engagement (4.5%+)</span>
                  </span>
                </label>

                {/* Rising Stars */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.risingOnly}
                    onChange={(e) => setFilters({ ...filters, risingOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-[#051126] border-white/20"
                  />
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Rising Stars</span>
                  </span>
                </label>
              </div>

              {mobileFilterOpen && (
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-[#D4A338] hover:bg-[#c4922b] text-slate-950 font-bold rounded-xl mt-4 cursor-pointer"
                >
                  Apply Filters ({displayedCreators.length} Results)
                </button>
              )}
            </div>
          </div>

          {/* Right Results Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Toolbar (Sort & Count) */}
            <div className="bg-[#081838] p-4 rounded-2xl border border-white/10 shadow-lg space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    Showing <strong className="text-[#D4A338]">{totalCreators === 0 ? 0 : page * CREATOR_PAGE_SIZE + 1}–{Math.min((page + 1) * CREATOR_PAGE_SIZE, totalCreators)}</strong> of <strong className="text-white">{totalCreators}</strong> Influencers
                  </span>
                  {(filters.category !== 'all' || filters.city !== 'all' || filters.priceRange !== 'all' || isAnyQuickFilterActive) && (
                    <span className="text-[11px] text-[#D4A338] font-bold bg-[#D4A338]/15 px-2 py-0.5 rounded-md border border-[#D4A338]/30">
                      Filtered
                    </span>
                  )}
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Sort by:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="px-3 py-1.5 bg-[#051126] border border-white/15 rounded-xl font-bold text-white focus:outline-hidden focus:border-[#D4A338] cursor-pointer"
                  >
                    <option value="recommended" className="bg-[#051126] text-white">Recommended</option>
                    <option value="followers" className="bg-[#051126] text-white">Most Followers</option>
                    <option value="rating" className="bg-[#051126] text-white">Highest Rated</option>
                    <option value="engagement" className="bg-[#051126] text-white">Highest Engagement Rate (%)</option>
                    <option value="lowest_price" className="bg-[#051126] text-white">Lowest Starting Price (₹)</option>
                    <option value="collaborations" className="bg-[#051126] text-white">Most Brand Collaborations</option>
                    <option value="rising" className="bg-[#051126] text-white">Rising Creators</option>
                    <option value="recently_joined" className="bg-[#051126] text-white">Recently Joined</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips Strip */}
              {(isAnyQuickFilterActive || filters.category !== 'all' || filters.city !== 'all' || filters.followerRange !== 'all' || filters.priceRange !== 'all') && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-white/10">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active criteria:</span>

                  {filters.highEngagementOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold">
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>High Engagement (4.5%+)</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, highEngagementOnly: false }))}
                        className="hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.risingOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>Rising Stars</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, risingOnly: false }))}
                        className="hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.verifiedOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-[#759BF6]" />
                      <span>Verified Only</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, verifiedOnly: false }))}
                        className="hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 text-slate-200 border border-white/10 rounded-lg text-[11px] font-bold">
                      <span>Category: {filters.category}</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
                        className="hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.city !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 text-slate-200 border border-white/10 rounded-lg text-[11px] font-bold">
                      <span>City: {filters.city}</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, city: 'all' }))}
                        className="hover:text-white p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-[#D4A338] hover:text-[#f3c156] ml-1 cursor-pointer"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>

            {/* Creators Grid */}
            {pageLoading ? (
              <div className="p-12 text-center bg-[#081838] rounded-3xl border border-white/10 text-sm text-slate-400">Loading influencers…</div>
            ) : displayedCreators.length === 0 ? (
              <div className="p-12 text-center bg-[#081838] rounded-3xl border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">No creators found matching these filters</h3>
                  <p className="text-xs text-slate-400">
                    Try broadening your city or category selection to discover more talent.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#D4A338] hover:bg-[#c4922b] text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {displayedCreators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            )}
            {activeTab === 'all' && totalCreators > CREATOR_PAGE_SIZE && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || pageLoading} className="px-4 py-2 rounded-xl border border-white/15 bg-[#081838] text-xs font-bold disabled:opacity-40 text-white cursor-pointer hover:bg-white/10">Previous</button>
                <span className="text-xs font-medium text-slate-400">Page {page + 1} of {Math.ceil(totalCreators / CREATOR_PAGE_SIZE)}</span>
                <button type="button" onClick={() => setPage((current) => current + 1)} disabled={(page + 1) * CREATOR_PAGE_SIZE >= totalCreators || pageLoading} className="px-4 py-2 rounded-xl border border-white/15 bg-[#081838] text-xs font-bold disabled:opacity-40 text-white cursor-pointer hover:bg-white/10">Next</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowNewFolderModal(false)}
        >
          <div
            className="bg-[#081838] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/15 space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-white text-base">Create New Shortlist Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <input
                type="text"
                required
                placeholder="e.g. Bangalore Tech Influencers Q2"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#051126] border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#D4A338]"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4A338] hover:bg-[#c4922b] text-slate-950 font-bold rounded-xl cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
