import React, { useState } from 'react';
import { Flame, MapPin, IndianRupee, Clock, ArrowRight, Users, CheckCircle2, PlusCircle, Sparkles, Send, Filter, Search, Tag } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CampaignRequirement } from '../types';
import { CATEGORIES_LIST, CITIES_LIST } from '../data/initialData';
import { apiUrl } from '../config/api';

export const OpportunitiesView: React.FC = () => {
  const { campaigns, applyToCampaign, activeCreatorId, authUser, navigateTo, categories, cities, requireRole } = usePlatform();
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRequirement | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [hasApplied, setHasApplied] = useState<string | null>(null);

  const isAlreadyPitched = (camp: CampaignRequirement) => {
    if (!camp || !Array.isArray(camp.applicants)) return false;
    const currentCreatorId = activeCreatorId || authUser?.creatorProfile?.id;
    const currentEmail = authUser?.email;
    return camp.applicants.some((a: any) =>
      (currentCreatorId && (a.creatorId === currentCreatorId || a.id === currentCreatorId)) ||
      (currentEmail && (a.email === currentEmail || a.creatorEmail === currentEmail))
    );
  };

  // Local filters
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const filteredCampaigns = campaigns.filter((camp) => {
    if (searchFilter && !camp.campaignTitle.toLowerCase().includes(searchFilter.toLowerCase()) && !camp.companyName.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && camp.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (cityFilter !== 'all' && !camp.city.toLowerCase().includes(cityFilter.toLowerCase()) && camp.city !== 'Pan India') {
      return false;
    }
    return true;
  });

  const handleApply = (campaign: CampaignRequirement) => {
    if (!requireRole('CREATOR', 'pitch for a brand campaign', 'opportunities')) return;
    setSelectedCampaign(campaign);
    setPitchText(`Hi ${campaign.companyName}! I love this campaign concept. My audience is heavily concentrated in ${campaign.city} and aligns directly with your target demographic.`);
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    if (!requireRole('CREATOR', 'submit a pitch proposal', 'opportunities')) return;
    applyToCampaign(selectedCampaign.id, activeCreatorId, pitchText);
    setHasApplied(selectedCampaign.id);
    setTimeout(() => {
      setSelectedCampaign(null);
      setHasApplied(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-amber-500 text-xs font-bold uppercase mb-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Live Deals & Collaboration Requirements</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Brand Briefs & Creator Opportunities
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore active requirements posted by brands, agencies, and restaurants. Pitch directly and get hired.
              </p>
            </div>

            <button
              onClick={() => {
                if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
                navigateTo('post-requirement');
              }}
              className="px-4 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-[13px] rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New Brand Brief</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search campaigns or brand names..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">All Categories</option>
              {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map((c, idx) => (
                <option key={idx} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">All Geographies</option>
              <option value="Pan India">Pan India</option>
              {(cities && cities.length > 0 ? cities : CITIES_LIST).map((c, idx) => (
                <option key={idx} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Campaign List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-900">
            Showing {filteredCampaigns.length} Active Brand Brief{filteredCampaigns.length === 1 ? '' : 's'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(212,163,56,0.15)] hover:border-[#D4A338]/40 hover:-translate-y-2 transition-all duration-500 flex flex-col group relative overflow-hidden h-full"
              >
                {/* Thick Yellow Top Border */}
                <div className="absolute top-0 inset-x-0 h-4 bg-[#D4A338] z-0"></div>
                
                <div className="p-5 sm:p-6 pt-7 space-y-4 relative z-10 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl border border-slate-100 bg-white flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow overflow-hidden">
                        <img
                          src={(camp as any).logoUrl ? apiUrl((camp as any).logoUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(camp.companyName || 'Brand')}&background=fef3c7&color=78350f&bold=true`}
                          alt={camp.companyName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{camp.companyName}</h4>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{camp.city || 'Pan India'}</span>
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex relative z-10 items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-xs shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      ACTIVE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#b88628] text-lg leading-snug line-clamp-2">
                      {camp.campaignTitle}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50/30 text-[#b88628] border border-amber-200">
                      <Tag className="w-2.5 h-2.5 text-[#b88628]" />
                      {camp.category}
                    </span>
                    
                    {camp.isBarter ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
                        Barter
                      </span>
                    ) : camp.followerRange && camp.followerRange !== 'Any Tier' && camp.followerRange !== 'Any' ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Followers: {camp.followerRange}
                      </span>
                    ) : null}

                    {camp.language && camp.language !== 'Any' && camp.language !== 'Any Language' && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50/30 text-[#b88628] border border-amber-200">
                        Lang: {camp.language}
                      </span>
                    )}

                    {camp.genderPreference && camp.genderPreference !== 'Any' && camp.genderPreference !== 'Any / Both' && camp.genderPreference !== 'Custom Mix' && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50/30 text-[#b88628] border border-amber-200">
                        Gender: {camp.genderPreference}
                      </span>
                    )}

                    {camp.createdAt && (
                      <span className="text-[10px] text-slate-400 font-medium ml-auto flex items-center gap-1 mt-1 lg:mt-0">
                        <Clock className="w-2.5 h-2.5" />
                        {camp.createdAt}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 mb-0">
                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
                      {camp.deliverablesNeeded || camp.requirements || camp.campaignDescription}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 mt-auto relative z-10 w-full flex flex-col justify-end">
                  {(camp.maleCount > 0 || camp.femaleCount > 0) && (
                    <div className="flex items-center gap-3 mb-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100/80">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Required:</span>
                      {camp.maleCount > 0 && (
                        <span className="text-[13px] font-bold text-[#b88628]">
                          {camp.maleCount} Male
                        </span>
                      )}
                      {camp.femaleCount > 0 && (
                        <span className="text-[13px] font-bold text-rose-700">
                          {camp.femaleCount} Female
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="p-4 mb-5 bg-slate-50 rounded-3xl border border-slate-100/80 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest mb-1">Total Budget</span>
                      <span className="font-black text-emerald-600 text-[15px] block whitespace-normal leading-snug">{camp.budget}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest mb-1">Valid Till</span>
                      <span className={`font-bold text-[14px] block whitespace-normal leading-snug ${camp.validUntil ? 'text-rose-600' : 'text-slate-600'}`}>
                        {camp.validUntil ? new Date(camp.validUntil).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Until Filled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] text-slate-500 font-medium">
                      <strong className="text-slate-700 font-bold">
                        {Array.isArray(camp.applicants) ? camp.applicants.length : camp.applicantsCount || 0}
                      </strong>{' '}
                      applied
                    </span>

                    {isAlreadyPitched(camp) ? (
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
                        className="px-4 py-2 bg-black hover:bg-[#D4A338] hover:text-black text-white font-bold text-[13px] rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer group/btn"
                      >
                        <Sparkles className="w-4 h-4 text-[#D4A338]" />
                        <span>Pitch Now <ArrowRight className="w-3 h-3 ml-0.5 inline-block group-hover/btn:translate-x-1 transition-transform" /></span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pitch Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {hasApplied ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-lg text-slate-900">Pitch Dispatched!</h3>
                <p className="text-xs text-slate-500">
                  {selectedCampaign.companyName} has received your proposal and rate card.
                </p>
              </div>
            ) : (
              <form onSubmit={submitApplication} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#D4A338]">Submit Pitch</span>
                  <h3 className="font-bold text-base text-slate-900">{selectedCampaign.campaignTitle}</h3>
                  <p className="text-xs text-slate-500">Budget: {selectedCampaign.budget} • {selectedCampaign.city}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Pitch to {selectedCampaign.companyName}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-[13px] rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Pitch
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

