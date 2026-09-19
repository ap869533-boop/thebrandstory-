import React, { useState } from 'react';
import {
  Flame,
  MapPin,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Send,
  Tag,
  Clock,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import type { CampaignRequirement } from '../../types';

export const LiveOpportunitiesBoard: React.FC = () => {
  const { campaigns, applyToCampaign, activeCreatorId, authUser, navigateTo, requireRole } = usePlatform();
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

  const handleApply = (campaign: CampaignRequirement) => {
    if (!requireRole('CREATOR', 'pitch for a brand campaign', 'home')) return;
    setSelectedCampaign(campaign);
    setPitchText(
      `Hi ${campaign.companyName}! I am interested in collaborating on this campaign. My audience is based in ${campaign.city} and strongly matches your target audience.`
    );
  };

  const submitApplication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    if (!requireRole('CREATOR', 'submit a pitch proposal', 'home')) return;
    applyToCampaign(selectedCampaign.id, activeCreatorId, pitchText);
    setHasApplied(selectedCampaign.id);
    setTimeout(() => {
      setSelectedCampaign(null);
      setHasApplied(null);
    }, 1500);
  };

  const getOpeningLabel = (value: string | number | undefined) => {
    const countValue = String(value ?? '');
    if (!countValue) return '0 Creators';
    const normalized = countValue.toLowerCase();
    if (normalized.includes('creator')) return countValue;
    const count = Number(countValue);
    return `${countValue} ${Number.isFinite(count) && count === 1 ? 'Creator' : 'Creators'}`;
  };

  return (
    <section className="py-16 bg-slate-50/70 text-slate-900 border-b border-slate-200/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#D4A338] text-xs font-bold uppercase tracking-wider mb-1.5">
              <Flame className="w-3.5 h-3.5 fill-[#D4A338]" />
              <span>Live Campaign Marketplace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Active Brand Briefs & Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Verified brands post live collaboration requirements with transparent budgets. Apply directly with zero commission.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!requireRole('BRAND', 'post a campaign brief', 'post-requirement')) return;
                navigateTo('post-requirement');
              }}
              className="px-4 py-2.5 bg-[#D4A338] hover:bg-[#b88628] text-black font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>Post Campaign Brief</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('opportunities')}
              className="text-xs font-bold text-slate-600 hover:text-[#D4A338] flex items-center gap-1 group cursor-pointer transition"
            >
              <span>View All Briefs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.slice(0, 6).map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-[#D4A338]/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/90 border border-amber-200/80 text-amber-900 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {camp.companyName.trim().slice(0, 2).toUpperCase() || 'BR'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{camp.companyName}</h4>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{camp.city || 'Pan India'}</span>
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-[#b88628] transition line-clamp-2">
                    {camp.campaignTitle}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-[#8e6819] border border-amber-200/60">
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
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60">
                      Lang: {camp.language}
                    </span>
                  )}

                  {camp.genderPreference && camp.genderPreference !== 'Any' && camp.genderPreference !== 'Any / Both' && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-pink-50 text-pink-600 border border-pink-200/60">
                      Gender: {camp.genderPreference === 'Custom Mix' ? `${camp.maleCount}M, ${camp.femaleCount}F` : camp.genderPreference}
                    </span>
                  )}

                  {camp.createdAt && (
                    <span className="text-[10px] text-slate-400 font-medium ml-auto flex items-center gap-1 mt-1 lg:mt-0">
                      <Clock className="w-2.5 h-2.5" />
                      {camp.createdAt}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {camp.deliverablesNeeded || camp.requirements || camp.campaignDescription || 'Open for creator pitches with custom deliverables.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Budget</span>
                    <span className="font-black text-emerald-600 text-xs truncate block mt-0.5">{camp.budget}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">Openings</span>
                    <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">{getOpeningLabel(camp.influencersCount)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    <strong className="text-slate-800 font-bold">
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
                      className="px-4 py-2 bg-black hover:bg-[#D4A338] hover:text-black text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer group/btn"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover/btn:text-black transition-colors" />
                      <span>Pitch Now</span>
                      <ArrowRight className="w-3 h-3 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedCampaign(null)}
        >
          <div
            className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {hasApplied ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-lg text-slate-900">Pitch Submitted!</h3>
                <p className="text-xs text-slate-500">{selectedCampaign.companyName} has received your pitch proposal.</p>
              </div>
            ) : (
              <form onSubmit={submitApplication} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b88628]">Direct Collaboration Pitch</span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">{selectedCampaign.campaignTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Budget: {selectedCampaign.budget} • {selectedCampaign.city}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Pitch to {selectedCampaign.companyName}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#D4A338] transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#D4A338] hover:bg-[#b88628] text-black font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-black" />
                    <span>Submit Pitch</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
