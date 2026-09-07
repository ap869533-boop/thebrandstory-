import React from 'react';
import {
  X,
  Heart,
  Trash2,
  MessageSquare,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  IndianRupee,
  Users
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { TrustScoreBadge } from './TrustScoreBadge';

export const SavedShortlistDrawer: React.FC = () => {
  const {
    creators,
    savedCreatorIds,
    isCreatorSaved,
    toggleSaveCreator,
    savedDrawerOpen,
    closeSavedDrawer,
    clearAllSaved,
    navigateTo,
    openEnquiryModal,
    addToCompare,
    isComparing,
  } = usePlatform();

  if (!savedDrawerOpen) return null;

  // Filter ONLY saved creators
  const savedCreatorsList = creators.filter((c) => isCreatorSaved(c.id));

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  return (
    <div
      id="saved-shortlist-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans"
      onClick={closeSavedDrawer}
    >
      <div
        id="saved-shortlist-sheet"
        className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Heart className="w-5 h-5 fill-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  My Saved Shortlist
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-black">
                  {savedCreatorsList.length} {savedCreatorsList.length === 1 ? 'Creator' : 'Creators'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Creators you've bookmarked for your upcoming brand collaborations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedCreatorsList.length > 0 && (
              <button
                onClick={clearAllSaved}
                className="text-xs font-bold text-slate-400 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              onClick={closeSavedDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {savedCreatorsList.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base font-black text-slate-900">Your Shortlist is Empty</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You haven't saved any creators yet. Browse our marketplace and click the ❤️ heart icon on any creator card to add them here.
                </p>
              </div>
              <button
                onClick={() => {
                  closeSavedDrawer();
                  navigateTo('explore');
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>Discover Verified Creators</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedCreatorsList.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between space-y-3"
                >
                  {/* Creator Info Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => {
                        closeSavedDrawer();
                        navigateTo('creator-detail', { username: creator.username, id: creator.id });
                      }}
                      className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                    >
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs group-hover:scale-105 transition shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#D4A338] transition truncate">
                            {creator.name}
                          </h4>
                          {creator.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-[#D4A338] shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="truncate">@{creator.username}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-semibold">{creator.primaryCategory}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveCreator(creator.id)}
                      title="Remove from Saved"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Followers</span>
                      <span className="font-black text-slate-900">{formatFollowers(creator.followers)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Engagement</span>
                      <span className="font-black text-emerald-600">{creator.engagementRate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Starts At</span>
                      <span className="font-black text-slate-900">₹{(creator.startingPrice || 5000).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => {
                        closeSavedDrawer();
                        openEnquiryModal(creator);
                      }}
                      className="flex-1 py-2 bg-black hover:bg-zinc-900 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Direct Enquiry</span>
                    </button>

                    <button
                      onClick={() => addToCompare(creator)}
                      className={`px-3 py-2 rounded-xl font-bold border transition flex items-center gap-1 cursor-pointer ${
                        isComparing(creator.id)
                          ? 'bg-blue-50 text-[#b88628] border-blue-200'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isComparing(creator.id) ? 'Added' : 'Compare'}</span>
                    </button>

                    <button
                      onClick={() => {
                        closeSavedDrawer();
                        navigateTo('creator-detail', { username: creator.username, id: creator.id });
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {savedCreatorsList.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Ready to collaborate with all <strong className="text-slate-900">{savedCreatorsList.length} creators</strong>?
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  closeSavedDrawer();
                  navigateTo('post-requirement');
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Post Campaign Brief for All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
