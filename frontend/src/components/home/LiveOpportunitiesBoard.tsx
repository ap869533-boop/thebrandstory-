import React, { useState } from 'react';
import {
  Flame,
  MapPin,
  ArrowRight,
  Users, Gift, Calendar, CheckCircle2,
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
  const { campaigns, campaignsTotal, applyToCampaign, activeCreatorId, authUser, navigateTo, requireRole } = usePlatform();
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRequirement | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [hasApplied, setHasApplied] = useState<string | null>(null);
  const [applyError, setApplyError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignPage, setCampaignPage] = useState(0);
  const [pageCampaigns, setPageCampaigns] = useState<CampaignRequirement[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (campaignPage === 0) { setPageCampaigns(campaigns); return; }
    let cancelled = false;
    setPageLoading(true);
    const params = new URLSearchParams({ limit: '10', offset: String(campaignPage * 10) });
    fetch(apiUrl(`/api/campaigns?${params}`))
      .then((response) => response.json())
      .then((data) => { if (!cancelled) setPageCampaigns(data.campaigns || []); })
      .catch(() => { if (!cancelled) setPageCampaigns([]); })
      .finally(() => { if (!cancelled) setPageLoading(false); });
    return () => { cancelled = true; };
  }, [campaignPage, campaigns]);

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
    setApplyError('');
    setSelectedCampaign(campaign);
    setPitchText(
      `Hi ${campaign.companyName}! I am interested in collaborating on this campaign. My audience is based in ${campaign.city} and strongly matches your target audience.`
    );
  };

  const submitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    if (!requireRole('CREATOR', 'submit a pitch proposal', 'home')) return;
    setIsSubmitting(true);
    setApplyError('');
    try {
      await applyToCampaign(selectedCampaign.id, activeCreatorId, pitchText);
      setHasApplied(selectedCampaign.id);
      setTimeout(() => {
        setSelectedCampaign(null);
        setHasApplied(null);
      }, 1500);
    } catch (error) {
      setApplyError(error instanceof Error ? error.message : 'Failed to submit your pitch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-[#071328] text-white border-b border-slate-800/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Live Campaigns & Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Verified brands post live collaboration requirements with transparent budgets. Apply directly with zero commission.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={scrollLeft}
                className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="w-9 h-9 rounded-full bg-[#0d224b] border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('opportunities')}
              className="text-xs sm:text-sm font-black text-[#D4A338] hover:text-amber-300 flex items-center gap-1 group cursor-pointer transition"
            >
              <span>View All Briefs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div ref={sliderRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          {pageCampaigns
            .filter((camp) => !camp.validUntil || new Date(camp.validUntil) >= new Date(new Date().setHours(0, 0, 0, 0)))
            .map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-[26px] border-2 border-slate-100 hover:border-[#D4A338] shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group relative overflow-hidden w-[85vw] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] snap-center shrink-0 text-slate-900"
            >
              {/* Gold Top Accent */}
              <div className="absolute top-0 inset-x-0 h-2 bg-[#D4A338] z-0"></div>
              
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
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ACTIVE
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-[#b88628] text-base sm:text-lg leading-snug line-clamp-2 transition-colors">
                    {camp.campaignTitle}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-[#8e6819] border border-amber-200">
                    <Tag className="w-2.5 h-2.5 text-[#D4A338]" />
                    {camp.category}
                  </span>
                  
                  {camp.isBarter && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      Barter
                    </span>
                  )}
                </div>

                <div className="mt-1">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                    {camp.deliverablesNeeded || camp.requirements || camp.campaignDescription}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 mt-auto relative z-10 w-full flex flex-col justify-end">
                <div className="p-3.5 mb-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Budget</span>
                    <span className="font-black text-emerald-600 text-sm block leading-snug">{camp.budget}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Deadline</span>
                    <span className="font-bold text-xs text-slate-700 block leading-snug">
                      {camp.validUntil ? new Date(camp.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Open'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    <strong className="text-slate-800 font-bold">
                      {Math.max(Number(camp.applicantsCount) || 0, Array.isArray(camp.applicants) ? camp.applicants.length : 0)}
                    </strong>{' '}
                    applied
                  </span>

                  {isAlreadyPitched(camp) ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-slate-100 text-slate-400 rounded-full font-bold text-xs cursor-default flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Pitched</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(camp)}
                      className="px-4 py-2 bg-[#061226] hover:bg-black text-white rounded-full font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-slate-900/10 cursor-pointer"
                    >
                      <span>Pitch Campaign</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Pitch Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Pitch for Campaign</h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-800">{selectedCampaign.campaignTitle}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedCampaign.companyName} · {selectedCampaign.budget}</p>
            </div>

            <form onSubmit={submitApplication} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Proposal / Pitch Message</label>
                <textarea
                  value={pitchText}
                  onChange={(e) => setPitchText(e.target.value)}
                  rows={4}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#D4A338]"
                  placeholder="Explain why your audience is the perfect match for this campaign..."
                />
              </div>

              {applyError && <p role="alert" className="text-xs font-semibold text-rose-600">{applyError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hasApplied === selectedCampaign.id}
                  className="px-6 py-2.5 rounded-full bg-[#D4A338] hover:bg-[#be8f2b] text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-[#D4A338]/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : hasApplied === selectedCampaign.id ? 'Submitted!' : 'Submit Pitch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
