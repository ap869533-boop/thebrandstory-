import React, { useState } from 'react';
import { Flame, MapPin, IndianRupee, ArrowRight, CheckCircle2, PlusCircle, Sparkles, Send, Building2 } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CampaignRequirement } from '../../types';

export const LiveOpportunitiesBoard: React.FC = () => {
  const { campaigns, applyToCampaign, activeCreatorId, navigateTo, requireRole } = usePlatform();
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRequirement | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [hasApplied, setHasApplied] = useState<string | null>(null);

  const handleApply = (campaign: CampaignRequirement) => {
    if (!requireRole('CREATOR', 'pitch for a brand campaign', 'home')) return;
    setSelectedCampaign(campaign);
    setPitchText(`Hi ${campaign.companyName}! I am interested in collaborating on this campaign. My audience is based in ${campaign.city} and strongly matches your target audience.`);
  };

  const submitApplication = (e: React.FormEvent) => {
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
        {/* Header */}
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
              onClick={() => navigateTo('opportunities')}
              className="text-xs font-bold text-slate-600 hover:text-[#D4A338] flex items-center gap-1 group cursor-pointer transition"
            >
              <span>View All Briefs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* Clean, Professional Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.slice(0, 6).map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#D4A338] transition-all duration-300 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3">
                {/* Top Category & Timing */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#D4A338]/10 text-[#8e6819] border border-[#D4A338]/20">
                    {camp.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {camp.createdAt || 'Recently Added'}
                  </span>
                </div>

                {/* Campaign Title & Brand */}
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#D4A338] transition">
                    {camp.campaignTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{camp.companyName}</span>
                  </p>
                </div>

                {/* Deliverables Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {camp.requirements || camp.campaignDescription}
                </p>
              </div>

              {/* Bottom Meta & Action */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{camp.city}</span>
                  </div>
                  <div className="flex items-center gap-0.5 font-bold text-emerald-600">
                    <span>{camp.budget}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <span>Required: <strong className="text-slate-800">{camp.influencersCount} Creators</strong></span>
                  <span className="text-[#b88628] font-bold">{camp.applicantsCount || 0} Applied</span>
                </div>

                <button
                  onClick={() => handleApply(camp)}
                  className="w-full py-2.5 bg-black hover:bg-[#D4A338] hover:text-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pitch & Apply Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pitch Modal */}
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
                <p className="text-xs text-slate-500">
                  {selectedCampaign.companyName} has received your pitch proposal.
                </p>
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
