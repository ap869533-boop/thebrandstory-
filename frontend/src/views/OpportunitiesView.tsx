import React, { useState } from 'react';
import { Flame, MapPin, IndianRupee, Clock, ArrowRight, Users, CheckCircle2, PlusCircle, Sparkles, Send, Filter, Search } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CampaignRequirement } from '../types';
import { CATEGORIES_LIST, CITIES_LIST } from '../data/initialData';

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
              className="px-4 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
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
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#b88628]">
                      {camp.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {camp.createdAt}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {camp.campaignTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    By {camp.companyName} • {camp.industry}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {camp.deliverablesNeeded}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{camp.city}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-emerald-600">
                      <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                      <span>{camp.budget}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Followers: <strong>{camp.followerRange}</strong></span>
                    <span className="text-[#D4A338] font-semibold">
                      {Array.isArray(camp.applicants) ? camp.applicants.length : (camp.applicantsCount || 0)} Pitches
                    </span>
                  </div>

                  {isAlreadyPitched(camp) ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 cursor-not-allowed opacity-90"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Already Pitched</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(camp)}
                      className="w-full py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pitch My Profile</span>
                    </button>
                  )}
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
                    className="px-5 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
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

