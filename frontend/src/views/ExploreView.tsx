import React, { useState } from 'react';
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

export const ExploreView: React.FC = () => {
  const {
    creators,
    filters,
    setFilters,
    resetFilters,
    filteredCreators,
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

  // Compute total counts for quick criteria pills
  const totalTalentCount = creators.filter((c) => c.status !== 'suspended').length;
  const highEngagementCount = creators.filter(
    (c) => c.engagementRate >= 4.5 && c.status !== 'suspended'
  ).length;
  const risingStarsCount = creators.filter(
    (c) => (c.isRising || c.followers < 25000) && c.status !== 'suspended'
  ).length;
  const verifiedCount = creators.filter(
    (c) => c.isVerified && c.status !== 'suspended'
  ).length;

  const isAnyQuickFilterActive =
    filters.highEngagementOnly || filters.risingOnly || filters.verifiedOnly;

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
  let displayedCreators = filteredCreators;
  if (activeTab === 'saved') {
    if (selectedFolderId === 'all') {
      displayedCreators = filteredCreators.filter((c) => savedCreatorIds.includes(c.id));
    } else {
      const folder = savedFolders.find((f) => f.id === selectedFolderId);
      displayedCreators = filteredCreators.filter((c) => folder?.creatorIds.includes(c.id));
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
    <div className="min-h-screen bg-slate-50/60 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header & Search Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Influencer Discovery Marketplace
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore 50,000+ verified creators across 500+ Indian cities with authenticated Trust Scores.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Directory
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${
                    activeTab === 'saved' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Saved Folders ({savedCreatorIds.length})</span>
                </button>
              </div>

              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 bg-white"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Search & Natural Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Influencers..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#D4A338] transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Simplified Pill-Based Quick Filters Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span>All Talent</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    !isAnyQuickFilterActive
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-200 text-slate-600'
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
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : 'bg-white hover:bg-amber-50/60 text-slate-700 border-slate-200 hover:border-amber-300'
                }`}
              >
                <Zap
                  className={`w-3.5 h-3.5 ${
                    filters.highEngagementOnly
                      ? 'text-white fill-white'
                      : 'text-amber-500 fill-amber-500'
                  }`}
                />
                <span>High Engagement</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    filters.highEngagementOnly
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {highEngagementCount}
                </span>
                {filters.highEngagementOnly && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>

              {/* 3. Rising Stars Pill */}
              <button
                type="button"
                id="pill-filter-rising-stars"
                onClick={toggleRisingStars}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  filters.risingOnly
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-600/20 ring-2 ring-emerald-400/30'
                    : 'bg-white hover:bg-emerald-50/60 text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <TrendingUp
                  className={`w-3.5 h-3.5 ${
                    filters.risingOnly ? 'text-white' : 'text-emerald-600'
                  }`}
                />
                <span>Rising Stars</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    filters.risingOnly
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {risingStarsCount}
                </span>
                {filters.risingOnly && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>

              {/* 4. Verified Only Pill */}
              <button
                type="button"
                id="pill-filter-verified-only"
                onClick={toggleVerifiedOnly}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  filters.verifiedOnly
                    ? 'bg-black text-white border-blue-700 shadow-sm shadow-blue-600/20 ring-2 ring-blue-400/30'
                    : 'bg-white hover:bg-blue-50/60 text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${
                    filters.verifiedOnly ? 'text-white' : 'text-[#D4A338]'
                  }`}
                />
                <span>Verified Only</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    filters.verifiedOnly
                      ? 'bg-zinc-900 text-white'
                      : 'bg-blue-50 text-[#b88628] border border-blue-200'
                  }`}
                >
                  {verifiedCount}
                </span>
                {filters.verifiedOnly && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
            </div>

            {/* Clear Quick Pills Button */}
            {isAnyQuickFilterActive && (
              <button
                type="button"
                id="btn-clear-quick-pills"
                onClick={clearQuickPills}
                className="text-[11px] font-bold text-[#D4A338] hover:text-[#93651f] flex items-center gap-1 cursor-pointer transition shrink-0 self-start sm:self-center"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset criteria</span>
              </button>
            )}
          </div>

          {/* Saved Folders Sub-bar (if in saved tab) */}
          {activeTab === 'saved' && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedFolderId('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    selectedFolderId === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Saved ({savedCreatorIds.length})
                </button>
                {savedFolders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderId(f.id)}
                    className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                      selectedFolderId === f.id ? 'bg-black text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>{f.name} ({f.creatorIds.length})</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNewFolderModal(true)}
                className="text-xs font-bold text-[#D4A338] hover:text-[#93651f] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Folder
              </button>
            </div>
          )}
        </div>

        {/* Main 2-Column Marketplace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Faceted Filters Sidebar */}
          <div
            className={`lg:block ${
              mobileFilterOpen
                ? 'fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs p-4 flex justify-end'
                : 'hidden'
            }`}
          >
            <div
              className={`bg-white rounded-3xl border border-slate-200/80 p-5 space-y-6 text-xs max-h-[88vh] overflow-y-auto ${
                mobileFilterOpen ? 'w-full max-w-xs shadow-2xl animate-fadeIn' : 'w-full'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#D4A338]" />
                  <span>Marketplace Filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-[#D4A338] hover:text-[#93651f] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                  {mobileFilterOpen && (
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 1. Category Filter */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">Niche / Vertical</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all">All Categories</option>
                  {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map((c, idx) => (
                    <option key={idx} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. City Filter */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">City / Geography</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all">All Indian Cities</option>
                  {(cities && cities.length > 0 ? cities : CITIES_LIST).map((c, idx) => (
                    <option key={idx} value={c.name}>{c.name} ({c.state})</option>
                  ))}
                </select>
              </div>

              {/* 3. Follower Tiers */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">Follower Tier</label>
                <select
                  value={filters.followerRange}
                  onChange={(e) => setFilters({ ...filters, followerRange: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all">Any Audience Size</option>
                  <option value="1k-10k">🌱 Rising / Nano (1K – 10K)</option>
                  <option value="10k-50k">⚡ Micro (10K – 50K)</option>
                  <option value="50k-100k">🔥 Mid-Tier (50K – 100K)</option>
                  <option value="100k-500k">⭐ Macro (100K – 500K)</option>
                  <option value="500k-1m">👑 Mega (500K – 1M)</option>
                  <option value="1m+">💎 Celebrity (1M+)</option>
                </select>
              </div>

              {/* 4. Commercial Price Range */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">Commercial Budget Tier</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all">All Rates</option>
                  <option value="barter">Barter / Gifting Only</option>
                  <option value="under-5k">Under ₹5,000</option>
                  <option value="5k-10k">₹5,000 – ₹10,000</option>
                  <option value="10k-25k">₹10,000 – ₹25,000</option>
                  <option value="25k-50k">₹25,000 – ₹50,000</option>
                  <option value="50k+">₹50,000+</option>
                </select>
              </div>

              {/* 5. Engagement Rate */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">Min. Engagement Rate</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 3, 5, 8].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFilters({ ...filters, minEngagement: rate })}
                      className={`py-1.5 rounded-lg font-bold text-xs transition ${
                        filters.minEngagement === rate
                          ? 'bg-black text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {rate === 0 ? 'Any' : `${rate}%+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Collaboration Format */}
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">Deliverable Format</label>
                <select
                  value={filters.collaborationType}
                  onChange={(e) => setFilters({ ...filters, collaborationType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#D4A338] font-semibold"
                >
                  <option value="all">All Formats</option>
                  <option value="Paid">Paid Commercials</option>
                  <option value="Barter">Barter / Product Exchange</option>
                  <option value="UGC">User Generated Content (UGC)</option>
                  <option value="Event">Event Attendance & Store Visit</option>
                  <option value="Product Review">Product Review & Unboxing</option>
                  <option value="Brand Ambassador">Brand Ambassador</option>
                </select>
              </div>

              {/* 7. Quick Criteria Toggles */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="font-bold text-slate-900 block">Quick Toggles</label>
                
                {/* Verified Only */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-[#D4A338] focus:ring-[#D4A338]"
                  />
                  <span className="font-bold text-slate-800 flex items-center gap-1">
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
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>High Engagement (4.5%+)</span>
                  </span>
                </label>

                {/* Rising Stars */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.risingOnly}
                    onChange={(e) => setFilters({ ...filters, risingOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rising Stars</span>
                  </span>
                </label>
              </div>

              {mobileFilterOpen && (
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-black text-white font-bold rounded-xl mt-4 cursor-pointer"
                >
                  Apply Filters ({displayedCreators.length} Results)
                </button>
              )}
            </div>
          </div>

          {/* Right Results Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Toolbar (Sort & Count) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Showing <strong>{displayedCreators.length}</strong> Influencer{displayedCreators.length === 1 ? '' : 's'}
                  </span>
                  {(filters.category !== 'all' || filters.city !== 'all' || filters.priceRange !== 'all' || isAnyQuickFilterActive) && (
                    <span className="text-[11px] text-[#D4A338] font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                      Filtered
                    </span>
                  )}
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Sort by:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:border-[#D4A338] cursor-pointer"
                  >
                    <option value="recommended">Recommended (Trust & Reach)</option>
                    <option value="trust_score">Highest thebrandsstory. Trust Score</option>
                    <option value="followers">Most Followers</option>
                    <option value="engagement">Highest Engagement Rate (%)</option>
                    <option value="lowest_price">Lowest Starting Price (₹)</option>
                    <option value="collaborations">Most Brand Collaborations</option>
                    <option value="rising">Rising Creators</option>
                    <option value="recently_joined">Recently Joined</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips Strip */}
              {(isAnyQuickFilterActive || filters.category !== 'all' || filters.city !== 'all' || filters.followerRange !== 'all' || filters.priceRange !== 'all') && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active criteria:</span>

                  {filters.highEngagementOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold">
                      <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                      <span>High Engagement (4.5%+)</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, highEngagementOnly: false }))}
                        className="hover:text-amber-950 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.risingOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      <span>Rising Stars</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, risingOnly: false }))}
                        className="hover:text-emerald-950 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.verifiedOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#93651f] border border-blue-200 rounded-lg text-[11px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-[#D4A338]" />
                      <span>Verified Only</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, verifiedOnly: false }))}
                        className="hover:text-black p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold">
                      <span>Category: {filters.category}</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
                        className="hover:text-slate-950 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.city !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold">
                      <span>City: {filters.city}</span>
                      <button
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, city: 'all' }))}
                        className="hover:text-slate-950 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-[#D4A338] hover:text-[#93651f] ml-1 cursor-pointer"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>

            {/* Creators Grid */}
            {displayedCreators.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">No creators found matching these filters</h3>
                  <p className="text-xs text-slate-500">
                    Try broadening your city or category selection to discover more talent.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
                {displayedCreators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowNewFolderModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900 text-base">Create New Shortlist Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <input
                type="text"
                required
                placeholder="e.g. Bangalore Tech Influencers Q2"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#D4A338]"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-3 py-1.5 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white font-bold rounded-xl"
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

