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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import type { CampaignRequirement } from '../../types';
import { apiUrl } from '../../config/api';

export const LiveOpportunitiesBoard: React.FC = () => {
  const { campaigns, applyToCampaign, activeCreatorId, authUser, navigateTo, requireRole } = usePlatform();
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRequirement | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [hasApplied, setHasApplied] = useState<string | null>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

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

  return (
    <section className="py-16 bg-slate-50/70 text-slate-900 border-b border-slate-200/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Live campaign
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Verified brands post live collaboration requirements with transparent budgets. Apply directly with zero commission.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 mr-4">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:border-black hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:border-black hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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

        {/* Slider Container */}
        <div ref={sliderRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          {campaigns
            .filter((camp) => !camp.validUntil || new Date(camp.validUntil) >= new Date(new Date().setHours(0, 0, 0, 0)))
            .slice(0, 10)
            .map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(212,163,56,0.15)] hover:border-[#D4A338]/40 hover:-translate-y-2 transition-all duration-500 flex flex-col group relative overflow-hidden w-[85vw] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(33.333%-1rem)] snap-center shrink-0"
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
                      <span>Pitch Now</span>
                      <ArrowRight className="w-4 h-4 ml-0.5 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
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
