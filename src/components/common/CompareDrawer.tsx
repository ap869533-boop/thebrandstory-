import React from 'react';
import { X, Scale, ArrowRight, ShieldCheck, Trash2, MessageSquare, Check, Sparkles } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { TrustScoreBadge } from './TrustScoreBadge';

export const CompareDrawer: React.FC = () => {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    compareDrawerOpen,
    setCompareDrawerOpen,
    navigateTo,
    openEnquiryModal,
  } = usePlatform();

  if (compareList.length === 0) return null;

  // Floating trigger button when collapsed
  if (!compareDrawerOpen) {
    return (
      <div
        id="compare-floating-pill"
        onClick={() => setCompareDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 hover:bg-slate-800 transition cursor-pointer group"
      >
        <div className="flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
          <span className="font-bold text-xs">Compare Influencers</span>
          <span className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-[10px] font-extrabold text-white">
            {compareList.length}
          </span>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
          {compareList.map((c) => (
            <img
              key={c.id}
              src={c.avatar}
              alt={c.name}
              className="w-6 h-6 rounded-full border-2 border-slate-900 object-cover"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id="compare-modal-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={() => setCompareDrawerOpen(false)}
    >
      <div
        id="compare-modal-sheet"
        className="relative w-full max-w-5xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Creator Comparison Matrix</h3>
              <p className="text-xs text-slate-500">
                Comparing {compareList.length} of 4 influencers side-by-side
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
            <button
              onClick={() => setCompareDrawerOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto overflow-y-auto space-y-4 text-xs">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-slate-400 font-bold uppercase tracking-wider text-[10px] w-36">
                  Metric / Feature
                </th>
                {compareList.map((creator) => (
                  <th key={creator.id} className="pb-3 px-3 text-slate-900 w-1/4">
                    <div className="relative group">
                      <button
                        onClick={() => removeFromCompare(creator.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-200 text-slate-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition text-[10px]"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-14 h-14 rounded-full object-cover shadow-xs border border-white mb-2"
                        />
                        <span className="font-bold text-slate-900 text-sm truncate max-w-[130px] flex items-center gap-1">
                          {creator.name}
                          {creator.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#D4A338] inline shrink-0" />}
                        </span>
                        <span className="text-[11px] text-slate-500">@{creator.username}</span>
                        <span className="text-[10px] text-[#D4A338] font-semibold mt-0.5">{creator.currentCity}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Trust Score */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="py-3 font-semibold text-slate-600">Trust Score</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-3 px-3 text-center">
                    <TrustScoreBadge score={c.trustScore} size="sm" />
                  </td>
                ))}
              </tr>

              {/* Followers */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="py-3 font-semibold text-slate-600">Followers</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-3 px-3 text-center font-bold text-slate-900 text-sm">
                    {c.followers >= 1000000 ? `${(c.followers / 1000000).toFixed(1)}M` : `${(c.followers / 1000).toFixed(0)}K`}
                  </td>
                ))}
              </tr>

              {/* Engagement Rate */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="py-3 font-semibold text-slate-600">Engagement Rate</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-3 px-3 text-center font-bold text-emerald-600 text-sm">
                    {c.engagementRate}%
                  </td>
                ))}
              </tr>

              {/* Starting Price */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="py-3 font-semibold text-slate-600">Starting Price</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-3 px-3 text-center font-extrabold text-[#b88628] text-sm">
                    ₹{(c.startingPrice ?? 0).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* Reel Deliverable */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="py-3 font-semibold text-slate-600">Instagram Reel</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-3 px-3 text-center font-medium text-slate-800">
                    {c.pricing?.reelPrice ? `₹${(c.pricing.reelPrice).toLocaleString('en-IN')}` : 'Custom Quote'}
                  </td>
                ))}
              </tr>

              {/* Barter Available */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="py-3 font-semibold text-slate-600">Barter Collabs</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-3 px-3 text-center">
                    {c.pricing.isBarterAvailable ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-md border border-emerald-200">
                        Available
                      </span>
                    ) : (
                      <span className="text-slate-400">Paid Only</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Brand Collaborations */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="py-3 font-semibold text-slate-600">Past Collabs</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-3 px-3 text-center font-bold text-slate-700">
                    🤝 {c.brandCollaborationsCount} Brands
                  </td>
                ))}
              </tr>

              {/* Primary Category */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="py-3 font-semibold text-slate-600">Niche / Category</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-3 px-3 text-center font-medium text-slate-700">
                    {c.primaryCategory}
                  </td>
                ))}
              </tr>

              {/* Direct Actions */}
              <tr>
                <td className="py-4 font-semibold text-slate-600">Quick Actions</td>
                {compareList.map((c) => (
                  <td key={c.id} className="py-4 px-3 text-center space-y-2">
                    <button
                      onClick={() => {
                        setCompareDrawerOpen(false);
                        openEnquiryModal(c);
                      }}
                      className="w-full py-1.5 px-2 bg-black hover:bg-zinc-900 text-white font-bold rounded-lg shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Contact
                    </button>
                    <button
                      onClick={() => {
                        setCompareDrawerOpen(false);
                        navigateTo('influencer-detail', { username: c.username });
                      }}
                      className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition"
                    >
                      View Profile
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
