import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  Folder,
  MessageSquare,
  Sparkles,
  Users,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  Eye,
  ExternalLink,
  Lock,
  Settings
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CreatorCard } from '../components/common/CreatorCard';
import { ChangePasswordForm } from '../components/common/ChangePasswordForm';

export const BrandDashboardView: React.FC = () => {
  const {
    activeBrandName,
    campaigns,
    enquiries,
    savedFolders,
    creators,
    deleteFolder,
    navigateTo,
    openAIMatcherModal,
    authUser,
    openAuthModal,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState<'briefs' | 'enquiries' | 'shortlists' | 'settings'>('briefs');

  // RBAC Access Guard: If not signed in as a Brand / Agency / Admin
  if (!authUser || (authUser.role !== 'BRAND' && authUser.role !== 'ADMIN')) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xl space-y-5 animate-scaleUp">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Brand Dashboard Restricted
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This dashboard is exclusive for Brands, Agencies, and Marketing Teams managing influencer campaigns. Please sign in to your Brand account.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={openAuthModal}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In as Brand / Agency</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const brandDisplayName = authUser?.companyName || authUser?.name || activeBrandName;

  const myBriefs = campaigns.filter(
    (c) =>
      c.companyName.toLowerCase() === brandDisplayName.toLowerCase() ||
      c.companyName === 'thebrandsstory. Client' ||
      c.email?.toLowerCase() === authUser?.email?.toLowerCase()
  );

  const myEnquiries = enquiries.filter(
    (e) =>
      e.brandName.toLowerCase() === brandDisplayName.toLowerCase() ||
      e.email?.toLowerCase() === authUser?.email?.toLowerCase() ||
      e.brandName === 'Aura Fashion'
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#D4A338] flex items-center justify-center font-bold text-xl border border-blue-100">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{brandDisplayName}</h1>
                <span className="px-2 py-0.5 bg-blue-50 text-[#b88628] text-[10px] font-bold rounded-md">
                  Verified Brand
                </span>
              </div>
              <p className="text-xs text-slate-500">Manage campaign briefs, creator shortlists, and direct bookings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAIMatcherModal}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A338]" />
              <span>AI Matchmaker</span>
            </button>

            <button
              onClick={() => navigateTo('post-requirement')}
              className="px-4 py-2 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New Brief</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('briefs')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'briefs' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>My Posted Briefs ({myBriefs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'enquiries' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Creator Bookings ({myEnquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('shortlists')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'shortlists' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Saved Shortlists ({savedFolders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'settings' ? 'text-[#D4A338] border-b-2 border-blue-600' : 'hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Tab 1: Briefs */}
        {activeTab === 'briefs' && (
          <div className="space-y-4 animate-fadeIn">
            {myBriefs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
                <Flame className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Active Briefs</h3>
                <p className="text-xs text-slate-500">Post a campaign brief to get curated pitches from creators across India.</p>
                <button
                  onClick={() => navigateTo('post-requirement')}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-zinc-900 transition cursor-pointer"
                >
                  Post Your First Campaign Brief
                </button>
              </div>
            ) : (
              myBriefs.map((camp) => (
                <div key={camp.id} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#D4A338] uppercase tracking-wider">{camp.category}</span>
                      <h3 className="text-base font-black text-slate-900">{camp.campaignTitle}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg">
                        {camp.budget}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-50 text-[#b88628] text-xs font-bold rounded-lg">
                        {camp.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{camp.campaignDescription}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span>Target: {camp.city} • {camp.followerRange} followers</span>
                    <span className="font-bold text-slate-900">{camp.applicantsCount || 0} Creator Pitches Received</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4 animate-fadeIn">
            {myEnquiries.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Direct Bookings Yet</h3>
                <p className="text-xs text-slate-500">When you send direct booking enquiries to creators, they will be tracked here.</p>
              </div>
            ) : (
              myEnquiries.map((lead) => (
                <div key={lead.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">Creator ID: {lead.creatorId}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#b88628] text-[10px] font-bold">
                        {lead.collaborationType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{lead.message}</p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Budget: {lead.budget} • Date: {lead.preferredDate}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#b88628] text-xs font-bold">
                    {lead.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Shortlists */}
        {activeTab === 'shortlists' && (
          <div className="space-y-6 animate-fadeIn">
            {savedFolders.map((folder) => {
              const folderCreators = creators.filter((c) => folder.creatorIds.includes(c.id));
              return (
                <div key={folder.id} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Folder className="w-4 h-4 text-amber-500" />
                        <span>{folder.name}</span>
                      </h3>
                      <p className="text-xs text-slate-500">{folderCreators.length} Creators Shortlisted</p>
                    </div>
                    {deleteFolder && (
                      <button
                        onClick={() => deleteFolder(folder.id)}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        title="Delete List"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {folderCreators.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No creators added to this shortlist yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {folderCreators.map((creator) => (
                        <CreatorCard key={creator.id} creator={creator} variant="grid" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="animate-fadeIn max-w-2xl">
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </div>
  );
};
