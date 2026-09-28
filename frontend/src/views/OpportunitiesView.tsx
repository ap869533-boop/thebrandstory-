import React, { useEffect, useState } from 'react';
import { Flame, MapPin, IndianRupee, Clock, ArrowRight, Users, Gift, Calendar, CheckCircle2, PlusCircle, Sparkles, Send, Filter, Search, Tag } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CampaignRequirement } from '../types';
import { CATEGORIES_LIST, CITIES_LIST } from '../data/initialData';
import { apiUrl } from '../config/api';
import { SubPageHeader } from '../components/common/SubPageHeader';

export const OpportunitiesView: React.FC = () => {
  const { applyToCampaign, activeCreatorId, authUser, navigateTo, categories, cities, requireRole } = usePlatform();
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRequirement | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [hasApplied, setHasApplied] = useState<string | null>(null);
  const [campaignPage, setCampaignPage] = useState(0);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignRequirement[]>([]);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignLoading, setCampaignLoading] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ limit: '12', offset: String(campaignPage * 12) });
    if (searchFilter.trim()) params.set('searchQuery', searchFilter.trim());
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (cityFilter !== 'all') params.set('city', cityFilter);
    setCampaignLoading(true);
    const timer = window.setTimeout(() => fetch(apiUrl(`/api/campaigns?${params}`))
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) {
          setFilteredCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
          setCampaignTotal(Number(data.total) || 0);
        }
      })
      .catch(() => { if (!cancelled) { setFilteredCampaigns([]); setCampaignTotal(0); } })
      .finally(() => { if (!cancelled) setCampaignLoading(false); }), 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [campaignPage, searchFilter, categoryFilter, cityFilter]);

  useEffect(() => setCampaignPage(0), [searchFilter, categoryFilter, cityFilter]);

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
    <div className="min-h-screen bg-[#051126] text-white">
      {/* SubPage Header */}
      <SubPageHeader title="Opportunities" subtitle="Brand Deals & Live Briefs" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Banner */}
        <div className="bg-[#081838] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-[#D4A338] text-xs font-bold uppercase mb-1">
                <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Live Deals & Collaboration Requirements</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Brand Briefs & Creator Opportunities
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Explore active requirements posted by brands, agencies, and restaurants. Pitch directly and get hired with 0% commission.
              </p>
            </div>

            <button
              onClick={() => {
                if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
                navigateTo('post-requirement');
              }}
              className="px-4 py-2.5 bg-[#D4A338] hover:bg-[#c4922b] text-slate-950 font-bold text-[13px] rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
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
                className="w-full pl-9 pr-3 py-2.5 bg-[#051126] border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:border-[#D4A338]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-[#051126] border border-white/15 rounded-xl text-white focus:outline-hidden focus:border-[#D4A338]"
            >
              <option value="all" className="bg-[#051126] text-white">All Categories</option>
              {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map((c, idx) => (
                <option key={idx} value={c.name} className="bg-[#051126] text-white">{c.name}</option>
              ))}
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2.5 bg-[#051126] border border-white/15 rounded-xl text-white focus:outline-hidden focus:border-[#D4A338]"
            >
              <option value="all" className="bg-[#051126] text-white">All Geographies</option>
              <option value="Pan India" className="bg-[#051126] text-white">Pan India</option>
              {(cities && cities.length > 0 ? cities : CITIES_LIST).map((c, idx) => (
                <option key={idx} value={c.name} className="bg-[#051126] text-white">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-300">
            Showing <strong className="text-[#D4A338]">{campaignTotal === 0 ? 0 : campaignPage * 12 + 1}–{Math.min((campaignPage + 1) * 12, campaignTotal)}</strong> of <strong className="text-white">{campaignTotal}</strong> Active Brand Briefs
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaignLoading ? (
              <div className="col-span-full bg-[#081838] rounded-3xl p-12 text-center text-sm text-slate-400 border border-white/10">Loading campaign briefs…</div>
            ) : filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-[#081838] rounded-[24px] border border-white/10 shadow-xl hover:shadow-[0_20px_40px_rgba(212,163,56,0.15)] hover:border-[#D4A338]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group relative overflow-hidden h-full"
              >
                {/* Thick Yellow Top Border */}
                <div className="absolute top-0 inset-x-0 h-2.5 bg-[#D4A338] z-0"></div>
                
                <div className="p-5 sm:p-6 pt-7 space-y-4 relative z-10 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                        <img
                          src={(camp as any).logoUrl ? apiUrl((camp as any).logoUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(camp.companyName || 'Brand')}&background=051126&color=D4A338&bold=true`}
                          alt={camp.companyName}
                          className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-xs truncate">{camp.companyName}</h4>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{camp.city || 'Pan India'}</span>
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex relative z-10 items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ACTIVE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#D4A338] text-base sm:text-lg leading-snug line-clamp-2">
                      {camp.campaignTitle}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#D4A338]/15 text-[#D4A338] border border-[#D4A338]/30">
                      <Tag className="w-2.5 h-2.5 text-[#D4A338]" />
                      {camp.category}
                    </span>
                    
                    {camp.isBarter ? (
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        Barter
                      </span>
                    ) : camp.followerRange && camp.followerRange !== 'Any Tier' && camp.followerRange !== 'Any' ? (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                        Followers: {camp.followerRange}
                      </span>
                    ) : null}

                    {camp.language && camp.language !== 'Any' && camp.language !== 'Any Language' && (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                        Lang: {camp.language}
                      </span>
                    )}

                    {camp.genderPreference && camp.genderPreference !== 'Any' && camp.genderPreference !== 'Any / Both' && camp.genderPreference !== 'Custom Mix' && (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
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
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                      {camp.deliverablesNeeded || camp.requirements || camp.campaignDescription}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 mt-auto relative z-10 w-full flex flex-col justify-end">
                  {(camp.maleCount > 0 || camp.femaleCount > 0) && (
                    <div className="flex items-center gap-3 mb-3 bg-[#051126] px-4 py-2.5 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required:</span>
                      {camp.maleCount > 0 && (
                        <span className="text-xs font-bold text-[#D4A338]">
                          {camp.maleCount} Male
                        </span>
                      )}
                      {camp.femaleCount > 0 && (
                        <span className="text-xs font-bold text-rose-400">
                          {camp.femaleCount} Female
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="p-3.5 mb-4 bg-[#051126] rounded-2xl border border-white/10 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest mb-0.5">Total Budget</span>
                      <span className="font-black text-emerald-400 text-sm block leading-snug">{camp.budget}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest mb-0.5">Valid Till</span>
                      <span className={`font-bold text-xs block leading-snug ${camp.validUntil ? 'text-rose-400' : 'text-slate-400'}`}>
                        {camp.validUntil ? new Date(camp.validUntil).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Until Filled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      <strong className="text-white font-bold">
                        {Array.isArray(camp.applicants) ? camp.applicants.length : camp.applicantsCount || 0}
                      </strong>{' '}
                      applied
                    </span>

                    {isAlreadyPitched(camp) ? (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 bg-emerald-500/15 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5 cursor-not-allowed opacity-90"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Already Pitched</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(camp)}
                        className="px-4 py-2 bg-[#D4A338] hover:bg-[#c4922b] text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer group/btn"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>Pitch Now <ArrowRight className="w-3 h-3 ml-0.5 inline-block group-hover/btn:translate-x-1 transition-transform" /></span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {campaignTotal > 12 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button type="button" onClick={() => setCampaignPage((p) => Math.max(0, p - 1))} disabled={campaignPage === 0 || campaignLoading} className="px-4 py-2 rounded-xl border border-white/15 bg-[#081838] text-xs font-bold disabled:opacity-40 text-white cursor-pointer hover:bg-white/10">Previous</button>
              <span className="text-xs font-medium text-slate-400">Page {campaignPage + 1} of {Math.ceil(campaignTotal / 12)}</span>
              <button type="button" onClick={() => setCampaignPage((p) => p + 1)} disabled={(campaignPage + 1) * 12 >= campaignTotal || campaignLoading} className="px-4 py-2 rounded-xl border border-white/15 bg-[#081838] text-xs font-bold disabled:opacity-40 text-white cursor-pointer hover:bg-white/10">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Pitch Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#081838] rounded-3xl shadow-2xl border border-white/15 p-6 space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {hasApplied ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-lg text-white">Pitch Dispatched!</h3>
                <p className="text-xs text-slate-300">
                  {selectedCampaign.companyName} has received your proposal and rate card.
                </p>
              </div>
            ) : (
              <form onSubmit={submitApplication} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#D4A338]">Submit Pitch</span>
                  <h3 className="font-bold text-base text-white">{selectedCampaign.campaignTitle}</h3>
                  <p className="text-xs text-slate-400">Budget: {selectedCampaign.budget} • {selectedCampaign.city}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Pitch to {selectedCampaign.companyName}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#051126] border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#D4A338]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#D4A338] hover:bg-[#c4922b] text-slate-950 font-bold text-[13px] rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
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
